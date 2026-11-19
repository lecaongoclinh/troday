// Idempotent alignment of the endpoint catalogue to implemented BE services.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const file = path.join(root, "shared/api/contract.json");
const c = JSON.parse(fs.readFileSync(file, "utf8"));
const field = (name, type, required = false, rule = "") => ({
    name,
    type,
    required,
    rule,
});
const get = (n) =>
    c.endpoints.find((e) => e.id === `API-${String(n).padStart(3, "0")}`);
const remove = (n, names) => {
    get(n).inputFields = get(n).inputFields.filter(
        (f) => !names.includes(f.name),
    );
};
const add = (n, f) => {
    remove(n, [f.name]);
    get(n).inputFields.push(f);
};
c.version = "backend-implemented-v1";
c.date = "2026-11-12";
c.source =
    "BE controllers/services; ApiResponseDto(success,api,method,data,timestamp)";
for (const e of c.endpoints) {
    e.headers = e.headers.filter(
        (h) => !/^(If-Match|If-None-Match|Idempotency-Key):/.test(h),
    );
    e.status = 200;
    delete e.blockedReason;
}
for (const [n, names] of [
    [4, ["avatarFileId"]],
    [32, ["latitude", "longitude"]],
    [34, ["documents"]],
    [39, ["evidenceChecked"]],
    [43, ["allowAdditionalOccupants", "notes"]],
    [44, ["code", "allowAdditionalOccupants", "notes"]],
    [51, ["imageFileIds"]],
    [52, ["imageFileIds"]],
    [63, ["requirementsSnapshot"]],
    [72, ["targetContractId"]],
    [80, ["fileIds"]],
    [88, ["throughCreatedAt"]],
    [103, ["extraMembers", "templateId"]],
    [107, ["baseRevisionId", "templateId"]],
    [110, ["memberIds"]],
    [113, ["content", "members"]],
    [118, ["roommateRequestId"]],
    [130, ["newEndDate", "proposal"]],
    [133, ["proposalHash", "proposedRevisionId"]],
    [156, ["targetType", "targetId", "evidenceFileIds"]],
    [166, ["active"]],
])
    remove(n, names);
get(80).inputFields.find((f) => f.name === "type").rule = "TEXT";
add(
    23,
    field("phoneNumber", "string", true, "Số điện thoại đã yêu cầu xác minh."),
);
add(
    63,
    field(
        "profileVersion",
        "integer",
        false,
        "Phiên bản hồ sơ nhận từ máy chủ khi cập nhật.",
    ),
);
add(
    92,
    field(
        "clientRequestKey",
        "uuid",
        true,
        "Giữ nguyên khi gửi lại cùng một đề nghị.",
    ),
);
add(
    147,
    field(
        "payerRoomTenantId",
        "id",
        true,
        "Mã người thanh toán trong danh sách thành viên hợp đồng.",
    ),
);
add(154, field("contractId", "id", true));
add(154, field("roomId", "id", true));
get(155).inputFields = [
    field("decision", "enum", true, "HIDE / RESTORE / DELETE"),
    field("reason", "string", true),
];
get(160).inputFields = [
    field("decision", "enum", true, "INVESTIGATE / RESOLVE / DISMISS"),
    field("resolution", "string", false),
];
for (const name of [
    "reportedUserId",
    "reportedPostId",
    "contractId",
    "roommateRequestId",
])
    add(156, field(name, "id", false, "Chọn đúng một đối tượng báo cáo."));
get(133).input = null;
get(88).input = "NotificationRead";
get(88).inputFields = [field("isRead", "boolean", true)];
get(89).input = null;
get(89).inputFields = [];
add(167, field("content", "string", false));
add(
    52,
    field(
        "contentVersion",
        "integer",
        false,
        "Phiên bản tin được máy chủ trả về.",
    ),
);
get(70).inputFields = structuredClone(get(69).inputFields).map((f) => ({
    ...f,
    requiredOnPatch: f.required,
}));
get(52).inputFields = get(52).inputFields.map((f) =>
    ["title", "content"].includes(f.name)
        ? { ...f, required: true, requiredOnPatch: true }
        : f,
);
get(148).inputFields = get(148).inputFields.map((f) =>
    f.name === "items" ? { ...f, required: true, requiredOnPatch: true } : f,
);
get(18).headers = ["Refresh-Token: <refreshToken>"];
get(18).output =
    "Session {accessToken,expiresAt,user}; không có refresh token kế tiếp";
get(2).output = "Session {accessToken,refreshToken,expiresAt,user}";
get(116).output = "Resident[] (JSON); FE chuyển sang CSV khi xuất";
get(130).output =
    "ContractChangeRequest; effectiveDate được BE dùng làm ngày kết thúc mới cho RENEWAL";
c.schemas.LifestyleValue = [
    field("criterionId", "id", true),
    field("selfValue", "json"),
    field("preferredValue", "json"),
    field("isMandatory", "boolean"),
    field("importance", "integer", false, "0–5"),
];
get(67).inputFields = [field("criteria", "LifestyleValue[]", true)];
c.schemas.InvoiceInputItem = [
    field("type", "enum", true, "RENT / SERVICE / OTHER"),
    field("name", "string", true),
    field("unit", "string", true),
    field("quantity", "decimal", true),
    field("unitPrice", "money", true),
    field("roomServiceId", "id", false),
    field(
        "calculationMethod",
        "enum",
        false,
        "METERED / PER_PERSON / PER_ROOM",
    ),
    field("previousReading", "decimal", false),
    field("currentReading", "decimal", false),
];
get(91).query = "status";
get(95).query = "status";
get(101).query = "";
get(114).query = "";
get(117).query = "status";
for (const n of [46, 47, 49, 153]) get(n).access = "PUBLIC";
const blocks = {
    24: "Chức năng khôi phục mật khẩu hiện chưa khả dụng. Vui lòng liên hệ quản trị viên.",
    25: "Chức năng khôi phục mật khẩu hiện chưa khả dụng. Vui lòng liên hệ quản trị viên.",
    26: "Chức năng khôi phục mật khẩu hiện chưa khả dụng. Vui lòng liên hệ quản trị viên.",
    90: "Thông báo trực tiếp chưa khả dụng. Hãy tải lại để nhận cập nhật.",
    113: "Nhập hợp đồng giấy và thành viên hiện chưa khả dụng.",
    143: "Lưu giá dịch vụ riêng của phòng hiện chưa khả dụng.",
    170: "Tải nội dung tệp lên hiện chưa khả dụng.",
    171: "Xác nhận nội dung tệp hiện chưa khả dụng.",
    173: "Tải nội dung tệp về hiện chưa khả dụng.",
};
for (const [n, reason] of Object.entries(blocks))
    get(Number(n)).blockedReason = reason;
for (const e of c.endpoints)
    if (e.input && e.method !== "PATCH" && e.input !== "InvoiceDraft")
        c.schemas[e.input] = structuredClone(e.inputFields);
c.schemas.InvoiceDraft = structuredClone(get(147).inputFields);
fs.writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
console.log(
    `Aligned ${c.endpoints.length} endpoints to BE; ${Object.keys(blocks).length} incomplete operations are guarded.`,
);
