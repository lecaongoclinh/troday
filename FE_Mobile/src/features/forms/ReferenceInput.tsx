import React, { useState } from "react";
import {
    Modal,
    View,
    ScrollView,
    Text,
    TextInput,
    Pressable,
} from "react-native";
import type { FieldSpec, RecordValue } from "../../api/types";
import { isRecord } from "../../api/types";
import { useApp } from "../../contexts/AppContext";
import { useApi } from "../../hooks/useApi";
import { endpoint } from "../../api/catalog";
import {
    Button,
    EmptyState,
    ErrorState,
    Loading,
} from "../../components/common";
import { colors, ui } from "../../theme";
import { label } from "./labels";

const sources: Record<string, number> = {
    houseId: 29,
    roomId: 57,
    targetRoomId: 57,
    postId: 57,
    viewingId: 95,
    conversationId: 77,
    contractId: 101,
    targetContractId: 101,
    templateId: 165,
    serviceId: 137,
};
const purposes: Record<string, string> = {
    avatarFileId: "AVATAR",
    imageFileIds: "POST_IMAGE",
    identityFileId: "IDENTITY",
    evidenceFileIds: "REPORT_EVIDENCE",
    fileIds: "CHAT_IMAGE",
    paperDocumentFileId: "CONTRACT",
    fileId: "LANDLORD_PROOF",
};
export function ReferenceInput({
    field,
    value,
    onChange,
    disabled,
}: {
    field: FieldSpec;
    value: unknown;
    onChange: (value: unknown) => void;
    disabled: boolean;
}) {
    const app = useApp();
    const [open, setOpen] = useState(false),
        [page, setPage] = useState(1);
    const ownRoom =
        app.role === "landlord" &&
        ["roomId", "targetRoomId"].includes(field.name);
    const source = ownRoom ? 29 : sources[field.name],
        e = source ? endpoint(source) : null;
    const state = useApi(open && source ? source : null, {
        query: e?.pagination === "page" ? { page, pageSize: 100 } : undefined,
    });
    const filePurpose = purposes[field.name];
    const array = field.type === "id[]";
    const data = state.result?.data;
    const rows: RecordValue[] = filePurpose
        ? app.uploadedFiles.filter((f) => f.purpose === filePurpose)
        : Array.isArray(data)
          ? ownRoom
              ? data
                    .filter(isRecord)
                    .flatMap((h) =>
                        Array.isArray(h.rooms) ? h.rooms.filter(isRecord) : [],
                    )
              : data.filter(isRecord)
          : [];
    function option(row: RecordValue) {
        if (source === 57 && ["roomId", "targetRoomId"].includes(field.name))
            return { id: row.roomId, title: row.title };
        if (source === 68 && isRecord(row.profile))
            return {
                id: row.profile.id,
                title: row.profile.fullName ?? row.profile.id,
            };
        return {
            id: row.id,
            title:
                row.name ??
                row.code ??
                row.title ??
                row.number ??
                row.contractNumber ??
                row.fullName ??
                row.id,
        };
    }
    function select(id: string) {
        if (array) {
            const current = Array.isArray(value) ? value : [];
            onChange(
                current.includes(id)
                    ? current.filter((v) => v !== id)
                    : [...current, id],
            );
        } else {
            onChange(id);
            setOpen(false);
        }
    }
    return (
        <View style={{ gap: 8 }}>
            {(source || filePurpose) && (
                <Button
                    secondary
                    disabled={disabled}
                    title={`Chọn ${label(field.name).toLowerCase()}`}
                    onPress={() => setOpen(true)}
                />
            )}
            <TextInput
                accessibilityLabel={label(field.name)}
                editable={!disabled}
                style={ui.input}
                value={
                    Array.isArray(value)
                        ? value.join(", ")
                        : value === undefined
                          ? ""
                          : String(value)
                }
                onChangeText={(v) => onChange(v)}
                keyboardType="numeric"
                placeholder={
                    array
                        ? "Các mã đã có, ngăn cách dấu phẩy"
                        : "Mã từ dữ liệu máy chủ"
                }
            />
            <Modal
                visible={open}
                transparent
                animationType="slide"
                onRequestClose={() => setOpen(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "#15382E66",
                        justifyContent: "flex-end",
                    }}
                >
                    <ScrollView
                        contentContainerStyle={{ padding: 24, gap: 15 }}
                        style={{
                            backgroundColor: colors.page,
                            maxHeight: "85%",
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,
                        }}
                    >
                        <Text style={ui.section}>
                            Chọn {label(field.name).toLowerCase()}
                        </Text>
                        {state.loading ? (
                            <Loading />
                        ) : state.error ? (
                            <ErrorState
                                error={state.error}
                                retry={state.refresh}
                            />
                        ) : rows.length ? (
                            rows.map((row, index) => {
                                const v = option(row);
                                if (typeof v.id !== "string") return null;
                                return (
                                    <Pressable
                                        key={index}
                                        accessibilityRole={
                                            array ? "checkbox" : "button"
                                        }
                                        accessibilityState={
                                            array
                                                ? {
                                                      checked:
                                                          Array.isArray(
                                                              value,
                                                          ) &&
                                                          value.includes(v.id),
                                                  }
                                                : undefined
                                        }
                                        style={ui.card}
                                        onPress={() => select(v.id as string)}
                                    >
                                        <Text style={ui.text}>
                                            {String(v.title ?? v.id)}
                                        </Text>
                                        <Text style={ui.muted}>
                                            {label(field.name)} {v.id}
                                            {array &&
                                            Array.isArray(value) &&
                                            value.includes(v.id)
                                                ? " · Đã chọn"
                                                : ""}
                                        </Text>
                                    </Pressable>
                                );
                            })
                        ) : (
                            <EmptyState
                                title="Chưa có lựa chọn"
                                description={
                                    filePurpose
                                        ? "Tải tệp đúng mục đích trước khi đính kèm."
                                        : "Chưa có dữ liệu phù hợp từ máy chủ."
                                }
                            />
                        )}
                        {state.result?.meta.pagination && (
                            <View style={ui.between}>
                                <Button
                                    secondary
                                    title="Trước"
                                    disabled={page <= 1}
                                    onPress={() => setPage((p) => p - 1)}
                                />
                                <Button
                                    secondary
                                    title="Tiếp"
                                    disabled={
                                        page >=
                                        state.result.meta.pagination.totalPages
                                    }
                                    onPress={() => setPage((p) => p + 1)}
                                />
                            </View>
                        )}
                        <Button title="Xong" onPress={() => setOpen(false)} />
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
