import type { ApiResult, Endpoint, RecordValue } from "./types.ts";
import { isRecord } from "./types.ts";

export class ApiError extends Error {
    status: number;
    code: string;
    details: { field: string; message: string }[];
    requestId?: string;
    ambiguous: boolean;
    constructor(
        message: string,
        options: {
            status?: number;
            code?: string;
            details?: { field: string; message: string }[];
            requestId?: string;
            ambiguous?: boolean;
        } = {},
    ) {
        super(message);
        this.name = "ApiError";
        this.status = options.status ?? 0;
        this.code = options.code ?? "CLIENT_ERROR";
        this.details = options.details ?? [];
        this.requestId = options.requestId;
        this.ambiguous = options.ambiguous ?? false;
    }
}
const messages: Record<number, string> = {
    400: "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.",
    401: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
    403: "Bạn không có quyền thực hiện thao tác này.",
    404: "Không tìm thấy dữ liệu hoặc bạn không có quyền xem.",
    409: "Dữ liệu hoặc trạng thái đã thay đổi. Hãy tải lại trước khi tiếp tục.",
    422: "Vui lòng kiểm tra các trường nhập liệu.",
    429: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
    500: "Máy chủ gặp sự cố. Vui lòng thử lại sau.",
    503: "Dịch vụ tạm thời chưa sẵn sàng.",
};
export function normalizeBaseUrl(raw: string): string {
    if (!raw.trim()) return "";
    let url: URL;
    try {
        url = new URL(raw.trim());
    } catch {
        throw new ApiError("Địa chỉ máy chủ không hợp lệ.");
    }
    if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
    )
        throw new ApiError(
            "Địa chỉ máy chủ phải là HTTP(S), không chứa tài khoản, query hoặc fragment.",
        );
    return url.toString().replace(/\/+$/, "");
}
export function safeHttpUrl(value: unknown): string | undefined {
    if (typeof value !== "string") return;
    try {
        const u = new URL(value);
        if (
            ["http:", "https:"].includes(u.protocol) &&
            !u.username &&
            !u.password
        )
            return value;
    } catch {
        /* Invalid URL. */
    }
}
export function buildPath(
    endpoint: Endpoint,
    params: Record<string, string> = {},
) {
    return endpoint.path.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = String(params[key] ?? "");
        if (!/^[1-9]\d*$/.test(value))
            throw new ApiError("Chưa chọn tài nguyên hợp lệ.", {
                code: "INVALID_RESOURCE",
            });
        return encodeURIComponent(value);
    });
}
export function queryKeys(endpoint: Endpoint) {
    return [
        ...new Set([
            ...(endpoint.query || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            ...(endpoint.pagination === "page" ? ["page", "pageSize"] : []),
        ]),
    ];
}
// Jackson emits Long as JSON numbers. Preserve integer lexemes before JSON.parse,
// including IDs larger than Number.MAX_SAFE_INTEGER, without touching strings.
export function parseBackendJson(raw: string): unknown {
    return JSON.parse(
        raw.replace(
            /"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
            (token) => {
                if (token.startsWith('"')) return token;
                return /^-?\d+$/.test(token) &&
                    !Number.isSafeInteger(Number(token))
                    ? JSON.stringify(token)
                    : token;
            },
        ),
    );
}
const moneyKey =
    /^(rentAmount|depositAmount|unitPrice|unitPriceOverride|effectiveUnitPrice|total|amount|unpaidAmount|budgetMin|budgetMax|quantity|previousReading|currentReading)$/;
export function normalizeData(value: unknown, key = ""): unknown {
    if (Array.isArray(value))
        return value.map((v) =>
            normalizeData(v, key.endsWith("Ids") ? "id" : ""),
        );
    if (isRecord(value))
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, normalizeData(v, k)]),
        );
    if (
        typeof value === "number" &&
        (key === "id" || /Id$/.test(key) || moneyKey.test(key))
    )
        return String(value);
    // BE LocalDateTime represents business wall time in Vietnam. Normalize for
    // display; outgoing appointments are also converted to +07:00 below.
    if (
        typeof value === "string" &&
        /At$/.test(key) &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
    )
        return value + "+07:00";
    return value;
}
export function vietnamDateTime(value: string): string {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) throw new ApiError("Thời gian không hợp lệ.");
    return new Date(time + 7 * 3600000)
        .toISOString()
        .replace(/\.\d{3}Z$/, "+07:00");
}
export interface RequestOptions {
    params?: Record<string, string>;
    query?: RecordValue;
    body?: RecordValue;
    etag?: string;
    createOnly?: boolean;
    idempotencyKey?: string;
    signal?: AbortSignal;
    response?: "json" | "csv";
    all?: boolean;
}
export class ApiClient {
    baseUrl: string;
    token?: string;
    refreshToken?: string;
    onUnauthorized?: () => void;
    onSession?: (data: RecordValue) => void;
    private transport: typeof fetch;
    private timeout: number;
    constructor(
        baseUrl: string,
        options: { fetch?: typeof fetch; timeout?: number } = {},
    ) {
        this.baseUrl = normalizeBaseUrl(baseUrl);
        this.transport = options.fetch ?? globalThis.fetch.bind(globalThis);
        this.timeout = options.timeout ?? 20000;
    }
    async request<T = unknown>(
        endpoint: Endpoint,
        options: RequestOptions = {},
    ): Promise<ApiResult<T>> {
        if (!this.baseUrl)
            throw new ApiError(
                "Chưa kết nối máy chủ. Vui lòng cấu hình địa chỉ API.",
                { code: "NOT_CONFIGURED" },
            );
        if (endpoint.blockedReason)
            throw new ApiError(endpoint.blockedReason, { code: "UNAVAILABLE" });
        const isRefresh = endpoint.id === "API-018";
        const protectedRoute = endpoint.access !== "PUBLIC";
        if (
            (isRefresh && !this.refreshToken) ||
            (!isRefresh && protectedRoute && !this.token)
        )
            throw new ApiError("Vui lòng đăng nhập để tiếp tục.", {
                status: 401,
                code: "LOGIN_REQUIRED",
            });
        const query = new URLSearchParams();
        const allowed = queryKeys(endpoint);
        for (const [key, value] of Object.entries(options.query ?? {})) {
            if (value === undefined || value === null || value === "") continue;
            if (!allowed.includes(key))
                throw new ApiError("Bộ lọc không được hỗ trợ.", {
                    code: "INVALID_QUERY",
                });
            // BE returns the complete list. page/pageSize are handled by this adapter.
            if (!["page", "pageSize"].includes(key))
                query.set(key, String(value));
        }
        const headers: Record<string, string> = { Accept: "application/json" };
        if (isRefresh) headers["Refresh-Token"] = this.refreshToken!;
        else if (protectedRoute && this.token)
            headers.Authorization = `Bearer ${this.token}`;
        let body =
            options.body === undefined
                ? ["POST", "PUT", "PATCH"].includes(endpoint.method)
                    ? {}
                    : undefined
                : { ...options.body };
        if (body?.startsAt && typeof body.startsAt === "string")
            body.startsAt = vietnamDateTime(body.startsAt);
        if (
            endpoint.id === "API-148" &&
            (!Array.isArray(body?.items) || body.items.length === 0)
        )
            throw new ApiError(
                "Cần gửi đầy đủ chi tiết hóa đơn khi chỉnh sửa.",
                { code: "INVOICE_ITEMS_REQUIRED" },
            );
        if (endpoint.id === "API-080" && body?.type !== "TEXT")
            throw new ApiError("Hiện chỉ hỗ trợ tin nhắn văn bản.", {
                code: "UNAVAILABLE",
            });
        if (body !== undefined) headers["Content-Type"] = "application/json";
        // Only forward headers actually implemented by BE. Its domain-specific keys
        // (clientRequestKey/clientMessageKey) live in the JSON body, not If-Match.
        const controller = new AbortController();
        const abort = () => controller.abort();
        options.signal?.addEventListener("abort", abort, { once: true });
        if (options.signal?.aborted) controller.abort();
        const timer = setTimeout(abort, this.timeout);
        const write = endpoint.method !== "GET";
        try {
            const suffix = query.toString();
            const response = await this.transport(
                `${this.baseUrl}${buildPath(endpoint, options.params)}${suffix ? "?" + suffix : ""}`,
                {
                    method: endpoint.method,
                    headers,
                    body: body === undefined ? undefined : JSON.stringify(body),
                    signal: controller.signal,
                    credentials: "omit",
                },
            );
            if (response.status === 401 && protectedRoute && !isRefresh) {
                this.token = undefined;
                this.refreshToken = undefined;
                this.onUnauthorized?.();
            }
            let json: unknown;
            try {
                json = parseBackendJson(await response.text());
            } catch {
                throw new ApiError(
                    response.ok
                        ? "Phản hồi máy chủ không đúng định dạng."
                        : (messages[response.status] ??
                          "Không thể hoàn tất yêu cầu."),
                    {
                        status: response.status,
                        code: "INVALID_RESPONSE",
                        ambiguous: write,
                    },
                );
            }
            if (!response.ok) {
                // Spring Boot errors use status/error/message/path. Never expose SQL,
                // Java exception details, or tokens from a raw server error to the UI.
                throw new ApiError(
                    messages[response.status] ?? "Không thể hoàn tất yêu cầu.",
                    {
                        status: response.status,
                        code: `HTTP_${response.status}`,
                        requestId:
                            response.headers.get("x-request-id") ?? undefined,
                        ambiguous:
                            write &&
                            (response.status >= 500 || response.status === 408),
                    },
                );
            }
            if (
                !isRecord(json) ||
                json.success !== true ||
                !("data" in json) ||
                typeof json.timestamp !== "string"
            )
                throw new ApiError(
                    "Dữ liệu máy chủ chưa đúng cấu trúc phản hồi.",
                    { code: "CONTRACT_MISMATCH", ambiguous: write },
                );
            let data = normalizeData(json.data);
            const meta: ApiResult<T>["meta"] = {
                requestId: response.headers.get("x-request-id") ?? "",
                timestamp: json.timestamp,
            };
            if (endpoint.pagination === "page" && !options.all) {
                const items = Array.isArray(data)
                    ? data
                    : isRecord(data) && Array.isArray(data.items)
                      ? data.items
                      : undefined;
                if (items) {
                    const page = Math.max(
                        1,
                        Math.trunc(Number(options.query?.page) || 1),
                    );
                    const pageSize = Math.max(
                        1,
                        Math.min(
                            100,
                            Math.trunc(Number(options.query?.pageSize) || 20),
                        ),
                    );
                    meta.pagination = {
                        page,
                        pageSize,
                        total: items.length,
                        totalPages: Math.ceil(items.length / pageSize),
                    };
                    const slice = items.slice(
                        (page - 1) * pageSize,
                        page * pageSize,
                    );
                    data = Array.isArray(data)
                        ? slice
                        : { ...(data as RecordValue), items: slice };
                }
            }
            if (endpoint.id === "API-002" || isRefresh) {
                if (
                    !isRecord(data) ||
                    typeof data.accessToken !== "string" ||
                    !isRecord(data.user) ||
                    typeof data.user.id !== "string" ||
                    typeof data.user.fullName !== "string" ||
                    !Array.isArray(data.user.roles) ||
                    !data.user.roles.every((r) => typeof r === "string") ||
                    !data.user.roles.some((r) =>
                        ["TENANT", "LANDLORD", "ADMIN"].includes(
                            String(r).toUpperCase(),
                        ),
                    ) ||
                    data.user.status !== "ACTIVE"
                )
                    throw new ApiError(
                        "Phản hồi phiên đăng nhập chưa đầy đủ.",
                        { code: "CONTRACT_MISMATCH", ambiguous: true },
                    );
                this.token = data.accessToken;
                // BE rotates refresh once but does not return a replacement. Do not
                // reuse the consumed token or invent a cookie/native refresh contract.
                this.refreshToken =
                    typeof data.refreshToken === "string"
                        ? data.refreshToken
                        : undefined;
                this.onSession?.(data);
            }
            return { data: data as T, meta };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            if (options.signal?.aborted)
                throw new ApiError("Yêu cầu đã được hủy.", {
                    code: "CANCELLED",
                    ambiguous: write,
                });
            throw new ApiError(
                controller.signal.aborted
                    ? "Máy chủ phản hồi quá lâu. Vui lòng thử lại."
                    : "Không thể kết nối máy chủ. Kiểm tra mạng và địa chỉ API.",
                {
                    code: controller.signal.aborted
                        ? "TIMEOUT"
                        : "NETWORK_ERROR",
                    ambiguous: write,
                },
            );
        } finally {
            clearTimeout(timer);
            options.signal?.removeEventListener("abort", abort);
        }
    }
}
