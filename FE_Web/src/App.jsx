import { AUTH_VIEWS, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dialogs from './components/Dialogs';
import Discover from './pages/Discover';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import { RoomDetail, Properties, Services, Listings, Viewings } from './pages/Rentals';
import Contracts from './pages/Contracts';
import { Residents, Invoices } from './pages/Finance';
import { Chats, Roommates, Profile } from './pages/Community';
import { Verifications, Moderation, Templates, Reports, Users, Audit } from './pages/Admin';

const screens = { discover: Discover, favorites: Discover, dashboard: Dashboard, detail: RoomDetail, 'room-detail': RoomDetail, properties: Properties, services: Services, listings: Listings, viewings: Viewings, contracts: Contracts, residents: Residents, invoices: Invoices, chats: Chats, roommates: Roommates, profile: Profile, verifications: Verifications, moderation: Moderation, templates: Templates, reports: Reports, users: Users, audit: Audit };
export default function App() {
  const { route, toast } = useApp();
  const Screen = screens[route.view] || Discover;
  return <>{AUTH_VIEWS.includes(route.view) ? <Auth key={route.view} /> : <Layout><Screen key={`${route.role}:${route.view}`} favorites={route.view === 'favorites'} /></Layout>}<Dialogs /><div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div></>;
}
