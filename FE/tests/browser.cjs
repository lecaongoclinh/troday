// End-to-end checks with the installed Chrome; no browser test dependency required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

async function main() {
  const root = path.resolve(__dirname, '..');
  const { createServer } = await import('vite');
  const server = await createServer({ root, server: { host: '127.0.0.1', port: 0 }, mode: 'test' });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const cacheRoot = path.join(root, '.cache');
  fs.mkdirSync(cacheRoot, { recursive: true });
  const profile = fs.mkdtempSync(path.join(cacheRoot, 'browser-'));
  const screenshots = path.join(cacheRoot, 'screenshots');
  fs.mkdirSync(screenshots, { recursive: true });
  let chrome, socket;
  try {
    chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    const endpoint = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(new Error(`Chrome timed out: ${output.slice(-400)}`)), 20000);
      chrome.on('error', e => { clearTimeout(timer); reject(e); });
      chrome.stderr.on('data', chunk => { output += chunk; const match = output.match(/DevTools listening on (ws:\/\/\S+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
    });
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    const pending = new Map(), errors = [], badRequests = [], externalRequests = [];
    socket.onmessage = ({ data }) => {
      const m = JSON.parse(data);
      if (m.id) { const p = pending.get(m.id); if (p) { clearTimeout(p.timer); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } }
      if (m.method === 'Runtime.exceptionThrown') { const error = m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text; errors.push(error); console.error('Browser exception:', error); }
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') { const error = m.params.args.map(a => a.value || a.description).join(' '); errors.push(error); console.error('Browser error:', error); }
      if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) badRequests.push(`${m.params.response.status} ${m.params.response.url}`);
      if (m.method === 'Network.requestWillBeSent' && /^https?:/.test(m.params.request.url) && !m.params.request.url.startsWith(origin)) externalRequests.push(m.params.request.url);
    };
    const call = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 15000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
    const { targetInfos } = await call('Target.getTargets');
    const { sessionId } = await call('Target.attachToTarget', { targetId: targetInfos.find(t => t.type === 'page').targetId, flatten: true });
    const page = (method, params) => call(method, params, sessionId);
    const evaluate = async expression => { const result = await page('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
    const waitFor = async expression => { for (let i = 0; i < 120; i++) { if (await evaluate(expression)) return; await new Promise(r => setTimeout(r, 25)); } throw new Error(`Condition failed: ${expression}`); };
    const switchRole = async role => { await evaluate(`__troday.switchRole(${JSON.stringify(role)})`); await waitFor(`document.body.dataset.role === ${JSON.stringify(role)} && Boolean(window.__troday) && __troday.getState().role === ${JSON.stringify(role)}`); };
    const navigate = async (view, id = null) => { await evaluate(`__troday.navigate(${JSON.stringify(view)}, ${JSON.stringify(id)})`); await waitFor(`document.body.dataset.view === ${JSON.stringify(view)} && __troday.getState().view === ${JSON.stringify(view)}`); };
    const setInput = async (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    const clickText = async text => evaluate(`(() => { const button = [...document.querySelectorAll('dialog button')].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!button) throw new Error('Missing dialog button'); button.click(); })()`);
    const shot = async name => { await evaluate('document.fonts.ready'); const { data } = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(screenshots, `${name}.png`), Buffer.from(data, 'base64')); };
    await page('Page.enable'); await page('Runtime.enable'); await page('Network.enable');
    await page('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Ho_Chi_Minh' });
    await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await page('Page.navigate', { url: origin });
    await waitFor('Boolean(window.__troday && document.querySelector("h1"))');
    await evaluate('__troday.reset()');
    await waitFor('document.querySelectorAll(".property-card").length > 0');
    await shot('tenant-desktop');
    const navigation = await evaluate('__troday.navigation');
    let checked = 0;
    for (const width of [1440, 900, 390, 320]) {
      await page('Emulation.setDeviceMetricsOverride', { width, height: width < 650 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 650 });
      for (const [role, nav] of Object.entries(navigation)) {
        await waitFor('Boolean(window.__troday)');
        await evaluate(`__troday.switchRole(${JSON.stringify(role)})`);
        await waitFor(`document.body.dataset.role === ${JSON.stringify(role)}`);
        for (const [view] of nav) {
          await navigate(view);
          assert.ok(await evaluate('Boolean(document.querySelector("main h1"))'), `${role}/${view} missing title`);
          const bounds = await evaluate('({ scroll: document.documentElement.scrollWidth, width: innerWidth })');
          assert.ok(bounds.scroll <= bounds.width + 1, `${width}px ${role}/${view} overflows: ${JSON.stringify(bounds)}`);
          checked++;
        }
        if (width === 1440 && role !== 'tenant') { await navigate('dashboard'); await shot(`${role}-desktop`); }
      }
      if (width === 390) { await switchRole('tenant'); await navigate('discover'); await shot('tenant-mobile'); }
    }
    console.log(`Verified ${checked} screen/viewport combinations.`);
    await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await switchRole('tenant'); await navigate('discover');
    const firstPost = await evaluate('document.querySelector(".property-card").dataset.postId');
    await evaluate('document.querySelector(".save-room").click()');
    await waitFor(`__troday.getState().favorites.includes(${JSON.stringify(firstPost)})`);
    await navigate('favorites'); assert.ok(await evaluate(`Boolean(document.querySelector('[data-post-id="${firstPost}"]'))`));
    await navigate('discover'); await setInput('input[name="query"]', 'khongco-phong-nay');
    await evaluate('document.querySelector("form.discovery-search").requestSubmit()');
    await waitFor('document.querySelectorAll(".property-card").length === 0');
    await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.trim() === "Xóa bộ lọc").click()');
    await waitFor('document.querySelectorAll(".property-card").length > 0');
    await setInput('input[name="query"]', 'cau giay'); await evaluate('document.querySelector("form.discovery-search").requestSubmit()');
    await waitFor('document.querySelectorAll(".property-card").length === 3');
    await navigate('detail', firstPost); assert.ok(await evaluate('Boolean(document.querySelector(".detail-image"))'));
    await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.includes("Đề nghị lịch xem")).click()');
    await waitFor('Boolean(document.querySelector("dialog[open] form"))');
    await evaluate('document.querySelector("dialog form").requestSubmit()');
    await waitFor('__troday.getState().viewingProposals.length === 1');
    await switchRole('landlord'); await navigate('viewings');
    await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.trim() === "Chấp nhận").click()');
    await waitFor('Boolean(document.querySelector("dialog[open]"))'); await clickText('Xác nhận lịch hẹn');
    await waitFor('__troday.getState().viewingProposals[0].status === "ACCEPTED"');
    await navigate('properties');
    await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.trim() === "Thêm nhà trọ").click()');
    await waitFor('Boolean(document.querySelector("dialog input[name=name]"))');
    await setInput('dialog input[name="name"]', 'Nhà mẫu React'); await setInput('dialog input[name="address"]', '10 Đường Mẫu, Hà Nội'); await setInput('dialog input[name="area"]', 'Cầu Giấy');
    await evaluate('document.querySelector("dialog form").requestSubmit()');
    await waitFor('__troday.getState().houses.some(h => h.name === "Nhà mẫu React")');
    await navigate('contracts'); await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.includes("Nhập hợp đồng")).click()');
    await waitFor('Boolean(document.querySelector("dialog select[name=roomId]"))');
    await evaluate('document.querySelector("dialog .dialog-header .icon-button").click()');
    await navigate('invoices'); await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.includes("Tạo hóa đơn")).click()');
    await waitFor('Boolean(document.querySelector(".invoice-editor-row"))');
    await evaluate('document.querySelector("dialog .dialog-header .icon-button").click()');
    await switchRole('tenant'); await navigate('chats', 'c1');
    await setInput('.chat-composer textarea', 'Tin nhắn thử từ React'); await evaluate('document.querySelector(".chat-composer").requestSubmit()');
    await waitFor('__troday.getState().conversations.find(c => c.id === "c1").messages.at(-1).text === "Tin nhắn thử từ React"');
    await navigate('profile'); await setInput('input[name="name"]', 'Người dùng React'); await evaluate('document.querySelector("main form").requestSubmit()');
    await waitFor('document.querySelector(".profile-identity h2").textContent === "Người dùng React"');
    await navigate('register'); await setInput('input[name="fullName"]', 'Tài khoản xem thử'); await setInput('input[name="email"]', 'demo@example.com'); await setInput('input[name="password"]', 'sample-password'); await setInput('input[name="confirmPassword"]', 'wrong-password');
    await evaluate('document.querySelector(".auth-form").requestSubmit()');
    await waitFor('Boolean(document.querySelector(".auth-error"))');
    await setInput('input[name="confirmPassword"]', 'sample-password'); await evaluate('document.querySelector(".auth-form").requestSubmit()');
    await waitFor('document.body.dataset.view === "discover"');
    assert.ok(await evaluate('!JSON.stringify(localStorage).includes("sample-password")'), 'Password must never be persisted');
    await page('Page.reload'); await waitFor('Boolean(window.__troday)');
    assert.equal(await evaluate('__troday.getState().profiles.lan.name'), 'Người dùng React');
    await switchRole('admin'); await navigate('moderation');
    await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.trim() === "Duyệt").click()');
    await waitFor('Boolean(document.querySelector("dialog[open] form"))'); await clickText('Xác nhận');
    await waitFor('__troday.getState().posts.find(p => p.roomId === "r6").status === "APPROVED"');
    assert.ok(await evaluate('__troday.getState().audit.some(a => a.action === "Duyệt tin đăng")'));
    const editors = [
      ['landlord', 'properties', 'Thêm phòng'], ['landlord', 'services', 'Thêm dịch vụ'],
      ['landlord', 'listings', 'Tạo tin đăng'], ['landlord', 'viewings', 'Tạo lịch xem'],
      ['landlord', 'contracts', 'Nhập hợp đồng'], ['landlord', 'invoices', 'Tạo hóa đơn'],
      ['tenant', 'roommates', 'Tạo hồ sơ ở ghép'], ['tenant', 'profile', 'Gửi hồ sơ xác minh'],
      ['admin', 'templates', 'Thêm mẫu hợp đồng'], ['admin', 'reports', 'Xử lý'],
      ['admin', 'users', 'Khóa tài khoản'],
    ];
    for (const width of [1440, 390]) {
      await page('Emulation.setDeviceMetricsOverride', { width, height: width < 650 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 650 });
      for (const [role, view, label] of editors) {
        await switchRole(role); await navigate(view);
        await evaluate(`(() => { const b = [...document.querySelectorAll('main button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b) throw new Error('Missing editor button: ' + ${JSON.stringify(label)}); b.click(); })()`);
        await waitFor('Boolean(document.querySelector("dialog[open] form"))');
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector("dialog").scrollWidth <= document.querySelector("dialog").clientWidth + 1'), `${width}px ${role}/${view} editor overflows`);
        await evaluate('document.querySelector("dialog .dialog-header .icon-button").click()');
      }
    }
    console.log(`Verified ${editors.length * 2} editor/viewport combinations.`);
    for (const width of [1440, 390]) {
      await page('Emulation.setDeviceMetricsOverride', { width, height: width < 650 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 650 });
      for (const role of ['tenant', 'landlord']) {
        await switchRole(role); await navigate('contracts');
        assert.equal(await evaluate('Boolean(document.querySelector("main #contract-details"))'), false, 'Details must not appear below the list');
        await evaluate('[...document.querySelectorAll("main .segmented button")].find(b => b.textContent === "Đang hiệu lực").click()');
        const number = await evaluate('document.querySelector("main table tbody tr td strong").textContent');
        await evaluate('document.querySelector("main table tbody tr .button").click()');
        await waitFor('Boolean(document.querySelector("dialog[open] #contract-details"))');
        assert.ok(await evaluate(`document.querySelector('#app-dialog-title').textContent.includes(${JSON.stringify(number)}) && document.querySelector('#contract-details .contract-paper-head strong').textContent === ${JSON.stringify(number)}`), 'Modal must show the selected contract');
        assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector("dialog").scrollWidth <= document.querySelector("dialog").clientWidth + 1'), 'Contract modal must fit the viewport');
        if (role === 'tenant') await shot(`contract-detail-${width === 1440 ? 'desktop' : 'mobile'}`);
        await page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await waitFor('!document.querySelector("dialog[open]")');
        assert.equal(await evaluate('document.querySelector("main .segmented button[aria-pressed=true]").textContent'), 'Đang hiệu lực', 'Closing preserves the list filter');
        await evaluate('document.querySelector("main table tbody tr .button").click()');
        await waitFor('Boolean(document.querySelector("dialog[open] #contract-details"))');
        await clickText('Đề nghị gia hạn');
        await waitFor('Boolean(document.querySelector("dialog form select[name=type]"))');
        assert.equal(await evaluate('document.querySelector("dialog form select[name=type]").value'), 'RENEWAL', 'Contract actions remain available inside the modal');
        await evaluate('document.querySelector("dialog .dialog-header .icon-button").click()');
      }
    }
    console.log('Verified contract detail modals, selected content, Escape, preserved filters and renewal actions for both roles on desktop/mobile.');
    // URL history and mobile menu include every role screen.
    await page('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await switchRole('tenant'); await navigate('chats', 'c1');
    assert.ok(await evaluate('document.querySelector(".chat-composer").getBoundingClientRect().bottom <= innerHeight - 65'), 'Mobile composer must remain above navigation');
    await navigate('discover'); await evaluate('document.querySelector(".mobile-nav button:last-child").click()');
    await waitFor('document.querySelectorAll(".mobile-menu-grid button").length === 8');
    await evaluate('document.querySelector("dialog .dialog-header .icon-button").click()');
    await navigate('login'); await shot('login-mobile');
    await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await shot('login-desktop');
    assert.deepEqual([...new Set(errors)], [], 'Browser errors');
    assert.deepEqual([...new Set(badRequests)], [], 'Broken resources');
    assert.deepEqual([...new Set(externalRequests)], [], 'The UI must not request any API or external asset');
    console.log('Passed: filters, favorites, viewing proposals, house creation, editor forms, chat, profile, auth validation, persistence, moderation, mobile chat/menu.');
    console.log(`Screenshots: ${path.relative(root, screenshots)}`);
  } finally {
    socket?.close();
    if (chrome && chrome.exitCode === null) { const ended = once(chrome, 'exit').catch(() => {}); chrome.kill(); await ended; }
    await server.close();
    // Only remove the unique temporary Chrome profile inside this project's cache.
    const resolved = path.resolve(profile);
    if (resolved.startsWith(path.resolve(cacheRoot) + path.sep) && path.basename(resolved).startsWith('browser-')) { try { fs.rmSync(resolved, { recursive: true, force: true }); } catch { /* Chrome may briefly retain a file handle on Windows. */ } }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
