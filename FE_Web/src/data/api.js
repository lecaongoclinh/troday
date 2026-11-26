// Contract adapters for the controllers in BE; IDs stay strings inside the UI.
const base = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
export const SESSION_KEY = 'troday-session-v1';
export const id = value => value == null ? null : String(value);
const num = value => value == null || value === '' ? null : Number(value);
export const list = value => { if (value && Array.isArray(value.items)) return value.items; if (!Array.isArray(value)) throw new Error('Máy chủ trả danh sách không đúng định dạng.'); return value; };
let memorySession;
const pendingCommands = new Map();
export class ApiError extends Error {
  constructor(message, status = 0, path = '') { super(message); this.status = status; this.path = path; }
}
export function storedSession() {
  if (memorySession !== undefined) return memorySession;
  try { const s = JSON.parse(sessionStorage.getItem(SESSION_KEY)); return s?.accessToken && s?.user?.id != null ? s : null; } catch { return null; }
}
export function storeSession(session) {
  if (memorySession?.accessToken !== session?.accessToken) pendingCommands.clear();
  memorySession = session;
  try { if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); else sessionStorage.removeItem(SESSION_KEY); } catch { /* An in-memory session still works. */ }
}
export async function request(path, { method = 'GET', body, token, signal, headers = {} } = {}) {
  const access = token === undefined ? storedSession()?.accessToken : token;
  let commandScope, commandKey;
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && !headers['Idempotency-Key']) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(body ?? null)));
    commandScope = `${access || 'guest'}:${method}:${path}:${[...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')}`;
    commandKey = pendingCommands.get(commandScope) || crypto.randomUUID();pendingCommands.set(commandScope, commandKey);
  }
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method, headers: { Accept: 'application/json', ...(commandKey ? { 'Idempotency-Key': commandKey } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(access ? { Authorization: `Bearer ${access}` } : {}), ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20000)]) : AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('Không kết nối được máy chủ. Vui lòng thử lại.', 0, path);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    if (response.status < 500 && payload?.error?.code !== 'REQUEST_IN_PROGRESS') pendingCommands.delete(commandScope);
    if (response.status === 401 && access) window.dispatchEvent(new CustomEvent('troday:unauthorized', { detail: access }));
    const fallback = ({ 400: 'Thông tin gửi lên không hợp lệ.', 401: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 403: 'Tài khoản không có quyền thực hiện thao tác này.', 404: 'Không tìm thấy dữ liệu yêu cầu.', 409: 'Dữ liệu đã thay đổi hoặc không còn đủ điều kiện.', 500: 'Máy chủ gặp lỗi khi xử lý. Vui lòng thử lại.' })[response.status];
    throw new ApiError(payload?.detail || payload?.message || fallback || `Yêu cầu thất bại (HTTP ${response.status}).`, response.status, path);
  }
  if (response.status === 204) { pendingCommands.delete(commandScope);return null; }
  if (payload?.success !== true || !Object.hasOwn(payload, 'data')) throw new ApiError('Máy chủ trả dữ liệu không đúng định dạng.', response.status, path);
  pendingCommands.delete(commandScope);return payload.data;
}
export const send = (path, body = {}, method = 'POST') => request(path, { method, body });
export function userRoles(user) { return (user?.roles || [user?.role]).filter(Boolean).map(r => r.toLowerCase()).filter(r => ['tenant', 'landlord', 'admin'].includes(r)); }
export function emptyData() {
  return { pagination: null, searchPostIds: [], houses: [], rooms: [], posts: [], favorites: [], viewingProposals: [], viewings: [], contracts: [], residents: [], serviceCatalog: [], services: [], roomServices: [], publicServices: [], invoices: [], conversations: [], notifications: [], roommateInvites: [], roommateProfiles: {}, roommateProfile: null, verifications: [], houseVerifications: [], templates: [], reports: [], audit: [], changeRequests: [], joinRequests: [], users: [], profiles: {}, lockedUsers: [], sessions: [], criteria: [], lifestyles: [], reviews: [], dashboard: null, errors: [] };
}
export function personData(u) {
  const name = u.fullName || `Người dùng #${u.id}`;
  return { ...u.profile, ...u, id: id(u.id), name, short: name.split(' ').at(-1), initials: name.split(' ').slice(-2).map(n => n[0]).join('') };
}
export function houseData(h, ownerId) { return { ...h, id: id(h.id), ownerId: id(h.landlordId ?? ownerId), area: h.areaLabel || '', notes: h.notes || '' }; }
export function roomData(r) { return { ...r, id: id(r.id), houseId: id(r.houseId), code: r.code || r.roomNumber, title: r.title || r.code || r.roomNumber, price: num(r.rentAmount ?? r.rentPrice), deposit: num(r.depositAmount), area: num(r.area), capacity: num(r.capacity ?? r.maxOccupants), amenities: r.amenities || [], distance: r.distanceKm ?? null, photo: r.photoUrl || '', description: r.description || '' }; }
export function postData(p) { return { ...p, id: id(p.id), roomId: id(p.roomId), houseId: id(p.houseId), ownerId: id(p.landlordId), description: p.content || '', photo: p.photoUrl || '', version: p.contentVersion, public: p.status === 'APPROVED' && ['OPEN', undefined, null].includes(p.availabilityStatus) }; }
export function viewingData(v, proposal = false) { return { ...v, id: id(v.id), roomId: id(v.roomId), tenantId: id(v.tenantId), ownerId: id(proposal ? v.landlordId : v.createdById), conversationId: id(v.conversationId), date: v.startsAt ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(v.startsAt.endsWith('Z') || /[+-]\d\d:\d\d$/.test(v.startsAt) ? v.startsAt : `${v.startsAt}+07:00`)) : '', time: v.startsAt ? new Date(v.startsAt.endsWith('Z') || /[+-]\d\d:\d\d$/.test(v.startsAt) ? v.startsAt : `${v.startsAt}+07:00`).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }) : '', decision: v.rentalDecision, reason: v.cancellationReason || v.rejectionReason }; }
export function memberData(m) { return { ...m, id: id(m.id), tenantId: id(m.tenantId), contractId: id(m.contractId), roomId: id(m.roomId), name: m.fullName, moveIn: m.moveInDate, moveOut: m.moveOutDate, identity: m.identityNumber || '' }; }
export function contractData(c) { return { ...c, id: id(c.id), roomId: id(c.roomId), houseId: id(c.houseId), ownerId: id(c.landlordId), tenantId: id(c.representativeTenantId ?? c.viewingTenantId), viewingId: id(c.viewingId), number: c.contractNumber, start: c.startDate, end: c.endDate, rent: num(c.rentAmount), deposit: num(c.depositAmount), members: (c.members || []).map(memberData), revisions: [] }; }
export function invoiceData(i) { return { ...i, id: id(i.id), contractId: id(i.contractId), roomId: id(i.roomId), payerMemberId: id(i.payerId), code: i.invoiceNumber || `HĐ-${i.id}`, due: i.dueDate, items: (i.items || []).map(x => ({ ...x, price: num(x.unitPrice), quantity: num(x.quantity) })) }; }
export function conversationData(c) { return { ...c, id: id(c.id), roomId: id(c.roomId), postId: id(c.postId), users: (c.participants || []).map(p => id(p.userId)), messages: [] }; }
export function messageData(m, roomId) { return { ...m, id: id(m.id), senderId: id(m.senderId), sharedPostId: id(m.sharedPostId), roomId, text: m.content || '', time: m.sentAt?.slice(11, 16) || '' }; }
export function roommateData(p) { return { ...p, id: id(p.id), tenantId: id(p.tenantId), location: p.preferredLocation || '', available: p.availableFrom, habits: p.habits || '' }; }
export function verificationData(v, kind, me) { return { ...v, apiId: id(v.id), id: `${kind}:${v.id}`, kind, userId: id(v.tenantId ?? v.applicantUserId ?? me), type: kind === 'landlord' ? 'Xác minh chủ trọ' : 'Căn cước người thuê', date: v.createdAt, documents: v.documents || [] }; }
const merge = (rows, value) => { const i = rows.findIndex(x => x.id === value.id); if (i < 0) rows.push(value); else rows[i] = { ...rows[i], ...value }; };

