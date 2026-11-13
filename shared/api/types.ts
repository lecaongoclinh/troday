export type Role = "tenant" | "landlord" | "admin";
export type RecordValue = Record<string, unknown>;
export interface FieldSpec {
    name: string;
    type: string;
    required: boolean;
    rule: string;
    example?: unknown;
    requiredOnPatch?: boolean;
}
export interface Endpoint {
    id: string;
    method: string;
    path: string;
    title: string;
    access: string;
    input: string | null;
    inputFields: FieldSpec[];
    output: string;
    headers: string[];
    query: string;
    pagination: string | null;
    logic: string;
    group: string;
    flowIds: string[];
    errorCodes: string[];
    status: number;
    dependencies: string[];
    blockedReason?: string;
}
export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}
export interface ApiResult<T = unknown> {
    data: T;
    meta: { requestId: string; timestamp: string; pagination?: Pagination };
    etag?: string;
}
export interface SessionUser {
    id: string;
    fullName: string;
    roles: string[];
    status: string;
    [key: string]: unknown;
}
export const isRecord = (value: unknown): value is RecordValue =>
    typeof value === "object" && value !== null && !Array.isArray(value);
