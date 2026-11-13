import type { FieldSpec, RecordValue } from "./types.ts";
import { isRecord } from "./types.ts";
import { dateVN } from "./format.ts";

export interface ValidationResult {
    body: RecordValue;
    errors: Record<string, string>;
}
const uuid =
    /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
export function enumOptions(schema: string, field: FieldSpec): string[] {
    const overrides: Record<string, string[]> = {
        "Room.status": ["AVAILABLE", "MAINTENANCE"],
        "RoommateProfile.housingStatus": ["NO_ACCOMMODATION", "EXTERNAL"],
        "ChatMessage.type": ["TEXT"],
        "RoomService.calculationMethodOverride": [
            "METERED",
            "PER_PERSON",
            "PER_ROOM",
        ],
        "HouseProofDocument.documentType": [
            "OWNER_PROOF",
            "AUTHORIZATION",
            "LEASE_AGREEMENT",
            "SUBLET_CONSENT",
            "OTHER",
        ],
    };
    return (
        overrides[`${schema}.${field.name}`] ?? [
            ...new Set(field.rule.match(/\b[A-Z][A-Z_]+\b/g) ?? []),
        ]
    );
}
export const nestedFields: Record<string, FieldSpec[]> = {
    HouseProofDocument: [
        {
            name: "fileId",
            type: "id",
            required: true,
            rule: "Tệp LANDLORD_PROOF ACTIVE thuộc bạn.",
        },
        {
            name: "documentType",
            type: "enum",
            required: true,
            rule: "OWNER_PROOF / AUTHORIZATION / LEASE_AGREEMENT / SUBLET_CONSENT / OTHER.",
        },
    ],
    TransferProposal: [
        {
            name: "content",
            type: "string",
            required: true,
            rule: "Nội dung đề xuất đã đối chiếu.",
        },
        {
            name: "endDate",
            type: "date",
            required: true,
            rule: "Ngày kết thúc đề xuất.",
        },
        {
            name: "rentAmount",
            type: "money",
            required: false,
            rule: "Không âm.",
        },
        {
            name: "depositAmount",
            type: "money",
            required: false,
            rule: "Không âm.",
        },
    ],
};
export function childSchema(schema: string, field: FieldSpec) {
    if (schema === "HouseProof" && field.name === "documents")
        return "HouseProofDocument";
    if (schema === "ContractChange" && field.name === "proposal")
        return "TransferProposal";
    return field.type.endsWith("[]") ? field.type.slice(0, -2) : "";
}
export function validDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const d = new Date(value + "T00:00:00Z");
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === value;
}
function decimalCompare(a: string, b: string) {
    const normalize = (v: string) => {
        const [whole, fraction = ""] = v.split(".");
        return BigInt(whole) * 1000n + BigInt(fraction.padEnd(3, "0"));
    };
    return normalize(a) < normalize(b)
        ? -1
        : normalize(a) > normalize(b)
          ? 1
          : 0;
}
export function validate(
    schema: string,
    fields: FieldSpec[],
    raw: RecordValue,
    schemas: Record<string, FieldSpec[]>,
    patch = false,
): ValidationResult {
    const body: RecordValue = {},
        errors: Record<string, string> = {};
    for (const field of fields) {
        let value = raw[field.name];
        const name = field.name;
        if (
            schema === "ContractChange" &&
            raw.type !== "TRANSFER" &&
            ["proposal", "targetRoomId"].includes(name)
        )
            continue;
        if (
            schema === "ContractChange" &&
            raw.type !== "RENEWAL" &&
            name === "newEndDate"
        )
            continue;
        if (
            typeof value === "string" &&
            !name.toLowerCase().includes("password")
        )
            value = value.trim();
        if (value === undefined || value === "") {
            if ((!patch || field.requiredOnPatch) && field.required)
                errors[name] = "Vui lòng nhập thông tin này.";
            continue;
        }
        if (value === null) {
            if (field.type.includes("|null")) body[name] = null;
            else errors[name] = "Trường này không chấp nhận giá trị trống.";
            continue;
        }
        const type = field.type.split("|")[0];
        if (type === "json") {
            try {
                body[name] =
                    typeof value === "string" ? JSON.parse(value) : value;
            } catch {
                errors[name] =
                    'Nhập giá trị hợp lệ, ví dụ false, 5 hoặc "yên tĩnh".';
            }
            continue;
        }
        if (type === "boolean") {
            if (typeof value !== "boolean")
                errors[name] = "Vui lòng chọn có hoặc không.";
            else body[name] = value;
            continue;
        }
        if (type.endsWith("[]")) {
            const child = childSchema(schema, field),
                spec = nestedFields[child] ?? schemas[child];
            const input =
                typeof value === "string"
                    ? value
                          .split(",")
                          .map((v) => v.trim())
                          .filter(Boolean)
                    : value;
            if (!Array.isArray(input)) {
                errors[name] = "Danh sách không hợp lệ.";
                continue;
            }
            if (spec) {
                const list: RecordValue[] = [];
                input.forEach((entry, i) => {
                    if (!isRecord(entry)) {
                        errors[`${name}.${i}`] = "Thông tin không hợp lệ.";
                        return;
                    }
                    const result = validate(child, spec, entry, schemas);
                    list.push(result.body);
                    for (const [key, message] of Object.entries(result.errors))
                        errors[`${name}.${i}.${key}`] = message;
                });
                body[name] = list;
            } else if (child === "id" || child === "string") {
                if (
                    input.some(
                        (v) =>
                            typeof v !== "string" ||
                            (child === "id" && !/^[1-9]\d*$/.test(v)),
                    )
                )
                    errors[name] = "Danh sách có giá trị không hợp lệ.";
                else body[name] = input;
            } else
                errors[name] =
                    "Cấu trúc dữ liệu này đang chờ backend xác nhận.";
            if (
                ["imageFileIds", "documents", "items", "memberIds"].includes(
                    name,
                ) &&
                input.length === 0
            )
                errors[name] = "Cần ít nhất một mục.";
            continue;
        }
        if (type === "object") {
            const child = childSchema(schema, field),
                spec = nestedFields[child] ?? schemas[child];
            if (!isRecord(value) || !spec) {
                errors[name] =
                    "Cấu trúc dữ liệu này đang chờ backend xác nhận.";
                continue;
            }
            const result = validate(child, spec, value, schemas);
            body[name] = result.body;
            for (const [key, message] of Object.entries(result.errors))
                errors[`${name}.${key}`] = message;
            continue;
        }
        if (type === "integer") {
            const text = String(value);
            if (!/^-?\d+$/.test(text) || !Number.isSafeInteger(Number(text)))
                errors[name] = "Nhập số nguyên hợp lệ.";
            else body[name] = Number(text);
            continue;
        }
        if (typeof value !== "string") {
            errors[name] = "Thông tin không đúng định dạng.";
            continue;
        }
        body[name] = value;
        if (type === "id" && !/^[1-9]\d*$/.test(value))
            errors[name] = "Mã phải là chuỗi số nguyên dương.";
        if (type === "uuid" && !uuid.test(value))
            errors[name] = "Mã xác minh không hợp lệ.";
        if (type === "money" && !/^\d{1,13}(\.\d{1,2})?$/.test(value))
            errors[name] =
                "Tiền phải không âm, tối đa 13 chữ số nguyên và 2 chữ số lẻ, dùng dấu chấm.";
        if (type === "decimal") {
            const signed = ["latitude", "longitude"].includes(name),
                scale = signed
                    ? 7
                    : [
                            "quantity",
                            "previousReading",
                            "currentReading",
                        ].includes(name)
                      ? 3
                      : 2;
            if (
                !new RegExp(
                    `^${signed ? "-?" : ""}\\d+(\\.\\d{1,${scale}})?$`,
                ).test(value)
            )
                errors[name] =
                    `Nhập số hợp lệ, tối đa ${scale} chữ số lẻ, dùng dấu chấm.`;
        }
        if (type === "date" && !validDate(value))
            errors[name] = "Nhập ngày hợp lệ theo YYYY-MM-DD.";
        if (
            type === "datetime" &&
            (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(
                value,
            ) ||
                !validDate(value.slice(0, 10)) ||
                Number.isNaN(Date.parse(value)))
        )
            errors[name] =
                "Nhập thời gian có múi giờ, ví dụ 2026-12-01T09:00:00+07:00.";
        if (type === "enum" && !enumOptions(schema, field).includes(value))
            errors[name] = "Chọn một giá trị trong danh sách.";
        const limit = field.rule.match(
            /(?:tối đa |≤|1[–-])([\d.]+)\s*(?:ký tự|,|sau)/i,
        )?.[1];
        if (limit && value.length > Number(limit.replaceAll(".", "")))
            errors[name] = `Tối đa ${limit} ký tự.`;
        if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            errors[name] = "Email chưa hợp lệ.";
        if (name === "phoneNumber" && !/^\+?[\d ()-]{6,20}$/.test(value))
            errors[name] = "Số điện thoại chưa hợp lệ.";
        if (name === "sha256" && !/^[\da-f]{64}$/i.test(value))
            errors[name] = "Mã kiểm tra phải gồm 64 ký tự hex.";
        if (
            name === "content" &&
            schema === "Post" &&
            new TextEncoder().encode(value).length > 65535
        )
            errors[name] = "Nội dung vượt giới hạn 65.535 byte UTF-8.";
    }
    const require = (
        name: string,
        message = "Vui lòng nhập thông tin này.",
    ) => {
        if (
            body[name] === undefined ||
            body[name] === "" ||
            body[name] === false
        )
            errors[name] = message;
    };
    if (schema === "Register" && !body.email && !body.phoneNumber)
        errors.email = "Cần ít nhất email hoặc số điện thoại.";
    if (
        ["Room", "Capacity"].includes(schema) &&
        body.capacity !== undefined &&
        Number(body.capacity) <= 0
    )
        errors.capacity = "Sức chứa phải lớn hơn 0.";
    if (schema === "Room" && body.area !== undefined && Number(body.area) <= 0)
        errors.area = "Diện tích phải lớn hơn 0.";
    if (schema === "House") {
        if ((body.latitude !== undefined) !== (body.longitude !== undefined))
            errors.latitude = "Cần nhập đồng thời vĩ độ và kinh độ.";
        if (body.latitude !== undefined && Math.abs(Number(body.latitude)) > 90)
            errors.latitude = "Vĩ độ nằm trong khoảng -90 đến 90.";
        if (
            body.longitude !== undefined &&
            Math.abs(Number(body.longitude)) > 180
        )
            errors.longitude = "Kinh độ nằm trong khoảng -180 đến 180.";
    }
    if (
        schema === "Decision" ||
        schema === "ViewingDecision" ||
        schema === "HouseDecision"
    ) {
        if (body.decision === "REJECT")
            require("reason", "Vui lòng ghi lý do từ chối.");
        if (
            schema === "HouseDecision" &&
            fields.some((f) => f.name === "evidenceChecked") &&
            body.decision === "APPROVE" &&
            body.evidenceChecked !== true
        )
            errors.evidenceChecked =
                "Cần đối chiếu minh chứng trước khi duyệt.";
    }
    if (
        body.startDate &&
        body.endDate &&
        String(body.endDate) < String(body.startDate)
    )
        errors.endDate = "Ngày kết thúc phải từ ngày bắt đầu trở đi.";
    if (schema === "HouseProof") {
        if (["AUTHORIZED", "SUBLESSOR"].includes(String(body.rightType)))
            require("validUntil");
        if (
            body.validUntil &&
            (String(body.validUntil) < String(body.validFrom) ||
                String(body.validUntil) < dateVN())
        )
            errors.validUntil =
                "Ngày hết hạn phải còn hiệu lực và từ ngày bắt đầu trở đi.";
        const docs = Array.isArray(body.documents) ? body.documents : [];
        if (docs.length > 8) errors.documents = "Tối đa 8 tệp minh chứng.";
        const required: Record<string, string[]> = {
            OWNER: ["OWNER_PROOF"],
            AUTHORIZED: ["OWNER_PROOF", "AUTHORIZATION"],
            SUBLESSOR: ["LEASE_AGREEMENT", "SUBLET_CONSENT"],
        };
        if (
            fields.some((f) => f.name === "documents") &&
            (required[String(body.rightType)] ?? []).some(
                (type) =>
                    !docs.some((d) => isRecord(d) && d.documentType === type),
            )
        )
            errors.documents = "Chưa đủ giấy tờ cho tư cách cho thuê đã chọn.";
    }
    if (schema === "RoommateProfile") {
        if (body.housingStatus === "EXTERNAL") require("externalContext");
        if (
            typeof body.budgetMin === "string" &&
            typeof body.budgetMax === "string" &&
            !errors.budgetMin &&
            !errors.budgetMax &&
            decimalCompare(body.budgetMin, body.budgetMax) > 0
        )
            errors.budgetMax =
                "Ngân sách tối đa phải từ ngân sách tối thiểu trở lên.";
    }
    if (["ViewingTime", "DirectViewing"].includes(schema)) {
        if (
            body.startsAt &&
            !errors.startsAt &&
            Date.parse(String(body.startsAt)) <= Date.now()
        )
            errors.startsAt = "Thời gian xem phải ở tương lai.";
        if (![30, 60, 90, 120].includes(Number(body.durationMinutes)))
            errors.durationMinutes = "Chọn 30, 60, 90 hoặc 120 phút.";
    }
    if (schema === "ChatMessage") {
        if (body.type === "TEXT")
            require("content", "Tin nhắn không được để trống.");
        if (
            body.type === "IMAGE" &&
            (!Array.isArray(body.fileIds) || !body.fileIds.length)
        )
            errors.fileIds = "Chọn ít nhất một ảnh.";
    }
    if (schema === "ContractChange") {
        if (
            body.type === "RENEWAL" &&
            fields.some((f) => f.name === "newEndDate")
        )
            require("newEndDate");
        if (body.type === "TRANSFER") {
            require("targetRoomId");
            if (fields.some((f) => f.name === "proposal")) require("proposal");
        }
    }
    if (
        schema === "RoommateInvite" &&
        body.scenario === "JOIN_SYSTEM_ROOM" &&
        fields.some((f) => f.name === "targetContractId")
    )
        require("targetContractId");
    if (schema === "JoinConsent" && body.consent !== true)
        errors.consent = "Cần xác nhận đồng ý để tiếp tục.";
    if (schema === "Handover" && body.consentRecorded !== true)
        errors.consentRecorded = "Cần ghi nhận sự đồng ý của người tiếp nhận.";
    if (
        schema === "InvoiceDraft" &&
        body.billingPeriod &&
        String(body.billingPeriod).slice(-2) !== "01"
    )
        errors.billingPeriod = "Kỳ hóa đơn phải là ngày đầu tháng.";
    if (
        schema === "Review" &&
        (!Number.isInteger(body.rating) ||
            Number(body.rating) < 1 ||
            Number(body.rating) > 5)
    )
        errors.rating = "Điểm đánh giá từ 1 đến 5.";
    if (schema === "InvoiceInputItem") {
        if (body.type === "SERVICE") require("roomServiceId");
        if (
            ["RENT", "SERVICE", "OTHER", "DISCOUNT"].includes(String(body.type))
        ) {
            require("name");
            require("quantity");
            require("unitPrice");
        }
        if (
            body.previousReading !== undefined &&
            body.currentReading !== undefined &&
            !errors.previousReading &&
            !errors.currentReading &&
            decimalCompare(
                String(body.previousReading),
                String(body.currentReading),
            ) > 0
        )
            errors.currentReading = "Chỉ số mới không được nhỏ hơn chỉ số cũ.";
    }
    if (patch && !Object.keys(body).length)
        errors._form = "Cần thay đổi ít nhất một trường.";
    if (
        schema === "ReportDecision" &&
        ["RESOLVE", "DISMISS"].includes(String(body.decision)) &&
        !body.resolution
    )
        errors.resolution = "Vui lòng nhập kết quả xử lý.";
    if (
        schema === "LifestyleValue" &&
        body.importance !== undefined &&
        (Number(body.importance) < 0 || Number(body.importance) > 5)
    )
        errors.importance = "Chọn mức độ từ 0 đến 5.";
    if (schema === "Report") {
        const targets = [
            "reportedUserId",
            "reportedPostId",
            "contractId",
            "roommateRequestId",
        ].filter((k) => body[k] !== undefined);
        if (targets.length !== 1)
            errors._form = "Chọn đúng một đối tượng cần báo cáo.";
    }
    if (
        schema === "LifestyleValue" &&
        body.selfValue == null &&
        body.preferredValue == null
    )
        errors.selfValue = "Cần nhập ít nhất một giá trị.";
    return { body, errors };
}
