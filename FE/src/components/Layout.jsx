import { NAV, ROLES } from '../data/navigation';
import { useApp } from '../context/AppContext';
import { Avatar, Icon } from './ui';

export function Brand({ sidebar = false }) {
  const { role, navigate } = useApp();
  return (
    <a
      href={`?role=${role}`}
      className="brand"
      onClick={event => {
        event.preventDefault();
        navigate(role === 'tenant' ? 'discover' : 'dashboard');
      }}
    >
      <span className="brand-mark"><Icon name="building-2" /></span>
      <span>
        trọ<span className="brand-accent">day{!sidebar && '.'}</span>
        {!sidebar && <small>Một chỗ ở. Nhiều an tâm.</small>}
      </span>
    </a>
  );
}

export default function Layout({ children }) {
  const { data, route, role, me, person, navigate, switchRole, openDialog, mainRef } = useApp();
  const roleLabel = `Không gian ${ROLES[role].toLowerCase()}`;
  const active = route.view === 'room-detail'
    ? role === 'tenant' ? 'discover' : role === 'admin' ? 'moderation' : 'properties'
    : route.view === 'detail'
      ? role === 'tenant' ? 'discover' : role === 'admin' ? 'moderation' : 'listings'
      : route.view;
  const unread = data.notifications.filter(notification => notification.userId === me && !notification.read).length;
  const mobile = role === 'tenant'
    ? ['discover', 'favorites', 'chats', 'contracts']
    : role === 'landlord'
      ? ['dashboard', 'properties', 'chats', 'invoices']
      : ['dashboard', 'verifications', 'moderation', 'reports'];

  const navItem = ([id, label, glyph]) => (
    <button
      key={id}
      type="button"
      className={`nav-link ${active === id ? 'active' : ''}`}
      aria-current={active === id ? 'page' : undefined}
      onClick={() => navigate(id)}
      data-view={id}
    >
      <Icon name={glyph} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <a className="skip-link" href="#app-main">Đến nội dung chính</a>
      <div className="app-shell">
        <aside className="sidebar" aria-label="Điều hướng chính">
          <Brand sidebar />
          <div className="sidebar-role"><span className="role-dot" />{roleLabel}</div>
          <nav className="sidebar-nav" aria-label="Chức năng">
            <div className="nav-group-title">Điều hướng</div>
            {NAV[role].map(navItem)}
          </nav>
          <div className="sidebar-account">
            <button type="button" className="account-row" onClick={() => navigate('profile')}>
              <Avatar id={me} />
              <span className="account-copy">
                <strong>{person(me).name}</strong>
                <small>{roleLabel}</small>
              </span>
            </button>
          </div>
        </aside>

        <div className="workspace">
          <header className="topbar">
            <div className="topbar-location">
              <span className="crumb">Không gian của bạn</span>
              <span className="crumb-divider">/</span>
              <strong>{NAV[role].find(([id]) => id === active)?.[1] || 'Chi tiết phòng'}</strong>
            </div>
            <a
              className="mobile-brand"
              href="?view=discover"
              onClick={event => {
                event.preventDefault();
                navigate(role === 'tenant' ? 'discover' : 'dashboard');
              }}
            >
              trọ<span>day.</span>
            </a>
            <div className="topbar-actions">
              <span className="preview-tag"><span />Bản xem trước</span>
              <label className="role-select-label">
                <span className="sr-only">Chọn vai trò xem trước</span>
                <select value={role} onChange={event => switchRole(event.target.value)} aria-label="Chọn vai trò xem trước">
                  {Object.entries(ROLES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              </label>
              <span className="topbar-divider" />
              <button
                className={`icon-button notification-button ${unread ? 'has-unread' : ''}`}
                type="button"
                aria-label={`Thông báo${unread ? `: ${unread} chưa đọc` : ''}`}
                onClick={() => openDialog('notifications')}
              >
                <Icon name="bell" />
                {unread > 0 && <span className="notification-badge">{unread}</span>}
              </button>
              <button className="account-button" type="button" aria-label="Tài khoản" onClick={() => navigate('profile')}>
                <Avatar id={me} />
              </button>
            </div>
          </header>

          <main id="app-main" ref={mainRef} tabIndex={-1} className={`main-content ${route.view === 'chats' ? 'chat-view' : ''}`}>
            {children}
          </main>
          <footer className="workspace-footer">
            <span>© {new Date().getFullYear()} Trọday.</span>
            <span>Một chỗ ở. Nhiều an tâm. <span className="footer-flower">✳</span></span>
          </footer>
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Điều hướng di động">
        {mobile.map(id => navItem(NAV[role].find(item => item[0] === id)))}
        <button type="button" className="nav-link" onClick={() => openDialog('menu')}>
          <Icon name="menu" /><span>Tiện ích</span>
        </button>
      </nav>
    </>
  );
}
