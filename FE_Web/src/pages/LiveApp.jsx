import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { useApi } from "../api/useApi";
import {
    endpoint,
    endpoints,
    allowed,
    pathKeys,
    schemas,
} from "../../../shared/api/catalog.ts";
import { isRecord } from "../../../shared/api/types.ts";
import {
    featureDefinitions,
    resourceTarget,
    resourceActions,
    relatedResources,
} from "../../../shared/api/workflows.ts";
import { labels, label, displayValue } from "../../../shared/api/labels.ts";
import {
    validate,
    enumOptions,
    nestedFields,
    childSchema,
} from "../../../shared/api/validation.ts";
import { money, dateTime } from "../../../shared/api/format.ts";
import { residentsCsv } from "../../../shared/api/csv.ts";
import {
    Badge,
    Button,
    Empty,
    Field,
    Icon,
    PageHeader,
    Tabs,
} from "../components/ui";

export function ApiState({ state, children }) {
    const app = useApp();
    if (app.restoring || state.loading)
        return (
            <div className="api-loading" role="status">
                Đang tải dữ liệu…
            </div>
        );
    if (!state.permitted)
        return (
            <Empty
                title="Đăng nhập để tiếp tục"
                action={
                    <Button
                        variant="primary"
                        onClick={() => app.navigate("login")}
                    >
                        Đăng nhập
                    </Button>
                }
            >
                Chức năng này dành cho tài khoản có quyền truy cập.
            </Empty>
        );
    if (state.error)
        return (
            <div className="api-error" role="alert">
                <strong>{state.error.message}</strong>
                <div className="table-actions">
                    <Button onClick={state.refresh}>Thử lại</Button>
                    {state.error.status === 401 && (
                        <Button onClick={() => app.navigate("login")}>
                            Đăng nhập
                        </Button>
                    )}
                </div>
            </div>
        );
    return children;
}
const privateKey =
    /(password|token|secret|storageKey|sha256|uploadUrl|downloadUrl|resetGrant)/i;
