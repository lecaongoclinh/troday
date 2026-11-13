import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ApiClient } from "../../../shared/api/client.ts";
import { endpoint } from "../../../shared/api/catalog.ts";
import { isRecord } from "../../../shared/api/types.ts";
import { NAV } from "../data/navigation";

const Context = createContext(null);
const SESSION_KEY = "troday-api-session-v1";
const BASE_KEY = "troday-api-base-url-v1";
export const AUTH_VIEWS = ["login", "register", "forgot-password"];
const defaultBase = () => {
    const fallback =
        import.meta.env.VITE_API_BASE_URL ||
        new URL("/api/v1", location.origin).href;
    try {
        return new ApiClient(localStorage.getItem(BASE_KEY) || fallback)
            .baseUrl;
    } catch {
        return fallback;
    }
};
function savedSession() {
    try {
        const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        return s?.baseUrl === defaultBase() ? s : null;
    } catch {
        return null;
    }
}
function readRoute() {
    const q = new URLSearchParams(location.search);
    const requestedEndpoint = Number(q.get("endpoint"));
    const endpointId =
        Number.isInteger(requestedEndpoint) &&
        requestedEndpoint >= 1 &&
        requestedEndpoint <= 176
            ? requestedEndpoint
            : undefined;
    let params = {};
    try {
        const value = JSON.parse(q.get("params") || "{}");
        if (isRecord(value)) params = value;
    } catch {
        /* Invalid route. */
    }
    return {
        role: Object.hasOwn(NAV, q.get("role")) ? q.get("role") : "tenant",
        view: q.get("view") || "discover",
        id: q.get("id"),
        endpointId,
        params,
        kind: q.get("kind") || undefined,
        rowId: q.get("row") || undefined,
        title: q.get("title") || undefined,
    };
}
export function AppProvider({ children }) {
    const [baseUrl, setBase] = useState(defaultBase),
        [user, setUser] = useState(null),
        [route, setRoute] = useState(readRoute);
    const [revision, setRevision] = useState(0),
        [dialog, setDialog] = useState(null),
        [toast, setToast] = useState(""),
        [restoring, setRestoring] = useState(true);
    const mainRef = useRef(),
        toastTimer = useRef();
    const notify = useCallback((message) => {
        clearTimeout(toastTimer.current);
        setToast(message);
        toastTimer.current = setTimeout(() => setToast(""), 4500);
    }, []);
    const clear = useCallback(() => {
        setUser(null);
        setDialog(null);
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {}
        setRevision((n) => n + 1);
    }, []);
    const client = useMemo(() => new ApiClient(baseUrl), [baseUrl]);
    const persist = useCallback(() => {
        try {
            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    baseUrl: client.baseUrl,
                    token: client.token,
                    refreshToken: client.refreshToken,
                }),
            );
        } catch {}
    }, [client]);
    client.onUnauthorized = () => {
        clear();
        notify("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
    };
    client.onSession = (data) => {
        if (isRecord(data.user)) {
            setUser(data.user);
            persist();
        }
    };
    const roles = (user?.roles || [])
        .map((r) => r.toLowerCase())
        .filter((r) => Object.hasOwn(NAV, r));
    const role = user
        ? roles.includes(route.role)
            ? route.role
            : roles[0] || "tenant"
        : "tenant";
    const navigate = useCallback(
        (view, id = null, nextRole, extra = {}) => {
            const selected = nextRole || role;
            const next = { role: selected, view, id, ...extra };
            const url = new URL(location.href);
            url.search = "";
            for (const [key, value] of Object.entries({
                role: selected,
                view,
                id,
                endpoint: extra.endpointId,
                params: extra.params ? JSON.stringify(extra.params) : undefined,
                kind: extra.kind,
                row: extra.rowId,
                title: extra.title,
            }))
                if (value != null) url.searchParams.set(key, String(value));
            history.pushState(null, "", url);
            setDialog(null);
            setRoute(next);
            window.scrollTo(0, 0);
            requestAnimationFrame(() =>
                mainRef.current?.focus({ preventScroll: true }),
            );
        },
        [role],
    );
    const openResource = useCallback(
        (target, title) =>
            navigate("resource", null, undefined, { ...target, title }),
        [navigate],
    );
    const invalidate = useCallback(() => setRevision((n) => n + 1), []);
    const refreshUser = useCallback(async () => {
        const result = await client.request(endpoint(3));
        setUser(result.data);
    }, [client]);
    async function login(body) {
        const result = await client.request(endpoint(2), { body });
        if (!isRecord(result.data) || !isRecord(result.data.user))
            throw new Error("Thiếu thông tin tài khoản.");
        setUser(result.data.user);
        persist();
        invalidate();
        const first = result.data.user.roles?.[0]?.toLowerCase() || "tenant";
        navigate(first === "tenant" ? "discover" : "dashboard", null, first);
    }
    async function logout() {
        try {
            if (client.token) await client.request(endpoint(19));
        } finally {
            client.token = undefined;
            client.refreshToken = undefined;
            clear();
            navigate("login", null, "tenant");
        }
    }
    useEffect(() => {
        let active = true;
        const abort = new AbortController();
        const stored = savedSession();
        if (stored?.token) {
            client.token = stored.token;
            client.refreshToken = stored.refreshToken;
            client
                .request(endpoint(3), { signal: abort.signal })
                .then((r) => {
                    if (active) {
                        setUser(r.data);
                        persist();
                    }
                })
                .catch((e) => {
                    if (active && e.code !== "CANCELLED") {
                        client.token = undefined;
                        client.refreshToken = undefined;
                        clear();
                        notify(e.message);
                    }
                })
                .finally(() => {
                    if (active) setRestoring(false);
                });
        } else setRestoring(false);
        return () => {
            active = false;
            abort.abort();
        };
    }, [client, clear, persist, notify]);
    useEffect(() => {
        const pop = () => {
            setRoute(readRoute());
            setDialog(null);
        };
        window.addEventListener("popstate", pop);
        return () => {
            window.removeEventListener("popstate", pop);
            clearTimeout(toastTimer.current);
        };
    }, []);
    useEffect(() => {
        document.body.dataset.role = role;
        document.body.dataset.view = route.view;
        document.body.classList.toggle(
            "auth-open",
            AUTH_VIEWS.includes(route.view),
        );
        document.title = `${NAV[role].find(([id]) => id === route.view)?.[1] || "Trọday"} · Trọday`;
    }, [role, route.view]);
    const me = user?.id;
    const person = (id) => {
        const name = id === me && user ? user.fullName : "Khách";
        return {
            name,
            short: name?.split(" ").at(-1),
            initials:
                name
                    ?.split(" ")
                    .slice(-2)
                    .map((x) => x[0])
                    .join("") || "K",
            color: "",
        };
    };
    return (
        <Context.Provider
            value={{
                client,
                baseUrl,
                user,
                roles,
                role,
                me,
                route,
                revision,
                restoring,
                mainRef,
                notify,
                toast,
                dialog,
                openDialog: (type, props = {}) => setDialog({ type, ...props }),
                closeDialog: () => setDialog(null),
                navigate,
                openResource,
                login,
                logout,
                invalidate,
                refreshUser,
                person,
                switchRole: (r) => {
                    if (roles.includes(r))
                        navigate(
                            r === "tenant" ? "discover" : "dashboard",
                            null,
                            r,
                        );
                },
                setBaseUrl: (raw) => {
                    const next = new ApiClient(raw);
                    client.token = undefined;
                    client.refreshToken = undefined;
                    clear();
                    try {
                        localStorage.setItem(BASE_KEY, next.baseUrl);
                    } catch {}
                    setBase(next.baseUrl);
                    setRestoring(false);
                },
            }}
        >
            {children}
        </Context.Provider>
    );
}
export const useApp = () => useContext(Context);
