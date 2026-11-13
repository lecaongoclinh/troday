import type { RecordValue } from "./types.ts";
import { isRecord } from "./types.ts";

export const featureDefinitions: Record<
    string,
    {
        title: string;
        description: string;
        read: number;
        create?: number;
        group: string[];
        tabs?: [number, string][];
    }
> = {
    discover: {
        title: "Tìm một nơi ở. Bắt đầu một hành trình.",
        description: "Khám phá không gian phù hợp với bạn.",
        read: 57,
        group: ["posts"],
    },
    favorites: {
        title: "Những nơi bạn đã lưu",
        description: "Tiếp tục tìm một nơi gọi là nhà.",
        read: 59,
        group: ["posts"],
    },
    dashboard: {
        title: "Tổng quan",
        description: "Theo dõi hoạt động và công việc của bạn.",
        read: 175,
        group: [],
    },
    properties: {
        title: "Nhà & phòng",
        description: "Quản lý các không gian thuộc nhà trọ của bạn.",
        read: 29,
        create: 30,
        group: ["property"],
    },
    services: {
        title: "Dịch vụ",
        description: "Danh mục dịch vụ và đơn giá theo từng nhà.",
        read: 137,
        group: ["billing"],
    },
    listings: {
        title: "Tin đăng",
        description: "Theo dõi và cập nhật tin đăng của bạn.",
        read: 50,
        create: 51,
        group: ["posts"],
    },
    moderation: {
        title: "Kiểm duyệt tin đăng",
        description: "Xem xét nội dung trước khi công khai.",
        read: 53,
        group: ["posts"],
    },
    viewings: {
        title: "Lịch xem phòng",
        description: "Sắp xếp một buổi gặp để tìm nơi phù hợp.",
        read: 95,
        create: 92,
        group: ["viewings"],
        tabs: [
            [95, "Lịch hẹn"],
            [91, "Đề nghị xem"],
        ],
    },
    contracts: {
        title: "Hợp đồng thuê trọ",
        description: "Rõ ràng điều khoản, an tâm khi thuê.",
        read: 101,
        create: 103,
        group: ["contracts", "residents", "changes"],
    },
    residents: {
        title: "Người ở",
        description: "Theo dõi cư trú và lịch sử đại diện.",
        read: 114,
        group: ["residents"],
    },
    invoices: {
        title: "Hóa đơn",
        description: "Theo dõi từng kỳ thanh toán.",
        read: 145,
        create: 147,
        group: ["billing"],
    },
    chats: {
        title: "Tin nhắn",
        description: "Trao đổi trước khi quyết định.",
        read: 77,
        group: ["messages"],
    },
    roommates: {
        title: "Tìm bạn ở ghép",
        description: "Cùng tìm một nơi thật hợp.",
        read: 68,
        create: 63,
        group: ["roommates"],
        tabs: [
            [68, "Gợi ý kết nối"],
            [71, "Lời mời"],
            [62, "Hồ sơ của tôi"],
            [65, "Tiêu chí sinh hoạt"],
        ],
    },
    verifications: {
        title: "Xác minh hồ sơ",
        description: "Theo dõi hồ sơ đang cần xét duyệt.",
        read: 37,
        group: ["account", "property"],
        tabs: [
            [37, "Quyền cho thuê"],
            [12, "Danh tính người thuê"],
            [15, "Hồ sơ chủ trọ"],
        ],
    },
    templates: {
        title: "Mẫu hợp đồng",
        description: "Quản lý các nội dung thỏa thuận.",
        read: 165,
        create: 166,
        group: ["moderation"],
    },
    reports: {
        title: "Báo cáo",
        description: "Theo dõi phản ánh và kết quả xử lý.",
        read: 157,
        create: 156,
        group: ["moderation"],
    },
    users: {
        title: "Người dùng",
        description: "Quản lý thành viên trong cộng đồng.",
        read: 161,
        group: ["moderation"],
    },
    audit: {
        title: "Nhật ký quản trị",
        description: "Lịch sử thay đổi và người thực hiện.",
        read: 168,
        group: ["moderation"],
    },
    notifications: {
        title: "Thông báo",
        description: "Các cập nhật dành riêng cho bạn.",
        read: 86,
        group: ["messages"],
    },
};
export interface ResourceTarget {
    endpointId: number;
    params: Record<string, string>;
    kind: string;
    rowId?: string;
}
export function resourceTarget(
    read: number,
    value: RecordValue,
    parent: Record<string, string> = {},
): ResourceTarget | undefined {
    if (read === 68 && isRecord(value.profile))
        return resourceTarget(64, value.profile, parent);
    const id = String(value.id ?? value.postId ?? "");
    if (!/^[1-9]\d*$/.test(id)) return;
    const map: Record<number, [number, string, string]> = {
        57: [58, "postId", "post"],
        58: [58, "postId", "post"],
        59: [58, "postId", "post"],
        29: [31, "houseId", "house"],
        31: [31, "houseId", "house"],
        42: [46, "roomId", "room"],
        46: [46, "roomId", "room"],
        95: [96, "viewingId", "viewing"],
        101: [102, "contractId", "contract"],
        145: [146, "invoiceId", "invoice"],
        77: [78, "conversationId", "conversation"],
        64: [64, "profileId", "roommate"],
        37: [38, "verificationId", "house-verification"],
        12: [13, "verificationId", "identity-verification"],
        15: [16, "verificationId", "landlord-verification"],
        158: [159, "reportId", "report"],
        161: [162, "userId", "user"],
        168: [169, "actionId", "audit"],
        33: [35, "verificationId", "house-proof"],
        129: [131, "requestId", "change"],
    };
    if (map[read]) {
        const [endpointId, param, kind] = map[read];
        return { endpointId, params: { ...parent, [param]: id }, kind };
    }
    const collection: Record<number, string> = {
        50: "listing",
        53: "moderation-post",
        91: "proposal",
        71: "invitation",
        165: "template",
        140: "house-service",
        144: "room-service",
        105: "revision",
        115: "member",
        117: "join",
        7: "my-identity",
        10: "my-landlord",
        20: "session",
        86: "notification",
        65: "criterion",
    };
    return {
        endpointId: read,
        params: parent,
        kind: collection[read] ?? "record",
        rowId: id,
    };
}
export interface Operation {
    id: number;
    title?: string;
    initial?: RecordValue;
    params?: Record<string, string>;
}
export function resourceActions(
    kind: string,
    data: RecordValue,
    params: Record<string, string>,
    userId = "",
): Operation[] {
    const status = String(data.status ?? "");
    const id = String(data.id ?? "");
    const action = (
        id: number,
        initial?: RecordValue,
        extra?: Record<string, string>,
    ): Operation => ({ id, initial, params: { ...params, ...extra } });
    switch (kind) {
        case "house":
            return [action(32, data), action(43), action(34), action(141)];
        case "room":
            return [
                action(44, data),
                action(45, data),
                action(51, { roomId: id }),
            ];
        case "post":
            return [
                action(60),
                action(61),
                action(76, { postId: id }),
                action(156, { reportedPostId: id }),
            ];
        case "listing":
            return [
                action(52, data, { postId: id }),
                action(55, undefined, { postId: id }),
            ];
        case "moderation-post":
            return status === "PENDING_REVIEW"
                ? [action(54, undefined, { postId: id })]
                : status === "HIDDEN"
                  ? [action(56, undefined, { postId: id })]
                  : [];
        case "proposal":
            return status === "PENDING"
                ? [
                      action(93, undefined, { proposalId: id }),
                      action(94, undefined, { proposalId: id }),
                  ]
                : [];
        case "viewing":
            return status === "SCHEDULED"
                ? [action(98), action(99)]
                : status === "COMPLETED"
                  ? [
                        action(100),
                        ...(data.rentalDecision === "AGREED"
                            ? [action(103, { viewingId: id })]
                            : []),
                    ]
                  : [];
        case "contract":
            return [
                ...(["PENDING_CONFIRMATION"].includes(status)
                    ? [
                          action(109, { revisionId: data.currentRevisionId }),
                          action(106),
                      ]
                    : []),
                ...(["CONFIRMED", "ACTIVE"].includes(status)
                    ? [action(110)]
                    : []),
                ...(["DRAFT", "PENDING_CONFIRMATION", "CONFIRMED"].includes(
                    status,
                )
                    ? [action(111)]
                    : []),
                ...(status === "ACTIVE"
                    ? [
                          action(130, {
                              baseRevisionId: data.currentRevisionId,
                          }),
                          action(128),
                      ]
                    : []),
            ];
        case "invoice":
            return status === "DRAFT"
                ? [
                      action(148, {
                          ...data,
                          items: Array.isArray(data.items)
                              ? data.items.map((item) =>
                                    isRecord(item) ? { ...item } : item,
                                )
                              : [],
                      }),
                      action(149),
                  ]
                : ["UNPAID", "OVERDUE"].includes(status)
                  ? [action(150), action(151)]
                  : status === "CANCELLED"
                    ? [action(152)]
                    : [];
        case "house-verification":
            return status === "PENDING"
                ? [action(39)]
                : status === "APPROVED"
                  ? [action(40)]
                  : [];
        case "identity-verification":
            return status === "PENDING" ? [action(14)] : [];
        case "landlord-verification":
            return status === "PENDING" ? [action(17)] : [];
        case "house-proof":
            return status === "PENDING" ? [action(36)] : [];
        case "my-identity":
            return status === "PENDING"
                ? [action(8, undefined, { verificationId: id })]
                : [];
        case "my-landlord":
            return status === "PENDING"
                ? [action(11, undefined, { verificationId: id })]
                : [];
        case "user":
            return [action(status === "LOCKED" ? 164 : 163)];
        case "template":
            return [action(167, data, { templateId: id })];
        case "house-service":
            return [action(142, data, { houseServiceId: id })];
        case "room-service":
            return [
                action(143, data, {
                    houseServiceId: String(data.houseServiceId),
                }),
            ];
        case "revision":
            return status === "DRAFT"
                ? [
                      action(107, data, { revisionId: id }),
                      action(108, undefined, { revisionId: id }),
                  ]
                : [];
        case "member":
            return [
                action(27, undefined, { memberId: id }),
                ...(status === "PLANNED"
                    ? [action(112, undefined, { memberId: id })]
                    : []),
                ...(status === "ACTIVE"
                    ? [action(125, undefined, { memberId: id })]
                    : []),
            ];
        case "join":
            return [119, 120, 121, 122, 123, 124].map((n) =>
                action(n, undefined, { requestId: id }),
            );
        case "invitation":
            return status === "PENDING"
                ? [
                      action(data.receiverId === userId ? 73 : 74, undefined, {
                          requestId: id,
                      }),
                  ]
                : status === "ACCEPTED"
                  ? [
                        action(84, undefined, { requestId: id }),
                        action(75, undefined, { requestId: id }),
                    ]
                  : [];
        case "report":
            return [action(160)];
        case "change":
            return status === "PENDING"
                ? [action(132), action(134)]
                : status === "APPROVED_WAITING_CONFIRMATION"
                  ? [action(133), action(134)]
                  : status === "READY_TO_APPLY"
                    ? [action(135), action(134)]
                    : [];
        case "session":
            return [action(21, undefined, { sessionId: id })];
        case "notification":
            return [
                action(88, { isRead: !data.isRead }, { notificationId: id }),
            ];
        case "criterion":
            return [action(70, data, { criterionId: id })];
        case "roommate":
            return [];
        default:
            return [];
    }
}
export function relatedResources(
    kind: string,
    data: RecordValue,
): [number, string, Record<string, string>][] {
    const id = String(data.id ?? "");
    if (kind === "house")
        return [
            [42, "Phòng", { houseId: id }],
            [140, "Dịch vụ", { houseId: id }],
            [33, "Lịch sử xác minh", { houseId: id }],
            [41, "Quyền cho thuê", { houseId: id }],
        ];
    if (kind === "room" || kind === "post") {
        const roomId = kind === "post" ? String(data.roomId) : id;
        return [
            [49, "Dịch vụ", { roomId }],
            [153, "Đánh giá", { roomId }],
            ...(kind === "room"
                ? ([
                      [47, "Tin đăng", { roomId }],
                      [48, "Người ở", { roomId }],
                      [144, "Giá dịch vụ phòng", { roomId }],
                  ] as [number, string, Record<string, string>][])
                : []),
        ];
    }
    if (kind === "contract")
        return [
            [105, "Phiên bản hợp đồng", { contractId: id }],
            [115, "Người ở", { contractId: id }],
            [129, "Yêu cầu thay đổi", { contractId: id }],
            [127, "Lịch sử đại diện", { contractId: id }],
            [126, "Ứng viên đại diện", { contractId: id }],
            [136, "Phòng có thể chuyển", { contractId: id }],
        ];
    return [];
}
