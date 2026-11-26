import { AUTH_VIEWS, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dialogs from './components/Dialogs';
import ListControls from './components/ListControls';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import { RoomDetail, Properties, Services, Listings, Viewings } from './pages/Rentals';
import Contracts from './pages/Contracts';
import { Residents, Invoices } from './pages/Finance';
import { Chats, Roommates, Profile } from './pages/Community';
import { Verifications, Moderation, Templates, Reports, Users, Audit } from './pages/Admin';
import { Button, Empty } from './components/ui';

const screens = { discover: Discover, favorites: Discover, dashboard: Dashboard, detail: RoomDetail, 'room-detail': RoomDetail, properties: Properties, services: Services, listings: Listings, viewings: Viewings, contracts: Contracts, residents: Residents, invoices: Invoices, chats: Chats, roommates: Roommates, profile: Profile, verifications: Verifications, moderation: Moderation, templates: Templates, reports: Reports, users: Users, audit: Audit };
export default function App() {
  const { route, toast, session, booting, loading, loadError, data, reload } = useApp();
  const Screen = screens[route.view] || Discover;
  const needsLogin = !session && !['discover', 'detail'].includes(route.view);
  return <>{booting ? <Empty title="Đang kiểm tra phiên đăng nhập…" /> : AUTH_VIEWS.includes(route.view) || needsLogin ? <Auth key={needsLogin ? 'login' : route.view} /> : <Layout>{loadError || data.errors.length ? <div className="flow-banner" role="alert"><p>{loadError || `Chưa tải được một phần dữ liệu. ${data.errors[0].message}`}</p><Button onClick={() => reload()}>Thử tải lại</Button></div> : null}{route.view !== 'discover' && <ListControls />}{loading && <p role="status" className="muted">Đang tải dữ liệu…</p>}<div aria-busy={loading}><Screen key={`${session?.user.id || 'guest'}:${route.role}:${route.view}`} favorites={route.view === 'favorites'} /></div></Layout>}<Dialogs /><div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div></>;
}