export const primaryEndpoint = route => ({ discover: '/posts', favorites: '/me/favorites', properties: '/houses', listings: '/landlord/posts', contracts: '/contracts', residents: '/residents', invoices: '/invoices', chats: '/conversations', users: '/admin/users', reports: '/admin/reports', audit: '/admin/moderation-actions', moderation: '/admin/posts', templates: '/contract-templates' })[route.view];
export async function allPages(path, options = {}) {
  const first = await request(path, options);
  if (!first || !Array.isArray(first.items)) return first;
  const items = [...first.items]; let page = first.page || 1, next = first.hasNext;
  while (next) {
    const url = new URL(path, 'http://local'); url.searchParams.set('page', ++page);
    const value = await request(url.pathname + url.search, options);
    if (!value || !Array.isArray(value.items)) throw new Error('Phản hồi phân trang không hợp lệ.');
    items.push(...value.items); next = value.hasNext;
  }
  return Object.hasOwn(first, 'counts') ? { ...first, items } : items;
}
export async function loadData(user, route, signal) {
  const data = emptyData(), role = route.role, me = id(user?.id);
  const get = async (path, fallback = [], optional404 = false) => {
    try {
      const url = new URL(path, 'http://local');
      if (url.pathname === primaryEndpoint(route)) {
        const query = route.listQuery || {};url.searchParams.set('page', query.page || 1);url.searchParams.set('pageSize', query.pageSize || 20);
        if (query.q) url.searchParams.set('q', query.q);
        for (const key of ['status', 'houseId', 'roomId', 'contractId', 'type', 'direction']) if (query[key]) url.searchParams.set(key, query[key]);
        const value = await request(url.pathname + url.search, { signal });
        data.pagination = value?.items ? { ...value, endpoint: url.pathname } : null;
        return value;
      }
      return await allPages(path, { signal });
    }
    catch (e) { if (signal?.aborted) throw e; if (!(optional404 && e.status === 404)) data.errors.push({ path, message: e.message, status: e.status }); return fallback; }
  };
  const addPost = p => {
    merge(data.posts, postData(p));
    if (p.house) merge(data.houses, houseData(p.house, p.landlordId));
    if (p.room) merge(data.rooms, { ...roomData(p.room), amenities: p.amenities || [] });
  };
  if (!['profile','users','audit','reports','verifications','templates'].includes(route.view)) { const rows = list(await get(`/posts${route.view === 'discover' && route.exploreQuery ? `?${route.exploreQuery}` : ''}`)); data.searchPostIds = rows.map(p => id(p.id)); rows.forEach(addPost); }
  if (user) {
    data.profiles[me] = personData(user);
    const common = [
      ['/me/notifications', rows => { data.notifications = list(rows).map(n => ({ ...n, id: id(n.id), userId: me, text: [n.title, n.content].filter(Boolean).join(' · '), read: n.isRead })); }],
      ['/me/sessions', rows => { data.sessions = list(rows).map(s => ({ ...s, id: id(s.id) })); }],
    ];
    if (role === 'admin') common.push(
      ['/admin/posts', rows => list(rows).forEach(addPost)],
      ['/admin/users', rows => { data.users = list(rows).map(personData); data.users.forEach(u => { data.profiles[u.id] = u; }); data.lockedUsers = data.users.filter(u => u.status === 'LOCKED').map(u => u.id); }],
      ['/admin/reports', rows => { data.reports = list(rows); }],
      ['/admin/moderation-actions', rows => { data.audit = list(rows).map(a => ({ ...a, id: id(a.id), actorId: id(a.actorUserId), date: a.occurredAt, target: a.afterSnapshot })); }],
      ['/admin/identity-verifications', rows => { data.verifications.push(...list(rows).map(v => verificationData(v, 'identity'))); }],
      ['/admin/landlord-verifications', rows => { data.verifications.push(...list(rows).map(v => verificationData(v, 'landlord'))); }],
      ['/admin/house-verifications', rows => { data.houseVerifications = list(rows).map(v => ({ ...v, id: id(v.id), houseId: id(v.houseId), applicantId: id(v.applicantLandlordId), scope: v.scopeDescription })); }],
      ['/admin/dashboard', value => { data.dashboard = value; }, {}],
    );
    else common.push(
      ['/contracts', rows => { data.contracts = list(rows).map(contractData); }],
      ['/invoices', rows => { data.invoices = list(rows).map(invoiceData); }],
      ['/viewings', rows => { data.viewings = list(rows).map(v => viewingData(v)); }],
      ['/viewing-proposals', rows => { data.viewingProposals = list(rows).map(v => viewingData(v, true)); }],
      ['/conversations', rows => { data.conversations = list(rows).map(conversationData); }],
      ['/occupant-join-requests', rows => { data.joinRequests = list(rows).map(j => ({ ...j, id: id(j.id), contractId: id(j.contractId), applicantId: id(j.applicantId), requestedBy: id(j.requestedById) })); }],
      ['/me/identity-verifications', rows => data.verifications.push(...list(rows).map(v => verificationData(v, 'identity', me)))],
      ['/me/landlord-verifications', rows => data.verifications.push(...list(rows).map(v => verificationData(v, 'landlord', me)))],
    );
    if (role === 'tenant') common.push(
      ['/me/favorites', rows => { list(rows).forEach(f => { data.favorites.push(id(f.postId)); if (f.post) addPost(f.post); }); }],
      ['/me/roommate-profile', value => { data.roommateProfile = value ? roommateData(value) : null; }, null, true],
      ['/roommate-requests', value => { data.roommateInvites = list(value.items).map(i => ({ ...i, id: id(i.id), senderId: id(i.senderId), receiverId: id(i.receiverId), note: i.message, status: i.endedAt ? 'ENDED' : i.status })); }, { items: [] }],
    );
    if (role === 'landlord') common.push(
      ['/residents', rows => { data.residents = list(rows).map(memberData); }],
      ['/rental-services', rows => { data.serviceCatalog = list(rows).map(s => ({ ...s, id: id(s.id) })); }],
      ['/houses', rows => list(rows).forEach(h => { merge(data.houses, houseData(h, me)); (h.rooms || []).forEach(r => merge(data.rooms, roomData(r))); })],
      ['/landlord/posts', rows => list(rows).forEach(addPost)],
      ['/landlord/dashboard', value => { data.dashboard = value; }, {}],
    );
    if (['landlord', 'admin'].includes(role)) common.push(['/contract-templates', rows => { data.templates = list(rows).map(t => ({ ...t, id: id(t.id) })); }]);
    const needed = ({ profile: ['/me/notifications','/me/sessions','/me/identity-verifications','/me/landlord-verifications'], users: ['/admin/users','/me/notifications'], audit: ['/admin/moderation-actions','/admin/users','/me/notifications'], reports: ['/admin/reports','/me/notifications'], templates: ['/contract-templates','/me/notifications'], moderation: ['/admin/posts','/me/notifications'], verifications: ['/admin/identity-verifications','/admin/landlord-verifications','/admin/house-verifications','/me/notifications'] })[route.view];
    await Promise.all(common.filter(([path]) => !needed || needed.includes(path)).map(async ([path, apply, fallback, optional]) => apply(await get(path, fallback, optional))));
    await Promise.all(data.contracts.map(async c => {
      const revisions = list(await get(`/contracts/${c.id}/revisions`));
      c.revisions = revisions.map(r => ({ ...r, id: id(r.id), version: r.revisionNumber }));
      const current = c.revisions.find(r => id(r.id) === id(c.currentRevisionId));
      c.terms = current?.content || ''; c.revisionNo = current?.revisionNumber; c.feedback = c.revisions.find(r => r.tenantFeedback)?.tenantFeedback;
      data.changeRequests.push(...list(await get(`/contracts/${c.id}/change-requests`)).map(x => { let proposal = {}; try { proposal = typeof x.proposalSnapshot === 'string' ? JSON.parse(x.proposalSnapshot) : x.proposalSnapshot || {}; } catch { /* Backend snapshot may be absent. */ } return { ...x, id: id(x.id), contractId: id(x.contractId), requestedById: id(x.requestedById), effective: x.requestedEffectiveDate, note: proposal.reason || '', newEndDate: proposal.newEndDate, proposal }; }));
    }));
    if (role === 'landlord') await Promise.all(data.houses.filter(h => h.ownerId === me).map(async h => {
      data.houseVerifications.push(...list(await get(`/houses/${h.id}/verifications`)).map(v => ({ ...v, id: id(v.id), houseId: id(v.houseId), scope: v.scopeDescription, applicantId: me })));
      data.services.push(...list(await get(`/houses/${h.id}/services`)).map(s => ({ ...s, id: id(s.id), houseId: id(s.houseId), price: num(s.unitPrice), method: s.calculationMethod })));
    }));
    if (role === 'tenant' && data.roommateProfile && route.view === 'roommates') {
      list(await get('/roommate-matches')).forEach(m => { const p = roommateData(m.profile); data.roommateProfiles[p.id] = { ...p, score: m.score }; });
      data.criteria = list(await get('/lifestyle-criteria'));
      data.lifestyles = list(await get('/me/roommate-profile/lifestyles'));
    }
    const current = data.conversations.find(c => c.id === route.id) || (route.view === 'chats' && window.matchMedia('(min-width: 651px)').matches ? data.conversations[0] : null);
    if (current && current.users.length === 2 && route.view === 'chats') {
      current.messages = list(await get(`/conversations/${current.id}/messages`)).map(m => messageData(m, current.roomId));
      // A share can reference a post outside the current discovery result.
      await Promise.all([...new Set(current.messages.map(m => m.sharedPostId).filter(p => p && !data.posts.some(x => x.id === p)))].map(async p => { const post = await get(`/posts/${p}`, null, true); if (post) addPost(post); }));
    }
    if (role === 'landlord' && ['services', 'room-detail', 'detail', 'invoices'].includes(route.view)) await Promise.all(data.rooms.filter(r => data.houses.some(h => h.id === r.houseId && h.ownerId === me)).map(async r => {
      data.roomServices.push(...list(await get(`/rooms/${r.id}/service-settings`)).map(s => ({ ...s, id: id(s.id), roomId: id(s.roomId), serviceId: id(s.houseServiceId), override: num(s.unitPriceOverride) })));
    }));
  }
  if (route.view === 'detail' && route.id && !data.posts.some(p => p.id === route.id)) { const p = await get(`/posts/${route.id}`, null); if (p) addPost(p); }
  const roomIds = new Set([...data.contracts.map(c => c.roomId), ...data.invoices.map(i => i.roomId), ...data.viewings.map(v => v.roomId), ...data.viewingProposals.map(v => v.roomId), ...(route.view === 'room-detail' ? [route.id] : [])].filter(Boolean));
  await Promise.all([...roomIds].filter(r => !data.rooms.some(x => x.id === r)).map(async rid => { const r = await get(`/rooms/${rid}`, null); if (r) merge(data.rooms, roomData(r)); }));
  if (['detail', 'room-detail'].includes(route.view)) {
    const rid = route.view === 'room-detail' ? route.id : data.posts.find(p => p.id === route.id)?.roomId;
    if (rid) await Promise.all([
      get(`/rooms/${rid}/reviews`).then(rows => { data.reviews = list(rows).map(r => ({ ...r, id: id(r.id) })); }),
      get(`/rooms/${rid}/services`).then(rows => { data.publicServices = list(rows).map(s => ({ ...s, price: num(s.unitPrice) })); }),
    ]);
  }
  data.contracts.forEach(c => c.members.forEach(m => { if (m.tenantId && !data.profiles[m.tenantId]) data.profiles[m.tenantId] = personData({ id: m.tenantId, fullName: m.name }); }));
  data.invoices.forEach(i => { const c = data.contracts.find(c => c.id === i.contractId); i.payerId = c?.members.find(m => m.id === i.payerMemberId)?.tenantId; });
  data.reports = data.reports.map(r => ({ ...r, id: id(r.id), from: id(r.reporterId), date: r.createdAt, target: r.reportedPostId ? `Tin #${r.reportedPostId}` : r.contractId ? `Hợp đồng #${r.contractId}` : r.reportedUserId ? `Người dùng #${r.reportedUserId}` : r.type }));
  return data;
}

