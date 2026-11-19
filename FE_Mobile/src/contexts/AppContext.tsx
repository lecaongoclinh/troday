import React, {
    createContext,
    useContext,
    useMemo,
    useState,
    useCallback,
} from "react";
import { ApiClient, ApiError } from "../api/client";
import { endpoint } from "../api/catalog";
import { isRecord } from "../api/types";
import type { Role, SessionUser, RecordValue } from "../api/types";

interface AppContextValue {
    client: ApiClient;
    user: SessionUser | null;
    role: Role | "guest";
    roles: Role[];
    baseUrl: string;
    revision: number;
    setBaseUrl: (url: string) => void;
    selectRole: (role: Role) => void;
    login: (body: RecordValue, key: string) => Promise<void>;
    logout: () => Promise<void>;
    invalidate: () => void;
    refreshUser: () => Promise<void>;
    notice: string;
    notify: (text: string) => void;
    dismiss: () => void;
    uploadedFiles: { id: string; name: string; purpose: string }[];
    rememberFile: (file: { id: string; name: string; purpose: string }) => void;
}
const Context = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [baseUrl, setUrl] = useState(
        process.env.EXPO_PUBLIC_API_BASE_URL ?? "",
    );
    const [user, setUser] = useState<SessionUser | null>(null),
        [role, setRole] = useState<Role | "guest">("guest");
    const [token, setToken] = useState<string>(),
        [refreshToken, setRefreshToken] = useState<string>(),
        [revision, setRevision] = useState(0),
        [notice, notify] = useState("");
    const [uploadedFiles, setUploadedFiles] = useState<
        { id: string; name: string; purpose: string }[]
    >([]);
    const clear = useCallback(() => {
        setToken(undefined);
        setRefreshToken(undefined);
        setUser(null);
        setRole("guest");
        setUploadedFiles([]);
        setRevision((n) => n + 1);
    }, []);
    const client = useMemo(() => {
        const api = new ApiClient(baseUrl);
        api.token = token;
        api.refreshToken = refreshToken;
        api.onSession = (data) => {
            if (typeof data.accessToken === "string")
                setToken(data.accessToken);
            setRefreshToken(
                typeof data.refreshToken === "string"
                    ? data.refreshToken
                    : undefined,
            );
            if (isRecord(data.user))
                setUser(data.user as unknown as SessionUser);
        };
        api.onUnauthorized = () => {
            clear();
            notify("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
        };
        return api;
    }, [baseUrl, token, refreshToken, clear]);
    const roles: Role[] = (user?.roles ?? [])
        .map((r) => r.toLowerCase())
        .filter((r): r is Role => ["tenant", "landlord", "admin"].includes(r));
    async function login(body: RecordValue, key: string) {
        const result = await client.request(endpoint(2), {
            body,
            idempotencyKey: key,
        });
        if (
            !isRecord(result.data) ||
            typeof result.data.accessToken !== "string" ||
            !isRecord(result.data.user) ||
            typeof result.data.user.id !== "string" ||
            typeof result.data.user.fullName !== "string" ||
            !Array.isArray(result.data.user.roles) ||
            !result.data.user.roles.every((r) => typeof r === "string") ||
            result.data.user.status !== "ACTIVE"
        )
            throw new ApiError(
                "Phản hồi đăng nhập chưa đủ thông tin tài khoản và vai trò. Backend cần hoàn thiện hợp đồng Session.",
                { code: "CONTRACT_MISMATCH" },
            );
        const next = result.data.user as unknown as SessionUser;
        const first = next.roles
            .map((r) => r.toLowerCase())
            .find((r) => ["tenant", "landlord", "admin"].includes(r)) as
            | Role
            | undefined;
        if (!first)
            throw new ApiError("Tài khoản chưa có vai trò được hỗ trợ.", {
                code: "FORBIDDEN",
            });
        setToken(result.data.accessToken);
        setRefreshToken(
            typeof result.data.refreshToken === "string"
                ? result.data.refreshToken
                : undefined,
        );
        setUser(next);
        setRole(first);
        setRevision((n) => n + 1);
    }
    async function logout() {
        try {
            if (client.token && client.baseUrl)
                await client.request(endpoint(19), {
                    idempotencyKey: cryptoKey(),
                });
        } finally {
            clear();
        }
    }
    // Native UUID implementation is supplied by expo-crypto; never use Math.random for command keys.
    const value: AppContextValue = {
        client,
        user,
        role,
        roles,
        baseUrl,
        revision,
        setBaseUrl: (url) => {
            const next = new ApiClient(url);
            setUrl(next.baseUrl);
            clear();
        },
        selectRole: (next) => {
            if (roles.includes(next)) {
                setRole(next);
                setRevision((n) => n + 1);
            }
        },
        login,
        logout,
        invalidate: () => setRevision((n) => n + 1),
        refreshUser: async () => {
            const result = await client.request(endpoint(3));
            if (isRecord(result.data))
                setUser(result.data as unknown as SessionUser);
        },
        notice,
        notify,
        dismiss: () => notify(""),
        uploadedFiles,
        rememberFile: (file) =>
            setUploadedFiles((list) => [
                ...list.filter((f) => f.id !== file.id),
                file,
            ]),
    };
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
import { randomUUID as cryptoKey } from "expo-crypto";
export function useApp() {
    const context = useContext(Context);
    if (!context) throw new Error("AppProvider missing");
    return context;
}
