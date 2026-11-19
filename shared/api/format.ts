export function money(value: unknown) {
    if (typeof value !== "string" || !/^\d+(\.\d{1,2})?$/.test(value))
        return "Chưa có giá";
    const [whole, decimal] = value.split(".");
    return (
        whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
        (decimal && !/^0+$/.test(decimal) ? "," + decimal : "") +
        " đ"
    );
}
export function dateTime(value: unknown) {
    if (typeof value !== "string") return "Chưa có thời gian";
    const d = new Date(value);
    if (Number.isNaN(d.valueOf())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
    }).format(d);
}
export function dateVN(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
    }).formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
}
