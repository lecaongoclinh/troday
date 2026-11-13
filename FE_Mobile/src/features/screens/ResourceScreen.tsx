import React, { useState, useRef, useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    TextInput,
    Pressable,
    AppState,
    RefreshControl,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { randomUUID } from "expo-crypto";
import type { RootStackParamList } from "../../navigation/types";
import { useApi } from "../../hooks/useApi";
import { useApp } from "../../contexts/AppContext";
import { endpoint, allowed } from "../../api/catalog";
import { isRecord } from "../../api/types";
import type { RecordValue } from "../../api/types";
import { ApiError } from "../../api/client";
import { MutationAttempt } from "../forms/attempt";
import { RecordDetails, ResourceCard } from "../../components/DataView";
import {
    Button,
    EmptyState,
    ErrorState,
    Heading,
    Icon,
    Loading,
} from "../../components/common";
import { colors, fonts, ui } from "../../theme";
import { dateTime } from "../../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Resource">;
interface Related {
    id: number;
    title: string;
    kind?: string;
    detail?: number;
    param?: string;
    query?: RecordValue;
}
export function ResourceScreen({ route, navigation }: Props) {
    const { endpointId, params, title, kind } = route.params;
    const { role, user } = useApp(),
        state = useApi(endpointId, { params });
    const data = isRecord(state.result?.data) ? state.result.data : {};
    const status = String(data.status ?? "");
    const [tab, setTab] = useState(0);
    const related: Related[] =
        kind === "house"
            ? [
                  {
                      id: 42,
                      title: "Phòng",
                      kind: "room",
                      detail: 46,
                      param: "roomId",
                  },
                  { id: 140, title: "Dịch vụ", kind: "house-service" },
                  {
                      id: 33,
                      title: "Hồ sơ xác minh",
                      kind: "house-proof",
                      detail: 35,
                      param: "verificationId",
                  },
                  { id: 41, title: "Quyền cho thuê" },
              ]
            : kind === "room"
              ? [
                    {
                        id: 47,
                        title: "Tin đăng",
                        kind: "post",
                        detail: 58,
                        param: "postId",
                    },
                    { id: 49, title: "Dịch vụ" },
                    ...(role === "landlord"
                        ? [
                              { id: 48, title: "Người ở", kind: "resident" },
                              {
                                  id: 144,
                                  title: "Giá dịch vụ riêng",
                                  kind: "room-service",
                              },
                          ]
                        : []),
                    { id: 153, title: "Đánh giá" },
                ]
              : kind === "contract"
                ? [
                      { id: 105, title: "Phiên bản", kind: "revision" },
                      { id: 115, title: "Người ở", kind: "member" },
                      { id: 127, title: "Lịch sử đại diện" },
                      {
                          id: 129,
                          title: "Thay đổi thuê",
                          kind: "change",
                          detail: 131,
                          param: "requestId",
                      },
                      {
                          id: 117,
                          title: "Yêu cầu vào ở",
                          kind: "join",
                          query: {},
                      },
                  ]
                : kind === "post"
                  ? [
                        ...(typeof data.roomId === "string"
                            ? [
                                  {
                                      id: 49,
                                      title: "Dịch vụ",
                                      query: undefined,
                                  },
                                  { id: 153, title: "Đánh giá" },
                              ]
                            : []),
                    ]
                  : kind === "conversation"
                    ? [{ id: 83, title: "Lịch xem liên quan" }]
                    : [];
    const scoped = {
        ...params,
        ...(kind === "post" && typeof data.roomId === "string"
            ? { roomId: data.roomId }
            : {}),
    };
    const actions: {
        id: number;
        title?: string;
        initial?: RecordValue;
        when?: boolean;
    }[] =
        kind === "house"
            ? [
                  { id: 32, title: "Sửa thông tin nhà", initial: data },
                  { id: 43, title: "Thêm phòng" },
                  { id: 34, title: "Nộp minh chứng quyền cho thuê" },
                  { id: 141, title: "Thêm dịch vụ" },
              ]
            : kind === "room"
              ? [
                    { id: 44, title: "Sửa phòng", initial: data },
                    { id: 45, title: "Đổi sức chứa", initial: data },
                    {
                        id: 51,
                        title: "Đăng tin cho phòng",
                        initial: { roomId: params.roomId },
                    },
                ]
              : kind === "post"
                ? [
                      { id: 60, title: "Lưu tin phòng" },
                      { id: 61, title: "Bỏ lưu tin" },
                      {
                          id: 76,
                          title: "Nhắn tin chủ trọ",
                          initial: { postId: params.postId },
                      },
                      {
                          id: 156,
                          title: "Báo cáo tin",
                          initial: { reportedPostId: params.postId },
                      },
                  ]
                : kind === "viewing"
                  ? [
                        {
                            id: 98,
                            title: "Ghi nhận buổi xem",
                            when: status === "SCHEDULED",
                        },
                        {
                            id: 99,
                            title: "Hủy lịch xem",
                            when: status === "SCHEDULED",
                        },
                        {
                            id: 100,
                            title: "Quyết định thuê",
                            when: status === "COMPLETED",
                        },
                        {
                            id: 103,
                            title: "Soạn hợp đồng",
                            initial: { viewingId: params.viewingId },
                            when:
                                status === "COMPLETED" &&
                                data.rentalDecision === "AGREED",
                        },
                    ]
                  : kind === "contract"
                    ? [
                          {
                              id: 109,
                              title: "Xác nhận phiên bản hợp đồng",
                              initial: {
                                  revisionId: isRecord(data.currentRevision)
                                      ? data.currentRevision.id
                                      : data.currentRevisionId,
                              },
                              when: status === "PENDING_CONFIRMATION",
                          },
                          {
                              id: 106,
                              title: "Yêu cầu chỉnh sửa",
                              when: status === "PENDING_CONFIRMATION",
                          },
                          {
                              id: 110,
                              title: "Ghi nhận vào ở",
                              when: ["CONFIRMED", "ACTIVE"].includes(status),
                          },
                          {
                              id: 111,
                              title: "Hủy hợp đồng",
                              when: [
                                  "DRAFT",
                                  "PENDING_CONFIRMATION",
                                  "CONFIRMED",
                              ].includes(status),
                          },
                          {
                              id: 130,
                              title: "Yêu cầu thay đổi thuê",
                              when: status === "ACTIVE",
                          },
                          {
                              id: 128,
                              title: "Bàn giao đại diện",
                              when: status === "ACTIVE",
                          },
                      ]
                    : kind === "invoice"
                      ? [
                            {
                                id: 148,
                                title: "Sửa bản nháp",
                                initial: data,
                                when: status === "DRAFT",
                            },
                            {
                                id: 149,
                                title: "Phát hành hóa đơn",
                                when: status === "DRAFT",
                            },
                            {
                                id: 150,
                                title: "Ghi nhận đã thu đủ tiền",
                                when: status === "UNPAID",
                            },
                            {
                                id: 151,
                                title: "Hủy hóa đơn",
                                when: status === "UNPAID",
                            },
                            {
                                id: 152,
                                title: "Tạo hóa đơn thay thế",
                                when: status === "CANCELLED",
                            },
                        ]
                      : kind === "house-verification"
                        ? [
                              {
                                  id: 39,
                                  title: "Duyệt / từ chối hồ sơ",
                                  when: status === "PENDING",
                              },
                              {
                                  id: 40,
                                  title: "Thu hồi quyền cho thuê",
                                  when: status === "APPROVED",
                              },
                          ]
                        : kind === "identity-verification"
                          ? [
                                {
                                    id: 14,
                                    title: "Duyệt / từ chối hồ sơ",
                                    when: status === "PENDING",
                                },
                            ]
                          : kind === "landlord-verification"
                            ? [
                                  {
                                      id: 17,
                                      title: "Duyệt / từ chối hồ sơ",
                                      when: status === "PENDING",
                                  },
                              ]
                            : kind === "house-proof"
                              ? [
                                    {
                                        id: 36,
                                        title: "Rút hồ sơ",
                                        when: status === "PENDING",
                                    },
                                ]
                              : kind === "report"
                                ? [{ id: 160, title: "Xử lý báo cáo" }]
                                : kind === "user"
                                  ? [
                                        {
                                            id: 163,
                                            title: "Khóa tài khoản",
                                            when: status === "ACTIVE",
                                        },
                                        {
                                            id: 164,
                                            title: "Mở khóa tài khoản",
                                            when: status === "LOCKED",
                                        },
                                    ]
                                  : kind === "change"
                                    ? [
                                          {
                                              id: 132,
                                              title: "Xử lý yêu cầu",
                                              when: status === "PENDING",
                                          },
                                          {
                                              id: 133,
                                              title: "Xác nhận đề xuất",
                                              when:
                                                  status ===
                                                  "APPROVED_WAITING_CONFIRMATION",
                                          },
                                          {
                                              id: 134,
                                              title: "Hủy yêu cầu",
                                              when: ![
                                                  "COMPLETED",
                                                  "CANCELLED",
                                                  "REJECTED",
                                              ].includes(status),
                                          },
                                          {
                                              id: 135,
                                              title: "Áp dụng thay đổi",
                                              when: status === "READY_TO_APPLY",
                                          },
                                      ]
                                    : kind === "file"
                                      ? [
                                            {
                                                id: 173,
                                                title: "Mở liên kết tải tệp",
                                            },
                                            {
                                                id: 174,
                                                title: "Xóa tệp chưa được tham chiếu",
                                            },
                                        ]
                                      : kind === "my-identity"
                                        ? [
                                              {
                                                  id: 6,
                                                  title: "Nộp giấy tờ danh tính",
                                              },
                                          ]
                                        : kind === "my-landlord"
                                          ? [
                                                {
                                                    id: 9,
                                                    title: "Nộp hồ sơ chủ trọ",
                                                },
                                            ]
                                          : [];
    function operation(
        id: number,
        initial: RecordValue = {},
        extra: Record<string, string> = {},
    ) {
        navigation.navigate("Operation", {
            endpointId: id,
            params: { ...scoped, ...extra },
            initial,
            etag: state.result?.etag,
        });
    }
    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ui.body}
            refreshControl={
                <RefreshControl refreshing={false} onRefresh={state.refresh} />
            }
        >
            <Heading title={title} />
            {related.length > 0 && (
                <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                    {[{ title: "Thông tin", id: 0 }, ...related].map(
                        (item, i) => (
                            <Pressable
                                key={i}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: tab === i }}
                                onPress={() => setTab(i)}
                                style={{
                                    padding: 11,
                                    borderRadius: 12,
                                    backgroundColor:
                                        tab === i ? colors.teal : colors.white,
                                    borderWidth: 1,
                                    borderColor: colors.line,
                                }}
                            >
                                <Text
                                    style={{
                                        fontFamily: fonts.medium,
                                        fontSize: 11,
                                        color:
                                            tab === i
                                                ? colors.white
                                                : colors.muted,
                                    }}
                                >
                                    {item.title}
                                </Text>
                            </Pressable>
                        ),
                    )}
                </View>
            )}
            {state.loading ? (
                <Loading />
            ) : state.error ? (
                <ErrorState error={state.error} retry={state.refresh} />
            ) : (
                <>
                    {tab === 0 ? (
                        <>
                            {kind === "conversation" ? (
                                <Chat conversationId={params.conversationId} />
                            ) : (
                                <View style={ui.card}>
                                    <RecordDetails data={state.result?.data} />
                                </View>
                            )}
                            {actions
                                .filter(
                                    (a) =>
                                        a.when !== false &&
                                        allowed(
                                            endpoint(a.id),
                                            user?.roles ?? [],
                                            role,
                                        ),
                                )
                                .map((action) => (
                                    <Button
                                        key={action.id}
                                        secondary
                                        title={
                                            action.title ??
                                            endpoint(action.id).title
                                        }
                                        onPress={() =>
                                            operation(action.id, action.initial)
                                        }
                                    />
                                ))}
                            {kind === "viewing" &&
                                role === "landlord" &&
                                status === "COMPLETED" && (
                                    <Button
                                        secondary
                                        title="Xem ảnh hưởng khi gửi hợp đồng"
                                        onPress={() =>
                                            navigation.push("Resource", {
                                                endpointId: 104,
                                                params,
                                                title: "Ảnh hưởng khi gửi hợp đồng",
                                            })
                                        }
                                    />
                                )}
                            {kind === "contract" && role === "landlord" && (
                                <Button
                                    secondary
                                    title="Người đủ điều kiện làm đại diện"
                                    onPress={() =>
                                        navigation.push("Resource", {
                                            endpointId: 126,
                                            params,
                                            title: "Ứng viên đại diện",
                                        })
                                    }
                                />
                            )}
                        </>
                    ) : (
                        <RelatedList
                            related={related[tab - 1]}
                            params={scoped}
                            navigation={navigation}
                            etag={state.result?.etag}
                        />
                    )}
                    {tab === 0 &&
                        Array.isArray(state.result?.data) &&
                        state.result.data.map((item, index) => {
                            if (!isRecord(item) || typeof item.id !== "string")
                                return null;
                            if (kind === "sessions")
                                return (
                                    <Button
                                        key={index}
                                        secondary
                                        title={`Thu hồi phiên ${item.isCurrent ? "hiện tại" : index + 1}`}
                                        onPress={() =>
                                            operation(
                                                21,
                                                {},
                                                { sessionId: String(item.id) },
                                            )
                                        }
                                    />
                                );
                            if (
                                kind === "my-identity" &&
                                item.status === "PENDING"
                            )
                                return (
                                    <Button
                                        key={index}
                                        secondary
                                        title="Rút hồ sơ đang chờ"
                                        onPress={() =>
                                            operation(
                                                8,
                                                {},
                                                {
                                                    verificationId: String(
                                                        item.id,
                                                    ),
                                                },
                                            )
                                        }
                                    />
                                );
                            if (
                                kind === "my-landlord" &&
                                item.status === "PENDING"
                            )
                                return (
                                    <Button
                                        key={index}
                                        secondary
                                        title="Rút hồ sơ đang chờ"
                                        onPress={() =>
                                            operation(
                                                11,
                                                {},
                                                {
                                                    verificationId: String(
                                                        item.id,
                                                    ),
                                                },
                                            )
                                        }
                                    />
                                );
                            return null;
                        })}
                    <Button
                        secondary
                        title="Tải lại"
                        icon="refresh-cw"
                        onPress={state.refresh}
                    />
                </>
            )}
        </ScrollView>
    );
}
function RelatedList({
    related,
    params,
    navigation,
    etag,
}: {
    related: Related;
    params: Record<string, string>;
    navigation: Props["navigation"];
    etag?: string;
}) {
    const app = useApp(),
        state = useApi(related.id, {
            params,
            query: {
                ...(related.query ?? {}),
                ...(endpoint(related.id).pagination === "page"
                    ? { page: 1, pageSize: 100 }
                    : {}),
            },
        });
    if (state.loading) return <Loading />;
    if (state.error)
        return <ErrorState error={state.error} retry={state.refresh} />;
    const raw = state.result?.data;
    const data =
        related.id === 117 && Array.isArray(raw)
            ? raw.filter(
                  (x) => isRecord(x) && x.contractId === params.contractId,
              )
            : raw;
    if (!Array.isArray(data))
        return (
            <View style={ui.card}>
                <RecordDetails data={data} />
            </View>
        );
    const actions: Record<string, number[]> = {
        revision: [107, 108],
        member: [27, 112, 125],
        join: [119, 120, 121, 122, 123, 124],
        change: [132, 133, 134, 135],
        "house-service": [142],
        "room-service": [143],
    };
    return (
        <View style={{ gap: 15 }}>
            {data.length ? (
                data.map((item, index) => {
                    if (!isRecord(item)) return null;
                    const id =
                        typeof item.id === "string" ? item.id : undefined;
                    const extra =
                        related.kind === "revision"
                            ? { revisionId: id }
                            : related.kind === "member"
                              ? { memberId: id }
                              : related.kind === "house-service"
                                ? { houseServiceId: id }
                                : related.kind === "room-service"
                                  ? {
                                        houseServiceId:
                                            typeof item.houseServiceId ===
                                            "string"
                                                ? item.houseServiceId
                                                : undefined,
                                    }
                                  : { requestId: id };
                    const scope = {
                        ...params,
                        ...Object.fromEntries(
                            Object.entries(extra).filter(
                                (pair): pair is [string, string] =>
                                    typeof pair[1] === "string",
                            ),
                        ),
                    };
                    return (
                        <View key={id ?? index} style={{ gap: 8 }}>
                            <ResourceCard
                                data={item}
                                kind={related.kind}
                                onPress={
                                    id && related.detail && related.param
                                        ? () =>
                                              navigation.push("Resource", {
                                                  endpointId: related.detail!,
                                                  params: {
                                                      ...params,
                                                      [related.param!]: id,
                                                  },
                                                  title: related.title,
                                                  kind: related.kind,
                                              })
                                        : undefined
                                }
                            />
                            {id &&
                                (actions[related.kind ?? ""] ?? [])
                                    .filter((action) =>
                                        allowed(
                                            endpoint(action),
                                            app.user?.roles ?? [],
                                            app.role,
                                        ),
                                    )
                                    .map((action) => (
                                        <Button
                                            key={action}
                                            secondary
                                            title={endpoint(action).title}
                                            onPress={() =>
                                                navigation.navigate(
                                                    "Operation",
                                                    {
                                                        endpointId: action,
                                                        params: scope,
                                                        initial:
                                                            action === 142 ||
                                                            action === 107
                                                                ? item
                                                                : {},
                                                        etag: undefined,
                                                    },
                                                )
                                            }
                                        />
                                    ))}
                        </View>
                    );
                })
            ) : (
                <EmptyState
                    title="Chưa có dữ liệu"
                    description="Thông tin liên quan sẽ hiển thị tại đây."
                />
            )}
        </View>
    );
}
function Chat({ conversationId }: { conversationId: string }) {
    const app = useApp(),
        messages = useApi(79, {
            params: { conversationId },
            query: { limit: 100 },
        });
    const [text, setText] = useState(""),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false);
    const attempt = useRef(new MutationAttempt(randomUUID));
    const messageKey = useRef(randomUUID());
    useEffect(() => {
        const timer = setInterval(() => {
            if (
                AppState.currentState === "active" ||
                AppState.currentState === null
            )
                messages.refresh();
        }, 15000);
        return () => clearInterval(timer);
    }, [messages.refresh]);
    async function send() {
        if (busy || !text.trim()) return;
        if (text.trim().length > 2000) {
            setError("Tin nhắn tối đa 2.000 ký tự.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            const body = {
                clientMessageKey: messageKey.current,
                type: "TEXT",
                content: text.trim(),
            };
            const key = attempt.current.begin(body);
            await app.client.request(endpoint(80), {
                params: { conversationId },
                body,
                idempotencyKey: key,
            });
            attempt.current = new MutationAttempt(randomUUID);
            messageKey.current = randomUUID();
            setText("");
            messages.refresh();
            app.invalidate();
        } catch (caught) {
            const e =
                caught instanceof ApiError
                    ? caught
                    : new ApiError("Không thể gửi tin.");
            attempt.current.finish(e.ambiguous);
            setError(
                e.message +
                    (e.ambiguous ? " Giữ nguyên nội dung và thử lại." : ""),
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <View style={{ gap: 18 }}>
            {messages.loading && !messages.result ? (
                <Loading />
            ) : messages.error ? (
                <ErrorState error={messages.error} retry={messages.refresh} />
            ) : Array.isArray(messages.result?.data) &&
              messages.result.data.length ? (
                messages.result.data.map((item, index) => {
                    if (!isRecord(item)) return null;
                    const mine = item.senderId === app.user?.id;
                    return (
                        <View
                            key={typeof item.id === "string" ? item.id : index}
                            style={{
                                maxWidth: "87%",
                                alignSelf: mine ? "flex-end" : "flex-start",
                                backgroundColor: mine
                                    ? colors.teal
                                    : colors.white,
                                padding: 14,
                                borderRadius: 17,
                                gap: 7,
                            }}
                        >
                            <Text
                                style={[
                                    ui.text,
                                    { color: mine ? colors.white : colors.ink },
                                ]}
                            >
                                {typeof item.content === "string"
                                    ? item.content
                                    : item.type === "POST_SHARE"
                                      ? "Tin phòng được chia sẻ"
                                      : item.type === "IMAGE"
                                        ? "Ảnh đính kèm"
                                        : "Thông báo hệ thống"}
                            </Text>
                            {typeof item.sentAt === "string" && (
                                <Text
                                    style={[
                                        ui.muted,
                                        {
                                            fontSize: 9,
                                            color: mine
                                                ? "#BDD1C2"
                                                : colors.muted,
                                        },
                                    ]}
                                >
                                    {dateTime(item.sentAt)}
                                </Text>
                            )}
                        </View>
                    );
                })
            ) : (
                <EmptyState
                    icon="message-circle"
                    title="Bắt đầu cuộc trò chuyện"
                    description="Trao đổi về phòng và hẹn thời gian xem phù hợp."
                />
            )}
            <View style={[ui.card, { padding: 12 }]}>
                <TextInput
                    accessibilityLabel="Nội dung tin nhắn"
                    editable={!busy && !attempt.current.uncertain}
                    style={[
                        ui.input,
                        { minHeight: 85, textAlignVertical: "top" },
                    ]}
                    multiline
                    value={text}
                    onChangeText={setText}
                    placeholder="Viết lời nhắn của bạn…"
                    maxLength={2000}
                />
                {error && (
                    <Text accessibilityRole="alert" style={ui.error}>
                        {error}
                    </Text>
                )}
                <Button
                    title={
                        attempt.current.uncertain
                            ? "Thử gửi lại"
                            : "Gửi tin nhắn"
                    }
                    icon="send"
                    loading={busy}
                    disabled={!text.trim()}
                    onPress={() => void send()}
                />
            </View>
        </View>
    );
}
