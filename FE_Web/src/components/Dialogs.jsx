import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { NAV } from '../data/navigation';
import { request, send, id, list, allPages, uploadFile, openFile } from '../data/api';
import { dateLabel, day, money, ownHouses, ownRooms, publicPosts, totalInvoice } from '../data/selectors';
import { Badge, Button, Empty, Field, Icon, Table } from './ui';
import ContractDetails from './ContractDetails';

export default function Dialogs() {
  const { dialog, closeDialog } = useApp(), ref = useRef();
  useEffect(() => { if (dialog && ref.current && !ref.current.open) ref.current.showModal(); }, [dialog]);
  if (!dialog) return null;
  return <dialog className={`app-dialog ${dialog.type === 'contract-detail' ? 'contract-detail-dialog' : ''}`} aria-labelledby="app-dialog-title" ref={ref} onCancel={closeDialog} onClick={e => { if (e.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(); } }}><DialogContent key={`${dialog.type}:${dialog.id || dialog.roomId || ''}`} /></dialog>;
}
function Frame({ title, children }) { const { closeDialog } = useApp(); return <><div className="dialog-header"><h2 id="app-dialog-title">{title}</h2><button className="icon-button" type="button" aria-label="Đóng hộp thoại" onClick={closeDialog}><Icon name="x" /></button></div><div className="dialog-content">{children}</div></>; }
const text = (name, label, extra = {}) => ({ name, label, required: true, ...extra });
const number = (name, label, extra = {}) => text(name, label, { type: 'number', min: 0, ...extra });
const select = (name, label, options, extra = {}) => text(name, label, { type: 'select', options, ...extra });
const options = (rows, label) => rows.map(r => [r.id, label(r)]);
function Editor({ title, fields = [], initial = {}, onSubmit, children, submitLabel = 'Lưu thay đổi' }) {
  const { closeDialog, notify } = useApp();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), submitting = useRef(false);
  const submit = async e => {
    e.preventDefault(); if (submitting.current) return;
    const form = e.currentTarget, values = Object.fromEntries(new FormData(form));
    for (const f of fields) if (f.type === 'number') values[f.name] = Number(values[f.name]);
    submitting.current = true; setBusy(true); setError('');
    try { await onSubmit(values, form); closeDialog(); notify('Đã lưu thay đổi.'); }
    catch (e) { setError(e.message || 'Vui lòng kiểm tra thông tin và thử lại.'); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <Frame title={title}><form onSubmit={submit}><fieldset disabled={busy} className="form-fieldset"><div className="form-grid">{fields.map(f => <Field key={f.name} label={f.label} full={f.full}>{f.type === 'select' ? <select name={f.name} required={f.required} defaultValue={initial?.[f.name] ?? f.options[0]?.[0]}>{f.options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select> : f.type === 'textarea' ? <textarea name={f.name} defaultValue={initial?.[f.name] || ''} required={f.required} maxLength={10000} /> : <input type={f.type || 'text'} name={f.name} defaultValue={initial?.[f.name] ?? f.defaultValue ?? ''} required={f.required} min={f.min} max={f.max} step={f.type === 'number' ? f.step || 'any' : undefined} maxLength={f.maxLength || 500} />}</Field>)}</div>{children}{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><Button onClick={closeDialog}>Hủy</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Đang lưu…' : submitLabel}</Button></div></fieldset></form></Frame>;
}
function Unavailable({ title, children }) { return <Frame title={title}><Empty title="Chưa thể hoàn tất thao tác">{children}</Empty></Frame>; }

function DialogContent() {
  const app = useApp();
  const { data, dialog: d, role, me, person, room, house, contract, upsert, decide, navigate, closeDialog, openDialog, execute, run, logout } = app;
  const save = (collection, item, values) => upsert(collection, { ...item, ...values });
  const houses = ownHouses(data, me), rooms = ownRooms(data, me);
  switch (d.type) {
    case 'help': return <Frame title="Chào bạn, Trọday đây!"><p>Tìm phòng, lưu tin yêu thích, hẹn xem và kết nối bạn ở ghép. Đăng nhập để sử dụng các chức năng của tài khoản.</p></Frame>;
    case 'menu': return <Frame title="Không gian của bạn"><div className="mobile-menu-grid">{NAV[role].map(([view, label, icon]) => <Button key={view} icon={icon} onClick={() => navigate(view)}>{label}</Button>)}</div><div className="form-actions"><Button onClick={app.session ? logout : () => navigate('login')}>{app.session ? 'Đăng xuất' : 'Đăng nhập / Đăng ký'}</Button></div></Frame>;
    case 'notifications': return <Frame title="Thông báo"><div className="notification-list">{data.notifications.map(n => <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}><Icon name="bell" /><div><p>{n.text}</p>{!n.read && <Button onClick={() => app.patch('notifications', n.id, { read: true })}>Đánh dấu đã đọc</Button>}{n.resourceId && <Button variant="text-button" onClick={() => navigate(({ CONVERSATION: 'chats', CONTRACT: 'contracts', INVOICE: 'invoices', VIEWING: 'viewings' })[n.resourceType] || 'profile', n.resourceId)}>Xem nội dung</Button>}</div></div>)}{!data.notifications.length && <Empty title="Chưa có thông báo" />}</div><div className="form-actions"><Button onClick={() => run(() => execute(() => send('/me/notifications/read-all')))}>Đọc tất cả</Button></div></Frame>;
    case 'house': {
      const h = house(d.id);
      return <Editor title={h ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ'} initial={h} fields={[text('name', 'Tên nhà trọ'), text('address', 'Địa chỉ đầy đủ', { full: true }), text('provinceCode', 'Mã tỉnh / thành phố'), text('localityCode', 'Mã phường / xã', { required: false })]} onSubmit={v => save('houses', h, v)} />;
    }
    case 'room': {
      const r = room(d.id), live = data.contracts.some(c => c.roomId === r?.id && ['ACTIVE', 'CONFIRMED', 'PENDING_CONFIRMATION'].includes(c.status));
      return <Editor title={r ? `Sửa phòng ${r.code}` : 'Thêm phòng mới'} initial={r || { houseId: d.houseId || houses[0]?.id, capacity: 2, area: 25, price: 4000000, deposit: 4000000, status: 'AVAILABLE' }} fields={[...(!r ? [select('houseId', 'Nhà trọ', options(houses, h => h.name)), text('code', 'Mã phòng')] : []), number('area', 'Diện tích (m²)', { min: 1 }), number('capacity', 'Sức chứa (người)', { min: 1, step: 1 }), number('price', 'Giá thuê / tháng (đ)'), number('deposit', 'Tiền đặt cọc (đ)'), ...(!live ? [select('status', 'Trạng thái', [['AVAILABLE', 'Còn phòng'], ['MAINTENANCE', 'Bảo trì']])] : [])]} onSubmit={v => save('rooms', r, v)} />;
    }
    case 'service': {
      const s = data.services.find(s => s.id === d.id);
      return <Editor title={s ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'} initial={s || { houseId: d.houseId, price: 0, method: 'PER_ROOM' }} fields={[...(!s ? [select('houseId', 'Nhà trọ', options(houses, h => h.name)), select('serviceId', 'Dịch vụ', [['', 'Tự đặt tên'], ...options(data.serviceCatalog, s => `${s.name} / ${s.unit}`)], { required: false }), text('name', 'Tên dịch vụ riêng', { required: false }), text('unit', 'Đơn vị riêng', { required: false }), select('method', 'Cách tính', [['METERED', 'Theo đồng hồ'], ['PER_ROOM', 'Theo phòng'], ['PER_PERSON', 'Theo người']])] : [text('name', 'Tên dịch vụ'), text('unit', 'Đơn vị tính'), select('method', 'Cách tính', [['METERED', 'Theo đồng hồ'], ['PER_ROOM', 'Theo phòng'], ['PER_PERSON', 'Theo người']])]), number('price', 'Đơn giá (đ)')]} onSubmit={v => save('services', s, { ...v, active: s?.active ?? true })} />;
    }
    case 'service-price': {
      const s = data.services.find(s => s.id === d.serviceId), entry = data.roomServices.find(x => x.roomId === d.roomId && x.serviceId === d.serviceId);
      return <Editor title={`Giá riêng · ${s?.name}`} initial={{ price: entry?.override ?? s?.price }} fields={[number('price', 'Đơn giá riêng (đ)')]} onSubmit={v => execute(() => send(`/rooms/${d.roomId}/service-settings/${d.serviceId}`, { active: true, unitPriceOverride: v.price }, 'PUT'))}><Button onClick={() => run(async () => { await execute(() => send(`/rooms/${d.roomId}/service-settings/${d.serviceId}`, { unitPriceOverride: null }, 'PUT')); closeDialog(); })}>Dùng lại giá của nhà</Button></Editor>;
    }
    case 'listing': {
      const p = data.posts.find(p => p.id === d.id), r = room(p?.roomId || d.roomId || rooms[0]?.id);
      return <Editor title={p ? 'Chỉnh sửa tin đăng' : 'Tạo tin đăng'} initial={p || { roomId: r?.id, title: r?.title, description: r?.description }} fields={[...(!p ? [select('roomId', 'Phòng', options(rooms, r => r.code))] : []), text('title', 'Tiêu đề', { full: true }), text('description', 'Nội dung', { type: 'textarea', full: true }), text('amenities', 'Tiện ích, cách nhau bằng dấu phẩy', { required: false, full: true, defaultValue: (p?.amenities || []).join(', ') })]} onSubmit={async (v, form) => { const chosen = [...form.elements.postImages.files]; const newIds = await Promise.all(chosen.map(file => uploadFile(file, 'POST_IMAGE'))); return save('posts', p, { ...v, roomId: p?.roomId || v.roomId, ...(newIds.length ? { imageFileIds: [...(p?.imageFileIds || []), ...newIds] } : {}), amenities: v.amenities.split(',').map(x => x.trim()).filter(Boolean) }); }}><Field label="Ảnh phòng (tối đa 12 ảnh)" full><input name="postImages" type="file" accept="image/jpeg,image/png,image/webp" multiple /></Field><p>Tin sẽ được gửi xét duyệt sau khi lưu.</p></Editor>;
    }
    case 'viewing': return <ViewingEditor />;
    case 'accept-viewing': {
      const v = data.viewingProposals.find(v => v.id === d.id);
      return <Editor title="Chấp nhận đề nghị xem phòng" onSubmit={() => decide('viewingProposals', d.id, { status: 'ACCEPTED' })} submitLabel="Xác nhận lịch hẹn"><p>{person(v?.tenantId).name} · phòng {room(v?.roomId)?.code} · {v?.time} {dateLabel(v?.date)}</p></Editor>;
    }
    case 'contract-detail': return <Frame title={`Chi tiết hợp đồng ${contract(d.id)?.number || ''}`}><ContractDetails id={d.id} /></Frame>;
    case 'contract': return <ContractEditor />;
    case 'paper-import': return <PaperImportEditor />;
    case 'invoice': return <InvoiceEditor />;
    case 'invoice-detail': return <InvoiceDetail />;
    case 'move-in': {
      const c = contract(d.id);
      return <Editor title="Xác nhận vào ở" fields={[text('moveInDate', 'Ngày vào ở', { type: 'date', defaultValue: day() })]} onSubmit={(v, form) => { const memberIds = [...form.querySelectorAll('input[name="memberId"]:checked')].map(input => Number(input.value));if (!memberIds.length) throw new Error('Chọn người thực tế đã vào ở.');return execute(() => send(`/contracts/${c.id}/move-ins`, { ...v, memberIds })); }}><p>Chọn người thực tế vào ở. Lần đầu cần có đại diện.</p>{c.members.filter(m => m.status === 'PLANNED').map(m => <label className="checkbox-row" key={m.id}><input name="memberId" value={m.id} type="checkbox" defaultChecked={m.id === String(c.representativeRoomTenantId) || !c.representativeRoomTenantId} /><span>{m.name}</span></label>)}</Editor>;
    }
    case 'move-out': {
      const c = contract(d.contractId), member = c.members.find(m => m.id === d.id), successors = c.members.filter(m => m.status === 'ACTIVE' && m.tenantId && m.id !== member.id);
      const handover = member.tenantId === c.tenantId && successors.length > 0;
      return <Editor title={handover ? 'Bàn giao đại diện và rời phòng' : 'Ghi nhận rời phòng'} fields={[...(handover ? [select('successorMemberId', 'Đại diện tiếp theo', options(successors, m => m.name))] : [text('moveOutDate', 'Ngày rời phòng', { type: 'date', defaultValue: day() })]), text('reason', 'Lý do', { type: 'textarea', full: true })]} onSubmit={(v, form) => execute(() => handover ? send(`/contracts/${c.id}/representative-handovers`, { ...v, departingMemberId: member.id, consentRecorded: form.elements.consent.checked }) : send(`/contracts/${c.id}/members/${member.id}/move-out`, v))}><p>{member.name} · {room(c.roomId)?.code}</p>{handover && <label className="checkbox-row"><input type="checkbox" name="consent" required /><span>Đã ghi nhận đồng ý bàn giao của các bên, có hiệu lực hôm nay.</span></label>}</Editor>;
    }
    case 'cancel-member': return <Editor title="Hủy thành viên dự kiến" fields={[text('reason', 'Lý do hủy', { type: 'textarea', full: true })]} onSubmit={values => execute(() => send(`/contracts/${d.contractId}/members/${d.id}/cancel`, values))} />;
    case 'contract-feedback': return <Editor title="Góp ý hợp đồng" fields={[text('reason', 'Nội dung cần chỉnh sửa', { type: 'textarea', full: true })]} onSubmit={v => execute(() => send(`/contracts/${d.id}/revision-requests`, v))} submitLabel="Gửi góp ý" />;
    case 'contract-change': return <ChangeEditor />;
    case 'apply-change': {
      const x = data.changeRequests.find(x => x.id === d.id);
      return <Editor title="Duyệt phương án thay đổi" onSubmit={() => decide('changeRequests', d.id, { status: 'APPROVED' })} submitLabel="Chấp nhận phương án"><p>{x.note}</p><p>Ngày hiệu lực: {dateLabel(x.effective)}{x.newEndDate && ` · Kết thúc mới: ${dateLabel(x.newEndDate)}`}</p><p>Người thuê cần xác nhận lại phương án trước bước áp dụng.</p></Editor>;
    }
    case 'approve-join': return <Editor title="Duyệt yêu cầu thêm người" onSubmit={() => decide('joinRequests', d.id, { status: 'APPROVED' })} submitLabel="Duyệt yêu cầu"><p>Chỉ duyệt khi các bên đã đồng ý và phòng còn đủ sức chứa.</p></Editor>;
    case 'join': {
      const peers = data.roommateInvites.filter(i => i.status === 'ACCEPTED').map(i => i.senderId === me ? i.receiverId : i.senderId);
      if (!peers.length) return <Unavailable title="Thêm người ở ghép">Bạn cần có một kết nối ở ghép đã được chấp nhận.</Unavailable>;
      return <Editor title="Đề nghị thêm người ở ghép" fields={[select('applicantId', 'Người ở ghép', peers.map(p => [p, person(p).name])), text('plannedMoveInDate', 'Ngày dự kiến vào ở', { type: 'date' }), text('message', 'Lời nhắn', { required: false, type: 'textarea', full: true })]} onSubmit={v => execute(() => send('/occupant-join-requests', { ...v, contractId: d.id }))} />;
    }
    case 'roommate-profile': {
      const p = data.roommateProfile, active = data.contracts.flatMap(c => c.members).find(m => m.tenantId === me && m.status === 'ACTIVE');
      const currentResident = active || (p?.housingStatus === 'IN_SYSTEM' && p.currentRoomTenantId ? { id: p.currentRoomTenantId } : null);
      return <Editor title={p ? 'Sửa hồ sơ ở ghép' : 'Tạo hồ sơ ở ghép'} initial={p || { housingStatus: currentResident ? 'IN_SYSTEM' : 'NO_ACCOMMODATION', available: day(), budgetMin: 2000000, budgetMax: 4000000 }} fields={[select('housingStatus', 'Tình trạng chỗ ở', [...(currentResident ? [['IN_SYSTEM', 'Đang ở trong hệ thống']] : []), ['NO_ACCOMMODATION', 'Đang tìm chỗ ở'], ['EXTERNAL', 'Đang ở ngoài hệ thống']]), text('location', 'Khu vực mong muốn'), text('available', 'Có thể ở từ', { type: 'date' }), number('budgetMin', 'Ngân sách từ (đ)'), number('budgetMax', 'Ngân sách đến (đ)'), text('externalContext', 'Mô tả chỗ ở ngoài hệ thống', { type: 'textarea', required: false, full: true })]} onSubmit={v => {
        if (v.budgetMax < v.budgetMin) throw new Error('Ngân sách tối đa cần lớn hơn hoặc bằng tối thiểu.');
        return execute(() => send('/me/roommate-profile', { housingStatus: v.housingStatus, currentRoomTenantId: v.housingStatus === 'IN_SYSTEM' ? currentResident?.id : null, externalContext: v.externalContext, availableFrom: v.available, preferredLocation: v.location, preferredGender: p?.preferredGender || 'ANY', budgetMin: v.budgetMin, budgetMax: v.budgetMax, active: true, ...(p ? { profileVersion: p.profileVersion } : {}) }, 'PUT'));
      }} />;
    }
    case 'lifestyles': return <LifestylesEditor />;
    case 'chat-settings': return <Editor title="Thông báo hội thoại" fields={[select('muted', 'Thông báo tin nhắn mới', [['', 'Không thay đổi'], ['true', 'Tắt thông báo'], ['false', 'Bật thông báo']], { required: false })]} onSubmit={v => v.muted === '' ? Promise.resolve() : execute(() => send(`/conversations/${d.id}/preferences`, { muted: v.muted === 'true' }, 'PATCH'))} />;
    case 'review': return <Editor title="Đánh giá phòng đã thuê" fields={[select('rating', 'Mức độ hài lòng', [5, 4, 3, 2, 1].map(n => [n, `${n} / 5`])), text('content', 'Chia sẻ trải nghiệm', { type: 'textarea', full: true })]} onSubmit={v => execute(() => send('/reviews', { ...v, rating: Number(v.rating), roomId: d.roomId, contractId: d.contractId, roomTenantId: d.memberId }))} submitLabel="Gửi đánh giá" />;
    case 'moderate-review': return <Editor title="Ẩn đánh giá" fields={[text('reason', 'Lý do ẩn', { type: 'textarea', full: true })]} onSubmit={v => execute(() => send(`/admin/reviews/${d.id}/moderation`, { decision: 'HIDE', reason: v.reason }))} />;
    case 'roommate-person': {
      const p = data.roommateProfiles[d.id], receiver = p?.tenantId;
      if (!receiver) return <Unavailable title={`Hồ sơ #${d.id}`}>Chưa có thông tin tài khoản để gửi lời mời kết nối. {p?.location} · {money(p?.budgetMin)} — {money(p?.budgetMax)}.</Unavailable>;
      return <Editor title={person(receiver).name} fields={[text('message', 'Lời chào', { type: 'textarea', full: true })]} onSubmit={async v => { await execute(() => send('/roommate-requests', { ...v, receiverId: receiver, ...(p.housingStatus === 'IN_SYSTEM' ? { targetContractId: p.targetContractId } : {}), scenario: p.housingStatus === 'IN_SYSTEM' ? 'JOIN_SYSTEM_ROOM' : p.housingStatus === 'EXTERNAL' ? 'JOIN_EXTERNAL_HOME' : 'SEARCH_TOGETHER' })); navigate('roommates', 'outgoing'); }} submitLabel="Gửi lời mời" />;
    }
    case 'share-post': {
      const invites = data.roommateInvites.filter(i => i.status === 'ACCEPTED');
      if (!invites.length) return <Unavailable title="Chia sẻ phòng">Hãy kết nối với một người bạn ở ghép trước.</Unavailable>;
      return <Editor title="Chia sẻ phòng cho bạn ghép" fields={[select('inviteId', 'Gửi cho', options(invites, i => person(i.senderId === me ? i.receiverId : i.senderId).name))]} onSubmit={v => execute(async () => { const c = await send(`/roommate-requests/${v.inviteId}/conversation`); return send(`/conversations/${c.id}/post-shares`, { postId: d.postId, clientMessageKey: crypto.randomUUID() }); })} submitLabel="Chia sẻ phòng" />;
    }
    case 'report': return <Editor title="Báo cáo tin đăng" fields={[text('reason', 'Nội dung cần kiểm tra', { type: 'textarea', full: true })]} onSubmit={v => save('reports', null, { ...v, postId: d.postId })} submitLabel="Gửi báo cáo" />;
    case 'resolve-report': return <Editor title="Xử lý báo cáo" fields={[select('decision', 'Hướng xử lý', [['INVESTIGATE', 'Tiếp nhận điều tra'], ['RESOLVE', 'Đã giải quyết'], ['DISMISS', 'Không đủ căn cứ']]), text('resolution', 'Kết luận', { type: 'textarea', full: true })]} onSubmit={v => execute(() => send(`/admin/reports/${d.id}/decision`, v))} />;
    case 'identity': return <IdentityEditor />;
    case 'house-proof': return <HouseProofEditor />;
    case 'verification': return <VerificationDetail />;
    case 'template': {
      const t = data.templates.find(t => t.id === d.id);
      return <Editor title={t ? `Sửa nội dung · ${t.name}` : 'Thêm mẫu hợp đồng'} initial={t} fields={[...(!t ? [text('name', 'Tên mẫu', { full: true })] : []), text('content', 'Điều khoản', { type: 'textarea', full: true })]} onSubmit={v => save('templates', null, { ...v, name: t?.name || v.name })} />;
    }
    case 'user-lock': {
      const locked = data.lockedUsers.includes(d.id);
      return <Editor title={locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'} fields={[text('reason', 'Lý do', { type: 'textarea', full: true })]} onSubmit={v => execute(() => send(`/admin/users/${d.id}/${locked ? 'unlock' : 'lock'}`, v))}><p>{person(d.id).name}</p></Editor>;
    }
    case 'decision': return <Editor title={d.title} fields={d.reason ? [text('reason', 'Lý do / ghi chú', { type: 'textarea', full: true })] : []} onSubmit={v => decide(d.collection, d.id, { ...v, status: d.status })} submitLabel="Xác nhận"><p>{d.title}?</p></Editor>;
    default: return <Unavailable title="Trọday">Nội dung không còn khả dụng.</Unavailable>;
  }
}

function ViewingEditor() {
  const { data, dialog: d, role, me, room, person, execute } = useApp();
  const requestKey = useRef(crypto.randomUUID());
  const candidates = role === 'landlord' ? data.conversations.filter(c => c.type === 'ROOM_INQUIRY' && c.users.includes(me) && c.users.length === 2 && c.roomId && room(c.roomId)?.status === 'AVAILABLE') : publicPosts(data).filter(p => room(p.roomId)?.status === 'AVAILABLE');
  if (!candidates.length) return <Unavailable title="Hẹn xem phòng">Cần có phòng còn trống và một cuộc trao đổi với người thuê trước khi tạo lịch.</Unavailable>;
  const first = candidates.find(x => x.id === (role === 'landlord' ? d.conversationId : d.postId) || x.roomId === d.roomId) || candidates[0];
  return <Editor title={role === 'landlord' ? 'Tạo lịch xem phòng' : 'Đề nghị lịch xem phòng'} initial={{ contextId: first.id, date: day(1), time: '17:00', duration: 60 }} fields={[select('contextId', 'Phòng và người trao đổi', options(candidates, x => `${room(x.roomId)?.code} · ${role === 'landlord' ? person(x.users.find(u => u !== me)).name : x.title}`), { full: true }), text('date', 'Ngày xem', { type: 'date', min: day() }), text('time', 'Giờ hẹn', { type: 'time' }), select('duration', 'Thời lượng', [30, 60, 90, 120].map(n => [n, `${n} phút`])), text('notes', 'Lời nhắn', { required: false, type: 'textarea', full: true })]} onSubmit={v => {
    if (Date.parse(`${v.date}T${v.time}:00+07:00`) <= Date.now()) throw new Error('Chọn thời gian hẹn trong tương lai.');
    return execute(async () => {
      const selected = candidates.find(x => x.id === v.contextId);
      const c = role === 'landlord' ? selected : await send('/conversations/room-inquiries', { postId: selected.id });
      if ((c.participants || c.users).length !== 2) throw new Error('Cuộc trò chuyện chưa tách riêng cho hai bên. Chưa thể gửi đề nghị.');
      return send(role === 'landlord' ? '/viewings' : '/viewing-proposals', { conversationId: c.id, roomId: selected.roomId, ...(role === 'landlord' ? { tenantId: c.users.find(u => u !== me) } : { clientRequestKey: requestKey.current }), startsAt: `${v.date}T${v.time}:00+07:00`, durationMinutes: Number(v.duration), notes: v.notes });
    });
  }} submitLabel={role === 'landlord' ? 'Tạo lịch hẹn' : 'Gửi đề nghị'} />;
}
function ContractEditor() {
  const { data, dialog: d, execute } = useApp();
  const c = data.contracts.find(c => c.id === d.id), draft = c?.revisions.find(r => r.status === 'DRAFT');
  const eligible = data.viewings.filter(v => v.status === 'COMPLETED' && v.decision === 'AGREED');
  const [viewingId, setViewingId] = useState(d.viewingId || eligible[0]?.id || '');
  const [impact, setImpact] = useState(null);
  useEffect(() => { if (!c && viewingId) { let active = true; request(`/viewings/${viewingId}/contract-impact`).then(x => { if (active) setImpact(x); }).catch(() => { if (active) setImpact(null); }); return () => { active = false; }; } }, [c?.id, viewingId]);
  if (c && !draft) return <Unavailable title="Chỉnh sửa hợp đồng">Người thuê cần gửi góp ý để tạo bản nháp chỉnh sửa trước khi gửi lại hợp đồng.</Unavailable>;
  if (!c && !eligible.length) return <Unavailable title="Lập hợp đồng">Chọn một lịch đã xem và người thuê đã đồng ý thuê. Nhập hợp đồng giấy cần chức năng tải tài liệu, hiện chưa sẵn sàng.</Unavailable>;
  const initial = draft ? { start: draft.startDate, end: draft.endDate, rent: draft.rentAmount, deposit: draft.depositAmount, terms: draft.content } : { number: `HD-${Date.now()}`, start: day(), end: day(365), terms: data.templates.find(t => t.active)?.content || '' };
  return <Editor title={c ? 'Chỉnh sửa và gửi lại hợp đồng' : 'Lập hợp đồng từ lịch đã xem'} initial={initial} fields={[...(!c ? [text('number', 'Số hợp đồng', { full: true })] : []), text('start', 'Ngày bắt đầu', { type: 'date' }), text('end', 'Ngày kết thúc', { type: 'date' }), number('rent', 'Tiền phòng / tháng (đ)'), number('deposit', 'Tiền đặt cọc (đ)'), text('terms', 'Điều khoản', { type: 'textarea', full: true })]} onSubmit={v => {
    if (v.end <= v.start) throw new Error('Ngày kết thúc phải sau ngày bắt đầu.');
    const body = { startDate: v.start, endDate: v.end, rentAmount: v.rent, depositAmount: v.deposit, content: v.terms };
    return execute(async () => { if (!c) return send('/contracts', { ...body, contractNumber: v.number, viewingId }); await send(`/contracts/${c.id}/revisions/${draft.id}`, body, 'PATCH'); return send(`/contracts/${c.id}/revisions/${draft.id}/submit`); });
  }} submitLabel="Gửi hợp đồng xác nhận">{!c && <Field label="Lịch đủ điều kiện"><select value={viewingId} onChange={e => setViewingId(e.target.value)}>{eligible.map(v => <option key={v.id} value={v.id}>Lịch #{v.id} · Phòng #{v.roomId} · Người thuê #{v.tenantId}</option>)}</select></Field>}{impact && <p>Số lịch sắp tới trên phòng: {impact.futureViewingsCount}. Số đề nghị đang chờ theo máy chủ: {impact.pendingProposalsCount}.</p>}</Editor>;
}
function ChangeEditor() {
  const { data, dialog: d, execute } = useApp(), c = data.contracts.find(c => c.id === d.id);
  const [type, setType] = useState(d.changeType || 'RENEWAL'), [targets, setTargets] = useState([]), [error, setError] = useState('');
  useEffect(() => { if (type !== 'TRANSFER') return; let active = true; allPages(`/contracts/${c.id}/transfer-options`).then(rows => { if (active) setTargets(list(rows)); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [type, c.id]);
  return <Editor title="Đề nghị thay đổi hợp đồng" initial={{ effective: day(), newEnd: c.end }} fields={[text('effective', 'Ngày hiệu lực', { type: 'date' }), ...(type === 'RENEWAL' ? [text('newEnd', 'Ngày kết thúc mới', { type: 'date', min: c.end })] : []), ...(type === 'TRANSFER' ? [select('targetRoomId', 'Phòng đích cùng chủ', targets.map(r => [r.roomId, r.code])), text('transferEnd', 'Ngày kết thúc tại phòng mới', { type: 'date' }), text('transferContent', 'Điều khoản tại phòng mới', { type: 'textarea', full: true })] : []), text('reason', 'Nội dung đề nghị', { type: 'textarea', full: true })]} onSubmit={v => {
    if (type === 'RENEWAL' && v.newEnd <= c.end) throw new Error('Ngày kết thúc mới phải sau thời hạn hiện tại.');
    return execute(() => send(`/contracts/${c.id}/change-requests`, { type, baseRevisionId: c.currentRevisionId, effectiveDate: v.effective, ...(type === 'RENEWAL' ? { newEndDate: v.newEnd } : {}), ...(type === 'TRANSFER' ? { targetRoomId: v.targetRoomId, proposal: { content: v.transferContent, endDate: v.transferEnd } } : {}), reason: v.reason }));
  }} submitLabel="Gửi đề nghị"><Field label="Loại đề nghị"><select name="type" value={type} onChange={e => setType(e.target.value)}>{[['RENEWAL', 'Gia hạn'], ['TRANSFER', 'Chuyển phòng'], ['TERMINATION', 'Kết thúc']].map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></Field>{error && <p role="alert">{error}</p>}</Editor>;
}
function InvoiceEditor() {
  const { data, dialog: d, me, room, upsert, execute } = useApp();
  const invoice = data.invoices.find(i => i.id === d.id), contracts = data.contracts.filter(c => c.ownerId === me && c.status === 'ACTIVE');
  const [contractId, setContractId] = useState(invoice?.contractId || contracts[0]?.id || '');
  const c = contracts.find(c => c.id === contractId);
  const [items, setItems] = useState(invoice?.items || [{ type: 'RENT', name: 'Tiền phòng', quantity: 1, unit: 'tháng', price: c?.rent || 0 }]);
  if (!c) return <Unavailable title="Tạo hóa đơn">Cần có hợp đồng đang hiệu lực.</Unavailable>;

  const changeItem = (i, key, value) => setItems(rows => rows.map((row, index) => i === index ? { ...row, [key]: ['price', 'quantity'].includes(key) ? Number(value) : value } : row));
  return <Editor title={d.replacement ? 'Tạo hóa đơn thay thế' : invoice ? 'Sửa hóa đơn nháp' : 'Tạo hóa đơn'} initial={invoice || { period: `${day().slice(0, 7)}-01`, due: day(5) }} fields={[text('period', 'Kỳ thu (ngày đầu tháng)', { type: 'date' }), text('due', 'Hạn thanh toán', { type: 'date' })]} onSubmit={v => {
    if (v.period.slice(8) !== '01') throw new Error('Kỳ thu cần là ngày đầu tháng.');
    if (!items.length || items.some(i => !i.name.trim() || i.quantity <= 0 || i.price < 0)) throw new Error('Kiểm tra tên, số lượng và đơn giá các khoản thu.');
    const payer = c.members.find(m => m.id === v.payerMemberId && m.status === 'ACTIVE');
    if (!payer) throw new Error('Chưa xác định được người thanh toán của hợp đồng.');
    if (d.replacement) return execute(() => send(`/invoices/${invoice.id}/replacements`, { dueDate: v.due, items: items.map(i => ({ type: i.type || 'OTHER', name: i.name, unit: i.unit || 'lần', quantity: i.quantity, unitPrice: i.price, ...(i.roomServiceId ? { roomServiceId: i.roomServiceId, previousReading: i.previousReading, currentReading: i.currentReading } : {}) })) }));
    return upsert('invoices', { ...invoice, ...v, contractId, payerMemberId: payer.id, items });
  }} submitLabel="Lưu hóa đơn nháp"><Field label="Hợp đồng"><select value={contractId} disabled={!!invoice} onChange={e => { setContractId(e.target.value); const x = contracts.find(c => c.id === e.target.value); setItems([{ type: 'RENT', name: 'Tiền phòng', quantity: 1, price: x.rent }]); }}>{contracts.map(c => <option key={c.id} value={c.id}>{c.number} · {room(c.roomId)?.code}</option>)}</select></Field><Field label="Người thanh toán"><select name="payerMemberId" key={contractId} defaultValue={invoice?.payerMemberId || c.members.find(m => m.tenantId === c.tenantId)?.id}>{c.members.filter(m => m.status === 'ACTIVE').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field><h3 className="small-title">Các khoản thu</h3><div className="invoice-editor-items">{items.map((item, index) => <div className="invoice-editor-row" key={index}><Field label="Khoản thu"><input disabled={item.type === 'SERVICE'} required value={item.name} onChange={e => changeItem(index, 'name', e.target.value)} /></Field><Field label="Số lượng"><input disabled={item.type === 'SERVICE'} required type="number" min="0.01" step="any" value={item.quantity} onChange={e => changeItem(index, 'quantity', e.target.value)} /></Field><Field label="Đơn giá (đ)"><input disabled={item.type === 'SERVICE'} required type="number" min="0" value={item.price} onChange={e => changeItem(index, 'price', e.target.value)} /></Field>{item.type === 'SERVICE' && item.calculationMethod === 'METERED' && <><Field label="Chỉ số đầu"><input type="number" min="0" required value={item.previousReading ?? ''} onChange={e => changeItem(index, 'previousReading', Number(e.target.value))} /></Field><Field label="Chỉ số cuối"><input type="number" min="0" required value={item.currentReading ?? ''} onChange={e => changeItem(index, 'currentReading', Number(e.target.value))} /></Field></>}<Button icon="x" aria-label={`Xóa khoản ${index + 1}`} onClick={() => setItems(items.filter((_, i) => i !== index))} /></div>)}</div><Button onClick={() => setItems([...items, { type: 'OTHER', name: '', quantity: 1, unit: 'lần', price: 0 }])}>Thêm khoản thu</Button><div className="total-line"><span>Tổng cộng</span><strong>{money(totalInvoice({ items }))}</strong></div></Editor>;
}
function LifestylesEditor() {
  const { data, execute } = useApp();
  const initial = {}, fields = [];
  data.criteria.forEach(c => {
    let allowed; try { allowed = JSON.parse(c.allowedValues); } catch { allowed = null; } if (c.valueType === 'BOOLEAN') allowed = [true, false];
    const row = data.lifestyles.find(x => String(x.criterionId) === String(c.id));
    const values = Array.isArray(allowed) ? allowed.map(v => [JSON.stringify(v), typeof v === 'boolean' ? v ? 'Có' : 'Không' : String(v)]) : null;
    for (const [key, label] of [['selfValue', 'Bản thân'], ['preferredValue', 'Mong muốn ở bạn ghép']]) {
      const name = `${c.id}-${key}`;
      fields.push(values ? select(name, `${c.name} · ${label}`, [['', 'Chưa chọn'], ...values], { required: false }) : text(name, `${c.name} · ${label}`, { required: false, type: c.valueType === 'NUMBER' ? 'number' : 'text' }));
      initial[name] = values ? row?.[key] || '' : row?.[key] ? JSON.parse(row[key]) : '';
    }
    fields.push(number(`${c.id}-importance`, `${c.name} · Mức quan trọng (0–5)`, { min: 0, max: 5, step: 1 }), select(`${c.id}-mandatory`, `${c.name} · Yêu cầu bắt buộc`, [['false', 'Không'], ['true', 'Có']]));
    initial[`${c.id}-importance`] = row?.importance ?? 1; initial[`${c.id}-mandatory`] = String(row?.isMandatory || false);
  });
  if (!fields.length) return <Unavailable title="Thói quen & mong muốn">Chưa có tiêu chí đang hoạt động.</Unavailable>;
  return <Editor title="Thói quen & mong muốn" fields={fields} initial={initial} onSubmit={(v, form) => {
    const raw = Object.fromEntries(new FormData(form));
    const criteria = data.criteria.flatMap(c => {
      const self = raw[`${c.id}-selfValue`], preferred = raw[`${c.id}-preferredValue`];
      if (!self && !preferred) return [];
      let allowed; try { allowed = JSON.parse(c.allowedValues); } catch { allowed = null; } if (c.valueType === 'BOOLEAN') allowed = [true, false];
      const value = x => x === '' ? null : Array.isArray(allowed) ? JSON.parse(x) : c.valueType === 'NUMBER' ? Number(x) : x;
      return [{ criterionId: c.id, selfValue: value(self), preferredValue: value(preferred), importance: v[`${c.id}-importance`], isMandatory: v[`${c.id}-mandatory`] === 'true' }];
    });
    return execute(() => send('/me/roommate-profile/lifestyles', { criteria }, 'PUT'));
  }} />;
}
function InvoiceDetail() {
  const { data, dialog: d, role, contract, room, person, openDialog } = useApp(), i = data.invoices.find(i => i.id === d.id), c = contract(i?.contractId);
  if (!i) return <Unavailable title="Hóa đơn">Không tìm thấy hóa đơn.</Unavailable>;
  return <Frame title={`Hóa đơn ${i.code}`}><div className="invoice-detail"><div><span>Phòng</span><strong>{room(i.roomId)?.code}</strong></div><div><span>Người thanh toán</span><strong>{i.payerId ? person(i.payerId).name : `Thành viên #${i.payerMemberId}`}</strong></div><div><span>Kỳ thu</span><strong>{dateLabel(i.period)}</strong></div><div><span>Hạn thanh toán</span><strong>{dateLabel(i.due)}</strong></div></div><Badge status={i.status} /><Table rows={i.items} columns={[{ label: 'Khoản thu', key: 'name' }, { label: 'Số lượng', key: 'quantity' }, { label: 'Đơn giá', render: x => money(x.price) }, { label: 'Thành tiền', render: x => money(x.amount) }]} /><div className="total-line"><span>Tổng thanh toán</span><strong>{money(i.total)}</strong></div>{role === 'landlord' && <div className="form-actions">{i.status === 'DRAFT' && <><Button onClick={() => openDialog('invoice', { id: i.id })}>Sửa hóa đơn</Button><Button onClick={() => openDialog('decision', { collection: 'invoices', id: i.id, status: 'UNPAID', title: 'Phát hành hóa đơn' })}>Phát hành</Button></>}{['UNPAID', 'OVERDUE'].includes(i.status) && <><Button onClick={() => openDialog('decision', { collection: 'invoices', id: i.id, status: 'CANCELLED', reason: true, title: 'Hủy hóa đơn' })}>Hủy hóa đơn</Button><Button onClick={() => openDialog('decision', { collection: 'invoices', id: i.id, status: 'PAID', title: 'Xác nhận đã thu tiền' })}>Xác nhận thu tiền</Button></>}{i.status === 'CANCELLED' && <Button onClick={() => openDialog('invoice', { id: i.id, replacement: true })}>Tạo hóa đơn thay thế</Button>}</div>}</Frame>;
}
function VerificationDetail() {
  const { data, dialog: d, openDialog, run, decide, closeDialog } = useApp();
  const v = d.kind === 'house' ? data.houseVerifications.find(x => x.id === d.id) : data.verifications.find(x => x.id === d.id);
  const [detail, setDetail] = useState(v), [error, setError] = useState(''), [opened, setOpened] = useState([]), [checked, setChecked] = useState(false);
  useEffect(() => { if (!v) return; let active = true; const path = d.kind === 'house' ? `/admin/house-verifications/${v.id}` : `/admin/${v.kind === 'landlord' ? 'landlord' : 'identity'}-verifications/${v.apiId}`; request(path).then(x => { if (active) setDetail({ ...v, ...x }); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [d.id]);
  if (!detail) return <Unavailable title="Hồ sơ xác minh">Không tìm thấy hồ sơ.</Unavailable>;
  const documents = detail.documents?.length ? detail.documents.map(f => f.fileId) : [detail.identityFileId].filter(Boolean);
  return <Frame title="Chi tiết hồ sơ xác minh"><Badge status={detail.status} /><p>Hồ sơ #{v.apiId || v.id}</p><p>{detail.scopeDescription || detail.type}</p>{documents.map(fileId => <Button key={fileId} onClick={() => run(async () => { await openFile(fileId); setOpened(values => [...values, fileId]); }, '')}>Xem minh chứng #{fileId}</Button>)}{v.status === 'PENDING' && <><label className="checkbox-row"><input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} /><span>Tôi đã xem và đối chiếu đầy đủ minh chứng.</span></label><Button variant="primary" disabled={!checked || !documents.length || documents.some(fid => !opened.includes(fid))} onClick={() => run(async () => { await decide(d.kind === 'house' ? 'houseVerifications' : 'verifications', d.id, { status: 'APPROVED', evidenceChecked: true }); closeDialog(); })}>Phê duyệt hồ sơ</Button></>}{error && <p role="alert">{error}</p>}{v.status === 'PENDING' && <Button onClick={() => openDialog('decision', { collection: d.kind === 'house' ? 'houseVerifications' : 'verifications', id: d.id, status: 'REJECTED', title: 'Từ chối hồ sơ', reason: true })}>Từ chối có lý do</Button>}{d.kind === 'house' && v.status === 'APPROVED' && <Button onClick={() => openDialog('decision', { collection: 'houseVerifications', id: d.id, status: 'REVOKED', title: 'Thu hồi quyền cho thuê', reason: true })}>Thu hồi xác minh</Button>}</Frame>;
}

function IdentityEditor() {
  const { data, me, execute, run } = useApp();
  return <Editor title="Nộp hồ sơ xác minh" fields={[select('kind', 'Loại hồ sơ', [['identity', 'Danh tính người thuê'], ['landlord', 'Đăng ký vai trò chủ trọ']]), text('identityNumber', 'Số căn cước')]} onSubmit={async (values, form) => {
    await execute(async () => { const identityFileId = await uploadFile(form.elements.identityFile.files[0], 'IDENTITY');return send(`/me/${values.kind}-verifications`, { identityNumber: values.identityNumber, identityFileId }); });
  }} submitLabel="Nộp hồ sơ"><Field label="Ảnh hoặc PDF căn cước"><input name="identityFile" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /></Field>{data.verifications.filter(v => v.userId === me).map(v => <div key={v.id}>{v.type} #{v.apiId} <Badge status={v.status} />{v.status === 'PENDING' && <Button onClick={() => run(() => execute(() => send(`/me/${v.kind === 'landlord' ? 'landlord' : 'identity'}-verifications/${v.apiId}/withdraw`)))}>Rút hồ sơ</Button>}</div>)}</Editor>;
}
function HouseProofEditor() {
  const { dialog, data, execute, run } = useApp();const [right, setRight] = useState('OWNER');
  const types = right === 'OWNER' ? [['OWNER_PROOF', 'Giấy tờ sở hữu']] : right === 'AUTHORIZED' ? [['OWNER_PROOF', 'Giấy tờ sở hữu'], ['AUTHORIZATION', 'Văn bản ủy quyền']] : [['LEASE_AGREEMENT', 'Hợp đồng thuê'], ['SUBLET_CONSENT', 'Đồng ý cho thuê lại']];
  return <Editor title="Nộp quyền cho thuê nhà" fields={[text('scopeDescription', 'Phạm vi được phép cho thuê', { type: 'textarea', full: true }), text('validFrom', 'Có hiệu lực từ', { type: 'date', defaultValue: day() }), text('validUntil', 'Hết hiệu lực', { type: 'date', required: right !== 'OWNER' })]} onSubmit={(values, form) => execute(async () => {
    const documents = [];for (const [documentType] of types) { const file = form.elements[documentType].files[0];if (file.size > 5242880) throw new Error('Mỗi minh chứng nhà tối đa 5 MB.');documents.push({ fileId: await uploadFile(file, 'LANDLORD_PROOF'), documentType }); }
    return send(`/houses/${dialog.houseId}/verifications`, { ...values, validUntil: values.validUntil || null, rightType: right, documents });
  })}><Field label="Quyền đối với nhà"><select value={right} onChange={e => setRight(e.target.value)}><option value="OWNER">Chủ sở hữu</option><option value="AUTHORIZED">Được ủy quyền</option><option value="SUBLESSOR">Cho thuê lại</option></select></Field>{types.map(([type, label]) => <Field key={type} label={label}><input required name={type} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" /></Field>)}{data.houseVerifications.filter(v => v.houseId === dialog.houseId).map(v => <div key={v.id}><Badge status={v.status} />{v.status === 'PENDING' && <Button onClick={() => run(() => execute(() => send(`/houses/${dialog.houseId}/verifications/${v.id}/withdraw`)))}>Rút hồ sơ</Button>}</div>)}</Editor>;
}
function PaperImportEditor() {
  const { data, me, execute } = useApp();const rooms = ownRooms(data, me);
  const [members, setMembers] = useState([{ fullName: '', tenantId: '', representative: true, moveInDate: '' }]);
  return <Editor title="Nhập hợp đồng giấy đã ký" fields={[select('roomId', 'Phòng', options(rooms, r => r.code)), text('contractNumber', 'Số hợp đồng'), text('startDate', 'Ngày bắt đầu', { type: 'date' }), text('endDate', 'Ngày kết thúc', { type: 'date' }), number('rentAmount', 'Tiền thuê'), number('depositAmount', 'Tiền cọc'), text('content', 'Nội dung đã ký', { type: 'textarea', full: true })]} onSubmit={(values, form) => execute(async () => {
    const paperDocumentFileId = await uploadFile(form.elements.paperFile.files[0], 'CONTRACT');return send('/contract-imports', { ...values, paperDocumentFileId, members: members.map(m => ({ ...m, tenantId: m.tenantId || null, moveInDate: m.moveInDate || undefined })) });
  })}><Field label="Bản chụp hợp đồng đã ký"><input required type="file" name="paperFile" accept="application/pdf,image/jpeg,image/png,image/webp" /></Field>{members.map((member, index) => <div className="form-grid" key={index}>{[['fullName', 'Họ tên'], ['tenantId', 'Mã tài khoản (đại diện bắt buộc)'], ['moveInDate', 'Ngày thực tế vào ở (nếu đã đến)']].map(([key, label]) => <Field key={key} label={label}><input required={key === 'fullName' || key === 'tenantId' && index === 0} type={key === 'moveInDate' ? 'date' : 'text'} value={member[key]} onChange={e => setMembers(rows => rows.map((row, i) => i === index ? { ...row, [key]: e.target.value } : row))} /></Field>)}</div>)}<Button onClick={() => setMembers(rows => [...rows, { fullName: '', tenantId: '', moveInDate: '', representative: false }])}>Thêm thành viên</Button></Editor>;
}
