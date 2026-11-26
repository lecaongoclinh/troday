import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NAV } from '../data/navigation';
import { defaultListQuery, emptyData, id, loadData, patchRecord, personData, request, saveRecord, send, storedSession, storeSession, userRoles } from '../data/api';

const Context = createContext(null);
export const AUTH_VIEWS = ['login', 'register', 'forgot-password'];
function readRoute() {
  const p = new URLSearchParams(location.search), role = Object.hasOwn(NAV, p.get('role')) ? p.get('role') : 'tenant';
  const requestedView = p.get('view');
  const view = NAV[role].some(([key]) => key === requestedView) || AUTH_VIEWS.includes(requestedView) || ['detail', 'room-detail'].includes(requestedView) ? requestedView : homeView(role);
  return { role, view, id: p.get('id') || null, listQuery: defaultListQuery(view) };
}
const homeView = role => role === 'tenant' ? 'discover' : 'dashboard';
function writeRoute(route, replace = false) {
  const url = new URL(location.href);
  url.searchParams.set('role', route.role); url.searchParams.set('view', route.view);
  if (route.id) url.searchParams.set('id', route.id); else url.searchParams.delete('id');
  if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', url);
}
export function AppProvider({ children }) {
  const [session, setSession] = useState(storedSession), [booting, setBooting] = useState(true);
  const [data, setData] = useState(emptyData), [route, setRoute] = useState(readRoute);
  const [loading, setLoading] = useState(false), [loadError, setLoadError] = useState(''), [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [dialog, setDialog] = useState(null), [toast, setToast] = useState('');
  const toastTimer = useRef(), mainRef = useRef(), abort = useRef(), mutation = useRef(false), sessionRef = useRef(session), routeRef = useRef(route), generation = useRef(0);
  sessionRef.current = session; routeRef.current = route;
  const me = id(session?.user?.id), availableRoles = userRoles(session?.user);
  const notify = useCallback(message => { clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 6000); }, []);
  const navigate = useCallback((view, target = null, requestedRole) => {
    const current = sessionRef.current, roles = userRoles(current?.user);
    const role = current ? roles.includes(requestedRole || routeRef.current.role) ? requestedRole || routeRef.current.role : roles[0] || 'tenant' : 'tenant';
    if (!NAV[role].some(([key]) => key === view) && !AUTH_VIEWS.includes(view) && !['detail', 'room-detail'].includes(view)) view = homeView(role);
    const previous = routeRef.current;
    const sameView = previous.view === view && previous.role === role;
    const listQuery = sameView && ['chats', 'discover'].includes(view) ? previous.listQuery : defaultListQuery(view);
    generation.current++;
    const next = { role, view, id: id(target), listQuery, exploreQuery: sameView && view === 'discover' ? previous.exploreQuery : '' };
    writeRoute(next); setDialog(null); setRoute(next); window.scrollTo(0, 0);
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }, []);
  const setListQuery = values => {
    const previous = routeRef.current;
    const next = { ...previous, id: null, listQuery: { ...defaultListQuery(previous.view), ...previous.listQuery, page: 1, ...values } };
    if (previous.id) writeRoute(next, true);
    setRoute(next);
  };
  const clearSession = useCallback(() => {
    abort.current?.abort();generation.current++;setDrafts({});storeSession(null); sessionRef.current = null; setSession(null); setData(emptyData()); setDialog(null);
  }, []);
  const reload = useCallback(async ({ background = false } = {}) => {
    abort.current?.abort(); const controller = new AbortController(); abort.current = controller;
    if (!background) setLoading(true); setLoadError('');
    try { const snapshot = await loadData(sessionRef.current?.user, routeRef.current, controller.signal); if (!controller.signal.aborted) setData(snapshot); }
    catch (error) { if (!controller.signal.aborted) setLoadError(error.message || 'Không tải được dữ liệu.'); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    const initial = sessionRef.current;
    if (!initial) { setBooting(false); return; }
    request('/me', { token: initial.accessToken }).then(user => {
      if (active) { const next = { ...initial, user }; storeSession(next); setSession(next); }
    }).catch(error => { if (active) { if (error.status === 401 || error.status === 403) clearSession(); else setLoadError(error.message); } }).finally(() => { if (active) setBooting(false); });
    return () => { active = false; };
  }, [clearSession]);
  useEffect(() => {
    const denied = event => { if (sessionRef.current?.accessToken === event.detail) { clearSession(); notify('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'); navigate('login'); } };
    const pop = () => { generation.current++; setRoute(readRoute()); setDialog(null); };
    window.addEventListener('troday:unauthorized', denied); window.addEventListener('popstate', pop);
    return () => { window.removeEventListener('troday:unauthorized', denied); window.removeEventListener('popstate', pop); clearTimeout(toastTimer.current); };
  }, [clearSession, navigate, notify]);
  useEffect(() => {
    if (booting) return;
    const roles = userRoles(session?.user), actual = session ? roles.includes(route.role) ? route.role : roles[0] || 'tenant' : 'tenant';
    if (route.role !== actual) { const view = AUTH_VIEWS.includes(route.view) ? route.view : homeView(actual); const next = { role: actual, view, id: null, listQuery: defaultListQuery(view) }; writeRoute(next, true); setRoute(next); return; }
    if (AUTH_VIEWS.includes(route.view)) { setLoading(false); return; }
    reload();
    return () => abort.current?.abort();
  }, [booting, session?.accessToken, route, reload]);
  useEffect(() => {
    if (!session || booting) return;
    // Polling also reconciles notifications written by SQL workflows.
    const timer = setInterval(() => { if (!document.hidden && !mutation.current && !dialog) reload({ background: true }); }, 30000);
    return () => clearInterval(timer);
  }, [session, booting, dialog, reload]);
  useEffect(() => {
    if (!session?.accessToken || booting) return;
    const controller = new AbortController(); let retry, refresh;
    const connect = async () => {
      try {
        const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')}/events`, { headers: { Accept: 'text/event-stream', Authorization: `Bearer ${session.accessToken}` }, signal: controller.signal });
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
        while (!controller.signal.aborted) {
          const chunk = await reader.read(); if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true }).replace(/\r\n/g, '\n');
          let end;
          while ((end = buffer.indexOf('\n\n')) >= 0) {
            const event = buffer.slice(0, end); buffer = buffer.slice(end + 2);
            if (/event:\s*(message|notification)\b/.test(event)) {
              clearTimeout(refresh); refresh = setTimeout(() => { if (!document.hidden && !mutation.current) reload({ background: true }); }, 200);
            }
          }
        }
      } catch { /* Polling keeps the screen usable while SSE reconnects. */ }
      if (!controller.signal.aborted) retry = setTimeout(connect, 5000);
    };
    connect(); return () => { controller.abort(); clearTimeout(retry); clearTimeout(refresh); };
  }, [session?.accessToken, booting, reload]);
  useEffect(() => {
    document.body.dataset.role = route.role; document.body.dataset.view = route.view;
    document.body.classList.toggle('auth-open', AUTH_VIEWS.includes(route.view));
    document.title = `${NAV[route.role].find(([key]) => key === route.view)?.[1] || ({ detail: 'Chi tiết tin', 'room-detail': 'Chi tiết phòng', login: 'Đăng nhập', register: 'Đăng ký', 'forgot-password': 'Quên mật khẩu' })[route.view] || 'Trọday'} · Trọday`;
  }, [route]);
  const execute = async action => {
    if (!sessionRef.current) { navigate('login'); throw new Error('Vui lòng đăng nhập để tiếp tục.'); }
    if (mutation.current) throw new Error('Đang xử lý thao tác trước. Vui lòng chờ.');
    mutation.current = true; setBusy(true);
    try { const result = await action(); await reload({ background: true }); return result; }
    finally { mutation.current = false; setBusy(false); }
  };
  const run = async (action, message = 'Đã cập nhật.') => { try { const result = await action(); if (message) notify(message); return result; } catch (error) { notify(error.message); return null; } };
  const upsert = (collection, item) => execute(() => saveRecord(collection, item));
  const patch = (collection, target, values) => run(() => execute(() => {
    const item = data[collection].find(row => row.id === target); if (!item) throw new Error('Dữ liệu không còn khả dụng.');
    return patchRecord(collection, item, values);
  }));
  const decide = (collection, target, values) => execute(() => {
    const item = data[collection].find(row => row.id === target); if (!item) throw new Error('Dữ liệu không còn khả dụng.');
    return patchRecord(collection, item, values);
  });
  const login = async values => {
    const result = await request('/auth/login', { method: 'POST', body: values, token: null });
    if (!result.accessToken || !result.user?.id || !userRoles(result.user).length) throw new Error('Phản hồi đăng nhập thiếu tài khoản hoặc vai trò.');
    const next = { accessToken: result.accessToken, expiresAt: result.expiresAt, user: result.user };
    abort.current?.abort();generation.current++;setDrafts({});storeSession(next); sessionRef.current = next; setData(emptyData()); setSession(next);
    navigate(homeView(userRoles(result.user)[0]), null, userRoles(result.user)[0]);
  };
  const logout = () => run(async () => { await send('/auth/logout'); clearSession(); navigate('login'); }, 'Đã đăng xuất.');
  const saveProfile = values => execute(async () => {
    await send('/me/profile', values, 'PATCH');
    const user = await request('/me'), next = { ...sessionRef.current, user };
    storeSession(next); sessionRef.current = next; setSession(next);
  });
  const revokeSession = s => run(async () => {
    await request(`/me/sessions/${s.id}`, { method: 'DELETE' });
    if (s.isCurrent) { clearSession(); navigate('login'); } else await reload({ background: true });
  }, 'Đã thu hồi phiên đăng nhập.');
  const toggleFavorite = postId => run(() => execute(() => request(`/me/favorites/${postId}`, { method: data.favorites.includes(postId) ? 'DELETE' : 'PUT' })));
  const searchPosts = async (filters, sort) => {
    const currentGeneration = ++generation.current;
    const params = new URLSearchParams({ sort: ({ recommended: 'newest', 'price-asc': 'rentAsc', 'price-desc': 'rentDesc', area: 'areaDesc' })[sort] || 'newest' });
    for (const [key, value] of Object.entries({ q: filters.query, provinceCode: filters.area === 'all' ? '' : filters.area, maxRent: filters.maxPrice, minArea: filters.minArea, amenities: filters.amenity })) if (value) params.set(key, value);
    if (filters.distance) {
      const coords = await new Promise((resolve, reject) => { if (!navigator.geolocation) return reject(new Error('Thiết bị chưa hỗ trợ định vị.')); navigator.geolocation.getCurrentPosition(p => resolve(p.coords), () => reject(new Error('Cần cho phép vị trí để tìm trong bán kính.')), { timeout: 10000 }); });
      params.set('lat', coords.latitude); params.set('lng', coords.longitude); params.set('radiusKm', filters.distance);
    }
    if (currentGeneration !== generation.current || routeRef.current.view !== 'discover') return;
    setLoading(true);
    setRoute(previous => ({ ...previous, exploreQuery: params.toString(), listQuery: { ...previous.listQuery, page: 1 } }));
  };
  const startChat = postId => run(async () => { const c = await execute(() => send('/conversations/room-inquiries', { postId })); if (c.participants?.length !== 2) throw new Error('Cuộc trò chuyện chưa tách riêng cho hai bên. Vui lòng chờ xử lý quyền truy cập.'); navigate('chats', c.id); }, '');
  const openRoommateChat = inviteId => run(async () => { const c = await execute(() => send(`/roommate-requests/${inviteId}/conversation`)); navigate('chats', c.id); }, '');
  const openDialog = useCallback((type, props = {}) => setDialog({ type, ...props }), []);
  const person = target => data.profiles[target] || (target ? personData({ id: target }) : { name: 'Khách', short: 'bạn', initials: '?' });
  useEffect(() => {
    if (!import.meta.env.DEV && !import.meta.env.MODE.includes('test')) return;
    window.__troday = { getState: () => structuredClone({ ...data, ...route, me, loading, booting, authenticated: !!session }), navigate, navigation: NAV };
    return () => { delete window.__troday; };
  }, [data, route, me, loading, booting, session, navigate]);
  return <Context.Provider value={{ data, route, drafts, setDrafts, setListQuery, role: route.role, me, session, availableRoles, booting, loading, loadError, busy, reload, execute, run, login, logout, saveProfile, revokeSession, searchPosts, toggleFavorite, startChat, openRoommateChat, person, room: target => data.rooms.find(r => r.id === target), house: target => data.houses.find(h => h.id === target), contract: target => data.contracts.find(c => c.id === target), navigate, switchRole: role => navigate(homeView(role), null, role), upsert, patch, decide, dialog, openDialog, closeDialog: () => setDialog(null), toast, notify, mainRef }}>{children}</Context.Provider>;
}
export const useApp = () => useContext(Context);