export async function saveRecord(collection, item) {
  const updating = !!item.id, method = updating ? 'PATCH' : 'POST';
  switch (collection) {
    case 'houses': return request(updating ? `/houses/${item.id}` : '/houses', { method, headers: updating ? { 'If-Match': `"${item.rowVersion}"` } : {}, body: { name: item.name, address: item.address, areaLabel: item.area, provinceCode: item.provinceCode, localityCode: item.localityCode, notes: item.notes } });
    case 'rooms': { const result = await send(updating ? `/rooms/${item.id}` : `/houses/${item.houseId}/rooms`, { code: item.code, area: item.area, ...(!updating ? { capacity: item.capacity } : {}), rentAmount: item.price, depositAmount: item.deposit, ...(item.status ? { status: item.status } : {}) }, method); if (updating && item.capacity != null) await send(`/rooms/${item.id}/capacity`, { capacity: item.capacity }, 'PUT'); return result; }
    case 'services': return send(`/houses/${item.houseId}/services${updating ? `/${item.id}` : ''}`, { ...(item.serviceId ? { serviceId: item.serviceId } : {}), name: item.name, unit: item.unit, unitPrice: item.price, calculationMethod: item.method, active: item.active }, method);
    case 'posts': return send(updating ? `/posts/${item.id}` : '/posts', { roomId: item.roomId, title: item.title, content: item.description, contentVersion: item.version, amenities: item.amenities, ...(item.imageFileIds ? { imageFileIds: item.imageFileIds } : {}) }, method);
    case 'templates': return send('/admin/contract-templates', { name: item.name, content: item.content });
    case 'reports': return send('/reports', { type: 'VIOLATION', targetType: 'POST', targetId: item.postId, reason: item.reason });
    case 'invoices': return send(updating ? `/invoices/${item.id}` : '/invoices', { contractId: item.contractId, payerRoomTenantId: item.payerMemberId, billingPeriod: item.period, dueDate: item.due, items: item.items.map(i => ({ type: i.type || 'OTHER', name: i.name, unit: i.unit || 'lần', quantity: i.quantity, unitPrice: i.price, ...(i.roomServiceId ? { roomServiceId: i.roomServiceId, calculationMethod: i.calculationMethod, previousReading: i.previousReading, currentReading: i.currentReading } : {}) })) }, method);
    default: throw new Error('Luồng này chưa có hợp đồng API phù hợp.');
  }
}

