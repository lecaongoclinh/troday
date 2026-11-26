// End-to-end checks with the installed Chrome; no browser test dependency required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

async function main() {
  const root = path.resolve(__dirname, '..');
  const fixture = process.env.TRODAY_LIVE_API_URL ? { origin: process.env.TRODAY_LIVE_API_URL, live: true, close: async () => {} } : await mockBackend();
  process.env.API_PROXY_TARGET = fixture.origin;
  const { createServer } = await import('vite');
  const server = await createServer({ root, server: { host: '127.0.0.1', port: fixture.live ? 4173 : 0, strictPort: fixture.live }, mode: 'test' });
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
    const setInput = async (selector, value) => evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
    const clickText = async text => evaluate(`(() => { const button = [...document.querySelectorAll('dialog button')].find(b => b.textContent.trim() === ${JSON.stringify(text)}); if (!button) throw new Error('Missing dialog button'); button.click(); })()`);
    const shot = async name => { await evaluate('document.fonts.ready'); const { data } = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); fs.writeFileSync(path.join(screenshots, `${name}.png`), Buffer.from(data, 'base64')); };
    await page('Page.enable'); await page('Runtime.enable'); await page('Network.enable');
    await page('Emulation.setTimezoneOverride', { timezoneId: 'Asia/Ho_Chi_Minh' });
    await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await page('Page.navigate', { url: origin });
    await waitFor('Boolean(window.__troday) && !__troday.getState().booting && !__troday.getState().loading');
    await (fixture.live ? exerciseLive : exercise)({ assert, page, evaluate, waitFor, setInput, clickText, shot, origin, errors, badRequests, externalRequests, root, fixture });

  } finally {
    socket?.close();
    if (chrome && chrome.exitCode === null) { const ended = once(chrome, 'exit').catch(() => {}); chrome.kill(); await ended; }
    await server.close();
    await fixture.close();
    // Only remove the unique temporary Chrome profile inside this project's cache.
    const resolved = path.resolve(profile);
    if (resolved.startsWith(path.resolve(cacheRoot) + path.sep) && path.basename(resolved).startsWith('browser-')) { try { fs.rmSync(resolved, { recursive: true, force: true }); } catch { /* Chrome may briefly retain a file handle on Windows. */ } }
  }
}
async function mockBackend() {
  const http = require('node:http');
  const users = [
    { id: 1, fullName: 'Người thuê API', email: 'tenant@test.example', roles: ['TENANT'], role: 'TENANT', status: 'ACTIVE', profile: { address: 'Hà Nội', bio: '' } },
    { id: 2, fullName: 'Chủ trọ API', email: 'landlord@test.example', roles: ['LANDLORD'], role: 'LANDLORD', status: 'ACTIVE', profile: {} },
    { id: 3, fullName: 'Quản trị API', email: 'admin@test.example', roles: ['ADMIN'], role: 'ADMIN', status: 'ACTIVE', profile: {} },
    { id: 4, fullName: 'Bạn ghép API', email: 'peer@test.example', role: 'TENANT', status: 'ACTIVE', profile: {} },
    { id: 5, fullName: 'Người được mời', email: 'invitee@test.example', role: 'TENANT', status: 'ACTIVE', profile: {} },
  ];
  const rooms = [101, 102, 103].map((n, i) => ({ id: n, houseId: 11, code: `P${n}`, area: 25 + i, rentAmount: '3000000', depositAmount: '3000000', capacity: '3', status: n === 102 ? 'OCCUPIED' : 'AVAILABLE' }));
  const houses = [{ id: 11, name: 'Nhà từ API', address: '10 Đường Kiểm Thử, Hà Nội', provinceCode: '01', localityCode: '001' }];
  const posts = [201, 203].map((n, i) => ({ id: n, landlordId: 2, houseId: 11, roomId: rooms[i * 2].id, title: `Tin từ API ${n}`, content: 'Nội dung từ máy chủ', status: n === 201 ? 'APPROVED' : 'PENDING_REVIEW', availabilityStatus: 'OPEN', contentVersion: '1', amenities: ['Wi-Fi'], createdAt: `2026-11-${10 + i}T09:00:00Z` }));
  const post = p => ({ ...p, house: houses.find(h => h.id === p.houseId), room: rooms.find(r => r.id === p.roomId) });
  const contracts = [{ id: 601, contractNumber: 'HD-API-601', roomId: 102, houseId: 11, landlordId: 2, viewingTenantId: 1, status: 'ACTIVE', source: 'NEW_RENTAL', startDate: '2026-10-01', endDate: '2027-09-30', rentAmount: 3000000, depositAmount: 3000000, currentRevisionId: 901, members: [{ id: 801, contractId: 601, roomId: 102, tenantId: 1, fullName: users[0].fullName, status: 'ACTIVE', moveInDate: '2026-10-01' }] }];
  const revisions = [{ id: 901, contractId: 601, revisionNumber: 1, status: 'CONFIRMED', content: 'Điều khoản API', startDate: '2026-10-01', endDate: '2027-09-30' }];
  const viewings = [{ id: 701, roomId: 101, houseId: 11, tenantId: 1, createdById: 2, conversationId: 501, startsAt: '2026-11-12T10:00:00', endsAt: '2026-11-12T11:00:00', status: 'COMPLETED', rentalDecision: 'WAITING' }], proposals = [], invoices = [], changes = [], joins = [];
  const conversations = [{ id: 501, type: 'ROOM_INQUIRY', roomId: 101, postId: 201, participants: [{ userId: 1, joinedAt: '2026-11-01T10:00:00' }, { userId: 2, joinedAt: '2026-11-01T10:00:00' }] }], messages = [{ id: 1101, senderId: 2, content: 'Chào bạn từ API', type: 'TEXT', sentAt: '2026-11-12T10:00:00' }];
  const services = [{ id: 1201, houseId: 11, name: 'Điện API', unit: 'kWh', unitPrice: 4000, calculationMethod: 'METERED', active: true }], settings = [], favorites = new Set(), templates = [{ id: 1301, name: 'Mẫu từ API', version: 1, content: 'Điều khoản API', active: true }, { id: 1302, name: 'Mẫu thuê theo tháng', version: 2, content: 'Điều khoản thuê theo tháng', active: true }];
  const notifications = [{ id: 1501, title: 'Thông báo API', content: 'Nội dung máy chủ', isRead: false, resourceType: 'CONVERSATION', resourceId: 501 }];
  const invites = [{ id: 1601, senderId: 4, receiverId: 1, status: 'PENDING', message: 'Lời mời từ API' }], lifestyles = [];
  const reports = [{ id: 1701, reportedPostId: 201, reporterId: 1, type: 'POST', reason: 'Báo cáo API', status: 'PENDING' }], audit = [], calls = [], unknown = [];
  const sessions = new Map(); let sequence = 2000, fail = null, expired = false, roommateProfile = null, heldPosts = null;
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local'), route = url.pathname.replace(/^\/api\/v1/, ''), method = req.method;
    let raw = ''; for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : undefined;
    calls.push({ method, route, query: Object.fromEntries(url.searchParams), body, authorization: req.headers.authorization });
    const reply = (data, status = 200) => {
      let pagination;
      if (method === 'GET' && status < 400 && (Array.isArray(data) || Array.isArray(data?.items))) {
        const rows = (Array.isArray(data) ? data : data.items).filter(row => (!url.searchParams.get('status') || row.status === url.searchParams.get('status')) && (!url.searchParams.get('q') || JSON.stringify(row).toLowerCase().includes(url.searchParams.get('q').toLowerCase())));
        const page = Number(url.searchParams.get('page') || 1), pageSize = Number(url.searchParams.get('pageSize') || 20);
        pagination = { page, pageSize, total: rows.length, totalPages: Math.ceil(rows.length / pageSize) };
        data = { ...(Array.isArray(data) ? {} : data), ...pagination, totalItems: rows.length, hasNext: page * pageSize < rows.length, items: rows.slice((page - 1) * pageSize, page * pageSize) };
      }
      res.writeHead(status, { 'Content-Type': 'application/json' });res.end(JSON.stringify(status < 400 ? { success: true, api: url.pathname, method, data, meta: { requestId: 'fixture', timestamp: new Date().toISOString(), ...(pagination ? { pagination } : {}) }, error: null, timestamp: new Date().toISOString() } : { message: data }));
    };
    if (fail && method === fail.method && route === fail.route) { const status = fail.status; fail = null; return reply('Lỗi kiểm thử có chủ đích', status); }
    const user = sessions.get(req.headers.authorization?.replace('Bearer ', ''));
    if (route === '/auth/login') { const u = users.find(u => u.email === body.identifier); if (!u || body.password !== '123456') return reply('Sai mật khẩu', 401); const token = `token-${++sequence}`; sessions.set(token, u); expired = false; return reply({ accessToken: token, refreshToken: 'never-store-this', user: u }); }
    if (route === '/auth/register') return reply({ id: ++sequence, fullName: body.fullName, roles: ['TENANT'], status: 'ACTIVE' });
    if (route === '/auth/password-resets') return reply({ selector: 'otp-selector', retryAfterSeconds: 60 });
    if (route === '/auth/password-resets/verify') return reply({ resetGrant: 'verified-reset-grant' });
    if (route === '/auth/password-resets/complete') return reply({ passwordChanged: true });
    if (method === 'GET' && route === '/posts') { const hold = heldPosts;heldPosts = null;if (hold) await hold;return reply(url.searchParams.get('q') === 'missing' ? [] : posts.filter(p => p.status === 'APPROVED').map(post)); }
    if (method === 'GET' && /^\/posts\/\d+$/.test(route)) { const p = posts.find(p => p.id === Number(route.split('/')[2]) && p.status === 'APPROVED'); return p ? reply(post(p)) : reply('Không tìm thấy tin', 404); }
    if (method === 'GET' && /^\/rooms\/\d+$/.test(route)) return reply(rooms.find(r => r.id === Number(route.split('/')[2])));
    if (!user || expired) return reply('Phiên đã hết hạn', 401);
    const suffixId = Number(route.match(/\/(\d+)(?:\/[^/]+)?$/)?.[1]);
    if (route === '/events') { res.writeHead(200, { 'Content-Type': 'text/event-stream' }); res.end('event: connected\ndata: {}\n\n'); return; }
    if (route === '/me') return reply(user);
    if (route === '/auth/logout') { sessions.delete(req.headers.authorization.replace('Bearer ', '')); return reply({ revoked: true }); }
    if (route === '/me/profile') { user.fullName = body.fullName; user.profile = { ...user.profile, ...body }; return reply({ userId: user.id, ...body }); }
    if (route === '/me/notification-settings') return reply(body);
    if (route === '/me/sessions') return reply([{ id: 41, createdAt: '2026-11-01T10:00:00', expiresAt: '2026-12-01T10:00:00', revokedAt: '', isCurrent: true }, { id: 42, createdAt: '2026-11-01T10:00:00', expiresAt: '2026-12-01T10:00:00', revokedAt: '', isCurrent: false }]);
    if (method === 'DELETE' && route.startsWith('/me/sessions/')) return reply({ id: suffixId, revoked: true });
    if (route === '/me/notifications') return reply(notifications);
    if (/^\/me\/notifications\/\d+\/read-state$/.test(route)) { notifications.find(n => n.id === suffixId).isRead = true; return reply(notifications.find(n => n.id === suffixId)); }
    if (route === '/me/notifications/read-all') { notifications.forEach(n => n.isRead = true); return reply({ updatedCount: 1 }); }
    if (method === 'GET' && /\/(?:identity|landlord)-verifications$/.test(route)) return reply([]);
    if (route === '/me/favorites') return reply([...favorites].map(postId => ({ postId, post: posts.some(p => p.id === postId) ? post(posts.find(p => p.id === postId)) : null })));
    if (route.startsWith('/me/favorites/')) { method === 'PUT' ? favorites.add(suffixId) : favorites.delete(suffixId); return reply({ postId: suffixId, saved: method === 'PUT' }); }
    if (route === '/me/roommate-profile') { if (method === 'GET') return roommateProfile ? reply(roommateProfile) : reply('Chưa có hồ sơ', 404); roommateProfile = { id: 1801, tenantId: user.id, ...body, profileVersion: (roommateProfile?.profileVersion || 0) + 1 }; return reply(roommateProfile); }
    if (route === '/roommate-matches') return reply([{ profile: { id: 1802, housingStatus: 'NO_ACCOMMODATION', availableFrom: '2026-12-01', preferredLocation: 'Hà Nội', budgetMin: 2000000, budgetMax: 4000000, active: true }, score: 75 }]);
    if (route === '/lifestyle-criteria') return reply([{ id: 1, name: 'Hút thuốc', valueType: 'BOOLEAN', allowedValues: '[true,false]', active: true }]);
    if (route === '/me/roommate-profile/lifestyles') { if (method === 'GET') return reply(lifestyles); lifestyles.splice(0, lifestyles.length, ...body.criteria.map(c => ({ ...c, selfValue: JSON.stringify(c.selfValue), preferredValue: JSON.stringify(c.preferredValue) }))); return reply({ profileVersion: 2, items: lifestyles }); }
    if (route === '/roommate-requests') return reply({ items: invites, counts: { incoming: 1, outgoing: 0 } });
    if (/^\/roommate-requests\/\d+\/response$/.test(route)) { const i = invites.find(i => i.id === suffixId); i.status = body.decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'; return reply({ request: i, conversationId: null }); }
    if (/^\/roommate-requests\/\d+\/conversation$/.test(route)) { if (!conversations.some(c => c.id === 502)) conversations.push({ id: 502, type: 'ROOMMATE', participants: [{ userId: 1, joinedAt: '2026-11-01' }, { userId: 4, joinedAt: '2026-11-01' }] }); return reply(conversations.find(c => c.id === 502)); }
    if (/^\/roommate-requests\/\d+\/(?:cancel|end)$/.test(route)) { const i = invites.find(i => i.id === suffixId); i.status = 'CANCELLED'; return reply(i); }
    if (route === '/conversations') return reply(conversations);
    if (route === '/conversations/room-inquiries') return reply(conversations[0]);
    if (/^\/conversations\/\d+\/messages$/.test(route)) { if (method === 'GET') return reply(messages.filter(m => (m.conversationId || 501) === suffixId)); const m = { id: ++sequence, conversationId: suffixId, senderId: user.id, type: body.type, content: body.content, sentAt: '2026-11-13T14:00:00' }; messages.push(m); return reply({ message: m, eventId: `message:${m.id}` }); }
    if (/^\/conversations\/\d+\/read-state$/.test(route)) return reply({ conversationId: suffixId, unreadCount: 0 });
    if (/^\/conversations\/\d+\/post-shares$/.test(route)) { const m = { id: ++sequence, conversationId: suffixId, senderId: user.id, type: 'POST_SHARE', sentAt: '2026-11-13T14:00:00', sharedPostId: body.postId }; messages.push(m); return reply(m); }
    if (/^\/conversations\/\d+\/preferences$/.test(route)) return reply({ conversationId: suffixId, ...body });
    if (route === '/viewing-proposals') { if (method === 'GET') return reply(proposals); const p = { ...body, id: ++sequence, tenantId: user.id, landlordId: 2, status: 'PENDING' }; proposals.push(p); return reply(p); }
    if (/^\/viewing-proposals\/\d+\/decision$/.test(route)) { const p = proposals.find(p => p.id === suffixId); p.status = body.decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'; if (p.status === 'ACCEPTED') viewings.push({ ...p, id: ++sequence, createdById: 2, status: 'SCHEDULED', rentalDecision: 'WAITING' }); return reply({ proposal: p, viewing: viewings.at(-1) }); }
    if (/^\/viewing-proposals\/\d+\/withdraw$/.test(route)) { const p = proposals.find(p => p.id === suffixId); p.status = 'WITHDRAWN'; return reply(p); }
    if (route === '/viewings') return reply(viewings);
    if (/^\/viewings\/\d+\/rental-decision$/.test(route)) { const v = viewings.find(v => v.id === suffixId); v.rentalDecision = body.decision === 'AGREE' ? 'AGREED' : 'DECLINED'; return reply(v); }
    if (/^\/viewings\/\d+\/(?:attendance|cancel)$/.test(route)) { const v = viewings.find(v => v.id === suffixId); v.status = route.endsWith('/cancel') ? 'CANCELLED' : body.outcome === 'ATTENDED' ? 'COMPLETED' : 'NO_SHOW'; return reply(v); }
    if (/^\/viewings\/\d+\/contract-impact$/.test(route)) return reply({ futureViewingsCount: 1, pendingProposalsCount: 0 });
    if (route === '/houses') { if (method === 'POST') { const h = { ...body, id: ++sequence }; houses.push(h); return reply(h); } return reply(houses.map(h => ({ ...h, rooms: rooms.filter(r => r.houseId === h.id) }))); }
    if (/^\/houses\/\d+$/.test(route)) { const h = houses.find(h => h.id === suffixId); Object.assign(h, body); return reply(h); }
    if (/^\/houses\/\d+\/rooms$/.test(route)) { const r = { ...body, id: ++sequence, houseId: suffixId }; rooms.push(r); return reply(r); }
    if (/^\/rooms\/\d+$/.test(route) && method === 'PATCH') { const r = rooms.find(r => r.id === suffixId); Object.assign(r, body); return reply(r); }
    if (/^\/houses\/\d+\/verifications$/.test(route) || route === '/admin/house-verifications') return reply([{ id: 61, houseId: 11, rightType: 'OWNER', scopeDescription: 'Toàn bộ nhà', status: 'APPROVED', validFrom: '2026-01-01' }]);
    if (/^\/houses\/\d+\/services(?:\/\d+)?$/.test(route)) { if (method === 'GET') return reply(services.filter(s => s.houseId === suffixId)); if (method === 'PATCH') { const s = services.find(s => s.id === Number(route.split('/').at(-1))); Object.assign(s, body); return reply(s); } const s = { id: ++sequence, houseId: Number(route.split('/')[2]), ...body }; services.push(s); return reply(s); }
    if (/^\/rooms\/\d+\/service-settings$/.test(route)) return reply(settings);
    if (/^\/rooms\/\d+\/service-settings\/\d+$/.test(route)) return reply({ roomId: Number(route.split('/')[2]), houseServiceId: Number(route.split('/').at(-1)), active: body.active });
    if (route === '/landlord/posts') return reply(posts.filter(p => {
      const { houseId, roomId, createdFrom, createdTo } = Object.fromEntries(url.searchParams);
      const date = p.createdAt?.slice(0, 10);
      return (!houseId || p.houseId === Number(houseId)) && (!roomId || p.roomId === Number(roomId))
        && (!createdFrom || date >= createdFrom) && (!createdTo || date <= createdTo);
    }).map(post));
    if (route === '/admin/posts') return reply(posts.map(post));
    if (route === '/posts' && method === 'POST') { const p = { ...body, id: ++sequence, roomId: Number(body.roomId), houseId: 11, landlordId: user.id, status: 'PENDING_REVIEW', contentVersion: '1' }; posts.push(p); return reply(post(p)); }
    if (/^\/posts\/\d+$/.test(route) && method === 'PATCH') { const p = posts.find(p => p.id === suffixId); Object.assign(p, body, { roomId: Number(body.roomId), status: 'PENDING_REVIEW' }); return reply(post(p)); }
    if (/^\/(?:admin\/)?posts\/\d+\/(?:decision|hide|restore)$/.test(route)) { const p = posts.find(p => p.id === suffixId); p.status = route.endsWith('/hide') ? 'HIDDEN' : body.decision === 'REJECT' ? 'REJECTED' : 'APPROVED'; return reply(post(p)); }
    if (route === '/contracts') { if (method === 'GET') return reply(contracts); const v = viewings.find(v => v.id === Number(body.viewingId)); const c = { id: ++sequence, contractNumber: body.contractNumber, roomId: v.roomId, houseId: 11, landlordId: user.id, viewingTenantId: v.tenantId, viewingId: v.id, status: 'PENDING_CONFIRMATION', source: 'NEW_RENTAL', ...body, currentRevisionId: ++sequence, members: [{ id: ++sequence, tenantId: v.tenantId, fullName: 'Người thuê API', status: 'PLANNED' }] }; contracts.push(c); revisions.push({ id: c.currentRevisionId, contractId: c.id, revisionNumber: 1, status: 'PENDING_CONFIRMATION', content: body.content }); return reply(c); }
    if (/^\/contracts\/\d+\/revisions$/.test(route)) return reply(revisions.filter(r => r.contractId === suffixId));
    if (/^\/contracts\/\d+\/change-requests$/.test(route)) {
      if (method === 'GET') return reply(changes.filter(c => c.contractId === suffixId));
      const change = { id: ++sequence, contractId: suffixId, requestedById: user.id, type: body.type,
        status: 'PENDING', requestedEffectiveDate: body.effectiveDate, baseRevisionId: body.baseRevisionId,
        proposalHash: `proposal-${sequence}`, proposalSnapshot: JSON.stringify(body) };
      changes.push(change);
      return reply(change);
    }
    if (/^\/contract-change-requests\/\d+\/(decision|confirm|cancel|apply)$/.test(route)) {
      const change = changes.find(row => row.id === suffixId);
      if (route.endsWith('/apply')) {
        if (change.status !== 'READY_TO_APPLY') return reply('Yêu cầu chưa đủ xác nhận', 409);
        change.status = 'COMPLETED';
        const contract = contracts.find(row => row.id === change.contractId);
        contract.endDate = JSON.parse(change.proposalSnapshot).newEndDate;
        contract.currentRevisionId = change.proposedRevisionId;
      }
      else if (route.endsWith('/cancel')) change.status = 'CANCELLED';
      else if (route.endsWith('/confirm')) {
        if (change.status !== 'APPROVED_WAITING_CONFIRMATION' || body.proposalHash !== change.proposalHash ||
            body.proposedRevisionId !== change.proposedRevisionId) return reply('Phương án đã thay đổi', 409);
        change.status = 'READY_TO_APPLY';
      }
      else if (body.decision === 'REJECT') change.status = 'REJECTED';
      else {
        if (body.proposalHash !== change.proposalHash) return reply('Đề nghị đã thay đổi', 409);
        change.status = 'APPROVED_WAITING_CONFIRMATION';
        change.proposalHash = `reviewed-${change.id}`;
        change.proposedRevisionId = ++sequence;
        change.proposalSnapshot = JSON.stringify({ ...JSON.parse(change.proposalSnapshot), ...body.amendment });
      }
      return reply(change);
    }
    if (/^\/contracts\/\d+\/transfer-options$/.test(route)) return reply([{ roomId: 103, code: 'P103' }]);
    if (/^\/contracts\/\d+\/(?:confirm|move-ins|cancel)$/.test(route)) { const c = contracts.find(c => c.id === suffixId); c.status = route.endsWith('/confirm') ? 'CONFIRMED' : route.endsWith('/cancel') ? 'CANCELLED' : 'ACTIVE'; if (c.status === 'ACTIVE') c.members.forEach(m => m.status = 'ACTIVE'); return reply(c); }
    if (route === '/occupant-join-requests') {
      if (method === 'GET') return reply(joins.filter(j => [j.applicantId, j.requestedById, j.landlordId].includes(user.id)));
      const applicant = users.find(u => u.id === Number(body.applicantId) || u.email === body.applicantContact);
      const contract = contracts.find(c => c.id === Number(body.contractId));
      const join = { ...body, id: ++sequence, contractId: contract.id, contractNumber: contract.contractNumber, landlordId: contract.landlordId,
        roomCode: rooms.find(r => r.id === contract.roomId).code, applicantId: applicant.id, applicantName: applicant.fullName,
        requestedById: user.id, status: 'PENDING_CONSENT', representativeConsented: body.representativeConsent, applicantConsented: false };
      joins.push(join);
      return reply(join);
    }
    if (/^\/occupant-join-requests\/\d+\/(consents|approve|complete)$/.test(route)) {
      const join = joins.find(j => j.id === suffixId);
      if (route.endsWith('/consents')) { join.applicantConsented = true; join.status = 'PENDING_LANDLORD'; }
      else if (route.endsWith('/approve')) join.status = 'APPROVED';
      else join.status = 'COMPLETED';
      return reply(join);
    }
    if (route === '/invoices') { if (method === 'GET') return reply(invoices); const i = { ...body, id: ++sequence, contractId: Number(body.contractId), roomId: contracts.find(c => c.id === Number(body.contractId)).roomId, payerId: body.payerRoomTenantId, period: body.billingPeriod, status: 'DRAFT', total: body.items.reduce((a, i) => a + i.quantity * i.unitPrice, 0) }; invoices.push(i); return reply(i); }
    if (/^\/invoices\/\d+\/(?:issue|payment-confirmation|cancel)$/.test(route)) { const i = invoices.find(i => i.id === suffixId); i.status = route.endsWith('/issue') ? 'UNPAID' : route.endsWith('/cancel') ? 'CANCELLED' : 'PAID'; return reply(i); }
    if (route === '/residents' || route === '/residents/export') return reply(contracts.flatMap(c => c.members.map(m => ({ ...m, contractId: c.id, roomId: c.roomId }))));
    if (/^\/rooms\/\d+\/(?:reviews|services)$/.test(route)) return reply([]);
    if (route === '/rental-services') return reply([{ id: 1, name: 'Điện', unit: 'kWh', defaultCalculationMethod: 'METERED' }]);
    if (route === '/contract-templates') return reply(templates.filter(t => t.active));
    if (route === '/admin/contract-templates') { const t = { ...body, id: ++sequence, version: 1 }; templates.push(t); return reply(t); }
    if (/^\/admin\/contract-templates\/\d+$/.test(route)) { const t = templates.find(t => t.id === suffixId); Object.assign(t, body); return reply(t); }
    if (route === '/reports') { const r = { ...body, id: ++sequence, status: 'PENDING', reporterId: user.id }; reports.push(r); return reply(r); }
    if (route === '/admin/reports') return reply(reports);
    if (/^\/admin\/reports\/\d+\/decision$/.test(route)) { const r = reports.find(r => r.id === suffixId); r.status = body.decision === 'INVESTIGATE' ? 'INVESTIGATING' : body.decision === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED'; r.resolution = body.resolution; return reply(r); }
    if (route === '/admin/users') return reply(users);
    if (/^\/admin\/users\/\d+\/(?:lock|unlock)$/.test(route)) { const u = users.find(u => u.id === suffixId); u.status = route.endsWith('/unlock') ? 'ACTIVE' : 'LOCKED'; audit.push({ id: ++sequence, actorUserId: user.id, action: 'USER_LOCK', reason: body?.reason || 'Mở khóa', occurredAt: '2026-11-13T12:00:00' }); return reply(u); }
    if (route === '/admin/moderation-actions') return reply(audit);
    if (route === '/admin/dashboard' || route === '/landlord/dashboard') return reply({ userCount: users.length, roomCount: rooms.length });
    unknown.push(`${method} ${route}`); return reply(`Missing fixture: ${method} ${route}`, 500);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, calls, unknown, users, favorites, proposals, viewings, contracts, invoices, posts, changes, conversations, delayNextPosts: () => { let release;heldPosts = new Promise(resolve => { release = resolve; });return release; }, fail: (method, route, status = 409) => { fail = { method, route, status }; }, expire: () => { expired = true; }, close: () => new Promise(resolve => server.close(resolve)) };
}

async function exercise({ page, evaluate, waitFor, setInput, clickText, shot, errors, externalRequests, fixture, root }) {
  const navigate = async (view, id = null) => {
    await evaluate(`__troday.navigate(${JSON.stringify(view)}, ${JSON.stringify(id)})`);
    await waitFor(`__troday.getState().view === ${JSON.stringify(view)}`);
    await new Promise(r => setTimeout(r, 50));
    await waitFor('!__troday.getState().loading');
  };
  const click = async (label, area = 'main') => evaluate(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(area + ' button')})].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b) throw Error('Missing button: '+${JSON.stringify(label)}); b.click(); })()`);
  const submit = async () => { await evaluate('document.querySelector("dialog form").requestSubmit()'); await waitFor('!document.querySelector("dialog[open]") || Boolean(document.querySelector("dialog [role=alert]"))'); };
  const login = async (role, account = role) => {
    await navigate('login'); await waitFor('Boolean(document.querySelector(".auth-form"))');
    await setInput('input[name=identifier]', `${account}@test.example`); await setInput('input[name=password]', '123456');
    await evaluate('document.querySelector(".auth-form").requestSubmit()');
    await waitFor(`__troday.getState().authenticated && __troday.getState().role === ${JSON.stringify(role)} && !__troday.getState().loading && Boolean(document.querySelector('main h1'))`);
  };
  const selectValue = (selector, value) => evaluate(`(() => {
    const select = document.querySelector(${JSON.stringify(selector)});
    select.value = ${JSON.stringify(value)};
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await waitFor('document.querySelectorAll(".property-card").length === 1');
  await evaluate('document.querySelector(".save-room").click()'); await waitFor('Boolean(document.querySelector(".auth-form"))');
  assert.equal(await evaluate('__troday.getState().favorites.length'), 0, 'Guest cannot save locally');
  await setInput('input[name=identifier]', 'tenant@test.example'); await setInput('input[name=password]', 'wrong'); await evaluate('document.querySelector(".auth-form").requestSubmit()');
  await waitFor('Boolean(document.querySelector(".auth-error"))'); assert.equal(await evaluate('__troday.getState().authenticated'), false);
  await login('tenant');
  await navigate('discover'); fixture.fail('PUT', '/me/favorites/201'); await evaluate('document.querySelector(".save-room").click()');
  await waitFor('document.querySelector(".toast").textContent.includes("có chủ đích")'); assert.equal(fixture.favorites.size, 0);
  await evaluate('document.querySelector(".save-room").click()'); await waitFor('__troday.getState().favorites.includes("201")');
  await navigate('favorites'); assert.equal(await evaluate('document.querySelectorAll(".property-card").length'), 1);
  await page('Page.reload'); await waitFor('Boolean(window.__troday) && !__troday.getState().booting && !__troday.getState().loading && __troday.getState().favorites.includes("201")');
  assert.ok(await evaluate('!JSON.stringify(sessionStorage).includes("refreshToken") && !JSON.stringify(localStorage).includes("troday-react-demo")'));
  fixture.favorites.add(999); await navigate('favorites'); await waitFor('document.querySelector("main").textContent.includes("Tin #999")'); await click('Bỏ lưu tin'); await waitFor('!__troday.getState().favorites.includes("999")');
  const adminReads = fixture.calls.filter(c => c.route.startsWith('/admin/')).length;
  await page('Page.navigate', { url: (await evaluate('location.origin')) + '/?role=admin&view=users' });
  await waitFor('Boolean(window.__troday) && !__troday.getState().booting && !__troday.getState().loading && __troday.getState().role === "tenant"');
  assert.equal(fixture.calls.filter(c => c.route.startsWith('/admin/')).length, adminReads, 'A URL parameter cannot grant a role');
  await navigate('discover'); await setInput('input[name=query]', 'missing'); await evaluate('document.querySelector(".discovery-search").requestSubmit()');
  await waitFor('document.querySelectorAll(".property-card").length === 0'); assert.ok(fixture.calls.some(c => c.route === '/posts' && c.query.q === 'missing'));
  await navigate('discover');assert.equal(await evaluate('document.querySelectorAll(".property-card").length'), 0, 'FE-01: reload keeps search separate from saved posts');
  await click('Xóa bộ lọc'); await waitFor('document.querySelectorAll(".property-card").length === 1');
  const discoveryPosts = Array.from({ length: 12 }, (_, index) => ({ ...fixture.posts[0], id: 3000 + index, title: `Discovery page ${index}` }));
  fixture.posts.push(...discoveryPosts);
  await setInput('input[name=query]', 'Discovery page');
  await evaluate('document.querySelector(".discovery-search").requestSubmit()');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.totalItems === 12');
  await selectValue('.list-paging select', '10');
  await waitFor('!__troday.getState().loading && document.querySelectorAll(".property-card").length === 10');
  await click('Sau');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.page === 2 && document.querySelectorAll(".property-card").length === 2');
  assert.equal(fixture.calls.filter(c => c.route === '/posts').at(-1).query.q, 'Discovery page');
  await setInput('input[name=query]', 'Discovery page 4');
  await evaluate('document.querySelector(".discovery-search").requestSubmit()');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.page === 1 && document.querySelectorAll(".property-card").length === 1');
  fixture.posts.splice(-discoveryPosts.length);
  const profileReadsStart = fixture.calls.length;await navigate('profile');assert.ok(fixture.calls.slice(profileReadsStart).filter(c => c.method === 'GET' && c.route !== '/events').length <= 6, 'FE-05: profile does not load rental datasets'); await setInput('input[name=fullName]', 'Tên đã cập nhật API'); await evaluate('document.querySelector("main form").requestSubmit()');
  await waitFor('document.querySelector(".profile-identity h2").textContent === "Tên đã cập nhật API"');
  await navigate('chats', '501'); await setInput('.chat-composer textarea', 'Tin nhắn qua API'); await evaluate('document.querySelector(".chat-composer").requestSubmit()');
  await waitFor('__troday.getState().conversations[0].messages.some(m => m.text === "Tin nhắn qua API")');
  const sent = fixture.calls.find(c => c.method === 'POST' && c.route === '/conversations/501/messages'); assert.equal(sent.body.type, 'TEXT'); assert.ok(sent.body.clientMessageKey);
  fixture.fail('POST', '/conversations/501/messages'); await setInput('.chat-composer textarea', 'Giữ bản nháp khi lỗi'); await evaluate('document.querySelector(".chat-composer").requestSubmit()'); await waitFor('document.querySelector(".toast").textContent.includes("có chủ đích")'); assert.equal(await evaluate('document.querySelector(".chat-composer textarea").value'), 'Giữ bản nháp khi lỗi');
  await navigate('profile');await navigate('chats', '501');assert.equal(await evaluate('document.querySelector(".chat-composer textarea").value'), 'Giữ bản nháp khi lỗi', 'FE-03: draft survives navigation');
  await page('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const mobileReads = fixture.calls.filter(c => c.method === 'PUT' && c.route === '/conversations/501/read-state').length;
  await navigate('chats');await new Promise(resolve => setTimeout(resolve,100));assert.equal(fixture.calls.filter(c => c.method === 'PUT' && c.route === '/conversations/501/read-state').length,mobileReads,'FE-02: closed mobile pane never marks read');
  await navigate('chats', '501');await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate('detail', '201'); await click('Đề nghị lịch xem'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit();
  await waitFor('__troday.getState().viewingProposals.length === 1'); const proposed = fixture.calls.find(c => c.method === 'POST' && c.route === '/viewing-proposals'); assert.equal(proposed.body.durationMinutes, 60); assert.ok(proposed.body.startsAt.endsWith('+07:00')); assert.ok(proposed.body.conversationId);
  await navigate('viewings'); await click('Đồng ý thuê'); await waitFor('__troday.getState().viewings[0].decision === "AGREED"');
  await navigate('roommates'); await click('Tạo hồ sơ ở ghép'); await waitFor('Boolean(document.querySelector("dialog form"))'); await setInput('dialog input[name=location]', 'Hà Nội'); await submit(); await waitFor('Boolean(__troday.getState().roommateProfile)');
  await click('Thói quen & mong muốn'); await waitFor('Boolean(document.querySelector("dialog form"))');
  await evaluate(`document.querySelector('dialog select[name="1-selfValue"]').value = 'false'; document.querySelector('dialog select[name="1-preferredValue"]').value = 'true'`); await submit();
  const lifestyle = fixture.calls.find(c => c.method === 'PUT' && c.route === '/me/roommate-profile/lifestyles'); assert.equal(lifestyle.body.criteria[0].selfValue, false); assert.equal(lifestyle.body.criteria[0].preferredValue, true);
  await click('Tìm hiểu thêm'); await waitFor('Boolean(document.querySelector("dialog[open]"))'); assert.ok(await evaluate('document.querySelector("dialog").textContent.includes("Chưa có thông tin tài khoản")')); await evaluate('document.querySelector("dialog .dialog-header button").click()');
  await click('Lời mời dành cho bạn (1)'); await click('Chấp nhận'); await waitFor('__troday.getState().roommateInvites[0].status === "ACCEPTED"');
  await click('Nhắn tin'); await waitFor('__troday.getState().view === "chats" && __troday.getState().id === "502" && !__troday.getState().loading');
  await navigate('detail', '201'); await click('Chia sẻ cho bạn ghép'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await navigate('chats', '502'); await waitFor('Boolean(document.querySelector(".shared-post-card"))');
  const readsBefore = fixture.calls.filter(c => c.route === '/conversations/501/messages' && c.method === 'GET').length;
  fixture.conversations[0].participants.push({ userId: 4, joinedAt: '2026-11-13' }); await navigate('chats', '501');
  assert.equal(fixture.calls.filter(c => c.route === '/conversations/501/messages' && c.method === 'GET').length, readsBefore, 'Do not fetch messages from a merged private conversation');
  assert.ok(await evaluate('document.querySelector(".chat-pane-body").textContent.includes("kiểm tra quyền truy cập")')); fixture.conversations[0].participants.pop();
  await login('landlord'); await navigate('viewings'); await click('Chấp nhận'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await waitFor('__troday.getState().viewingProposals[0].status === "ACCEPTED"');
  await navigate('properties'); await click('Thêm nhà trọ'); await waitFor('Boolean(document.querySelector("dialog form"))'); await setInput('dialog input[name=name]', 'Nhà tạo qua API'); await setInput('dialog input[name=address]', 'Địa chỉ kiểm thử'); await setInput('dialog input[name=provinceCode]', '01'); await submit(); await waitFor('__troday.getState().houses.some(h => h.name === "Nhà tạo qua API")');
  await click('Thêm nhà trọ'); await waitFor('Boolean(document.querySelector("dialog form"))'); await setInput('dialog input[name=name]', 'Giữ dữ liệu khi lỗi'); await setInput('dialog input[name=address]', 'Địa chỉ kiểm thử'); await setInput('dialog input[name=provinceCode]', '01');
  for (const status of [400, 403, 404, 409, 500]) {
    const before = fixture.calls.filter(c => c.method === 'POST' && c.route === '/houses').length;
    fixture.fail('POST', '/houses', status); await evaluate('document.querySelector("dialog form").requestSubmit(); document.querySelector("dialog form").requestSubmit()');
    await waitFor('Boolean(document.querySelector("dialog .form-error")) && !document.querySelector("dialog fieldset").disabled');
    assert.equal(fixture.calls.filter(c => c.method === 'POST' && c.route === '/houses').length, before + 1, 'Double submit sends one request');
    assert.equal(await evaluate('document.querySelector("dialog input[name=name]").value'), 'Giữ dữ liệu khi lỗi');
    assert.equal(await evaluate('__troday.getState().houses.filter(h => h.name === "Giữ dữ liệu khi lỗi").length'), 0);
  }
  await evaluate('document.querySelector("dialog .dialog-header button").click()');
  await navigate('listings');
  await selectValue('select[name=houseId]', '11');
  await waitFor('!__troday.getState().loading && __troday.getState().listQuery.houseId === "11"');
  await selectValue('select[name=roomId]', '101');
  await setInput('input[name=createdFrom]', '2026-11-10');
  await waitFor('!__troday.getState().loading && __troday.getState().listQuery.createdFrom === "2026-11-10"');
  assert.deepEqual(fixture.calls.filter(c => c.route === '/landlord/posts').at(-1).query, { page: '1', pageSize: '20', houseId: '11', roomId: '101', createdFrom: '2026-11-10' });
  assert.equal(await evaluate('document.querySelectorAll("main tbody tr").length'), 1);
  await click('Xóa lọc nhà, phòng và ngày');
  await waitFor('!__troday.getState().loading && !__troday.getState().listQuery.createdFrom');
  await click('Tạo tin đăng'); await waitFor('Boolean(document.querySelector("dialog form"))'); await setInput('dialog input[name=title]', 'Tin tạo qua API'); await setInput('dialog textarea[name=description]', 'Nội dung kiểm thử'); await submit(); await waitFor('__troday.getState().posts.some(p => p.title === "Tin tạo qua API")'); assert.ok(fixture.calls.some(c => c.method === 'POST' && c.route === '/posts' && c.body.content === 'Nội dung kiểm thử'));
  await navigate('contracts');
  await click('Xem mẫu hợp đồng');
  await waitFor('Boolean(document.querySelector("dialog details summary"))');
  assert.ok(await evaluate('document.querySelector("dialog").textContent.includes("Phiên bản mẫu 2")'));
  await evaluate('document.querySelector("dialog .dialog-header button").click()');
  await click('Lập từ lịch đã xem'); await waitFor('Boolean(document.querySelector("dialog form"))');
  await selectValue('dialog select[name=templateId]', '1302');
  assert.equal(await evaluate('document.querySelector("dialog textarea[name=terms]").value'), 'Điều khoản thuê theo tháng');
  await setInput('dialog input[name=rent]', '3000000'); await setInput('dialog input[name=deposit]', '3000000'); await submit(); await waitFor('__troday.getState().contracts.length === 2');
  assert.equal(fixture.calls.find(c => c.route === '/contracts' && c.method === 'POST').body.templateId, '1302');
  const createdContract = String(fixture.contracts.at(-1).id);
  await login('tenant'); await navigate('contracts', createdContract); await waitFor('Boolean(document.querySelector("dialog #contract-details"))'); await clickText('Xác nhận hợp đồng'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await waitFor('__troday.getState().contracts.find(c => c.id === '+JSON.stringify(createdContract)+').status === "CONFIRMED"');
  await login('landlord'); await navigate('contracts', createdContract); await waitFor('Boolean(document.querySelector("dialog #contract-details"))'); await clickText('Xác nhận vào ở'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await waitFor('__troday.getState().contracts.find(c => c.id === '+JSON.stringify(createdContract)+').status === "ACTIVE"');
  await navigate('invoices'); await click('Tạo hóa đơn'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await waitFor('__troday.getState().invoices.length === 1');
  await click('Chi tiết'); await waitFor('Boolean(document.querySelector("dialog[open]"))'); await clickText('Phát hành'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await waitFor('__troday.getState().invoices[0].status === "UNPAID"');
  await click('Xác nhận thu'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit(); await waitFor('__troday.getState().invoices[0].status === "PAID"');
  await login('tenant'); await navigate('contracts'); await click('Mời người ở ghép vào phòng');
  await waitFor('Boolean(document.querySelector("dialog input[name=applicantContact]"))');
  await setInput('dialog input[name=applicantContact]', 'invitee@test.example');
  await submit(); await waitFor('__troday.getState().joinRequests[0]?.status === "PENDING_CONSENT"');
  assert.equal(fixture.calls.find(c => c.route === '/occupant-join-requests' && c.method === 'POST').body.representativeConsent, true);
  await login('tenant', 'invitee'); await navigate('contracts'); await click('Đồng ý vào ở');
  await waitFor('__troday.getState().joinRequests[0]?.status === "PENDING_LANDLORD"');
  await login('landlord'); await navigate('residents'); await click('Duyệt yêu cầu'); await submit();
  await waitFor('__troday.getState().joinRequests[0]?.status === "APPROVED"');
  await click('Xác nhận đã vào ở'); await submit();
  await waitFor('__troday.getState().joinRequests[0]?.status === "COMPLETED"');
  await login('tenant'); await navigate('contracts', '601');
  await waitFor('Boolean(document.querySelector("dialog #contract-details"))');
  await evaluate('document.querySelector("dialog .contract-version summary").click()');
  assert.ok(await evaluate('document.querySelector("dialog .contract-version[open]").textContent.includes("Điều khoản API")'));
  await clickText('Đề nghị điều chỉnh');
  await waitFor('Boolean(document.querySelector("dialog input[name=newEnd]"))');
  await setInput('dialog input[name=newEnd]', '2028-09-30');
  await setInput('dialog textarea[name=reason]', 'Tiếp tục thuê phòng');
  await submit(); await waitFor('__troday.getState().changeRequests[0]?.status === "PENDING"');
  assert.equal(fixture.calls.find(c => c.route === '/contracts/601/change-requests' && c.method === 'POST').body.acceptUnchangedProposal, undefined);
  await login('landlord'); await navigate('contracts'); await click('Xem phương án');
  await setInput('dialog input[name=newEndDate]', '2028-10-31');
  await submit();
  await waitFor('__troday.getState().changeRequests[0]?.status === "APPROVED_WAITING_CONFIRMATION"');
  assert.equal(fixture.calls.find(c => c.route.endsWith('/decision') && c.route.startsWith('/contract-change-requests/')).body.amendment.newEndDate, '2028-10-31');
  await click('Xem phương án');
  assert.ok(await evaluate('!document.querySelector("dialog form")'));
  await evaluate('document.querySelector("dialog .dialog-header button").click()');
  await login('tenant'); await navigate('contracts'); await click('Xem phương án');
  assert.ok(await evaluate('document.querySelector("dialog").textContent.includes("31/10/2028")'));
  await submit();
  await waitFor('__troday.getState().changeRequests[0]?.status === "READY_TO_APPLY"');
  await login('landlord'); await navigate('contracts');
  await click('Xem phương án'); await submit();
  await waitFor('__troday.getState().changeRequests[0]?.status === "COMPLETED"');
  await waitFor('__troday.getState().contracts.find(c => c.id === "601")?.end === "2028-10-31"');
  await login('admin'); await navigate('users'); assert.ok(await evaluate('document.querySelector("main").textContent.includes("Bạn ghép API")')); await click('Khóa tài khoản'); await waitFor('Boolean(document.querySelector("dialog form"))'); await setInput('dialog textarea[name=reason]', 'Lý do kiểm thử'); await submit(); await waitFor('__troday.getState().lockedUsers.length === 1');
  await navigate('moderation'); await click('Duyệt'); await waitFor('Boolean(document.querySelector("dialog form"))'); await submit();
  await waitFor('!__troday.getState().posts.some(p => p.id === "203")');
  assert.equal(fixture.posts.find(p => p.id === 203).status, 'APPROVED');
  const extraPosts = Array.from({ length: 12 }, (_, i) => ({ ...fixture.posts[0], id: 4000 + i, title: `Paging example ${4000 + i}` }));
  fixture.posts.push(...extraPosts);
  await click('Đã duyệt');
  await waitFor('!__troday.getState().loading && __troday.getState().posts.some(p => p.id === "203")');
  assert.equal(fixture.calls.filter(c => c.route === '/admin/posts').at(-1).query.status, 'APPROVED');
  await evaluate('(() => { const select = document.querySelector(".list-paging select"); select.value = "10"; select.dispatchEvent(new Event("change", { bubbles: true })); })()');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.pageSize === 10');
  assert.equal(await evaluate('document.querySelectorAll("main table tbody tr").length'), 10);
  const firstPostIds = await evaluate('__troday.getState().posts.map(post => post.id)');
  await click('Sau');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.page === 2');
  const secondPostIds = await evaluate('__troday.getState().posts.map(post => post.id)');
  assert.ok(secondPostIds.every(id => !firstPostIds.includes(id)), 'The second page contains different rows');
  await click('Trước');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.page === 1');
  await click('Sau');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.page === 2');
  await setInput('.server-list-controls input', 'Paging example 4000');
  await evaluate('document.querySelector(".server-list-controls form").requestSubmit()');
  await waitFor('!__troday.getState().loading && __troday.getState().pagination.page === 1 && __troday.getState().pagination.totalItems === 1');
  assert.deepEqual(await evaluate('__troday.getState().posts.map(post => post.id)'), ['4000']);
  fixture.posts.splice(-extraPosts.length);
  await navigate('reports'); await click('Xử lý'); await waitFor('Boolean(document.querySelector("dialog form"))'); await setInput('dialog textarea[name=resolution]', 'Đang kiểm tra'); await submit(); await waitFor('__troday.getState().reports[0].status === "INVESTIGATING"');
  await login('tenant');await navigate('discover');const releaseSearch = fixture.delayNextPosts();await setInput('input[name=query]', 'missing');await evaluate('document.querySelector(".discovery-search").requestSubmit()');await new Promise(resolve => setTimeout(resolve,80));
  await login('admin');await navigate('moderation');const moderationBefore = await evaluate('JSON.stringify(__troday.getState().posts.map(p => p.id))');releaseSearch();await new Promise(resolve => setTimeout(resolve,150));assert.equal(await evaluate('JSON.stringify(__troday.getState().posts.map(p => p.id))'),moderationBefore,'FE-06: stale public search cannot replace moderation data');
  await navigate('forgot-password');await setInput('input[name=identifier]', 'tenant@test.example');await evaluate('document.querySelector(".auth-form").requestSubmit()');await waitFor('Boolean(document.querySelector("input[name=code]"))');await setInput('input[name=code]', '654321');await evaluate('document.querySelector(".auth-form").requestSubmit()');await waitFor('Boolean(document.querySelector("input[name=confirmPassword]"))');await setInput('input[name=password]', 'New-password-123');await setInput('input[name=confirmPassword]', 'New-password-123');await evaluate('document.querySelector(".auth-form").requestSubmit()');await waitFor('__troday.getState().view === "login"');assert.ok(fixture.calls.some(c => c.route === '/auth/password-resets/complete' && c.body.newPassword === 'New-password-123'),'FE-04: complete reset after grant');
  let screens = 0;
  for (const width of [1440, 900, 390, 320]) {
    await page('Emulation.setDeviceMetricsOverride', { width, height: width < 650 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 650 });
    for (const role of ['tenant', 'landlord', 'admin']) {
      await login(role); const nav = await evaluate(`__troday.navigation[${JSON.stringify(role)}]`);
      for (const [view] of nav) {
        await navigate(view); assert.ok(await evaluate('Boolean(document.querySelector("main h1"))'), `${role}/${view}`);
        const bounds = await evaluate('({ scroll: document.documentElement.scrollWidth, width: innerWidth })'); assert.ok(bounds.scroll <= bounds.width + 1, `${width}px ${role}/${view} overflow: ${JSON.stringify(bounds)}`); screens++;
      }
      if (width === 1440 || width === 390) { await navigate(role === 'tenant' ? 'discover' : 'dashboard'); await shot(`${role}-api-${width}`); }
    }
  }
  await login('tenant'); await navigate('profile'); fixture.expire(); await evaluate('document.querySelector("main .profile-signout").click()'); await waitFor('!__troday.getState().authenticated && Boolean(document.querySelector(".auth-form"))'); assert.equal(await evaluate('__troday.getState().contracts.length'), 0, 'Expiry clears private data');
  assert.deepEqual([...new Set(errors.filter(e => !e.startsWith('Failed to load resource:')))], [], 'Browser exceptions');
  assert.deepEqual(fixture.unknown, [], 'Every request must have a defined backend fixture');
  assert.deepEqual([...new Set(externalRequests)], [], 'All API calls use the local proxy');
  const controllers = fs.readdirSync(path.join(root, '../BE/src/main/java/com/troday/api/controller')).filter(f => f.endsWith('.java')).flatMap(f => [...fs.readFileSync(path.join(root, '../BE/src/main/java/com/troday/api/controller', f), 'utf8').matchAll(/@(Get|Post|Patch|Put|Delete)Mapping\(\s*(?:value\s*=\s*)?"([^"]+)"/g)].map(m => ({ method: m[1].toUpperCase(), pattern: new RegExp('^' + m[2].replace(/\{[^}]+\}/g, '[^/]+') + '$') })));
  for (const c of fixture.calls) assert.ok(controllers.some(e => e.method === c.method && e.pattern.test(c.route)), `No BE controller: ${c.method} ${c.route}`);
  console.log(`Passed ${screens} screen/viewport combinations; login, errors, real-ID persistence, search, favorites, profile, chat/read state, proposals/approval, rental decision, houses, posts, contracts/confirmation/move-in, invoices/issue/payment, roommate-profile, admin moderation/users/reports and expiry.`);
  console.log(`Verified ${new Set(fixture.calls.map(c => `${c.method} ${c.route.replace(/\/\d+(?=\/|$)/g, '/:id')}`)).size} endpoint patterns against ${controllers.length} BE controller mappings.`);
}

async function exerciseLive({ page, evaluate, waitFor, setInput, shot, errors }) {
  const navigate = async (view, id = null) => {
    await evaluate(`__troday.navigate(${JSON.stringify(view)}, ${JSON.stringify(id)})`);
    await new Promise(r => setTimeout(r, 80));
    await waitFor(`__troday.getState().view === ${JSON.stringify(view)} && !__troday.getState().loading && Boolean(document.querySelector('main h1'))`);
  };
  let checked = 0;
  for (const role of ['tenant', 'landlord', 'admin']) {
    await evaluate('__troday.navigate("login")'); await waitFor('Boolean(document.querySelector(".auth-form"))');
    await setInput('input[name=identifier]', `${role === 'admin' ? 'admin' : role + '01'}@troday.example`); await setInput('input[name=password]', '123456');
    await evaluate('document.querySelector(".auth-form").requestSubmit()');
    await waitFor(`__troday.getState().authenticated && __troday.getState().role === ${JSON.stringify(role)} && !__troday.getState().loading && Boolean(document.querySelector('main h1'))`);
    const nav = await evaluate(`__troday.navigation[${JSON.stringify(role)}]`);
    for (const width of [1440, 390]) {
      await page('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390 });
      for (const [view] of nav) {
        await navigate(view); const bounds = await evaluate('({ scroll: document.documentElement.scrollWidth, width: innerWidth })'); assert.ok(bounds.scroll <= bounds.width + 1, `Live ${role}/${view}/${width}: ${JSON.stringify(bounds)}`); checked++;
        if (view === 'invoices' && role === 'tenant') assert.equal(await evaluate('document.querySelectorAll("main table tbody tr").length'), await evaluate('__troday.getState().invoices.length'), 'Invoices remain visible when BE omits the linked contract');
        if (view === 'roommates' && role === 'tenant' && await evaluate('__troday.getState().roommateProfile?.housingStatus === "IN_SYSTEM"')) {
          await evaluate('[...document.querySelectorAll("main button")].find(b => b.textContent.trim() === "Sửa hồ sơ của bạn").click()');
          await waitFor('Boolean(document.querySelector("dialog select[name=housingStatus]"))');
          assert.equal(await evaluate('document.querySelector("dialog select[name=housingStatus]").value'), 'IN_SYSTEM', 'Keep server housing status when BE omits the related contract');
          await evaluate('document.querySelector("dialog .dialog-header button").click()');
        }
      }
      await navigate(role === 'tenant' ? 'discover' : 'dashboard'); await shot(`${role}-live-${width}`);
    }
    await navigate('profile'); await evaluate('document.querySelector(".profile-signout").click()'); await waitFor('!__troday.getState().authenticated && Boolean(document.querySelector(".auth-form"))');
  }
  assert.deepEqual([...new Set(errors.filter(e => !e.startsWith('Failed to load resource:')))], [], 'Live browser exceptions');
  console.log(`Passed ${checked} live BE screen/viewport combinations using the seed accounts, with login and logout through real APIs.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
