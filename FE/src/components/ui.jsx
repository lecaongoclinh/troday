import paths from './icon-paths.json';
import { useApp } from '../context/AppContext';

const extraPaths = {
  'arrow-up-right': '<path d="M7 17 17 7M7 7h10v10"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',
};
export function Icon({ name, ...props }) {
  // Only bundled, trusted SVG paths are inserted here; application content uses JSX.
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} dangerouslySetInnerHTML={{ __html: extraPaths[name] || paths[name] || paths['building-2'] }} />;
}
export function Button({ children, icon, variant = '', className = '', ...props }) { return <button type="button" className={`button ${variant} ${className}`} {...props}>{icon && <Icon name={icon} />}{children}</button>; }
export function Avatar({ id }) { const { person } = useApp(); const p = person(id); return <span className={`avatar ${p.color || ''}`} aria-hidden="true">{p.initials}</span>; }
const STATUSES = {
  AVAILABLE: ['Còn phòng', 'green'], RESERVED: ['Đã giữ chỗ', 'yellow'], OCCUPIED: ['Đang cho thuê', 'blue'], MAINTENANCE: ['Bảo trì', 'red'],
  APPROVED: ['Đã duyệt', 'green'], PENDING_REVIEW: ['Chờ duyệt', 'yellow'], REJECTED: ['Đã từ chối', 'red'], HIDDEN: ['Đã ẩn', 'gray'],
  PENDING: ['Chờ xử lý', 'yellow'], DRAFT: ['Bản nháp', 'gray'], PENDING_CONFIRMATION: ['Chờ xác nhận', 'yellow'], CONFIRMED: ['Đã xác nhận', 'green'], ACTIVE: ['Đang hiệu lực', 'green'], TERMINATED: ['Đã kết thúc', 'gray'], CANCELLED: ['Đã hủy', 'red'],
  UNPAID: ['Chưa thanh toán', 'yellow'], PAID: ['Đã thanh toán', 'green'], SCHEDULED: ['Đã hẹn', 'blue'], COMPLETED: ['Đã xem phòng', 'green'], NO_SHOW: ['Không đến', 'red'], WAITING: ['Chưa quyết định', 'gray'], AGREED: ['Đồng ý thuê', 'green'], DECLINED: ['Không thuê', 'red'], WITHDRAWN: ['Đã rút', 'gray'],
  PENDING_LANDLORD: ['Chờ chủ trọ duyệt', 'yellow'], PLANNED: ['Chờ vào ở', 'yellow'], LEFT: ['Đã rời phòng', 'gray'], ACCEPTED: ['Đã kết nối', 'green'], RESOLVED: ['Đã xử lý', 'green'], REVOKED: ['Đã thu hồi', 'red'],
};
export function Badge({ status, children, tone = 'gray' }) { const value = STATUSES[status]; return <span className={`pill ${value?.[1] || tone}`}>{children || value?.[0] || status}</span>; }
export function Empty({ title = 'Chưa có dữ liệu', children, icon = 'inbox', action }) { return <div className="empty-state"><Icon name={icon} /><div><strong>{title}</strong><p>{children}</p>{action}</div></div>; }
export function PageHeader({ title, description, children }) { return <div className="page-heading"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="heading-actions">{children}</div>}</div>; }
export function Section({ title, action, children, className = '' }) { return <section className={className}><div className="section-bar"><h2>{title}</h2>{action}</div>{children}</section>; }
export function Field({ label, children, full, ...props }) { return <label className={`field ${full ? 'full' : ''}`} {...props}>{label}{children}</label>; }
export function Tabs({ items, value, onChange, label = 'Lọc danh sách' }) { return <div className="segmented" role="group" aria-label={label}>{items.map(([id, text]) => <button key={id} type="button" className={value === id ? 'active' : ''} aria-pressed={value === id} onClick={() => onChange(id)}>{text}</button>)}</div>; }
export function Table({ columns, rows, empty = 'Chưa có mục nào', rowKey = 'id' }) { return <div className="table-surface table-scroll">{rows.length ? <table><thead><tr>{columns.map((c, index) => <th scope="col" key={c.key || index}>{c.label || <span className="sr-only">Thao tác</span>}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row[rowKey] || index}>{columns.map((c, index) => <td key={c.key || index} className={c.actions ? 'actions-cell' : ''}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>)}</tbody></table> : <Empty title={empty} />}</div>; }
export function TextLink({ children, to }) { const { navigate } = useApp(); return <Button variant="text-button" onClick={() => navigate(to)}>{children}<Icon name="arrow-right" /></Button>; }