export async function patchRecord(collection, item, values) {
  const { status, reason } = values, rid = item.apiId || item.id;
  switch (collection) {
    case 'services': return saveRecord(collection, { ...item, ...values });
    case 'templates': return send(`/admin/contract-templates/${rid}`, { active: values.active }, 'PATCH');
    case 'notifications': return send(`/me/notifications/${rid}/read-state`, { isRead: true }, 'PUT');
    case 'viewingProposals': return status === 'WITHDRAWN' ? send(`/viewing-proposals/${rid}/withdraw`) : send(`/viewing-proposals/${rid}/decision`, { decision: status === 'ACCEPTED' ? 'ACCEPT' : 'REJECT', reason });
    case 'viewings':
      if (values.decision) return send(`/viewings/${rid}/rental-decision`, { decision: ({ AGREED: 'AGREE', DECLINED: 'DECLINE', WITHDRAWN: 'WITHDRAW' })[values.decision] });
      return status === 'CANCELLED' ? send(`/viewings/${rid}/cancel`, { reason }) : send(`/viewings/${rid}/attendance`, { outcome: status === 'COMPLETED' ? 'ATTENDED' : 'NO_SHOW' });
    case 'posts': return status === 'HIDDEN' ? send(`/posts/${rid}/hide`, { reason }) : status === 'APPROVED' && item.status === 'HIDDEN' ? send(`/admin/posts/${rid}/restore`) : send(`/admin/posts/${rid}/decision`, { decision: status === 'APPROVED' ? 'APPROVE' : 'REJECT', reason, contentVersion: item.contentVersion });
    case 'contracts': return status === 'CONFIRMED' ? send(`/contracts/${rid}/confirm`, { revisionId: item.currentRevisionId }) : send(`/contracts/${rid}/cancel`, { reason });
    case 'invoices': return send(`/invoices/${rid}/${({ UNPAID: 'issue', PAID: 'payment-confirmation', CANCELLED: 'cancel' })[status]}`, { reason });
    case 'changeRequests': return send(`/contract-change-requests/${rid}/decision`, { decision: status === 'REJECTED' ? 'REJECT' : 'APPROVE', reason });
    case 'joinRequests': return send(`/occupant-join-requests/${rid}/${status === 'REJECTED' ? 'reject' : 'approve'}`, { reason });
    case 'verifications': return send(`/admin/${item.kind === 'landlord' ? 'landlord' : 'identity'}-verifications/${rid}/decision`, { decision: status === 'APPROVED' ? 'APPROVE' : 'REJECT', reason, evidenceChecked: values.evidenceChecked });
    case 'houseVerifications': return send(`/admin/house-verifications/${rid}/${status === 'REVOKED' ? 'revoke' : 'decision'}`, { decision: status === 'APPROVED' ? 'APPROVE' : 'REJECT', reason, evidenceChecked: values.evidenceChecked });
    default: throw new Error('Thao tác này chưa có hợp đồng API phù hợp.');
  }
}

