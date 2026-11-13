import { isRecord } from "./types.ts";
const columns = [
    ["id", "Mã cư dân"],
    ["fullName", "Họ và tên"],
    ["contractId", "Hợp đồng"],
    ["roomId", "Phòng"],
    ["status", "Trạng thái"],
    ["plannedMoveInDate", "Ngày dự kiến"],
    ["moveInDate", "Ngày vào ở"],
    ["moveOutDate", "Ngày rời đi"],
];
export function residentsCsv(data: unknown): string {
    if (!Array.isArray(data)) throw new Error("Danh sách cư dân không hợp lệ.");
    const cell = (value: unknown) => {
        let text = String(value ?? "");
        if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
        return '"' + text.replaceAll('"', '""') + '"';
    };
    return (
        "\uFEFF" +
        [
            columns.map(([, title]) => cell(title)).join(","),
            ...data
                .filter(isRecord)
                .map((row) => columns.map(([key]) => cell(row[key])).join(",")),
        ].join("\r\n")
    );
}
