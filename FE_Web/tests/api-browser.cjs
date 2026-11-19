// Browser integration against a local HTTP fixture using the real BE envelope.
// No production BE/database writes. MockMvc tests separately exercise Spring.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const catalog = JSON.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../../shared/api/contract.json"),
        "utf8",
    ),
);
const title = (n) => catalog.endpoints[n - 1].title;

async function main() {
    const root = path.resolve(__dirname, "..");
    const calls = [],
        errors = [],
        sessions = new Map(),
        favorites = new Set();
    let postsUnavailable = false;
    const users = {
        tenant: {
            id: 7,
            fullName: "Test Tenant",
            roles: ["TENANT"],
            status: "ACTIVE",
            email: "tenant@example.test",
            profile: {},
        },
        landlord: {
            id: 8,
            fullName: "Test Landlord",
            roles: ["LANDLORD"],
            status: "ACTIVE",
            email: "landlord@example.test",
            profile: {},
        },
        admin: {
            id: 9,
            fullName: "Test Admin",
            roles: ["ADMIN"],
            status: "ACTIVE",
            email: "admin@example.test",
            profile: {},
        },
    };
    const post = {
        id: 101,
        title: "Room from backend",
        roomId: 201,
        landlordId: 8,
        status: "APPROVED",
        content: "Actual network fixture",
        room: {
            id: 201,
            houseId: 501,
            code: "P101",
            area: "25.00",
            capacity: "2",
            rentAmount: "3800000.00",
            depositAmount: "3800000.00",
            status: "AVAILABLE",
        },
        house: { id: 501, name: "API House", address: "API Address" },
        amenities: ["Wi-Fi"],
    };
    const houses = [
        {
            id: 501,
            name: "API House",
            address: "API Address",
            provinceCode: "79",
            rooms: [post.room],
        },
    ];
    const messages = [],
        invoices = [];
    const backend = http.createServer(async (req, res) => {
        const url = new URL(req.url, "http://localhost");
        let raw = "";
        for await (const chunk of req) raw += chunk;
        let body = {};
        try {
            body = raw ? JSON.parse(raw) : {};
        } catch {
            res.writeHead(400);
            res.end();
            return;
        }
        calls.push({
            method: req.method,
            path: url.pathname,
            body,
            headers: req.headers,
        });
        const send = (data, status = 200) => {
            res.writeHead(status, { "Content-Type": "application/json" });
            res.end(
                JSON.stringify(
                    status === 200
                        ? {
                              success: true,
                              api: "/api/v1",
                              method: req.method,
                              data,
                              timestamp: new Date().toISOString(),
                          }
                        : {
                              status,
                              error:
                                  status === 401
                                      ? "Unauthorized"
                                      : "Service Unavailable",
                          },
                ),
            );
        };
        const token = req.headers.authorization?.replace("Bearer ", "");
        const user = sessions.get(token);
        if (req.method === "POST" && url.pathname === "/api/v1/auth/login") {
            const role = body.identifier?.split("@")[0];
            if (!users[role] || body.password !== "test-password") {
                send(null, 401);
                return;
            }
            const accessToken = role + "-test-token";
            sessions.set(accessToken, users[role]);
            send({
                accessToken,
                refreshToken: "test-refresh",
                expiresAt: "2099-12-01T10:00:00",
                user: users[role],
            });
            return;
        }
        if (req.method === "POST" && url.pathname === "/api/v1/auth/register") {
            send({
                id: 10,
                fullName: body.fullName,
                roles: ["TENANT"],
                status: "ACTIVE",
            });
            return;
        }
        if (url.pathname === "/api/v1/posts" && req.method === "GET") {
            send([post], postsUnavailable ? 503 : 200);
            return;
        }
        if (url.pathname === "/api/v1/posts/101") {
            send(post);
            return;
        }
        if (!user) {
            send(null, 401);
            return;
        }
        if (url.pathname === "/api/v1/me") {
            send(user);
            return;
        }
        if (url.pathname === "/api/v1/auth/logout") {
            sessions.delete(token);
            send({ revoked: true });
            return;
        }
        if (url.pathname === "/api/v1/me/notification-counts") {
            send({ unreadCount: 0 });
            return;
        }
        if (url.pathname === "/api/v1/me/favorites") {
            send(
                [...favorites].map((postId) => ({
                    postId,
                    savedAt: "2026-11-12T10:00:00",
                    post,
                })),
            );
            return;
        }
        if (url.pathname === "/api/v1/me/favorites/101") {
            req.method === "DELETE"
                ? favorites.delete(101)
                : favorites.add(101);
            send({ postId: 101, saved: req.method !== "DELETE" });
            return;
        }
        if (url.pathname === "/api/v1/houses" && req.method === "POST") {
            const h = { ...body, id: 502, rooms: [] };
            houses.push(h);
            send(h);
            return;
        }
        if (url.pathname === "/api/v1/houses") {
            send(houses);
            return;
        }
        if (url.pathname === "/api/v1/houses/501") {
            if (req.method === "PATCH") Object.assign(houses[0], body);
            send(houses[0]);
            return;
        }
        if (url.pathname === "/api/v1/conversations") {
            send([{ id: 301, type: "ROOM_INQUIRY", roomId: 201, postId: 101 }]);
            return;
        }
        if (url.pathname === "/api/v1/conversations/301") {
            send({ id: 301, type: "ROOM_INQUIRY", roomId: 201 });
            return;
        }
        if (url.pathname === "/api/v1/conversations/301/messages") {
            if (req.method === "POST") {
                const m = {
                    id: messages.length + 1,
                    senderId: user.id,
                    content: body.content,
                    type: body.type,
                    sentAt: "2026-11-12T10:00:00",
                };
                messages.push(m);
                send({ message: m, eventId: "message:" + m.id });
            } else send(messages);
            return;
        }
        if (url.pathname === "/api/v1/contracts") {
            send([
                {
                    id: 601,
                    contractNumber: "HD-API",
                    status: "ACTIVE",
                    roomId: 201,
                },
            ]);
            return;
        }
        if (url.pathname === "/api/v1/contracts/601/members") {
            send([
                {
                    id: 701,
                    fullName: "Test Tenant",
                    status: "ACTIVE",
                    tenantId: 7,
                },
            ]);
            return;
        }
        if (url.pathname === "/api/v1/invoices" && req.method === "POST") {
            assert.ok(body.payerRoomTenantId, "payer required");
            assert.ok(body.items[0].unitPrice, "explicit price required");
            const invoice = {
                ...body,
                id: 801,
                status: "DRAFT",
                roomId: 201,
                total:
                    Number(body.items[0].unitPrice) *
                    Number(body.items[0].quantity),
            };
            invoices.push(invoice);
            send(invoice);
            return;
        }
        if (url.pathname === "/api/v1/invoices") {
            send(invoices);
            return;
        }
        if (url.pathname === "/api/v1/admin/users") {
            send(Object.values(users).map((u) => ({ ...u, role: u.roles[0] })));
            return;
        }
        if (url.pathname.endsWith("/dashboard")) {
            send({ houseCount: houses.length, roomCount: 1, userCount: 3 });
            return;
        }
        send([]);
    });
    await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
    const { createServer } = await import("vite");
    const server = await createServer({
        root,
        server: {
            host: "127.0.0.1",
            port: 0,
            proxy: {
                "/api": {
                    target: `http://127.0.0.1:${backend.address().port}`,
                    changeOrigin: true,
                },
            },
        },
        mode: "test",
    });
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    const cache = path.join(root, ".cache");
    fs.mkdirSync(cache, { recursive: true });
    const profile = fs.mkdtempSync(path.join(cache, "api-browser-"));
    let chrome, socket;
    try {
        chrome = spawn(
            process.env.CHROME_PATH ||
                "C:/Program Files/Google/Chrome/Application/chrome.exe",
            [
                "--headless=new",
                "--disable-gpu",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-background-networking",
                "--remote-debugging-port=0",
                `--user-data-dir=${profile}`,
                "about:blank",
            ],
            { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] },
        );
        const endpoint = await new Promise((resolve, reject) => {
            let out = "";
            const timer = setTimeout(
                () => reject(new Error("Chrome timed out")),
                20000,
            );
            chrome.once("error", reject);
            chrome.stderr.on("data", (chunk) => {
                out += chunk;
                const m = out.match(/DevTools listening on (ws:\/\/\S+)/);
                if (m) {
                    clearTimeout(timer);
                    resolve(m[1]);
                }
            });
        });
        socket = new WebSocket(endpoint);
        await new Promise((resolve, reject) => {
            socket.onopen = resolve;
            socket.onerror = reject;
        });
        let sequence = 0;
        const pending = new Map();
        socket.onmessage = ({ data }) => {
            const m = JSON.parse(data);
            if (m.id) {
                const p = pending.get(m.id);
                if (p) {
                    clearTimeout(p.timer);
                    pending.delete(m.id);
                    m.error
                        ? p.reject(new Error(JSON.stringify(m.error)))
                        : p.resolve(m.result);
                }
            }
            if (m.method === "Runtime.exceptionThrown")
                errors.push(
                    m.params.exceptionDetails.exception?.description ||
                        m.params.exceptionDetails.text,
                );
        };
        const call = (method, params = {}, sessionId) =>
            new Promise((resolve, reject) => {
                const id = ++sequence;
                const timer = setTimeout(
                    () => reject(new Error("CDP timeout: " + method)),
                    15000,
                );
                pending.set(id, { resolve, reject, timer });
                socket.send(
                    JSON.stringify({
                        id,
                        method,
                        params,
                        ...(sessionId ? { sessionId } : {}),
                    }),
                );
            });
        const { targetInfos } = await call("Target.getTargets");
        const { sessionId } = await call("Target.attachToTarget", {
            targetId: targetInfos.find((t) => t.type === "page").targetId,
            flatten: true,
        });
        const page = (method, params) => call(method, params, sessionId);
        const evaluate = async (expression) => {
            const result = await page("Runtime.evaluate", {
                expression,
                returnByValue: true,
                awaitPromise: true,
            });
            if (result.exceptionDetails)
                throw new Error(
                    result.exceptionDetails.exception?.description ||
                        result.exceptionDetails.text,
                );
            return result.result.value;
        };
        const waitFor = async (expression, description = expression) => {
            for (let i = 0; i < 160; i++) {
                if (await evaluate(expression)) return;
                await new Promise((r) => setTimeout(r, 40));
            }
            throw new Error(
                "Condition failed: " +
                    description +
                    "\n" +
                    (await evaluate("document.body.innerText")),
            );
        };
        const click = async (text) => {
            await evaluate(
                `(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)});if(!b)throw new Error('Button missing: '+${JSON.stringify(text)});b.click();})()`,
            );
        };
        const input = async (selector, value) =>
            evaluate(
                `(()=>{const x=document.querySelector(${JSON.stringify(selector)});if(!x)throw new Error('Input missing: '+${JSON.stringify(selector)});const type=x.tagName==='TEXTAREA'?HTMLTextAreaElement:x.tagName==='SELECT'?HTMLSelectElement:HTMLInputElement;Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(x,${JSON.stringify(value)});x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));})()`,
            );
        const navigate = async (view) => {
            await page("Page.navigate", { url: origin + "/?view=" + view });
            await waitFor(
                `document.body.dataset.view===${JSON.stringify(view)}&&!document.body.innerText.includes('Đang tải dữ liệu')`,
            );
        };
        const login = async (role) => {
            await navigate("login");
            await waitFor('!!document.querySelector("input[name=identifier]")');
            await input("input[name=identifier]", role + "@example.test");
            await input("input[name=password]", "test-password");
            await evaluate(
                'document.querySelector("form.auth-form").requestSubmit()',
            );
            await waitFor(
                `document.body.dataset.role===${JSON.stringify(role)}&&!!document.querySelector('.sidebar-account strong')&&document.querySelector('.sidebar-account strong').textContent.includes('Test')`,
            );
        };
        const command = async () => {
            await evaluate(
                'document.querySelector("dialog form").requestSubmit()',
            );
            await waitFor(
                `!![...document.querySelectorAll('dialog button')].find(b=>b.textContent.trim()==='Xác nhận')`,
            );
            await click("Xác nhận");
            await waitFor(
                `!![...document.querySelectorAll('dialog p')].find(p=>p.textContent.includes('Thao tác đã được máy chủ xác nhận'))`,
            );
        };
        const close = async () => {
            await click("Đóng");
            await waitFor('!document.querySelector("dialog")');
        };
        await page("Page.enable");
        await page("Runtime.enable");
        await page("Emulation.setDeviceMetricsOverride", {
            width: 1440,
            height: 1000,
            deviceScaleFactor: 1,
            mobile: false,
        });

        await page("Page.navigate", {
            url: origin + "/?role=admin&view=users",
        });
        await waitFor(
            `document.body.innerText.includes('Đăng nhập để tiếp tục')`,
        );
        assert.equal(
            calls.some((c) => c.path === "/api/v1/admin/users"),
            false,
        );
        await navigate("discover");
        await waitFor(`document.body.innerText.includes('Room from backend')`);
        await login("tenant");
        await waitFor(`document.body.innerText.includes('Room from backend')`);
        await click("Xem chi tiết");
        await waitFor(
            `!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(title(60))})`,
        );
        await click(title(60));
        await command();
        await close();
        assert.ok(favorites.has(101));
        await navigate("favorites");
        await waitFor(`document.body.innerText.includes('Room from backend')`);
        await click("Bỏ lưu");
        await command();
        await close();
        assert.equal(favorites.size, 0);

        await navigate("chats");
        await waitFor('!!document.querySelector(".api-resource-card")');
        await click("Xem chi tiết");
        await waitFor('!!document.querySelector(".api-chat textarea")');
        await input(".api-chat textarea", "Message through actual HTTP");
        await click("Gửi tin nhắn");
        await waitFor(
            `document.body.innerText.includes('Message through actual HTTP')`,
        );
        assert.equal(messages.length, 1);
        await navigate("profile");
        await waitFor(`document.body.innerText.includes('Test Tenant')`);
        await click("Đăng xuất");
        await waitFor('!!document.querySelector("form.auth-form")');

        await login("landlord");
        await navigate("properties");
        await waitFor(`document.body.innerText.includes('API House')`);
        await click(title(30));
        await input('dialog input[aria-label="Tên"]', "Created through API");
        await input('dialog input[aria-label="Địa chỉ"]', "Network address");
        await input('dialog input[aria-label="Mã tỉnh / thành phố"]', "79");
        await command();
        await close();
        assert.equal(houses.length, 2);
        assert.ok(
            calls.some(
                (c) =>
                    c.method === "POST" &&
                    c.path === "/api/v1/houses" &&
                    c.body.name === "Created through API",
            ),
        );
        await waitFor(
            `document.body.innerText.includes('Created through API')`,
        );
        await evaluate(
            `document.querySelector('.api-resource-card button').click()`,
        );
        await waitFor(
            `!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(title(32))})`,
        );
        await click(title(32));
        await input('dialog input[aria-label="Tên"]', "Updated through API");
        await command();
        await close();
        assert.equal(houses[0].name, "Updated through API");

        await navigate("invoices");
        await waitFor(
            `!![...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(title(147))})`,
        );
        await click(title(147));
        await input('dialog input[aria-label="Hợp đồng"]', "601");
        await input(
            'dialog input[aria-label="Người thanh toán trong hợp đồng"]',
            "701",
        );
        await input('dialog input[aria-label="Kỳ hóa đơn"]', "2026-12-01");
        await input('dialog input[aria-label="Hạn thanh toán"]', "2026-12-10");
        await click("Thêm chi tiết hóa đơn");
        await input('dialog select[aria-label="Loại"]', "RENT");
        await input('dialog input[aria-label="Tên"]', "Rent");
        await input('dialog input[aria-label="Đơn vị"]', "month");
        await input('dialog input[aria-label="Số lượng"]', "1");
        await input('dialog input[aria-label="Đơn giá (đ)"]', "3800000.00");
        await command();
        await close();
        assert.equal(invoices.length, 1);
        assert.equal(invoices[0].payerRoomTenantId, "701");
        assert.equal(invoices[0].items[0].unitPrice, "3800000.00");

        await navigate("profile");
        await click("Đăng xuất");
        await waitFor('!!document.querySelector("form.auth-form")');
        await login("admin");
        await navigate("users");
        await waitFor(`document.body.innerText.includes('Test Tenant')`);
        assert.ok(
            calls.some(
                (c) =>
                    c.path === "/api/v1/admin/users" &&
                    c.headers.authorization === "Bearer admin-test-token",
            ),
        );
        postsUnavailable = true;
        await navigate("discover");
        await waitFor(`!!document.querySelector('.api-error')`);
        assert.equal(
            await evaluate(
                `!![...document.querySelectorAll('.api-resource-card')].find(x=>x.textContent.includes('Room from backend'))`,
            ),
            false,
        );
        postsUnavailable = false;
        await page("Emulation.setDeviceMetricsOverride", {
            width: 390,
            height: 844,
            deviceScaleFactor: 1,
            mobile: true,
        });
        await navigate("discover");
        await waitFor(`document.body.innerText.includes('Room from backend')`);
        assert.ok(
            await evaluate(
                "document.documentElement.scrollWidth <= innerWidth + 2",
            ),
            "mobile layout overflow",
        );
        assert.deepEqual(errors, []);
        assert.equal(
            calls.some(
                (c) =>
                    "if-match" in c.headers || "idempotency-key" in c.headers,
            ),
            false,
        );
        console.log(
            "Browser API integration passed: guest role guard, session restore, login/logout, favorites, chat, house create/update, invoice payload, admin access, server failure and mobile layout.",
        );
    } finally {
        socket?.close();
        if (chrome) {
            const stopped = once(chrome, "exit").catch(() => {});
            chrome.kill();
            await stopped;
        }
        await server.close();
        await new Promise((resolve) => backend.close(resolve));
        // Keep the profile under ignored .cache for troubleshooting; no recursive deletion.
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
