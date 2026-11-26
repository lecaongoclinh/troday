import React, { useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import { File, Paths } from "expo-file-system";
import { allowed, endpoint } from "../../api/catalog";
import { ApiError } from "../../api/client";
import type { FieldSpec, RecordValue } from "../../api/types";
import { Button, EmptyState, Heading, Icon } from "../../components/common";
import { useApp } from "../../contexts/AppContext";
import { useApi } from "../../hooks/useApi";
import type { RootStackParamList } from "../../navigation/types";
import { colors, ui } from "../../theme";
import { dateVN, money } from "../../utils/format";
import { Fields } from "./Fields";
import { InvoiceMeterFields } from "./InvoiceServiceFields";
import { MutationAttempt } from "./attempt";
import { displayValue } from "./labels";
import { validDate } from "./validation";
import { markBatchCreated, parseBatchPreview, parseBatchResult, prepareBatchRoom } from "../../../../shared/api/invoice-batch.ts";
import type { BatchResult, BatchRoom, BatchRoomSubmission, BatchSubmission } from "../../../../shared/api/invoice-batch.ts";
import { batchDrafts, browserDraftStorage, type BatchDraft } from "../../../../shared/api/invoice-batch-drafts.ts";
import type { MeterInput } from "../../../../shared/api/invoice-preview.ts";

const fields: FieldSpec[] = [
    { name: "houseId", type: "id", required: true, rule: "Chọn nhà trọ." },
    { name: "billingPeriod", type: "date", required: true, rule: "Nhập ngày đầu tháng của kỳ thu." },
    { name: "dueDate", type: "date", required: true, rule: "Hạn thanh toán chung." },
];

const draftFile = (key: string) => new File(Paths.document, `${encodeURIComponent(key)}.json`);
const draftStorage = Platform.OS === "web" ? browserDraftStorage : {
    getItem(key: string) {
        const file = draftFile(key);
        return file.exists ? file.textSync() : null;
    },
    setItem(key: string, value: string) {
        const file = draftFile(key);
        if (!file.exists) file.create();
        file.writeSync(value);
    },
};

export function InvoiceBatchScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "InvoiceBatch">) {
    const { client, user, role, baseUrl, invalidate } = useApp();
    const permitted = allowed(endpoint(179), user?.roles ?? [], role);
    const store = batchDrafts(draftStorage, `${baseUrl}|${user?.id ?? ""}`);
    const defaultDueDate = dateVN(new Date(Date.now() + 5 * 86400000));
    const [scope, setScope] = useState(() => store.lastScope() ?? {
        houseId: "",
        billingPeriod: `${dateVN().slice(0, 7)}-01`,
    });
    const [draft, setDraft] = useState(() => store.read(scope, defaultDueDate));
    const draftRef = useRef(draft);
    const [storageFailed, setStorageFailed] = useState(false);
    const [updatedPreview, setUpdatedPreview] = useState<{ source: unknown; rooms: BatchRoom[] }>();
    const [result, setResult] = useState<BatchResult>();
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [retry, setRetry] = useState<BatchSubmission>();
    const attempt = useRef(new MutationAttempt(randomUUID));
    const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
    const { houseId, billingPeriod: period } = scope;
    const { dueDate, readings, excluded } = draft;
    const hasPeriod = validDate(period) && period.endsWith("-01");
    const state = useApi(permitted && /^[1-9]\d*$/.test(houseId) && hasPeriod ? 178 : null, {
        params: { houseId }, query: { billingPeriod: period },
    });
    const data = parseBatchPreview(state.result?.data);
    const preview = data?.houseId === houseId && data.billingPeriod === period ? data : undefined;
    const rooms = preview && updatedPreview?.source === state.result?.data ? updatedPreview?.rooms : preview?.rooms;
    const rows = (rooms ?? []).map(room => ({ room, ...prepareBatchRoom(room, readings[room.contractId]) }));
    const ready = rows.filter(({ room }) => !excluded[room.contractId])
        .map(row => row.submission).filter((item): item is BatchRoomSubmission => !!item);
    const locked = saving || !!retry;

    const updateDraft = (change: (previous: BatchDraft) => BatchDraft) => {
        const next = change(draftRef.current);
        draftRef.current = next;
        setDraft(next);
        if (houseId && hasPeriod) setStorageFailed(!store.save(scope, next));
    };
    const updateForm = (value: RecordValue) => {
        const next = { houseId: String(value.houseId ?? ""), billingPeriod: String(value.billingPeriod ?? "") };
        if (next.houseId !== houseId || next.billingPeriod !== period) {
            draftRef.current = store.read(next, houseId ? defaultDueDate : dueDate);
            setDraft(draftRef.current);
            setScope(next);
            store.remember(next);
            setStorageFailed(false);
            setUpdatedPreview(undefined);
            setResult(undefined);
            setError("");
        } else {
            updateDraft(previous => ({ ...previous, dueDate: String(value.dueDate ?? "") }));
        }
    };
    const updateReading = (contract: string, service: string, field: keyof MeterInput, value: string) => {
        updateDraft(previous => ({
            ...previous,
            readings: {
                ...previous.readings,
                [contract]: { ...previous.readings[contract], [service]: { ...previous.readings[contract]?.[service], [field]: value } },
            },
        }));
    };
    const save = async () => {
        if (attempt.current.busy || (!retry && (!ready.length || !validDate(dueDate)))) return;
        const body = retry ?? { billingPeriod: period, dueDate, rooms: ready };
        const key = attempt.current.begin({ houseId, body });
        setSaving(true);
        setError("");
        try {
            const response = await client.request(endpoint(179), {
                params: { houseId }, body: { ...body }, idempotencyKey: key,
            });
            const batch = parseBatchResult(response.data);
            attempt.current = new MutationAttempt(randomUUID);
            setRetry(undefined);
            if (rooms) setUpdatedPreview({ source: state.result?.data, rooms: markBatchCreated(rooms, batch.created) });
            setResult(batch);
            invalidate();
            scroll.current?.scrollTo({ y: 0 });
        } catch (e) {
            const uncertain = !(e instanceof ApiError) || e.ambiguous || e.code === "REQUEST_IN_PROGRESS";
            if (uncertain) attempt.current.finish(true);
            else attempt.current = new MutationAttempt(randomUUID);
            setRetry(uncertain ? body : undefined);
            setError(e instanceof Error ? e.message : "Không tạo được hóa đơn.");
        } finally {
            setSaving(false);
        }
    };

    if (!permitted) return <EmptyState title="Chỉ chủ trọ được nhập chỉ số theo nhà"
        description="Đăng nhập bằng tài khoản chủ trọ để tiếp tục." />;
    return <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={ui.body}>
        <Heading title="Nhập chỉ số theo nhà" />
        {result && <View accessibilityLiveRegion="polite" style={[ui.card, { gap: 10 }]}>
            <Text style={ui.section}>Hóa đơn vừa tạo ({result.created.length})</Text>
            {result.created.length === 0 && <Text style={ui.muted}>Đợt nhập này chưa tạo được hóa đơn.</Text>}
            {result.created.map(({ roomCode, invoice }) => <Button key={String(invoice.id)} secondary
                title={`Phòng ${roomCode} · HĐ-${invoice.id} · ${money(String(invoice.total))}`}
                onPress={() => navigation.push("Resource", {
                    endpointId: 146, params: { invoiceId: String(invoice.id) }, kind: "invoice", title: "Chi tiết hóa đơn",
                })} />)}
            {result.skipped.map(row => <Text key={row.contractId} style={ui.error}>
                Phòng {rows.find(({ room }) => room.contractId === row.contractId)?.room.roomCode ?? row.contractId} · {row.reason}
            </Text>)}
        </View>}
        <View style={ui.card}>
            <Fields schema="" fields={fields} values={{ ...scope, dueDate }} onChange={updateForm} disabled={locked}
                errors={period && !hasPeriod ? { billingPeriod: "Kỳ thu phải là ngày đầu tháng." } : {}} />
            <Text accessibilityRole={storageFailed ? "alert" : undefined} style={storageFailed ? ui.error : ui.muted}>
                {storageFailed ? "Chưa lưu được chỉ số trên thiết bị này. Các ô đang nhập có thể bị mất khi thoát."
                    : "Chỉ số tự lưu trên thiết bị này theo nhà trọ và kỳ thu."}
            </Text>
        </View>
        {state.loading && <Text style={ui.muted}>Đang tải các phòng cần nhập chỉ số…</Text>}
        {state.error && <Text accessibilityRole="alert" style={ui.error}>{state.error.message}</Text>}
        {(preview || state.error) && <Button secondary title="Tải lại danh sách" onPress={state.refresh} disabled={locked} />}
        {preview && <Text accessibilityRole="header" style={ui.section}>Danh sách phòng</Text>}
        {preview?.rooms.length === 0 && <EmptyState title="Chưa có phòng cần nhập chỉ số"
            description="Hệ thống hiển thị các phòng đang thuê có dịch vụ theo đồng hồ." />}
        {rows.map(({ room, total, submission }) => {
            const id = room.contractId;
            const blocked = room.invoiceId || room.blockedReason;
            return <View key={id} style={[ui.card, { gap: 10 }]}>
                <View style={ui.between}>
                    <Text style={ui.section}>Phòng {room.roomCode}</Text>
                    <Text style={ui.muted}>{room.contractNumber}</Text>
                </View>
                {room.invoiceStatus === "DRAFT" ? <View style={[ui.row, {
                    alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 10, backgroundColor: colors.soft, gap: 5,
                }]}>
                    <Icon name="check" size={16} />
                    <Text style={[ui.text, { color: colors.teal }]}>Đã tạo bản nháp</Text>
                </View> : blocked ? <Text style={ui.muted}>
                    {room.invoiceStatus ? displayValue(room.invoiceStatus) : room.blockedReason || "Đã có hóa đơn trong kỳ"}
                </Text> : <>
                    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: !excluded[id] }}
                        accessibilityLabel={`Chọn phòng ${room.roomCode}`} disabled={locked}
                        style={[ui.input, !excluded[id] && { borderColor: colors.teal }]}
                        onPress={() => updateDraft(previous => ({ ...previous, excluded: { ...previous.excluded, [id]: !previous.excluded[id] } }))}>
                        <Text style={ui.text}>{excluded[id] ? "Chọn phòng này" : "Đã chọn tạo hóa đơn"}</Text>
                    </Pressable>
                    {room.services.map(service => <View key={service.roomServiceId} style={{ gap: 7 }}>
                        <Text style={ui.text}>{service.name} · {money(service.unitPrice)} / {service.unit}</Text>
                        <InvoiceMeterFields service={service} roomCode={room.roomCode}
                            value={readings[id]?.[service.roomServiceId] ?? {}} disabled={locked || excluded[id]}
                            onChange={(field, value) => updateReading(id, service.roomServiceId, field, value)} />
                    </View>)}
                    <View style={ui.between}>
                        <Text style={ui.text}>{submission ? "Tổng hóa đơn" : "Chờ chỉ số hợp lệ"}</Text>
                        <Text style={ui.text}>{money(total)}</Text>
                    </View>
                </>}
            </View>;
        })}
        {error && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
        <Button title={retry ? "Thử lại tạo bản nháp" : `Tạo bản nháp hóa đơn (${ready.length})`}
            loading={saving} disabled={!retry && (!ready.length || !validDate(dueDate))} onPress={save} />
    </ScrollView>;
}
