// Source audit only: no server requests, database writes, or application changes.
// Run with Node 24+: node scripts/audit-api-contract.cjs [--json]
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const contract = JSON.parse(read("shared/api/contract.json"));
const normalize = (value) => value.replace(/\{[^}]+\}/g, "{}");
const key = (value) => `${value.method} ${normalize(value.path)}`;

async function main() {
    const routes = [];
    const directory = "BE/src/main/java/com/troday/api/controller";
    for (const file of fs
        .readdirSync(path.join(root, directory))
        .filter((f) => f.endsWith(".java"))
        .sort()) {
        const source = read(`${directory}/${file}`);
        // Handles the literal Spring mappings used by this repository. Fails closed
        // if a future controller uses a different class prefix or mapping syntax.
        assert.match(
            source,
            /@RequestMapping\("\/api\/v1"\)/,
            `${file}: inspect class prefix`,
        );
        const matches = [
            ...source.matchAll(
                /@(Get|Post|Put|Patch|Delete)Mapping\(\s*(?:value\s*=\s*)?"([^"]+)"/g,
            ),
        ];
        assert.equal(
            matches.length,
            (source.match(/@(Get|Post|Put|Patch|Delete)Mapping\b/g) ?? [])
                .length,
            `${file}: unsupported mapping syntax; inspect manually`,
        );
        for (const match of matches)
            routes.push({
                method: match[1].toUpperCase(),
                path: match[2],
                file: `${directory}/${file}`,
                line: source.slice(0, match.index).split("\n").length,
            });
    }
    const duplicates = routes.filter(
        (r, i) => routes.findIndex((other) => key(other) === key(r)) !== i,
    );
    const inventory = contract.endpoints.map((endpoint) => {
        const backend = routes.find((route) => key(route) === key(endpoint));
        return {
            id: endpoint.id,
            method: endpoint.method,
            path: endpoint.path,
            group: endpoint.group,
            backend: backend ?? null,
            placeholderNamesDiffer: !!backend && backend.path !== endpoint.path,
            pagination: endpoint.pagination,
            requiresEtag: endpoint.headers.some((h) =>
                h.startsWith("If-Match:"),
            ),
            requiresIdempotency: endpoint.headers.some((h) =>
                h.startsWith("Idempotency-Key:"),
            ),
            documentedStatus: endpoint.status,
        };
    });

    // These are source-derived response samples, NOT live BE integration tests.
    // The production Mobile client is used unchanged to reproduce its rejection.
    const { ApiClient, safeHttpUrl } = await import(
        pathToFileURL(path.join(root, "FE_Mobile/src/api/client.ts")).href
    );
    const timestamp = "2026-11-12T12:00:00Z";
    const javaDto = read(
        "BE/src/main/java/com/troday/api/dto/ApiResponseDto.java",
    );
    assert.match(
        javaDto,
        /record ApiResponseDto<T>\(boolean success, String api, String method, T data,\s*Instant timestamp\)/,
    );
    const beEnvelope = (data) => ({
        success: true,
        api: "/api/v1",
        method: "GET",
        data,
        timestamp,
    });
    const documentedEnvelope = (data) => ({
        data,
        meta: { requestId: "audit-only", timestamp },
        error: null,
    });
    const clientFor = (payload) =>
        new ApiClient("https://audit.invalid/api/v1", {
            fetch: async () => Response.json(payload),
        });
    const detail = contract.endpoints.find((e) => e.id === "API-058");
    assert.deepEqual(
        (
            await clientFor(beEnvelope({ id: 1 })).request(detail, {
                params: { postId: "1" },
            })
        ).data,
        { id: "1" },
    );
    await assert.rejects(
        clientFor(documentedEnvelope({ id: "1" })).request(detail, {
            params: { postId: "1" },
        }),
        (error) => error.code === "CONTRACT_MISMATCH",
    );
    const listing = contract.endpoints.find((e) => e.id === "API-057");
    assert.deepEqual(
        (await clientFor(beEnvelope([])).request(listing)).meta.pagination,
        { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    );
    assert.equal(safeHttpUrl("/api/v1/files/1/content"), undefined);

    const summary = {
        scope: "Static route inventory and source-derived response probes; no live HTTP or database verification",
        fullIntegrationVerified: false,
        frontendEndpoints: inventory.length,
        backendRoutes: routes.length,
        matchedRoutes: inventory.filter((e) => e.backend).length,
        missingRoutes: inventory.filter((e) => !e.backend).map((e) => e.id),
        extraRoutes: routes.filter(
            (r) => !inventory.some((e) => key(r) === key(e)),
        ),
        duplicateRoutes: duplicates,
        placeholderNameDifferences: inventory
            .filter((e) => e.placeholderNamesDiffer)
            .map((e) => e.id),
        paginatedEndpoints: inventory.filter((e) => e.pagination === "page")
            .length,
        etagEndpoints: inventory.filter((e) => e.requiresEtag).map((e) => e.id),
        idempotencyEndpoints: inventory.filter((e) => e.requiresIdempotency)
            .length,
        documentedNon200Endpoints: inventory.filter(
            (e) => e.documentedStatus !== 200,
        ).length,
        sourceProbes: {
            currentBeEnvelopeAccepted: true,
            obsoleteDraftEnvelopeRejected: true,
            backendArrayPaginatedByClient: true,
            relativeFileUrlRejected: true,
        },
    };
    console.log(
        JSON.stringify(
            process.argv.includes("--json") ? { summary, inventory } : summary,
            null,
            2,
        ),
    );
    if (
        summary.missingRoutes.length ||
        summary.extraRoutes.length ||
        duplicates.length
    )
        process.exitCode = 1;
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