export async function uploadFile(file, purpose) {
  if (!file || !file.size || file.size > 20000000) throw new Error('Chọn tệp có dung lượng từ 1 byte đến 20 MB.');
  const sha256 = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))].map(b => b.toString(16).padStart(2, '0')).join('');
  const session = await send('/files/upload-sessions', { purpose, originalName: file.name, mimeType: file.type, sizeBytes: file.size, sha256 });
  const response = await fetch(`${base}/files/${session.fileId}/content`, { method: 'PUT', body: file, headers: { ...session.requiredHeaders, Authorization: `Bearer ${storedSession()?.accessToken}` }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) { const error = await response.json().catch(() => ({})); throw new Error(error.detail || 'Không tải được nội dung tệp.'); }
  await send(`/files/${session.fileId}/complete`); return String(session.fileId);
}
export async function openFile(fileId) {
  const file = await send(`/files/${fileId}/download-links`);
  const url = new URL(file.downloadUrl, new URL(base, location.origin));
  const response = await fetch(url); if (!response.ok) throw new Error('Không đọc được tệp.');
  const blob = URL.createObjectURL(await response.blob()); const link = document.createElement('a');link.href = blob;link.target = '_blank';link.rel = 'noopener';link.click();setTimeout(() => URL.revokeObjectURL(blob), 60000);
}
export async function exportResidents(query = '') {
  const response = await fetch(`${base}/residents/export${query ? `?${query}` : ''}`, { headers: { Authorization: `Bearer ${storedSession()?.accessToken}` } });
  if (!response.ok || !response.headers.get('content-type')?.includes('text/csv')) throw new Error('Không xuất được danh sách cư dân.');
  return response.blob();
}
