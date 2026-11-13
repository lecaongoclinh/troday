import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from 'node:url';
import {
    ApiClient,
    ApiError,
    normalizeBaseUrl,
    buildPath,
    parseBackendJson,
    vietnamDateTime,
} from "../api/client.ts";
import { residentsCsv } from "../api/csv.ts";
import type { Endpoint } from "../api/types.ts";
const catalog = JSON.parse(
    readFileSync(new URL("../api/contract.json", import.meta.url), "utf8"),
);
const e = (id: number) => catalog.endpoints[id - 1] as Endpoint;
const success = (data: unknown) => ({
    success: true,
    api: "/api/v1",
    method: "GET",
    data,
    timestamp: "2026-11-12T12:00:00Z",
});
const client = (
    handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) =>
    new ApiClient("http://localhost:8081/api/v1", {
        fetch: ((url: unknown, init?: RequestInit) =>
            handler(String(url), init || {})) as typeof fetch,
    });

test("default browser transport retains the global fetch receiver", async () => {
    const original = globalThis.fetch;
    try {
        globalThis.fetch = function (this: unknown) {
            assert.equal(this, globalThis);
            return Promise.resolve(
                Response.json({
                    success: true,
                    data: [],
                    timestamp: "2026-11-12T00:00:00Z",
                }),
            );
        } as typeof fetch;
        const api = new ApiClient("http://localhost/api/v1");
        assert.deepEqual((await api.request(e(57))).data, []);
    } finally {
        globalThis.fetch = original;
    }
});
test("unconfigured and protected requests never reach transport", async () => {
    let calls = 0;
    const api = client(() => {
        calls++;
        return Response.json({});
    });
    await assert.rejects(
        api.request(e(3)),
        (err: ApiError) => err.code === "LOGIN_REQUIRED",
    );
    api.baseUrl = "";
    await assert.rejects(
        api.request(e(57)),
        (err: ApiError) => err.code === "NOT_CONFIGURED",
    );
    assert.equal(calls, 0);
});
test("base URLs reject credentials, query, fragments and non-HTTP protocols", () => {
    assert.equal(
        normalizeBaseUrl(" http://localhost:8081/api/v1/ "),
        "http://localhost:8081/api/v1",
    );
    for (const url of [
        "javascript:alert(1)",
        "https://user:pass@example.com",
        "http://localhost?token=x",
        "http://localhost/#x",
    ])
        assert.throws(() => normalizeBaseUrl(url));
});
test("resource IDs remain strings and cannot inject a path", () => {
    assert.equal(
        buildPath(e(58), { postId: "9007199254740993" }),
        "/posts/9007199254740993",
    );
    for (const postId of ["0", "-1", "x", "1/../../me"])
        assert.throws(() => buildPath(e(58), { postId }));
});
test("BE success envelope is accepted and numeric IDs/amounts are adapted for both frontends", async () => {
    const api = client(() =>
        Response.json(
            success({
                id: 1,
                roomId: 2,
                capacity: 3,
                total: 123.45,
                items: [{ id: 4, unitPrice: 123.45 }],
            }),
        ),
    );
    const r = await api.request<any>(e(58), { params: { postId: "1" } });
    assert.equal(r.data.id, "1");
    assert.equal(r.data.roomId, "2");
    assert.equal(r.data.capacity, 3);
    assert.equal(r.data.total, "123.45");
    assert.equal(r.data.items[0].id, "4");
    assert.equal(r.meta.timestamp, "2026-11-12T12:00:00Z");
});
test("BIGINT lexemes are preserved before parsing, including nested resource IDs", async () => {
    const raw =
        '{"success":true,"timestamp":"2026-11-12T00:00:00Z","data":{"id":9223372036854775807,"content":"keep 9223372036854775807 in text","members":[{"tenantId":9007199254740993}]}}';
    const api = client(() => new Response(raw));
    const result = await api.request<any>(e(58), { params: { postId: "1" } });
    assert.equal(result.data.id, "9223372036854775807");
    assert.equal(result.data.members[0].tenantId, "9007199254740993");
    assert.equal(result.data.content, "keep 9223372036854775807 in text");
    assert.throws(() => parseBackendJson("{invalid json}"));
});
test("arrays returned by BE paginate locally; page parameters are not sent to BE", async () => {
    let url = "";
    const api = client((u) => {
        url = u;
        return Response.json(
            success(Array.from({ length: 5 }, (_, i) => ({ id: i + 1 }))),
        );
    });
    const result = await api.request<any[]>(e(57), {
        query: { q: "Cầu Giấy & nắng", page: 2, pageSize: 2 },
    });
    assert.deepEqual(
        result.data.map((x) => x.id),
        ["3", "4"],
    );
    assert.deepEqual(result.meta.pagination, {
        page: 2,
        pageSize: 2,
        total: 5,
        totalPages: 3,
    });
    const query = new URL(url).searchParams;
    assert.equal(query.get("q"), "Cầu Giấy & nắng");
    assert.equal(query.has("page"), false);
    assert.equal(query.has("pageSize"), false);
    const all = await api.request<any[]>(e(57), { all: true });
    assert.equal(all.data.length, 5);
    await assert.rejects(
        api.request(e(57), { query: { actorId: "1" } }),
        (err: ApiError) => err.code === "INVALID_QUERY",
    );
});
test("wrapped invitation list keeps counts while paginating items", async () => {
    const api = client(() =>
        Response.json(
            success({
                items: [{ id: 1 }, { id: 2 }],
                counts: { incoming: 2, outgoing: 0 },
            }),
        ),
    );
    api.token = "opaque";
    const r = await api.request<any>(e(71), {
        query: { page: 2, pageSize: 1 },
    });
    assert.deepEqual(r.data, {
        items: [{ id: "2" }],
        counts: { incoming: 2, outgoing: 0 },
    });
});
test("Bearer is scoped to private routes; no draft ETag or Idempotency headers are required", async () => {
    const calls: RequestInit[] = [];
    const api = client((_, init) => {
        calls.push(init);
        return Response.json(success({ id: 1 }));
    });
    api.token = "opaque";
    await api.request(e(32), {
        params: { houseId: "1" },
        body: { name: "Nhà" },
    });
    await api.request(e(58), { params: { postId: "1" } });
    assert.equal(
        (calls[0].headers as Record<string, string>).Authorization,
        "Bearer opaque",
    );
    assert.equal(
        (calls[0].headers as Record<string, string>)["If-Match"],
        undefined,
    );
    assert.equal(
        (calls[0].headers as Record<string, string>)["Idempotency-Key"],
        undefined,
    );
    assert.equal(
        (calls[1].headers as Record<string, string>).Authorization,
        undefined,
    );
    assert.equal(calls[0].credentials, "omit");
});
test("refresh uses BE header contract once and drops the consumed refresh token", async () => {
    let headers: Record<string, string> = {};
    const api = client((_, init) => {
        headers = init.headers as Record<string, string>;
        return Response.json(
            success({
                accessToken: "next",
                expiresAt: "2026-12-01T10:00:00",
                user: {
                    id: 1,
                    fullName: "Lan",
                    roles: ["TENANT"],
                    status: "ACTIVE",
                },
            }),
        );
    });
    api.refreshToken = "one-use-refresh";
    const result = await api.request<any>(e(18));
    assert.equal(headers["Refresh-Token"], "one-use-refresh");
    assert.equal(headers.Authorization, undefined);
    assert.equal(api.token, "next");
    assert.equal(api.refreshToken, undefined);
    assert.equal(result.data.user.id, "1");
    await assert.rejects(
        api.request(e(18)),
        (err: ApiError) => err.code === "LOGIN_REQUIRED",
    );
});
test("401 clears private session and never retries a mutation automatically", async () => {
    let cleared = 0,
        calls = 0;
    const api = client(() => {
        calls++;
        return Response.json(
            { status: 401, error: "Unauthorized" },
            { status: 401 },
        );
    });
    api.token = "expired";
    api.refreshToken = "refresh";
    api.onUnauthorized = () => cleared++;
    await assert.rejects(
        api.request(e(30), { body: { name: "Nhà" } }),
        (err: ApiError) => err.status === 401,
    );
    assert.equal(api.token, undefined);
    assert.equal(api.refreshToken, undefined);
    assert.equal(cleared, 1);
    assert.equal(calls, 1);
});
test("Spring Boot error bodies do not leak SQL or exception details into the UI", async () => {
    const api = client(() =>
        Response.json(
            {
                status: 500,
                error: "Internal Server Error",
                message: "SQLSTATE password private",
            },
            { status: 500 },
        ),
    );
    api.token = "opaque";
    await assert.rejects(
        api.request(e(30), { body: {} }),
        (err: ApiError) =>
            err.status === 500 &&
            err.ambiguous &&
            !err.message.includes("SQLSTATE") &&
            !err.message.includes("password"),
    );
});
test("draft envelopes and non-JSON success are rejected", async () => {
    const api = client(() =>
        Response.json({
            data: { id: "1" },
            meta: { timestamp: "x", requestId: "x" },
            error: null,
        }),
    );
    await assert.rejects(
        api.request(e(58), { params: { postId: "1" } }),
        (err: ApiError) => err.code === "CONTRACT_MISMATCH",
    );
    const broken = client(() => new Response("<html>proxy error</html>"));
    await assert.rejects(
        broken.request(e(58), { params: { postId: "1" } }),
        (err: ApiError) => err.code === "INVALID_RESPONSE",
    );
});
test("incomplete BE operations are guarded before network or file side effects", async () => {
    let calls = 0;
    const api = client(() => {
        calls++;
        return Response.json(success({}));
    });
    api.token = "opaque";
    for (const n of [24, 25, 26, 90, 113, 143, 170, 171, 173])
        await assert.rejects(
            api.request(e(n)),
            (err: ApiError) => err.code === "UNAVAILABLE",
        );
    assert.equal(calls, 0);
});
test("invoice PATCH without items cannot trigger BE destructive replaceItems behavior", async () => {
    let calls = 0;
    const api = client(() => {
        calls++;
        return Response.json(success({ id: 1 }));
    });
    api.token = "opaque";
    await assert.rejects(
        api.request(e(148), {
            params: { invoiceId: "1" },
            body: { dueDate: "2026-12-01" },
        }),
        (err: ApiError) => err.code === "INVOICE_ITEMS_REQUIRED",
    );
    assert.equal(calls, 0);
});
test("appointment offset is converted to Vietnam wall time without changing the instant", async () => {
    let body: any;
    const api = client((_, init) => {
        body = JSON.parse(String(init.body));
        return Response.json(
            success({ id: 1, startsAt: "2099-12-01T09:00:00" }),
        );
    });
    api.token = "opaque";
    const result = await api.request<any>(e(92), {
        body: {
            roomId: "1",
            conversationId: "1",
            startsAt: "2099-12-01T02:00:00Z",
            durationMinutes: 60,
            clientRequestKey: "stable-key",
        },
    });
    assert.equal(body.startsAt, "2099-12-01T09:00:00+07:00");
    assert.equal(body.clientRequestKey, "stable-key");
    assert.equal(result.data.startsAt, "2099-12-01T09:00:00+07:00");
    assert.equal(
        Date.parse(vietnamDateTime("2099-12-01T09:00:00-05:00")),
        Date.parse("2099-12-01T09:00:00-05:00"),
    );
});
test("network failures are ambiguous for writes and no duplicate request is sent", async () => {
    let calls = 0;
    const api = client(() => {
        calls++;
        throw new TypeError("offline");
    });
    api.token = "opaque";
    await assert.rejects(
        api.request(e(30), { body: {} }),
        (err: ApiError) => err.code === "NETWORK_ERROR" && err.ambiguous,
    );
    assert.equal(calls, 1);
});
test("timeout aborts transport; cancellation remains distinguishable", async () => {
    const api = new ApiClient("http://localhost/api/v1", {
        timeout: 5,
        fetch: ((_: unknown, init: RequestInit) =>
            new Promise((_, reject) =>
                init.signal?.addEventListener("abort", () =>
                    reject(new Error("aborted")),
                ),
            )) as typeof fetch,
    });
    await assert.rejects(
        api.request(e(57)),
        (err: ApiError) => err.code === "TIMEOUT",
    );
});
test("CSV is generated from actual BE JSON, escapes quotes and prevents spreadsheet formulas", () => {
    const content = residentsCsv([
        {
            id: "1",
            fullName: '=HYPERLINK("x")',
            contractId: "2",
            roomId: "3",
            status: "ACTIVE",
        },
    ]);
    assert.ok(content.startsWith("\uFEFF"));
    assert.ok(content.includes('"\'=HYPERLINK(""x"")"'));
    assert.throws(() => residentsCsv({}));
});