export function RecordDetails({ data, depth = 0 }) {
    if (data == null) return <p className="muted">Chưa có thông tin.</p>;
    if (depth > 4)
        return <p className="muted">Xem thông tin trong mục liên quan.</p>;
    if (Array.isArray(data))
        return data.length ? (
            <div className="api-stack">
                {data.map((v, i) => (
                    <RecordDetails key={i} data={v} depth={depth + 1} />
                ))}
            </div>
        ) : (
            <p className="muted">Chưa có dữ liệu.</p>
        );
    if (!isRecord(data)) return <span>{displayValue(data)}</span>;
    return (
        <dl className="api-details">
            {Object.entries(data)
                .filter(([k]) => !privateKey.test(k))
                .map(([key, value]) => (
                    <div key={key}>
                        <dt>
                            {labels[key] ||
                                key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                        </dt>
                        <dd>
                            {isRecord(value) || Array.isArray(value) ? (
                                <RecordDetails data={value} depth={depth + 1} />
                            ) : key === "status" ? (
                                <Badge status={value} />
                            ) : /(Amount|Price|total|budgetMin|budgetMax)$/.test(
                                  key,
                              ) ? (
                                money(value)
                            ) : /At$/.test(key) && typeof value === "string" ? (
                                dateTime(value)
                            ) : (
                                displayValue(value)
                            )}
                        </dd>
                    </div>
                ))}
        </dl>
    );
}
function cardTitle(item) {
    return (
        item.title ||
        item.name ||
        item.fullName ||
        item.contractNumber ||
        item.code ||
        (item.profile
            ? "Gợi ý ở ghép"
            : item.id
              ? `Thông tin #${item.id}`
              : "Thông tin")
    );
}
function ResourceList({ read, data, params = {} }) {
    const app = useApp();
    const rows = Array.isArray(data)
        ? data
        : isRecord(data) && Array.isArray(data.items)
          ? data.items
          : null;
    if (!rows)
        return (
            <div className="flat-surface padded">
                <RecordDetails data={data} />
            </div>
        );
    if (!rows.length)
        return (
            <Empty title="Chưa có dữ liệu">
                Thông tin từ máy chủ sẽ hiển thị tại đây.
            </Empty>
        );
    return (
        <div
            className={
                [57, 59].includes(read) ? "api-post-grid" : "api-resource-grid"
            }
        >
            {rows.map((value, index) => {
                if (!isRecord(value))
                    return <div key={index}>{displayValue(value)}</div>;
                const item =
                    read === 59 && isRecord(value.post) ? value.post : value;
                const target = resourceTarget(
                    read,
                    read === 59 ? { ...item, postId: value.postId } : item,
                    params,
                );
                const room = isRecord(item.room) ? item.room : {};
                return (
                    <article
                        className="api-resource-card"
                        key={String(value.id || value.postId || index)}
                    >
                        {[57, 59].includes(read) && (
                            <div className="api-room-image">
                                <Icon name="home" width="42" height="42" />
                                <span>Chưa có ảnh hiển thị</span>
                            </div>
                        )}
                        <div className="api-card-content">
                            <div className="api-card-heading">
                                <h2>
                                    {read === 59 && !value.post
                                        ? "Tin không còn khả dụng"
                                        : cardTitle(item)}
                                </h2>
                                {item.status && <Badge status={item.status} />}
                            </div>
                            {(item.address || item.house?.address) && (
                                <p className="muted">
                                    {item.address || item.house.address}
                                </p>
                            )}
                            {item.content && (
                                <p className="api-excerpt">{item.content}</p>
                            )}
                            {room.area && (
                                <p className="muted">
                                    {room.area} m² · {room.capacity} người
                                </p>
                            )}
                            {(item.total != null ||
                                item.rentAmount != null ||
                                room.rentAmount != null) && (
                                <strong className="api-price">
                                    {money(
                                        item.total ??
                                            item.rentAmount ??
                                            room.rentAmount,
                                    )}
                                </strong>
                            )}
                            {item.startsAt && <p>{dateTime(item.startsAt)}</p>}
                            {item.profile && <RecordDetails data={item} />}
                            <div className="table-actions">
                                {target && !(read === 59 && !value.post) && (
                                    <Button
                                        onClick={() =>
                                            app.openResource(
                                                target,
                                                cardTitle(item),
                                            )
                                        }
                                    >
                                        Xem chi tiết{" "}
                                        <Icon name="arrow-up-right" />
                                    </Button>
                                )}
                                {read === 59 && (
                                    <Button
                                        onClick={() =>
                                            app.openDialog("operation", {
                                                endpointId: 61,
                                                params: {
                                                    postId: String(
                                                        value.postId,
                                                    ),
                                                },
                                            })
                                        }
                                    >
                                        Bỏ lưu
                                    </Button>
                                )}
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
function Pagination({ pagination, setPage }) {
    if (!pagination || pagination.totalPages <= 1) return null;
    return (
        <div className="api-pagination">
            <Button
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
            >
                Trước
            </Button>
            <span>
                Trang {pagination.page}/{pagination.totalPages} ·{" "}
                {pagination.total} mục
            </span>
            <Button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
            >
                Sau
            </Button>
        </div>
    );
}
export default function LivePage() {
    const app = useApp();
    const config = Object.hasOwn(featureDefinitions, app.route.view)
        ? featureDefinitions[app.route.view]
        : featureDefinitions.discover;
    const [tab, setTab] = useState(),
        [page, setPage] = useState(1),
        [query, setQuery] = useState({}),
        [draft, setDraft] = useState({});
    let read = tab || config.read;
    if (app.route.view === "dashboard" && app.role === "admin") read = 176;
    if (app.route.view === "reports" && app.role === "admin") read = 158;
    const spec = endpoint(read),
        state = useApi(read, {
            query: {
                ...query,
                ...(spec.pagination === "page" ? { page, pageSize: 20 } : {}),
            },
        });
    let create = config.create;
    if (app.route.view === "viewings" && app.role === "landlord") create = 97;
    const canCreate =
        create &&
        allowed(
            endpoint(create),
            app.user?.roles || [],
            app.user ? app.role : "guest",
        );
    const queryFields = (spec.query || "").split(",").filter(Boolean);
    return (
        <>
            <PageHeader title={config.title} description={config.description}>
                <Button onClick={state.refresh} icon="refresh-cw">
                    Tải lại
                </Button>
                {canCreate && (
                    <Button
                        variant="primary"
                        icon="plus"
                        onClick={() =>
                            app.openDialog("operation", { endpointId: create })
                        }
                    >
                        {endpoint(create).title}
                    </Button>
                )}
                {app.route.view === "residents" && app.user && (
                    <Button
                        onClick={() =>
                            app.openDialog("operation", { endpointId: 116 })
                        }
                    >
                        Xuất CSV
                    </Button>
                )}
            </PageHeader>
            {config.tabs && (
                <div className="filter-bar">
                    <Tabs
                        items={config.tabs}
                        value={read}
                        onChange={(id) => {
                            setTab(id);
                            setPage(1);
                            setQuery({});
                            setDraft({});
                        }}
                    />
                </div>
            )}
            {!!queryFields.length && (
                <form
                    className="api-filter"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setQuery(draft);
                    }}
                >
                    {queryFields.map((key) => (
                        <Field label={labels[key] || key} key={key}>
                            <input
                                name={key}
                                value={draft[key] || ""}
                                onChange={(e) =>
                                    setDraft({
                                        ...draft,
                                        [key]: e.target.value,
                                    })
                                }
                            />
                        </Field>
                    ))}
                    <Button type="submit" variant="primary">
                        Áp dụng
                    </Button>
                    <Button
                        onClick={() => {
                            setDraft({});
                            setQuery({});
                            setPage(1);
                        }}
                    >
                        Xóa bộ lọc
                    </Button>
                </form>
            )}
            <ApiState state={state}>
                <ResourceList read={read} data={state.result?.data} />
                <Pagination
                    pagination={state.result?.meta.pagination}
                    setPage={setPage}
                />
            </ApiState>
            <RelatedOperations groups={config.group} />
        </>
    );
}
function RelatedOperations({ groups }) {
    const app = useApp();
    if (!app.user || !groups?.length) return null;
    const list = endpoints.filter(
        (e) => groups.includes(e.group) && allowed(e, app.user.roles, app.role),
    );
    return (
        <details className="api-operations">
            <summary>Các thao tác liên quan</summary>
            <div className="api-operation-grid">
                {list.map((e) => (
                    <Button
                        key={e.id}
                        onClick={() =>
                            app.openDialog("operation", {
                                endpointId: Number(e.id.slice(4)),
                            })
                        }
                    >
                        {e.title}
                    </Button>
                ))}
            </div>
        </details>
    );
}
export function LiveResource() {
    const app = useApp(),
        route = app.route;
    const [page, setPage] = useState(1);
    const read = route.endpointId || 58,
        state = useApi(read, {
            params: route.params,
            all: !!route.rowId,
            query:
                endpoint(read).pagination === "page"
                    ? {
                          page: route.rowId ? 1 : page,
                          pageSize: route.rowId ? 100 : 20,
                      }
                    : undefined,
        });
    // A selected row is found in the full BE collection, without imposing a
    // nonexistent single-resource endpoint on private posts/proposals/templates.
    const source = state;
    const raw = source.result?.data;
    const list = Array.isArray(raw)
        ? raw
        : isRecord(raw) && Array.isArray(raw.items)
          ? raw.items
          : [];
    const selected = route.rowId
        ? list.find((x) => isRecord(x) && String(x.id) === route.rowId)
        : raw;
    const data = isRecord(selected) ? selected : {};
    const actions = resourceActions(
        route.kind,
        data,
        route.params || {},
        app.user?.id,
    ).filter((a) =>
        allowed(
            endpoint(a.id),
            app.user?.roles || [],
            app.user ? app.role : "guest",
        ),
    );
    return (
        <>
            <PageHeader title={route.title || "Thông tin chi tiết"}>
                <Button onClick={() => history.back()}>Quay lại</Button>
                <Button onClick={source.refresh}>Tải lại</Button>
            </PageHeader>
            <ApiState state={source}>
                {route.rowId && !selected ? (
                    <Empty title="Mục này không còn trong danh sách" />
                ) : (
                    <>
                        {route.kind === "conversation" ? (
                            <Chat
                                conversationId={route.params.conversationId}
                            />
                        ) : Array.isArray(selected) ||
                          (isRecord(selected) &&
                              Array.isArray(selected.items)) ? (
                            <ResourceList
                                read={read}
                                data={selected}
                                params={route.params}
                            />
                        ) : (
                            <div className="flat-surface padded">
                                <RecordDetails data={selected} />
                            </div>
                        )}
                        <div className="api-action-bar">
                            {actions.map((a, i) => (
                                <Button
                                    key={`${a.id}:${i}`}
                                    variant="primary"
                                    onClick={() =>
                                        app.openDialog("operation", {
                                            endpointId: a.id,
                                            params: a.params,
                                            initial: a.initial,
                                        })
                                    }
                                >
                                    {a.title || endpoint(a.id).title}
                                </Button>
                            ))}
                        </div>
                        <div className="api-action-bar">
                            {relatedResources(route.kind, data)
                                .filter(([id]) =>
                                    allowed(
                                        endpoint(id),
                                        app.user?.roles || [],
                                        app.user ? app.role : "guest",
                                    ),
                                )
                                .map(([id, title, params]) => (
                                    <Button
                                        key={id}
                                        onClick={() =>
                                            app.openResource(
                                                { endpointId: id, params },
                                                title,
                                            )
                                        }
                                    >
                                        {title}
                                    </Button>
                                ))}
                        </div>
                        {!route.rowId && (
                            <Pagination
                                pagination={state.result?.meta.pagination}
                                setPage={setPage}
                            />
                        )}
                    </>
                )}
            </ApiState>
        </>
    );
}
function Chat({ conversationId }) {
    const app = useApp(),
        state = useApi(79, { params: { conversationId } });
    const [text, setText] = useState(""),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const key = useRef(crypto.randomUUID()),
        [uncertain, setUncertain] = useState(false);
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") state.refresh();
        }, 15000);
        return () => clearInterval(timer);
    }, [state.refresh]);
    useEffect(() => {
        const data = state.result?.data;
        if (!Array.isArray(data) || !data.length) return;
        const last = data.at(-1);
        if (last?.id)
            app.client
                .request(endpoint(81), {
                    params: { conversationId },
                    body: { lastReadMessageId: last.id },
                })
                .catch(() => {});
    }, [state.result, app.client, conversationId]);
    async function send(e) {
        e.preventDefault();
        if (!text.trim() || busy) return;
        setBusy(true);
        setError("");
        try {
            await app.client.request(endpoint(80), {
                params: { conversationId },
                body: {
                    type: "TEXT",
                    content: text.trim(),
                    clientMessageKey: key.current,
                },
            });
            key.current = crypto.randomUUID();
            setText("");
            setUncertain(false);
            state.refresh();
            app.invalidate();
        } catch (err) {
            setError(err.message);
            setUncertain(err.ambiguous);
        } finally {
            setBusy(false);
        }
    }
    return (
        <div className="api-chat">
            <ApiState state={state}>
                {Array.isArray(state.result?.data) &&
                state.result.data.length ? (
                    state.result.data.map((m, i) => (
                        <div
                            key={m.id || i}
                            className={`api-message ${m.senderId === app.user?.id ? "mine" : ""}`}
                        >
                            <p>{m.content || displayValue(m.type)}</p>
                            <small>{dateTime(m.sentAt)}</small>
                        </div>
                    ))
                ) : (
                    <Empty title="Bắt đầu cuộc trò chuyện" />
                )}
            </ApiState>
            <form onSubmit={send}>
                <Field label="Nội dung tin nhắn">
                    <textarea
                        value={text}
                        disabled={busy || uncertain}
                        maxLength={2000}
                        required
                        onChange={(e) => setText(e.target.value)}
                    />
                </Field>
                {error && (
                    <p role="alert" className="form-error">
                        {error}
                    </p>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    disabled={busy || !text.trim()}
                >
                    {busy
                        ? "Đang gửi…"
                        : uncertain
                          ? "Gửi lại cùng tin nhắn"
                          : "Gửi tin nhắn"}
                </Button>
            </form>
            <div className="api-action-bar">
                <Button
                    onClick={() =>
                        app.openDialog("operation", {
                            endpointId: 92,
                            initial: { conversationId },
                        })
                    }
                >
                    Đề nghị xem phòng
                </Button>
                <Button
                    onClick={() =>
                        app.openDialog("operation", {
                            endpointId: 85,
                            params: { conversationId },
                        })
                    }
                >
                    Chia sẻ tin phòng
                </Button>
            </div>
        </div>
    );
}
export function LiveProfile() {
    const app = useApp(),
        state = useApi(3);
    useEffect(() => {
        if (state.result?.data?.fullName)
            document.title = `${state.result.data.fullName} · Trọday`;
    }, [state.result]);
    return (
        <>
            <PageHeader
                title="Tài khoản của bạn"
                description="Thông tin cá nhân và bảo mật."
            >
                <Button onClick={() => app.openDialog("connection")}>
                    Kết nối máy chủ
                </Button>
            </PageHeader>
            <ApiState state={state}>
                <div className="flat-surface padded">
                    <RecordDetails data={state.result?.data} />
                </div>
                <div className="api-action-bar">
                    {[4, 5, 18, 22, 6, 9, 28, 170]
                        .filter((id) =>
                            allowed(
                                endpoint(id),
                                app.user?.roles || [],
                                app.user ? app.role : "guest",
                            ),
                        )
                        .map((id) => (
                            <Button
                                key={id}
                                disabled={id === 18 && !app.client.refreshToken}
                                onClick={() =>
                                    app.openDialog("operation", {
                                        endpointId: id,
                                        initial:
                                            id === 4
                                                ? {
                                                      ...state.result?.data,
                                                      ...state.result?.data
                                                          ?.profile,
                                                  }
                                                : undefined,
                                    })
                                }
                            >
                                {endpoint(id).title}
                            </Button>
                        ))}
                </div>
                <div className="api-action-bar">
                    {[
                        [20, "Phiên đăng nhập"],
                        [7, "Hồ sơ danh tính"],
                        [10, "Hồ sơ chủ trọ"],
                    ].map(([id, title]) => (
                        <Button
                            key={id}
                            onClick={() =>
                                app.openResource(
                                    { endpointId: id, params: {} },
                                    title,
                                )
                            }
                        >
                            {title}
                        </Button>
                    ))}
                    <Button
                        onClick={() =>
                            void app
                                .logout()
                                .catch((e) => app.notify(e.message))
                        }
                    >
                        Đăng xuất
                    </Button>
                </div>
            </ApiState>
        </>
    );
}

export function LiveDialogs() {
    const app = useApp(),
        ref = useRef();
    useEffect(() => {
        if (app.dialog && ref.current && !ref.current.open)
            ref.current.showModal();
    }, [app.dialog]);
    if (!app.dialog) return null;
    return (
        <dialog
            className="app-dialog"
            ref={ref}
            onCancel={app.closeDialog}
            aria-labelledby="live-dialog-title"
        >
            <div className="dialog-header">
                <h2 id="live-dialog-title">
                    {app.dialog.type === "operation"
                        ? endpoint(app.dialog.endpointId).title
                        : app.dialog.type === "connection"
                          ? "Kết nối Trọday"
                          : "Tiện ích"}
                </h2>
                <button
                    className="icon-button"
                    aria-label="Đóng hộp thoại"
                    onClick={app.closeDialog}
                >
                    <Icon name="x" />
                </button>
            </div>
            <div className="dialog-content">
                {app.dialog.type === "operation" ? (
                    <Operation
                        key={JSON.stringify(app.dialog)}
                        operation={app.dialog}
                    />
                ) : app.dialog.type === "connection" ? (
                    <Connection />
                ) : (
                    <div className="api-stack">
                        <Button onClick={() => app.navigate("profile")}>
                            Tài khoản
                        </Button>
                        <Button onClick={() => app.navigate("notifications")}>
                            Thông báo
                        </Button>
                        <Button onClick={() => app.openDialog("connection")}>
                            Kết nối máy chủ
                        </Button>
                        {!app.user && (
                            <Button onClick={() => app.navigate("login")}>
                                Đăng nhập
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </dialog>
    );
}
function Connection() {
    const app = useApp(),
        [url, setUrl] = useState(app.baseUrl),
        [error, setError] = useState("");
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                try {
                    app.setBaseUrl(url);
                    app.closeDialog();
                    app.notify("Đã cập nhật kết nối.");
                } catch (err) {
                    setError(err.message);
                }
            }}
        >
            <Field label="Địa chỉ API">
                <input
                    value={url}
                    required
                    type="url"
                    onChange={(e) => setUrl(e.target.value)}
                />
            </Field>
            <p className="muted">
                Địa chỉ bao gồm /api/v1. Thay đổi kết nối sẽ đăng xuất phiên
                hiện tại.
            </p>
            {error && <p role="alert">{error}</p>}
            <Button type="submit" variant="primary">
                Lưu kết nối
            </Button>
        </form>
    );
}
function Operation({ operation }) {
    const app = useApp(),
        spec = endpoint(operation.endpointId),
        fields = spec.inputFields;
    const [values, setValues] = useState(() => {
        const value = {};
        for (const f of fields) {
            if (operation.initial?.[f.name] !== undefined)
                value[f.name] = operation.initial[f.name];
            else if (f.type.endsWith("[]") && f.required) value[f.name] = [];
        }
        for (const key of ["clientRequestKey", "clientMessageKey"])
            if (fields.some((f) => f.name === key))
                value[key] = crypto.randomUUID();
        return value;
    });
    const [params, setParams] = useState(operation.params || {}),
        [errors, setErrors] = useState({}),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false),
        [confirm, setConfirm] = useState(),
        [result, setResult] = useState(),
        [uncertain, setUncertain] = useState(false);
    const authorized = allowed(
        spec,
        app.user?.roles || [],
        app.user ? app.role : "guest",
    );
    if (!authorized)
        return (
            <Empty
                title="Bạn cần đăng nhập với tài khoản có quyền thực hiện"
                action={
                    <Button onClick={() => app.navigate("login")}>
                        Đăng nhập
                    </Button>
                }
            />
        );
    if (spec.blockedReason)
        return (
            <Empty title="Tính năng chưa khả dụng">{spec.blockedReason}</Empty>
        );
    async function execute(body) {
        if (busy) return;
        setBusy(true);
        setError("");
        try {
            const response = await app.client.request(spec, {
                params,
                body: spec.method === "GET" ? undefined : body,
            });
            setResult(response.data);
            setConfirm(undefined);
            setUncertain(false);
            app.invalidate();
            if (spec.id === "API-004")
                await app
                    .refreshUser()
                    .catch(() =>
                        app.notify(
                            "Đã lưu hồ sơ. Hãy tải lại để cập nhật thông tin tài khoản.",
                        ),
                    );
            if (spec.id === "API-116") {
                downloadCsv(residentsCsv(response.data));
                app.closeDialog();
                app.notify("Đã xuất danh sách cư dân.");
            } else if (spec.id === "API-022")
                app.openDialog("operation", {
                    endpointId: 23,
                    initial: {
                        selector: response.data.selector,
                        phoneNumber: body.phoneNumber,
                    },
                });
            else if (spec.id === "API-076" || spec.id === "API-084")
                app.openResource(
                    {
                        endpointId: 78,
                        params: { conversationId: response.data.id },
                        kind: "conversation",
                    },
                    "Cuộc trò chuyện",
                );
            else
                app.notify(
                    spec.method === "GET"
                        ? "Đã tải dữ liệu."
                        : "Máy chủ đã xác nhận thao tác.",
                );
        } catch (err) {
            setError(
                err.message +
                    (err.ambiguous
                        ? " Chưa xác định thao tác đã được lưu hay chưa. Hãy tải lại dữ liệu để kiểm tra."
                        : ""),
            );
            setUncertain(!!err.ambiguous);
            setConfirm(undefined);
        } finally {
            setBusy(false);
        }
    }
    function prepare(e) {
        e.preventDefault();
        const checked = validate(
            spec.input || "",
            fields,
            values,
            schemas,
            spec.method === "PATCH",
        );
        const next = { ...checked.errors };
        for (const key of pathKeys(spec))
            if (!/^[1-9]\d*$/.test(params[key] || ""))
                next[key] = "Chọn tài nguyên hợp lệ.";
        setErrors(next);
        if (Object.keys(next).length) return;
        if (spec.method === "GET") {
            void execute();
            return;
        }
        setConfirm(checked.body);
    }
    if (result !== undefined)
        return (
            <div className="api-stack">
                <p role="status">Thao tác đã được máy chủ xác nhận.</p>
                <RecordDetails data={result} />
                {spec.id === "API-027" && result?.selector && result?.token && (
                    <Button
                        onClick={() =>
                            navigator.clipboard
                                .writeText(
                                    JSON.stringify({
                                        selector: result.selector,
                                        token: result.token,
                                    }),
                                )
                                .then(() =>
                                    app.notify("Đã sao chép lời mời liên kết."),
                                )
                                .catch(() =>
                                    app.notify(
                                        "Trình duyệt chưa cho phép sao chép.",
                                    ),
                                )
                        }
                    >
                        Sao chép lời mời liên kết
                    </Button>
                )}
                <Button onClick={app.closeDialog}>Đóng</Button>
            </div>
        );
    return (
        <form onSubmit={prepare}>
            <fieldset
                disabled={busy || uncertain || confirm !== undefined}
                className="api-fieldset"
            >
                {pathKeys(spec)
                    .filter((k) => !operation.params?.[k])
                    .map((key) => (
                        <Field key={key} label={label(key)}>
                            <input
                                value={params[key] || ""}
                                required
                                inputMode="numeric"
                                onChange={(e) =>
                                    setParams({
                                        ...params,
                                        [key]: e.target.value,
                                    })
                                }
                            />
                            {errors[key] && (
                                <span className="form-error">
                                    {errors[key]}
                                </span>
                            )}
                        </Field>
                    ))}
                <LiveFields
                    fields={fields}
                    schema={spec.input || ""}
                    values={values}
                    onChange={setValues}
                    errors={errors}
                    scope={{ ...params, ...values }}
                />
            </fieldset>
            {errors._form && (
                <p role="alert" className="form-error">
                    {errors._form}
                </p>
            )}
            {error && (
                <p role="alert" className="form-error">
                    {error}
                </p>
            )}
            {confirm !== undefined ? (
                <div className="subtle-panel">
                    <p>
                        Xác nhận thực hiện “{spec.title}” với thông tin đã nhập?
                    </p>
                    <div className="table-actions">
                        <Button
                            disabled={busy}
                            onClick={() => setConfirm(undefined)}
                        >
                            Kiểm tra lại
                        </Button>
                        <Button
                            variant="primary"
                            disabled={busy}
                            onClick={() => void execute(confirm)}
                        >
                            {busy ? "Đang gửi…" : "Xác nhận"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="form-actions">
                    <Button onClick={app.closeDialog}>Đóng</Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={busy || uncertain}
                    >
                        {busy
                            ? "Đang xử lý…"
                            : spec.method === "GET"
                              ? "Xem dữ liệu"
                              : "Tiếp tục"}
                    </Button>
                </div>
            )}
        </form>
    );
}
function LiveFields({
    fields,
    schema,
    values,
    onChange,
    errors = {},
    prefix = "",
    scope = {},
}) {
    return (
        <div className="form-grid">
            {fields
                .filter(
                    (f) =>
                        !["clientMessageKey", "clientRequestKey"].includes(
                            f.name,
                        ),
                )
                .map((f) => (
                    <LiveField
                        key={f.name}
                        field={f}
                        schema={schema}
                        value={values[f.name]}
                        update={(v) => onChange({ ...values, [f.name]: v })}
                        errors={errors}
                        prefix={prefix}
                        scope={scope}
                    />
                ))}
        </div>
    );
}
function LiveField({ field: f, schema, value, update, errors, prefix, scope }) {
    const child = childSchema(schema, f),
        children = nestedFields[child] || schemas[child],
        options = f.type.startsWith("enum") ? enumOptions(schema, f) : [];
    const nullable = f.type.includes("|null");
    const key = prefix + f.name;
    return (
        <div
            className={`field ${children || ["content", "bio", "reason", "notes", "resolution"].includes(f.name) ? "full" : ""}`}
        >
            <span>
                {label(f.name)}
                {f.required ? " *" : ""}
            </span>
            {nullable && (
                <label className="checkbox-row">
                    <input
                        type="checkbox"
                        checked={value === null}
                        onChange={(e) => update(e.target.checked ? null : "")}
                    />
                    Dùng mặc định của nhà
                </label>
            )}
            {value !== null &&
                (children && f.type.endsWith("[]") ? (
                    <div className="api-stack">
                        {(Array.isArray(value) ? value : []).map((row, i) => (
                            <div className="api-nested" key={i}>
                                <LiveFields
                                    schema={child}
                                    fields={children}
                                    values={row}
                                    onChange={(next) =>
                                        update(
                                            value.map((x, n) =>
                                                n === i ? next : x,
                                            ),
                                        )
                                    }
                                    errors={errors}
                                    prefix={`${key}.${i}.`}
                                    scope={scope}
                                />
                                <Button
                                    onClick={() =>
                                        update(value.filter((_, n) => n !== i))
                                    }
                                >
                                    Bỏ mục này
                                </Button>
                            </div>
                        ))}
                        <Button
                            onClick={() =>
                                update([
                                    ...(Array.isArray(value) ? value : []),
                                    {},
                                ])
                            }
                        >
                            Thêm {label(f.name).toLowerCase()}
                        </Button>
                    </div>
                ) : f.type === "boolean" ? (
                    <select
                        aria-label={label(f.name)}
                        value={value === undefined ? "" : String(value)}
                        onChange={(e) =>
                            update(
                                e.target.value === ""
                                    ? undefined
                                    : e.target.value === "true",
                            )
                        }
                    >
                        <option value="">Chưa chọn</option>
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                    </select>
                ) : options.length ? (
                    <select
                        aria-label={label(f.name)}
                        value={value || ""}
                        onChange={(e) => update(e.target.value)}
                    >
                        <option value="">Chọn giá trị</option>
                        {options.map((v) => (
                            <option key={v} value={v}>
                                {displayValue(v)}
                            </option>
                        ))}
                    </select>
                ) : f.type === "id" || f.type === "id[]" ? (
                    <ReferenceField
                        field={f}
                        value={value}
                        update={update}
                        scope={scope}
                    />
                ) : [
                      "content",
                      "bio",
                      "reason",
                      "notes",
                      "resolution",
                  ].includes(f.name) ? (
                    <textarea
                        aria-label={label(f.name)}
                        value={value ?? ""}
                        onChange={(e) => update(e.target.value)}
                    />
                ) : (
                    <input
                        aria-label={label(f.name)}
                        type={
                            /password/i.test(f.name)
                                ? "password"
                                : f.type === "date"
                                  ? "date"
                                  : "text"
                        }
                        value={
                            Array.isArray(value)
                                ? value.join(", ")
                                : (value ?? "")
                        }
                        placeholder={
                            f.type === "datetime"
                                ? "YYYY-MM-DDTHH:mm:ss+07:00"
                                : f.type === "json"
                                  ? 'false, 5 hoặc "yên tĩnh"'
                                  : undefined
                        }
                        onChange={(e) => update(e.target.value)}
                    />
                ))}
            {errors[key] && (
                <span role="alert" className="form-error">
                    {errors[key]}
                </span>
            )}
        </div>
    );
}
function ReferenceField({ field, value, update, scope }) {
    const sources = {
        houseId: 29,
        contractId: 101,
        viewingId: 95,
        conversationId: 77,
        postId: 57,
        templateId: 165,
        serviceId: 137,
    };
    const member =
        [
            "payerRoomTenantId",
            "memberId",
            "successorMemberId",
            "departingMemberId",
            "memberIds",
        ].includes(field.name) && scope.contractId;
    const source = member ? 115 : sources[field.name];
    const state = useApi(source || null, {
        params: member ? { contractId: scope.contractId } : undefined,
    });
    const rows = Array.isArray(state.result?.data) ? state.result.data : [];
    return (
        <>
            {source && field.type === "id" && (
                <select
                    aria-label={`Chọn ${label(field.name)}`}
                    value={value || ""}
                    onChange={(e) => update(e.target.value)}
                >
                    <option value="">
                        {state.loading ? "Đang tải…" : "Chọn từ danh sách"}
                    </option>
                    {rows
                        .filter((r) => r.id)
                        .map((r) => (
                            <option key={r.id} value={r.id}>
                                {cardTitle(r)}
                            </option>
                        ))}
                </select>
            )}
            <input
                aria-label={label(field.name)}
                inputMode="numeric"
                placeholder={
                    field.type === "id[]"
                        ? "Các mã, ngăn cách bởi dấu phẩy"
                        : "Mã từ dữ liệu máy chủ"
                }
                value={Array.isArray(value) ? value.join(", ") : (value ?? "")}
                onChange={(e) => update(e.target.value)}
            />
            {state.error && (
                <span className="muted">
                    Không tải được danh sách lựa chọn. Có thể nhập mã đã có.
                </span>
            )}
        </>
    );
}
function downloadCsv(content) {
    const url = URL.createObjectURL(
        new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "residents.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
