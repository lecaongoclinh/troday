// Browser verification of the real exported React Native Web app, without an API stub.
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
async function main() {
    const root = path.resolve(__dirname, "../dist"),
        out = path.resolve(__dirname, "../artifacts");
    assert.ok(
        fs.existsSync(path.join(root, "index.html")),
        "Run npm run build:web first",
    );
    const profile = path.join(out, "browser-profile-" + Date.now());
    fs.mkdirSync(profile, { recursive: true });
    const fixtureCalls = [],
        saved = new Set();
    const fixtureUser = {
        id: 7,
        fullName: "Mobile API User",
        roles: ["TENANT"],
        status: "ACTIVE",
        profile: {},
    };
    const fixturePost = {
        id: 101,
        title: "Mobile Backend Room",
        roomId: 201,
        status: "APPROVED",
        room: {
            id: 201,
            houseId: 501,
            area: "25.00",
            capacity: "2",
            rentAmount: "3800000.00",
        },
    };
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, "http://localhost"),
            target = path.resolve(root, "." + decodeURIComponent(url.pathname));
        if (url.pathname.startsWith("/api/v1")) {
            let text = "";
            for await (const chunk of req) text += chunk;
            const body = text ? JSON.parse(text) : {};
            fixtureCalls.push({
                path: url.pathname,
                method: req.method,
                body,
                authorization: req.headers.authorization,
            });
            const respond = (data, status = 200) => {
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
                            : { status, error: "Unauthorized" },
                    ),
                );
            };
            if (url.pathname === "/api/v1/posts") return respond([fixturePost]);
            if (url.pathname === "/api/v1/posts/101")
                return respond(fixturePost);
            if (url.pathname === "/api/v1/auth/login")
                return respond({
                    accessToken: "mobile-test-token",
                    refreshToken: "mobile-refresh",
                    expiresAt: "2099-12-01T10:00:00",
                    user: fixtureUser,
                });
            if (req.headers.authorization !== "Bearer mobile-test-token")
                return respond(null, 401);
            if (url.pathname === "/api/v1/me") return respond(fixtureUser);
            if (url.pathname === "/api/v1/me/favorites")
                return respond(
                    [...saved].map((postId) => ({ postId, post: fixturePost })),
                );
            if (url.pathname === "/api/v1/me/favorites/101") {
                req.method === "DELETE" ? saved.delete(101) : saved.add(101);
                return respond({ postId: 101, saved: req.method !== "DELETE" });
            }
            return respond([]);
        }
        const relative = path.relative(root, target);
        if (relative.startsWith("..") || path.isAbsolute(relative))
            return res.writeHead(403).end();
        const file =
            fs.existsSync(target) && fs.statSync(target).isFile()
                ? target
                : path.join(root, "index.html");
        const type =
            {
                ".html": "text/html; charset=utf-8",
                ".js": "text/javascript",
                ".css": "text/css",
                ".ttf": "font/ttf",
                ".png": "image/png",
            }[path.extname(file)] ?? "application/octet-stream";
        res.setHeader("Content-Type", type);
        fs.createReadStream(file).pipe(res);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    let chrome, socket;
    const checks = [];
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
            let buffer = "";
            const timer = setTimeout(
                () => reject(new Error("Chrome start timed out")),
                20000,
            );
            chrome.on("error", (err) => {
                clearTimeout(timer);
                reject(err);
            });
            chrome.stderr.on("data", (chunk) => {
                buffer += chunk;
                const match = buffer.match(
                    /DevTools listening on (ws:\/\/\S+)/,
                );
                if (match) {
                    clearTimeout(timer);
                    resolve(match[1]);
                }
            });
        });
        socket = new WebSocket(endpoint);
        await new Promise((resolve, reject) => {
            socket.onopen = resolve;
            socket.onerror = reject;
        });
        let sequence = 0;
        const pending = new Map(),
            errors = [],
            apiRequests = [];
        socket.onmessage = ({ data }) => {
            const message = JSON.parse(data);
            if (message.id) {
                const p = pending.get(message.id);
                if (!p) return;
                pending.delete(message.id);
                clearTimeout(p.timer);
                message.error
                    ? p.reject(new Error(JSON.stringify(message.error)))
                    : p.resolve(message.result);
            } else if (message.method === "Runtime.exceptionThrown")
                errors.push(
                    message.params.exceptionDetails.exception?.description ||
                        message.params.exceptionDetails.text,
                );
            else if (
                message.method === "Runtime.consoleAPICalled" &&
                message.params.type === "error"
            )
                errors.push(
                    message.params.args
                        .map((arg) => arg.description || arg.value || "")
                        .join(" "),
                );
            else if (
                message.method === "Network.requestWillBeSent" &&
                message.params.request.url.includes("/api/v1")
            )
                apiRequests.push(message.params.request.url);
        };
        const call = (method, params = {}, sessionId) =>
            new Promise((resolve, reject) => {
                const id = ++sequence,
                    timer = setTimeout(
                        () => reject(new Error("Timeout: " + method)),
                        20000,
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
        const waitFor = async (expression) => {
            for (let i = 0; i < 200; i++) {
                if (await evaluate(expression)) return;
                await new Promise((resolve) => setTimeout(resolve, 50));
            }
            throw new Error(
                "Not ready: " +
                    expression +
                    "\n" +
                    (await evaluate("document.body.innerText")) +
                    "\n" +
                    errors.join("\n"),
            );
        };
        const byLabel = (name, role = "button") =>
            `Array.from(document.querySelectorAll('[role="${role}"]')).find(el=>el.getAttribute('aria-label')===${JSON.stringify(name)})`;
        const click = async (expression) => {
            assert.ok(
                await evaluate(
                    `(()=>{const el=${expression};if(!el)return false;el.click();return true;})()`,
                ),
                expression,
            );
            await new Promise((resolve) => setTimeout(resolve, 200));
        };
        const input = async (name, value) => {
            assert.ok(
                await evaluate(
                    `(()=>{const el=Array.from(document.querySelectorAll('input,textarea')).find(el=>el.getAttribute('aria-label')===${JSON.stringify(name)});if(!el)return false;const proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`,
                ),
            );
            await new Promise((resolve) => setTimeout(resolve, 100));
        };
        const screenshot = async (name) => {
            const result = await page("Page.captureScreenshot", {
                format: "png",
            });
            fs.writeFileSync(
                path.join(out, name + ".png"),
                Buffer.from(result.data, "base64"),
            );
        };
        await page("Page.enable");
        await page("Runtime.enable");
        await page("Network.enable");
        await page("Emulation.setDeviceMetricsOverride", {
            width: 390,
            height: 844,
            deviceScaleFactor: 1,
            mobile: true,
        });
        const base = `http://127.0.0.1:${server.address().port}`;
        await page("Page.navigate", { url: base });
        await waitFor(
            `document.body.innerText.includes('Chưa kết nối máy chủ')`,
        );
        assert.equal(
            await evaluate("document.documentElement.scrollWidth<=innerWidth"),
            true,
        );
        checks.push(
            "390px: discover renders with an honest unconfigured state",
        );
        assert.equal(
            await evaluate(`document.body.innerText.includes('Studio sáng')`),
            false,
        );
        checks.push("No demo seed data is shown");
        await screenshot("discover-mobile");
        await click(byLabel("Bộ lọc phòng"));
        await waitFor(`document.body.innerText.includes('Áp dụng bộ lọc')`);
        await screenshot("filters-mobile");
        await click(byLabel("Đóng"));
        await click(byLabel("Phòng đã lưu", "tab"));
        await waitFor(
            `document.body.innerText.includes('Đăng nhập để tiếp tục')`,
        );
        checks.push("Protected favorites require login");
        await click(byLabel("Tài khoản", "tab"));
        await waitFor(`document.body.innerText.includes('Kết nối máy chủ')`);
        await screenshot("account-mobile");
        await click(byLabel("Kết nối máy chủ"));
        await waitFor(
            `document.querySelector('input[aria-label="Địa chỉ API"]')!==null`,
        );
        await input("Địa chỉ API", "javascript:bad");
        await click(byLabel("Lưu kết nối"));
        await waitFor(
            `document.body.innerText.includes('Địa chỉ máy chủ phải là HTTP(S)')`,
        );
        checks.push("Invalid server URL rejected without network activity");
        await input("Địa chỉ API", "");
        await click(byLabel("Lưu kết nối"));
        await waitFor(`document.body.innerText.includes('Tài khoản của bạn')`);
        await click(byLabel("Đăng nhập"));
        await waitFor(
            `document.body.innerText.includes('Đăng nhập bằng tài khoản')`,
        );
        await click(byLabel("Đăng nhập bằng tài khoản"));
        await waitFor(
            `document.querySelector('input[aria-label="Mật khẩu"]')!==null`,
        );
        await click(byLabel("Kiểm tra và tiếp tục"));
        await waitFor(
            `document.body.innerText.includes('Vui lòng nhập thông tin này.')`,
        );
        checks.push("Login validates required fields");
        await input("Email hoặc số điện thoại", "test-only@example.test");
        await input("Mật khẩu", "test-only-not-an-account");
        await click(byLabel("Kiểm tra và tiếp tục"));
        await waitFor(`document.body.innerText.includes('Xác nhận thao tác')`);
        await click(byLabel("Xác nhận gửi"));
        await waitFor(
            `document.body.innerText.includes('Chưa kết nối máy chủ.')`,
        );
        checks.push(
            "No backend produces a real configuration error, never a fake login",
        );
        await screenshot("login-unconfigured");
        await page("Page.navigate", { url: base + "/space/properties" });
        await waitFor(
            `document.body.innerText.includes('Nhà & phòng')&&document.body.innerText.includes('Đăng nhập để tiếp tục')`,
        );
        checks.push("Deep link to landlord data cannot bypass authentication");
        await page("Page.navigate", { url: base + "/space/__proto__" });
        await waitFor(
            `document.body.innerText.includes('Bắt đầu một hành trình.')`,
        );
        checks.push("Unknown deep links fall back safely");
        await page("Emulation.setDeviceMetricsOverride", {
            width: 1280,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false,
        });
        await new Promise((resolve) => setTimeout(resolve, 400));
        assert.equal(
            await evaluate("document.documentElement.scrollWidth<=innerWidth"),
            true,
        );
        await screenshot("discover-desktop");
        checks.push("1280px: no horizontal overflow");
        assert.deepEqual(apiRequests, []);
        if (process.argv.includes("--api")) {
            await page("Page.navigate", { url: base });
            await waitFor(`${byLabel("Tài khoản", "tab")}!==undefined`);
            await click(byLabel("Tài khoản", "tab"));
            await click(byLabel("Kết nối máy chủ"));
            await input("Địa chỉ API", base + "/api/v1");
            await click(byLabel("Lưu kết nối"));
            await click(byLabel("Khám phá", "tab"));
            await waitFor(
                `document.body.innerText.includes('Mobile Backend Room')`,
            );
            await click(byLabel("Tài khoản", "tab"));
            await click(byLabel("Đăng nhập"));
            await click(byLabel("Đăng nhập bằng tài khoản"));
            await input("Email hoặc số điện thoại", "mobile@example.test");
            await input("Mật khẩu", "test-password");
            await click(byLabel("Kiểm tra và tiếp tục"));
            await click(byLabel("Xác nhận gửi"));
            await waitFor(
                `document.body.innerText.includes('Mobile Backend Room')`,
            );
            await click(byLabel("Xem Mobile Backend Room"));
            await waitFor(`document.body.innerText.includes('Lưu tin phòng')`);
            await click(byLabel("Lưu tin phòng"));
            await click(byLabel("Kiểm tra và tiếp tục"));
            await click(byLabel("Xác nhận gửi"));
            await waitFor(`document.body.innerText.includes('Lưu tin phòng')`);
            assert.ok(saved.has(101));
            assert.ok(
                fixtureCalls.some(
                    (call) =>
                        call.path === "/api/v1/me/favorites/101" &&
                        call.authorization === "Bearer mobile-test-token",
                ),
            );
            assert.ok(
                fixtureCalls.some(
                    (call) =>
                        call.path === "/api/v1/auth/login" &&
                        call.body.identifier === "mobile@example.test",
                ),
            );
            checks.push(
                "Real exported app: connection, BE numeric-ID envelope, login, post detail and favorite write verified through local HTTP fixture",
            );
        }
        assert.deepEqual(errors, []);
        const report = {
            checks,
            errors,
            apiRequests,
            backendVerified: false,
            platform: "React Native Web in Chrome",
            timestamp: new Date().toISOString(),
        };
        fs.writeFileSync(
            path.join(out, "browser-results.json"),
            JSON.stringify(report, null, 2),
        );
        console.log(JSON.stringify(report, null, 2));
    } finally {
        socket?.close();
        if (chrome && !chrome.killed) chrome.kill();
        await new Promise((resolve) => server.close(resolve));
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
