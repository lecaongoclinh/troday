import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { ApiClient } from "../src/api/client.ts";
import type { Endpoint } from "../src/api/types.ts";

const catalog = JSON.parse(readFileSync(new URL("../src/api/contract.json", import.meta.url), "utf8"));
const endpoint = (id: number) => catalog.endpoints[id - 1] as Endpoint;
test("native adapter accepts live login, string IDs and pagination", { skip: !process.env.TRODAY_LIVE_API_URL }, async () => {
  const client = new ApiClient(process.env.TRODAY_LIVE_API_URL!.replace(/\/$/, "") + "/api/v1");
  const login = await client.request<{ accessToken: string; user: { id: string } }>(endpoint(2), { body: { identifier: "tenant01@troday.example", password: "123456" }, idempotencyKey: crypto.randomUUID() });
  assert.equal(typeof login.data.user.id, "string");client.token = login.data.accessToken;
  const posts = await client.request<unknown[]>(endpoint(57), { query: { page: 1, pageSize: 1 } });
  assert.ok(Array.isArray(posts.data));assert.equal(posts.meta.pagination?.pageSize, 1);
  const contracts = await client.request<unknown[]>(endpoint(101), { query: { page: 1, pageSize: 20 } });
  assert.ok(contracts.data.length);
  await client.request(endpoint(19), { idempotencyKey: crypto.randomUUID() });
});
