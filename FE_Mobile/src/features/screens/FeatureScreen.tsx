import React, { useState } from "react";
import {
    ScrollView,
    View,
    Text,
    TextInput,
    Pressable,
    RefreshControl,
    Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import type { FeatureKey, RootStackParamList } from "../../navigation/types";
import type { RecordValue } from "../../api/types";
import { isRecord } from "../../api/types";
import { useApp } from "../../contexts/AppContext";
import { useApi } from "../../hooks/useApi";
import { endpoint, allowed } from "../../api/catalog";
import { features, roleNavigation } from "../config";
import { colors, fonts, ui } from "../../theme";
import {
    Button,
    EmptyState,
    ErrorState,
    Heading,
    Icon,
    Loading,
    Tag,
} from "../../components/common";
import type { IconName } from "../../components/common";
import {
    PostCard,
    RecordDetails,
    ResourceCard,
} from "../../components/DataView";
import { money } from "../../utils/format";
import { displayValue } from "../forms/labels";
import { WorkflowActions } from "../../components/WorkflowActions";

export function FeatureScreen({ feature }: { feature: FeatureKey }) {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const app = useApp(),
        config = features[feature];
    const [tab, setTab] = useState<number>(),
        [page, setPage] = useState(1),
        [search, setSearch] = useState(""),
        [filters, setFilters] = useState<RecordValue>({}),
        [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<RecordValue>({});
    let read = tab ?? config.read;
    if (feature === "dashboard" && app.role === "admin") read = 176;
    if (feature === "reports" && app.role === "admin") read = 158;
    const e = endpoint(read);
    const query: RecordValue = {
        ...filters,
        ...(e.pagination === "page" ? { page, pageSize: 20 } : {}),
    };
    const state = useApi(feature === "files" ? null : read, { query });
    const create =
        feature === "viewings" && app.role === "landlord" ? 97 : config.create;
    const createAllowed =
        create && allowed(endpoint(create), app.user?.roles ?? [], app.role);
    const open = (
        endpointId: number,
        params: Record<string, string> = {},
        title?: string,
        kind?: string,
    ) =>
        navigation.navigate("Resource", {
            endpointId,
            params,
            title: title ?? config.title,
            kind,
        });
    function openItem(value: unknown) {
        if (!isRecord(value)) return;
        if (
            feature === "roommates" &&
            read === 68 &&
            isRecord(value.profile) &&
            typeof value.profile.id === "string"
        ) {
            open(
                64,
                { profileId: value.profile.id },
                "Hồ sơ ở ghép",
                "roommate",
            );
            return;
        }
        if (typeof value.id !== "string") return;
        if (feature === "verifications") {
            const detail = read === 12 ? 13 : read === 15 ? 16 : 38;
            open(
                detail,
                { verificationId: value.id },
                "Hồ sơ xác minh",
                read === 12
                    ? "identity-verification"
                    : read === 15
                      ? "landlord-verification"
                      : "house-verification",
            );
            return;
        }
        if (feature === "reports" && app.role === "admin") {
            open(159, { reportId: value.id }, "Chi tiết báo cáo", "report");
            return;
        }
        if (read === 91) return;
        if (config.detail && config.param)
            open(
                config.detail,
                { [config.param]: value.id },
                config.title,
                config.kind,
            );
    }
    const data = state.result?.data;
    const list = Array.isArray(data)
        ? data
        : read === 71 && isRecord(data) && Array.isArray(data.items)
          ? data.items
          : undefined;
    const pagination = state.result?.meta.pagination;
    const loginAction = (
        <Button
            title="Đăng nhập"
            onPress={() => navigation.navigate("Auth", { mode: "login" })}
        />
    );
    function operation(
        id: number,
        params: Record<string, string> = {},
        initial: RecordValue = {},
        etag?: string,
        createOnly = false,
    ) {
        navigation.navigate("Operation", {
            endpointId: id,
            params,
            initial,
            etag,
            createOnly,
        });
    }
    if (feature === "profile")
        return (
            <ScrollView contentContainerStyle={ui.body}>
                <Heading
                    title="Tài khoản của bạn"
                    description="Thông tin, bảo mật và kết nối."
                />
                <View
                    style={[
                        ui.card,
                        { alignItems: "center", paddingVertical: 28 },
                    ]}
                >
                    <View
                        style={{
                            height: 72,
                            width: 72,
                            borderRadius: 26,
                            backgroundColor: colors.soft,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Icon name="user" size={32} />
                    </View>
                    <Text style={ui.section}>
                        {app.user?.fullName ?? "Chào bạn, người bạn mới"}
                    </Text>
                    <Text style={ui.muted}>
                        {app.user
                            ? "Quản lý thông tin tài khoản của bạn."
                            : "Đăng nhập để bắt đầu hành trình cùng Trọday."}
                    </Text>
                    {!app.user && loginAction}
                </View>
                {app.user && (
                    <>
                        <Text style={ui.eyebrow}>KHÔNG GIAN CỦA BẠN</Text>
                        {app.roles.map((role) => (
                            <Pressable
                                accessibilityRole="radio"
                                accessibilityState={{
                                    selected: app.role === role,
                                }}
                                key={role}
                                onPress={() => app.selectRole(role)}
                                style={[ui.card, ui.between]}
                            >
                                <Text style={ui.text}>
                                    {displayValue(role.toUpperCase())}
                                </Text>
                                <Icon
                                    name={
                                        app.role === role
                                            ? "check-circle"
                                            : "circle"
                                    }
                                />
                            </Pressable>
                        ))}
                        <Button
                            secondary
                            title="Sửa thông tin cá nhân"
                            icon="edit-2"
                            onPress={() =>
                                operation(
                                    4,
                                    {},
                                    app.user as unknown as RecordValue,
                                )
                            }
                        />
                        <Button
                            secondary
                            title="Cài đặt thông báo"
                            icon="bell"
                            onPress={() => operation(5)}
                        />
                        <Button
                            secondary
                            title="Phiên đăng nhập"
                            icon="smartphone"
                            onPress={() =>
                                open(20, {}, "Phiên đăng nhập", "sessions")
                            }
                        />
                        <Button
                            secondary
                            title="Xác minh số điện thoại"
                            onPress={() => operation(22)}
                        />
                        {app.role === "tenant" && (
                            <>
                                <Button
                                    secondary
                                    title="Xác minh danh tính"
                                    onPress={() =>
                                        open(
                                            7,
                                            {},
                                            "Xác minh danh tính",
                                            "my-identity",
                                        )
                                    }
                                />
                                <Button
                                    secondary
                                    title="Liên kết cư trú"
                                    onPress={() => operation(28)}
                                />
                                <Button
                                    secondary
                                    title="Đăng ký trở thành chủ trọ"
                                    onPress={() =>
                                        open(
                                            10,
                                            {},
                                            "Hồ sơ chủ trọ",
                                            "my-landlord",
                                        )
                                    }
                                />
                            </>
                        )}
                        <Button
                            secondary
                            title="Tệp đính kèm"
                            icon="upload-cloud"
                            onPress={() => navigation.navigate("Upload")}
                        />
                    </>
                )}
                <WorkflowActions feature="profile" />
                <Text style={ui.eyebrow}>THIẾT LẬP</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Kết nối máy chủ"
                    onPress={() => navigation.navigate("Connection")}
                    style={[ui.card, ui.between]}
                >
                    <View style={ui.row}>
                        <Icon name="server" />
                        <View>
                            <Text style={ui.text}>Kết nối máy chủ</Text>
                            <Text style={ui.muted}>
                                {app.baseUrl
                                    ? "Đã cấu hình địa chỉ"
                                    : "Chưa cấu hình"}
                            </Text>
                        </View>
                    </View>
                    <Icon name="chevron-right" size={17} />
                </Pressable>
                {app.user && (
                    <Button
                        danger
                        secondary
                        title="Đăng xuất"
                        onPress={() => {
                            void app
                                .logout()
                                .catch(() =>
                                    app.notify(
                                        "Đã xóa phiên trên thiết bị. Chưa xác minh việc thu hồi phiên tại máy chủ.",
                                    ),
                                );
                        }}
                    />
                )}
                <Text style={[ui.muted, { textAlign: "center", fontSize: 10 }]}>
                    Trọday · Phiên bản 0.1.0
                </Text>
            </ScrollView>
        );
    if (feature === "files")
        return (
            <EmptyState
                icon="upload-cloud"
                title="Tệp của bạn"
                description="Tải giấy tờ, hình ảnh và minh chứng qua kho tệp riêng tư."
                action={
                    <Button
                        title="Tải tệp lên"
                        onPress={() => navigation.navigate("Upload")}
                    />
                }
            />
        );
    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ui.body}
            refreshControl={
                <RefreshControl
                    refreshing={state.loading && !!state.result}
                    onRefresh={state.refresh}
                    tintColor={colors.teal}
                />
            }
        >
            {feature === "discover" ? (
                <>
                    <View style={{ gap: 8 }}>
                        <Text style={ui.muted}>
                            CHÀO{" "}
                            {app.user?.fullName
                                .split(" ")
                                .at(-1)
                                ?.toUpperCase() ?? "BẠN"}{" "}
                            <Text style={{ color: colors.coral }}>☀</Text>
                        </Text>
                        <Text
                            style={{
                                fontFamily: fonts.bold,
                                fontSize: 35,
                                lineHeight: 46,
                                color: colors.ink,
                                letterSpacing: -1.5,
                            }}
                        >
                            Tìm một nơi ở.{"\n"}
                            <Text style={{ color: colors.teal }}>
                                Bắt đầu một hành trình.
                            </Text>
                        </Text>
                        <Text style={ui.muted}>
                            Không gian phù hợp, cuộc sống dễ dàng hơn.
                        </Text>
                    </View>
                    <View
                        style={[
                            ui.input,
                            ui.row,
                            { paddingVertical: 5, paddingRight: 6 },
                        ]}
                    >
                        <Icon name="search" size={18} />
                        <TextInput
                            accessibilityLabel="Tìm phòng"
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={() => {
                                setFilters((f) => ({ ...f, q: search.trim() }));
                                setPage(1);
                            }}
                            placeholder="Bạn muốn sống ở đâu?"
                            style={
                                {
                                    flex: 1,
                                    fontFamily: fonts.regular,
                                    color: colors.ink,
                                    fontSize: 12,
                                    minHeight: 42,
                                    outlineWidth: 0,
                                } as never
                            }
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Tìm kiếm phòng"
                            onPress={() => {
                                setFilters((f) => ({ ...f, q: search.trim() }));
                                setPage(1);
                            }}
                            style={{
                                backgroundColor: colors.teal,
                                padding: 12,
                                borderRadius: 11,
                            }}
                        >
                            <Icon
                                name="arrow-right"
                                color={colors.white}
                                size={18}
                            />
                        </Pressable>
                    </View>
                    <View style={ui.between}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Tất cả khu vực"
                            onPress={() => {
                                setFilters({});
                                setSearch("");
                                setPage(1);
                            }}
                        >
                            <Tag text="Tất cả khu vực" />
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Bộ lọc phòng"
                            onPress={() => {
                                setDraftFilters(filters);
                                setFilterOpen(true);
                            }}
                            style={ui.row}
                        >
                            <Icon name="sliders" size={14} />
                            <Text style={[ui.muted, { color: colors.teal }]}>
                                Bộ lọc
                            </Text>
                        </Pressable>
                    </View>
                    <LinearGradient
                        colors={["#E3EDCE", "#F0F3DF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            padding: 22,
                            borderRadius: 23,
                            minHeight: 166,
                            overflow: "hidden",
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <View style={{ flex: 1, gap: 10, zIndex: 1 }}>
                            <Tag text="CÙNG NHAU THẬT HỢP" />
                            <Text
                                style={{
                                    fontFamily: fonts.bold,
                                    fontSize: 22,
                                    lineHeight: 31,
                                    color: colors.teal,
                                    letterSpacing: -0.6,
                                }}
                            >
                                Tìm bạn ở ghép,{"\n"}thêm một người bạn.
                            </Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Khám phá ở ghép"
                                onPress={() =>
                                    navigation.navigate("Feature", {
                                        feature: "roommates",
                                    })
                                }
                                style={ui.row}
                            >
                                <Text
                                    style={{
                                        fontFamily: fonts.semibold,
                                        fontSize: 11,
                                        color: colors.teal,
                                    }}
                                >
                                    Khám phá ngay
                                </Text>
                                <Icon name="arrow-right" size={14} />
                            </Pressable>
                        </View>
                        <View
                            style={{
                                width: 88,
                                alignItems: "center",
                                gap: 10,
                                transform: [{ rotate: "-8deg" }],
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: colors.teal,
                                    padding: 22,
                                    borderRadius: 26,
                                }}
                            >
                                <Icon
                                    name="users"
                                    size={37}
                                    color={colors.lime}
                                />
                            </View>
                            <View
                                style={{
                                    position: "absolute",
                                    right: -7,
                                    top: -10,
                                    backgroundColor: colors.white,
                                    borderRadius: 12,
                                    padding: 8,
                                }}
                            >
                                <Icon
                                    name="heart"
                                    size={16}
                                    color={colors.coral}
                                />
                            </View>
                        </View>
                    </LinearGradient>
                    <View style={{ flexDirection: "row", gap: 9 }}>
                        {(
                            [
                                {
                                    key: "viewings",
                                    icon: "calendar",
                                    title: "Lịch xem",
                                },
                                {
                                    key: "contracts",
                                    icon: "file-text",
                                    title: "Hợp đồng",
                                },
                                {
                                    key: "invoices",
                                    icon: "credit-card",
                                    title: "Hóa đơn",
                                },
                                {
                                    key: "roommates",
                                    icon: "users",
                                    title: "Ở ghép",
                                },
                            ] as const
                        ).map((item) => (
                            <Pressable
                                key={item.key}
                                accessibilityRole="button"
                                accessibilityLabel={item.title}
                                onPress={() =>
                                    navigation.navigate("Feature", {
                                        feature: item.key,
                                    })
                                }
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    gap: 9,
                                }}
                            >
                                <View
                                    style={{
                                        width: 53,
                                        height: 53,
                                        backgroundColor:
                                            item.key === "roommates"
                                                ? colors.peach
                                                : colors.soft,
                                        borderRadius: 18,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Icon name={item.icon} />
                                </View>
                                <Text
                                    style={{
                                        fontFamily: fonts.medium,
                                        color: colors.ink,
                                        fontSize: 10,
                                    }}
                                >
                                    {item.title}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={ui.between}>
                        <Text style={ui.section}>Không gian dành cho bạn</Text>
                        <Icon name="home" size={19} />
                    </View>
                </>
            ) : (
                <Heading
                    title={config.title}
                    description={config.subtitle}
                    action={
                        createAllowed ? (
                            <Button
                                title="Thêm mới"
                                icon="plus"
                                onPress={() =>
                                    operation(
                                        create as number,
                                        {},
                                        {},
                                        undefined,
                                        create === 63,
                                    )
                                }
                            />
                        ) : undefined
                    }
                />
            )}
            {config.alternate && (
                <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                    {[
                        { id: config.read, title: "Tất cả" },
                        ...config.alternate,
                    ].map((item) => (
                        <Pressable
                            accessibilityRole="tab"
                            accessibilityState={{ selected: read === item.id }}
                            key={item.id}
                            onPress={() => {
                                setTab(item.id);
                                setPage(1);
                                setFilters({});
                            }}
                            style={{
                                borderRadius: 12,
                                padding: 11,
                                backgroundColor:
                                    read === item.id
                                        ? colors.teal
                                        : colors.white,
                                borderWidth: 1,
                                borderColor: colors.line,
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: fonts.medium,
                                    fontSize: 11,
                                    color:
                                        read === item.id
                                            ? colors.white
                                            : colors.muted,
                                }}
                            >
                                {item.title}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
            {state.loading ? (
                <Loading />
            ) : state.error ? (
                <>
                    <ErrorState error={state.error} retry={state.refresh} />
                    {state.error.code === "LOGIN_REQUIRED" && loginAction}
                    {read === 62 && state.error.status === 404 && (
                        <Button
                            title="Tạo hồ sơ ở ghép"
                            onPress={() =>
                                operation(63, {}, {}, undefined, true)
                            }
                        />
                    )}
                </>
            ) : feature === "dashboard" && isRecord(data) ? (
                <Dashboard data={data} admin={app.role === "admin"} />
            ) : list ? (
                list.length ? (
                    <View style={{ gap: 15 }}>
                        {list.map((item, index) => {
                            const record = isRecord(item) ? item : {};
                            const id =
                                typeof record.id === "string"
                                    ? record.id
                                    : undefined;
                            if (feature === "discover")
                                return (
                                    <PostCard
                                        key={id ?? index}
                                        data={item}
                                        onPress={() => openItem(item)}
                                    />
                                );
                            if (feature === "favorites")
                                return (
                                    <View key={index} style={{ gap: 8 }}>
                                        {isRecord(record.post) ? (
                                            <PostCard
                                                data={record.post}
                                                onPress={() =>
                                                    typeof record.postId ===
                                                        "string" &&
                                                    open(
                                                        58,
                                                        {
                                                            postId: record.postId,
                                                        },
                                                        "Chi tiết tin",
                                                        "post",
                                                    )
                                                }
                                            />
                                        ) : (
                                            <View style={ui.card}>
                                                <Text style={ui.text}>
                                                    Tin phòng đã ngừng hiển thị
                                                </Text>
                                                <Text style={ui.muted}>
                                                    Thông tin cũ được ẩn để bảo
                                                    vệ chủ tin.
                                                </Text>
                                            </View>
                                        )}
                                        {typeof record.postId === "string" && (
                                            <Button
                                                secondary
                                                title="Bỏ lưu"
                                                onPress={() =>
                                                    operation(61, {
                                                        postId: String(
                                                            record.postId,
                                                        ),
                                                    })
                                                }
                                            />
                                        )}
                                    </View>
                                );
                            return (
                                <View key={id ?? index} style={{ gap: 8 }}>
                                    <ResourceCard
                                        data={
                                            read === 68 &&
                                            isRecord(record.profile)
                                                ? record.profile
                                                : item
                                        }
                                        kind={config.kind}
                                        onPress={
                                            config.detail ||
                                            (feature === "reports" &&
                                                app.role === "admin")
                                                ? () => openItem(item)
                                                : undefined
                                        }
                                    />
                                    {id && read === 91 && (
                                        <View style={ui.row}>
                                            {app.role === "landlord" ? (
                                                <Button
                                                    secondary
                                                    title="Xử lý đề nghị"
                                                    onPress={() =>
                                                        operation(93, {
                                                            proposalId: id,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                <Button
                                                    secondary
                                                    title="Rút đề nghị"
                                                    onPress={() =>
                                                        operation(94, {
                                                            proposalId: id,
                                                        })
                                                    }
                                                />
                                            )}
                                        </View>
                                    )}
                                    {id && feature === "notifications" && (
                                        <Button
                                            secondary
                                            title={
                                                record.isRead
                                                    ? "Đánh dấu chưa đọc"
                                                    : "Đánh dấu đã đọc"
                                            }
                                            onPress={() =>
                                                operation(
                                                    88,
                                                    { notificationId: id },
                                                    { isRead: !record.isRead },
                                                )
                                            }
                                        />
                                    )}
                                    {id && feature === "listings" && (
                                        <View style={{ gap: 8 }}>
                                            <Button
                                                secondary
                                                title="Sửa tin"
                                                onPress={() =>
                                                    operation(
                                                        52,
                                                        { postId: id },
                                                        record,
                                                    )
                                                }
                                            />
                                            <Button
                                                secondary
                                                title="Ẩn tin"
                                                onPress={() =>
                                                    operation(55, {
                                                        postId: id,
                                                    })
                                                }
                                            />
                                        </View>
                                    )}
                                    {id && feature === "moderation" && (
                                        <Button
                                            secondary
                                            title="Duyệt / từ chối"
                                            onPress={() =>
                                                operation(54, { postId: id })
                                            }
                                        />
                                    )}
                                    {id && feature === "connections" && (
                                        <>
                                            <Button
                                                secondary
                                                title="Phản hồi lời mời"
                                                onPress={() =>
                                                    operation(73, {
                                                        requestId: id,
                                                    })
                                                }
                                            />
                                            <Button
                                                secondary
                                                title="Mở cuộc trò chuyện"
                                                onPress={() =>
                                                    operation(84, {
                                                        requestId: id,
                                                    })
                                                }
                                            />
                                            <Button
                                                secondary
                                                title="Hủy lời mời"
                                                onPress={() =>
                                                    operation(74, {
                                                        requestId: id,
                                                    })
                                                }
                                            />
                                            <Button
                                                secondary
                                                title="Kết thúc kết nối"
                                                onPress={() =>
                                                    operation(75, {
                                                        requestId: id,
                                                    })
                                                }
                                            />
                                        </>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <EmptyState
                        icon={config.icon}
                        title="Chưa có dữ liệu"
                        description="Thông tin mới sẽ xuất hiện tại đây khi được cập nhật."
                    />
                )
            ) : data !== undefined ? (
                <View style={ui.card}>
                    <RecordDetails data={data} />
                    {read === 62 && (
                        <Button
                            title="Sửa hồ sơ ở ghép"
                            secondary
                            onPress={() =>
                                operation(
                                    63,
                                    {},
                                    isRecord(data) ? data : {},
                                    state.result?.etag,
                                )
                            }
                        />
                    )}
                </View>
            ) : null}
            {pagination && (
                <View style={ui.between}>
                    <Button
                        secondary
                        title="Trang trước"
                        disabled={page <= 1}
                        onPress={() => setPage((p) => p - 1)}
                    />
                    <Text style={ui.muted}>
                        {pagination.totalPages
                            ? `${pagination.page} / ${pagination.totalPages}`
                            : "0 kết quả"}
                    </Text>
                    <Button
                        secondary
                        title="Trang sau"
                        disabled={
                            !pagination.totalPages ||
                            page >= pagination.totalPages
                        }
                        onPress={() => setPage((p) => p + 1)}
                    />
                </View>
            )}
            {!state.loading && !state.error && (
                <Button
                    secondary
                    title="Tải lại"
                    icon="refresh-cw"
                    onPress={state.refresh}
                />
            )}
            <WorkflowActions feature={feature} />
            <Modal
                transparent
                visible={filterOpen}
                animationType="slide"
                onRequestClose={() => setFilterOpen(false)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "#15382E66",
                    }}
                >
                    <ScrollView
                        contentContainerStyle={{ padding: 24, gap: 17 }}
                        style={{
                            maxHeight: "85%",
                            backgroundColor: colors.page,
                            borderTopLeftRadius: 25,
                            borderTopRightRadius: 25,
                        }}
                    >
                        <Heading title="Tìm nơi phù hợp" />
                        {[
                            {
                                key: "provinceCode",
                                title: "Mã tỉnh / thành phố",
                            },
                            { key: "maxRent", title: "Giá thuê tối đa (đ)" },
                            { key: "minArea", title: "Diện tích từ (m²)" },
                        ].map((f) => (
                            <View key={f.key} style={{ gap: 7 }}>
                                <Text style={ui.text}>{f.title}</Text>
                                <TextInput
                                    accessibilityLabel={f.title}
                                    style={ui.input}
                                    value={String(draftFilters[f.key] ?? "")}
                                    onChangeText={(v) =>
                                        setDraftFilters((x) => ({
                                            ...x,
                                            [f.key]: v,
                                        }))
                                    }
                                    keyboardType={
                                        f.key === "provinceCode"
                                            ? "default"
                                            : "decimal-pad"
                                    }
                                />
                            </View>
                        ))}
                        <Button
                            title="Áp dụng bộ lọc"
                            onPress={() => {
                                if (
                                    (draftFilters.maxRent &&
                                        !/^\d+(\.\d{1,2})?$/.test(
                                            String(draftFilters.maxRent),
                                        )) ||
                                    (draftFilters.minArea &&
                                        !/^\d+(\.\d{1,2})?$/.test(
                                            String(draftFilters.minArea),
                                        ))
                                ) {
                                    app.notify(
                                        "Giá và diện tích phải là số không âm, dùng dấu chấm cho phần lẻ.",
                                    );
                                    return;
                                }
                                setFilters(draftFilters);
                                setPage(1);
                                setFilterOpen(false);
                            }}
                        />
                        <Button
                            secondary
                            title="Đóng"
                            onPress={() => setFilterOpen(false)}
                        />
                    </ScrollView>
                </View>
            </Modal>
        </ScrollView>
    );
}
function Dashboard({ data, admin }: { data: RecordValue; admin: boolean }) {
    const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const cards: {
        key: string;
        title: string;
        icon: IconName;
        feature: FeatureKey;
    }[] = admin
        ? [
              {
                  key: "pendingIdentityCount",
                  title: "Danh tính chờ duyệt",
                  icon: "user-check",
                  feature: "verifications",
              },
              {
                  key: "pendingHouseProofCount",
                  title: "Quyền cho thuê",
                  icon: "shield",
                  feature: "verifications",
              },
              {
                  key: "pendingPostCount",
                  title: "Tin chờ duyệt",
                  icon: "layout",
                  feature: "moderation",
              },
              {
                  key: "userCount",
                  title: "Người dùng",
                  icon: "users",
                  feature: "users",
              },
          ]
        : [
              {
                  key: "houseCount",
                  title: "Nhà trọ",
                  icon: "home",
                  feature: "properties",
              },
              {
                  key: "roomCount",
                  title: "Phòng",
                  icon: "grid",
                  feature: "properties",
              },
              {
                  key: "occupiedRoomCount",
                  title: "Phòng đang ở",
                  icon: "users",
                  feature: "residents",
              },
              {
                  key: "upcomingViewingCount",
                  title: "Lịch xem sắp tới",
                  icon: "calendar",
                  feature: "viewings",
              },
          ];
    return (
        <View style={{ gap: 20 }}>
            {!admin && (
                <LinearGradient
                    colors={["#165B4B", "#123E33"]}
                    style={{ padding: 24, borderRadius: 23, gap: 15 }}
                >
                    <Text style={[ui.eyebrow, { color: "#ACC7B8" }]}>
                        SỐ TIỀN CHƯA THU
                    </Text>
                    <Text
                        style={{
                            fontFamily: fonts.bold,
                            fontSize: 30,
                            color: colors.white,
                        }}
                    >
                        {typeof data.unpaidAmount === "string"
                            ? money(data.unpaidAmount)
                            : "Chưa có thống kê"}
                    </Text>
                    <Text
                        style={{
                            fontFamily: fonts.regular,
                            fontSize: 11,
                            color: "#B6CCBC",
                        }}
                    >
                        Theo các hóa đơn chưa thanh toán
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                            nav.navigate("Feature", { feature: "invoices" })
                        }
                        style={[
                            ui.between,
                            {
                                borderTopWidth: 1,
                                borderColor: "#FFFFFF22",
                                paddingTop: 15,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                fontFamily: fonts.medium,
                                fontSize: 12,
                                color: colors.lime,
                            }}
                        >
                            Xem hóa đơn
                        </Text>
                        <Icon name="arrow-right" color={colors.lime} />
                    </Pressable>
                </LinearGradient>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {cards.map((card) => (
                    <Pressable
                        key={card.key}
                        accessibilityRole="button"
                        onPress={() =>
                            nav.navigate("Feature", { feature: card.feature })
                        }
                        style={[ui.card, { width: "47%", flexGrow: 1 }]}
                    >
                        <Icon name={card.icon} />
                        <Text
                            style={{
                                fontFamily: fonts.bold,
                                fontSize: 29,
                                color: colors.ink,
                            }}
                        >
                            {typeof data[card.key] === "number"
                                ? String(data[card.key])
                                : "—"}
                        </Text>
                        <Text style={ui.muted}>{card.title}</Text>
                    </Pressable>
                ))}
            </View>
            {!admin && (
                <>
                    <Text style={ui.section}>Lịch xem sắp tới</Text>
                    {Array.isArray(data.upcomingViewings) &&
                    data.upcomingViewings.length ? (
                        data.upcomingViewings.map((v, i) => (
                            <ResourceCard key={i} data={v} kind="viewing" />
                        ))
                    ) : (
                        <EmptyState
                            icon="calendar"
                            title={
                                Array.isArray(data.upcomingViewings)
                                    ? "Chưa có lịch xem"
                                    : "Chưa có thông tin lịch xem"
                            }
                            description="Vào mục Lịch xem để kiểm tra các cuộc hẹn của bạn."
                        />
                    )}
                </>
            )}
        </View>
    );
}
