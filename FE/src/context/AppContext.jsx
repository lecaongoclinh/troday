import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import seed from '../data/seed.json';
import { NAV, PEOPLE } from '../data/navigation';
import { day, ROLE_USER, uid } from '../data/selectors';

const Context = createContext(null);
const STORAGE_KEY = 'troday-react-demo-v1';
export const AUTH_VIEWS = ['login', 'register', 'forgot-password'];
const initialData = () => {
  const next = structuredClone(seed);
  next.viewings.filter(v => v.status === 'SCHEDULED').forEach((v, index) => { v.date = day(index + 1); });
  next.profiles = {}; next.lockedUsers = []; next.revokedSessions = [];
  return next;
};
function loadData() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved?.version === 1 && Array.isArray(saved.data?.posts) && Array.isArray(saved.data?.houses)) return saved.data; } catch { /* Storage is optional. */ }
  return initialData();
}
function readRoute() {
  const p = new URLSearchParams(location.search), role = Object.hasOwn(NAV, p.get('role')) ? p.get('role') : 'tenant';
  const view = p.get('view');
  return { role, view: NAV[role].some(([id]) => id === view) || AUTH_VIEWS.includes(view) || ['detail', 'room-detail'].includes(view) ? view : role === 'tenant' ? 'discover' : 'dashboard', id: p.get('id') || null };
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadData);
  const [route, setRoute] = useState(readRoute);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef();
  const mainRef = useRef();
  const notify = useCallback(message => { clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 3500); }, []);
  const mutate = useCallback(recipe => setData(previous => { const next = structuredClone(previous); recipe(next); return next; }), []);
  const navigate = useCallback((view, id = null, role) => {
    const nextRole = role || route.role;
    const allowed = NAV[nextRole].some(([key]) => key === view) || AUTH_VIEWS.includes(view) || ['detail', 'room-detail'].includes(view);
    if (!allowed) view = nextRole === 'tenant' ? 'discover' : 'dashboard';
    const next = { role: nextRole, view, id };
    const url = new URL(location.href);
    url.searchParams.set('role', next.role); url.searchParams.set('view', view);
    if (id) url.searchParams.set('id', id); else url.searchParams.delete('id');
    if (url.href !== location.href) history.pushState(null, '', url);
    setDialog(null); setRoute(next); window.scrollTo(0, 0);
    requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }, [route.role]);
  const switchRole = role => { if (Object.hasOwn(NAV, role)) navigate(role === 'tenant' ? 'discover' : 'dashboard', null, role); };
  const openDialog = useCallback((type, props = {}) => setDialog({ type, ...props }), []);
  const closeDialog = () => setDialog(null);
  const upsert = (collection, item) => mutate(next => {
    const index = next[collection].findIndex(row => row.id === item.id);
    if (index >= 0) next[collection][index] = { ...next[collection][index], ...item };
    else next[collection].push({ ...item, id: item.id || uid(collection) });
  });
  const patch = (collection, id, values) => mutate(next => { const item = next[collection].find(item => item.id === id); if (item) Object.assign(item, values); });
  const audit = (action, target, reason) => mutate(next => next.audit.push({ id: uid('audit'), actorId: 'admin', action, target, reason, date: day() }));
  const me = ROLE_USER[route.role];
  const person = id => ({ ...(PEOPLE[id] || { name: id || 'Người dùng', initials: '?', short: 'bạn' }), ...data.profiles[id] });
  const room = id => data.rooms.find(r => r.id === id);
  const house = id => data.houses.find(h => h.id === id);
  const contract = id => data.contracts.find(c => c.id === id);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data })); } catch { /* Preview still works in memory. */ } }, [data]);
  useEffect(() => {
    const pop = () => { setRoute(readRoute()); setDialog(null); window.scrollTo(0, 0); };
    const sync = event => { if (event.key === STORAGE_KEY && event.newValue) setData(loadData()); };
    window.addEventListener('popstate', pop); window.addEventListener('storage', sync);
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('storage', sync); clearTimeout(toastTimer.current); };
  }, []);
  useEffect(() => {
    document.body.dataset.role = route.role; document.body.dataset.view = route.view;
    document.body.classList.toggle('auth-open', AUTH_VIEWS.includes(route.view));
    document.title = `${NAV[route.role].find(([id]) => id === route.view)?.[1] || ({ detail: 'Chi tiết tin', 'room-detail': 'Chi tiết phòng', login: 'Đăng nhập', register: 'Đăng ký', 'forgot-password': 'Quên mật khẩu' })[route.view] || 'Trọday'} · Trọday`;
  }, [route]);
  useEffect(() => {
    if (!import.meta.env.DEV && !import.meta.env.MODE.includes('test')) return;
    window.__troday = { getState: () => structuredClone({ ...data, ...route }), reset: () => setData(initialData()), navigate, switchRole, navigation: NAV };
    return () => { delete window.__troday; };
  }, [data, route, navigate]);

  return <Context.Provider value={{ data, route, role: route.role, me, person, room, house, contract, navigate, switchRole, mutate, upsert, patch, audit, dialog, openDialog, closeDialog, toast, notify, mainRef }}>{children}</Context.Provider>;
}
export const useApp = () => useContext(Context);
