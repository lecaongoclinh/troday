import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import {
  ApiClient,
  ApiError,
  buildPath,
  normalizeBaseUrl,
  safeHttpUrl,
} from "../src/api/client.ts";
import type { Endpoint } from "../src/api/types.ts";
const catalog = JSON.parse(
  readFileSync(new URL("../src/api/contract.json", import.meta.url), "utf8"),
);
const e = (n: number) => catalog.endpoints[n - 1] as Endpoint;
const key = "c9722130-2dc4-45dc-9012-bd3ae45af501";
const success = (data: unknown, extra: Record<string, unknown> = {}) => ({
  data,
  meta: { requestId: "test-only", timestamp: "2026-11-02T00:00:00Z", ...extra },
  error: null,
});
// Transport doubles exist only in tests; no server or mock data provider is shipped.
function transport(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) {
  return ((url: unknown, init?: RequestInit) =>
    handler(String(url), init ?? {})) as typeof fetch;
}
test("without backend configuration, no request is sent", async () => {
  let called = false;
  const api = new ApiClient("", {
    fetch: transport(() => {
      called = true;
      return Response.json({});
    }),
  });
  await assert.rejects(
    api.request(e(57)),
    (err: ApiError) => err.code === "NOT_CONFIGURED",
  );
  assert.equal(called, false);
});
test("base URL normalizes trailing slashes and rejects secrets or unsupported schemes", () => {
  assert.equal(
    normalizeBaseUrl(" https://api.example.test/api/v1/ "),
    "https://api.example.test/api/v1",
  );
  for (const raw of [
    "javascript:alert(1)",
    "https://user:password@example.test",
    "https://example.test?token=private",
    "https://example.test/#secret",
    "not-a-url",
  ])
    assert.throws(() => normalizeBaseUrl(raw));
});
test("path identifiers stay strings and reject missing, zero and injection", () => {
  assert.equal(
    buildPath(e(58), { postId: "900719925474099312345" }),
    "/posts/900719925474099312345",
  );
  for (const postId of ["", "0", "-1", "1/../../me", "1?admin=true", "abc"])
    assert.throws(() => buildPath(e(58), { postId }));
});
test("query keys are whitelisted and encoded once", async () => {
  let requested = "";
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport((url) => {
      requested = url;
      return Response.json(
        success([], {
          pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
        }),
      );
    }),
  });
  await api.request(e(57), {
    query: { q: "Cầu Giấy & nắng", page: 1, pageSize: 20 },
  });
  const url = new URL(requested);
  assert.equal(url.searchParams.get("q"), "Cầu Giấy & nắng");
  await assert.rejects(
    api.request(e(57), { query: { actorId: "123" } }),
    (err: ApiError) => err.code === "INVALID_QUERY",
  );
});
test("protected endpoints cannot send a request without authentication", async () => {
  let called = false;
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(() => {
      called = true;
      return Response.json({});
    }),
  });
  await assert.rejects(
    api.request(e(3)),
    (err: ApiError) => err.code === "LOGIN_REQUIRED",
  );
  assert.equal(called, false);
});
test("bearer token is scoped to private endpoints and cookies are omitted", async () => {
  const calls: RequestInit[] = [];
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport((_, init) => {
      calls.push(init);
      return Response.json(success({ id: "1" }));
    }),
  });
  api.token = "test-token";
  await api.request(e(3));
  await api.request(e(58), { params: { postId: "1" } });
  assert.equal(
    (calls[0].headers as Record<string, string>).Authorization,
    "Bearer test-token",
  );
  assert.equal(
    (calls[1].headers as Record<string, string>).Authorization,
    undefined,
  );
  assert.equal(calls[0].credentials, "omit");
});
test("POST preserves decimal strings, BIGINT strings and the exact idempotency key", async () => {
  let init: RequestInit = {};
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport((_, value) => {
      init = value;
      return Response.json(success({ id: "1" }));
    }),
  });
  api.token = "test-token";
  const body = {
    roomId: "900719925474099312345",
    rentAmount: "1234567890123.45",
  };
  await api.request(e(103), { body, idempotencyKey: key });
  assert.deepEqual(JSON.parse(String(init.body)), body);
  assert.equal(
    (init.headers as Record<string, string>)["Idempotency-Key"],
    key,
  );
  await assert.rejects(
    api.request(e(103), { body }),
    (err: ApiError) => err.code === "MISSING_IDEMPOTENCY",
  );
});
test("updates require the server ETag, never an invented version", async () => {
  let headers: Record<string, string> = {};
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport((_, init) => {
      headers = init.headers as Record<string, string>;
      return Response.json(success({ id: "1" }), { headers: { ETag: '"v3"' } });
    }),
  });
  api.token = "test-token";
  await assert.rejects(
    api.request(e(32), { params: { houseId: "1" }, body: { name: "Nhà" } }),
    (err: ApiError) => err.code === "MISSING_VERSION",
  );
  const result = await api.request(e(32), {
    params: { houseId: "1" },
    body: { name: "Nhà" },
    etag: '"v2"',
  });
  assert.equal(headers["If-Match"], '"v2"');
  assert.equal(result.etag, '"v3"');
});
test("creating a roommate profile uses If-None-Match instead of a fabricated ETag", async () => {
  let headers: Record<string, string> = {};
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport((_, init) => {
      headers = init.headers as Record<string, string>;
      return Response.json(success({ id: "1" }));
    }),
  });
  api.token = "test-token";
  await api.request(e(63), { body: {}, createOnly: true });
  assert.equal(headers["If-None-Match"], "*");
  assert.equal(headers["If-Match"], undefined);
});
test("401 clears the access token and signals logout only for protected requests", async () => {
  let expired = 0;
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(() =>
      Response.json({ error: { code: "UNAUTHENTICATED" } }, { status: 401 }),
    ),
  });
  api.token = "test-token";
  api.onUnauthorized = () => expired++;
  await assert.rejects(
    api.request(e(3)),
    (err: ApiError) => err.status === 401,
  );
  assert.equal(api.token, undefined);
  assert.equal(expired, 1);
  await assert.rejects(api.request(e(2), { body: {}, idempotencyKey: key }));
  assert.equal(expired, 1);
});
test("validation errors expose field details and support request ID, not SQL internals", async () => {
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(() =>
      Response.json(
        {
          data: null,
          meta: { requestId: "support-7" },
          error: {
            code: "VALIDATION_ERROR",
            message: "SQLSTATE private details",
            details: [{ field: "fullName", message: "Quá dài" }],
          },
        },
        { status: 422 },
      ),
    ),
  });
  await assert.rejects(
    api.request(e(1), { body: {}, idempotencyKey: key }),
    (err: ApiError) =>
      err.status === 422 &&
      err.details[0].field === "fullName" &&
      err.requestId === "support-7" &&
      !err.message.includes("SQLSTATE"),
  );
});
test("network failure on writes is ambiguous and is never retried automatically", async () => {
  let calls = 0;
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(() => {
      calls++;
      throw new TypeError("network down");
    }),
  });
  api.token = "test-token";
  await assert.rejects(
    api.request(e(30), { body: {}, idempotencyKey: key }),
    (err: ApiError) => err.ambiguous && err.code === "NETWORK_ERROR",
  );
  assert.equal(calls, 1);
});
test("invalid JSON success and missing pagination are rejected", async () => {
  let api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(() => Response.json({ id: "1" })),
  });
  await assert.rejects(
    api.request(e(58), { params: { postId: "1" } }),
    (err: ApiError) => err.code === "CONTRACT_MISMATCH",
  );
  api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(() => Response.json(success([]))),
  });
  await assert.rejects(
    api.request(e(57)),
    (err: ApiError) => err.code === "CONTRACT_MISMATCH",
  );
});
test("HTTP 500 or REQUEST_IN_PROGRESS does not imply a failed transaction", async () => {
  for (const [status, code] of [
    [500, "INTERNAL_ERROR"],
    [409, "REQUEST_IN_PROGRESS"],
  ] as const) {
    const api = new ApiClient("https://api.example.test/api/v1", {
      fetch: transport(() => Response.json({ error: { code } }, { status })),
    });
    api.token = "test-token";
    await assert.rejects(
      api.request(e(30), { body: {}, idempotencyKey: key }),
      (err: ApiError) => err.ambiguous,
    );
  }
});
test("timeout aborts the request and marks a write as ambiguous", async () => {
  const api = new ApiClient("https://api.example.test/api/v1", {
    timeout: 10,
    fetch: transport(
      (_, init) =>
        new Promise((_, reject) =>
          init.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          ),
        ),
    ),
  });
  api.token = "test-token";
  await assert.rejects(
    api.request(e(30), { body: {}, idempotencyKey: key }),
    (err: ApiError) => err.code === "TIMEOUT" && err.ambiguous,
  );
});
test("refresh is blocked until native authentication transport is confirmed", async () => {
  const api = new ApiClient("https://api.example.test/api/v1");
  await assert.rejects(
    api.request(e(18), { idempotencyKey: key }),
    (err: ApiError) => err.code === "CONTRACT_PENDING",
  );
});
test("CSV uses its declared format instead of the JSON envelope", async () => {
  const api = new ApiClient("https://api.example.test/api/v1", {
    fetch: transport(
      () =>
        new Response("\uFEFFname\nLan", {
          headers: { "Content-Type": "text/csv" },
        }),
    ),
  });
  api.token = "test-token";
  assert.equal(
    (await api.request<string>(e(116), { response: "csv" })).data.replace(
      /^\uFEFF/,
      "",
    ),
    "name\nLan",
  );
});
test("external URLs reject script, file URLs and embedded credentials", () => {
  assert.equal(
    safeHttpUrl("https://images.example.test/a.webp"),
    "https://images.example.test/a.webp",
  );
  for (const value of [
    "javascript:alert(1)",
    "file:///C:/secret",
    "https://user:password@example.test",
    {},
    null,
  ])
    assert.equal(safeHttpUrl(value), undefined);
});
