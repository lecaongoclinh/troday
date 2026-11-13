import { AUTH_VIEWS, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import LivePage, { LiveDialogs, LiveProfile, LiveResource } from './pages/LiveApp';
import './styles/api.css';

export default function App() {
  const { route, toast } = useApp();
  const Screen = route.view === 'profile' ? LiveProfile : route.view === 'resource' ? LiveResource : LivePage;
  return <>{AUTH_VIEWS.includes(route.view) ? <Auth key={route.view} /> : <Layout><Screen key={`${route.role}:${route.view}:${route.endpointId}:${route.rowId}:${JSON.stringify(route.params)}`} /></Layout>}<LiveDialogs /><div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div></>;
}
