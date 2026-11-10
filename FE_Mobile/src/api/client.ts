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
  400: "Yêu cầu chưa hợp lệ. Vui lòng kiểm tra lại thông tin.",
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
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
    !["https:", "http:"].includes(url.protocol) ||
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
export function buildPath(
  endpoint: Endpoint,
  params: Record<string, string> = {},
) {
  return endpoint.path.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (!value || !/^[1-9]\d*$/.test(value))
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
export function safeHttpUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  try {
    const url = new URL(value);
    if (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
      return value;
  } catch {
    /* Invalid URL */
  }
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
}
export class ApiClient {
  baseUrl: string;
  token?: string;
  onUnauthorized?: () => void;
  private transport: typeof fetch;
  private timeout: number;
  constructor(
    baseUrl: string,
    options: { fetch?: typeof fetch; timeout?: number } = {},
  ) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.transport = options.fetch ?? fetch;
    this.timeout = options.timeout ?? 20000;
  }
  async request<T = unknown>(
    endpoint: Endpoint,
    options: RequestOptions = {},
  ): Promise<ApiResult<T>> {
    if (!this.baseUrl)
      throw new ApiError(
        "Chưa kết nối máy chủ. Vui lòng cấu hình địa chỉ API trong mục Kết nối.",
        { code: "NOT_CONFIGURED" },
      );
    const protectedRoute = endpoint.access !== "PUBLIC";
    if (protectedRoute && !this.token)
      throw new ApiError("Vui lòng đăng nhập để tiếp tục.", {
        status: 401,
        code: "LOGIN_REQUIRED",
      });
    if (endpoint.id === "API-018")
      throw new ApiError(
        "Cơ chế gia hạn phiên cho ứng dụng di động chưa được backend xác nhận. Vui lòng đăng nhập lại.",
        { code: "CONTRACT_PENDING" },
      );
    const path = buildPath(endpoint, options.params);
    const query = new URLSearchParams();
    const allowed = queryKeys(endpoint);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      if (!allowed.includes(key))
        throw new ApiError("Bộ lọc không được đặc tả hỗ trợ.", {
          code: "INVALID_QUERY",
        });
      query.set(key, String(value));
    }
    const headers: Record<string, string> = {
      Accept: options.response === "csv" ? "text/csv" : "application/json",
    };
    if (protectedRoute && this.token)
      headers.Authorization = `Bearer ${this.token}`;
    if (options.body !== undefined)
      headers["Content-Type"] = "application/json";
    if (endpoint.headers.some((h) => h.startsWith("Idempotency-Key:"))) {
      if (
        !options.idempotencyKey ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          options.idempotencyKey,
        )
      )
        throw new ApiError(
          "Thiếu khóa an toàn cho thao tác. Vui lòng mở lại biểu mẫu.",
          { code: "MISSING_IDEMPOTENCY" },
        );
      headers["Idempotency-Key"] = options.idempotencyKey;
    }
    if (options.createOnly) headers["If-None-Match"] = "*";
    else if (endpoint.headers.some((h) => h.startsWith("If-Match:"))) {
      if (!options.etag)
        throw new ApiError("Cần tải phiên bản mới nhất trước khi cập nhật.", {
          code: "MISSING_VERSION",
        });
      headers["If-Match"] = options.etag;
    }
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    const timer = setTimeout(abort, this.timeout);
    const write = endpoint.method !== "GET";
    const queryString = query.toString();
    try {
      const response = await this.transport(
        `${this.baseUrl}${path}${queryString ? "?" + queryString : ""}`,
        {
          method: endpoint.method,
          headers,
          body:
            options.body === undefined
              ? undefined
              : JSON.stringify(options.body),
          signal: controller.signal,
          credentials: "omit",
        },
      );
      if (response.status === 401 && protectedRoute) {
        this.token = undefined;
        this.onUnauthorized?.();
      }
      if (options.response === "csv" && response.ok) {
        if (!response.headers.get("content-type")?.includes("text/csv"))
          throw new ApiError("Máy chủ chưa trả tệp CSV đúng định dạng.", {
            code: "CONTRACT_MISMATCH",
          });
        return {
          data: (await response.text()) as T,
          meta: {
            requestId: response.headers.get("x-request-id") ?? "",
            timestamp: new Date().toISOString(),
          },
        };
      }
      let json: unknown;
      try {
        json = await response.json();
      } catch {
        throw new ApiError(
          response.ok
            ? "Phản hồi máy chủ không đúng định dạng đã đặc tả."
            : (messages[response.status] ?? "Không thể hoàn tất yêu cầu."),
          {
            status: response.status,
            code: "INVALID_RESPONSE",
            ambiguous: write,
          },
        );
      }
      if (!response.ok) {
        const error =
          isRecord(json) && isRecord(json.error) ? json.error : undefined;
        const meta =
          isRecord(json) && isRecord(json.meta) ? json.meta : undefined;
        const details = Array.isArray(error?.details)
          ? error.details
              .filter(isRecord)
              .filter(
                (d) =>
                  typeof d.field === "string" && typeof d.message === "string",
              )
              .map((d) => ({
                field: String(d.field),
                message: String(d.message),
              }))
          : [];
        throw new ApiError(
          messages[response.status] ?? "Không thể hoàn tất yêu cầu.",
          {
            status: response.status,
            code: typeof error?.code === "string" ? error.code : "HTTP_ERROR",
            details,
            requestId:
              typeof meta?.requestId === "string" ? meta.requestId : undefined,
            ambiguous:
              write &&
              (response.status >= 500 ||
                response.status === 408 ||
                (response.status === 409 &&
                  error?.code === "REQUEST_IN_PROGRESS")),
          },
        );
      }
      if (
        !isRecord(json) ||
        !("data" in json) ||
        json.error !== null ||
        !isRecord(json.meta) ||
        typeof json.meta.requestId !== "string" ||
        typeof json.meta.timestamp !== "string"
      )
        throw new ApiError(
          "Dữ liệu máy chủ chưa khớp hợp đồng phản hồi. Vui lòng liên hệ bộ phận hỗ trợ.",
          { code: "CONTRACT_MISMATCH", ambiguous: write },
        );
      if (endpoint.pagination === "page") {
        const p = json.meta.pagination;
        if (
          !isRecord(p) ||
          !["page", "pageSize", "total", "totalPages"].every(
            (k) =>
              typeof p[k] === "number" &&
              Number.isInteger(p[k]) &&
              Number(p[k]) >= 0,
          ) ||
          Number(p.page) < 1 ||
          Number(p.pageSize) < 1 ||
          Number(p.pageSize) > 100
        )
          throw new ApiError("Phản hồi thiếu thông tin phân trang hợp lệ.", {
            code: "CONTRACT_MISMATCH",
          });
      }
      return {
        data: json.data as T,
        meta: json.meta as unknown as ApiResult<T>["meta"],
        etag: response.headers.get("etag") ?? undefined,
      };
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
          code: controller.signal.aborted ? "TIMEOUT" : "NETWORK_ERROR",
          ambiguous: write,
        },
      );
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
    }
  }
}
