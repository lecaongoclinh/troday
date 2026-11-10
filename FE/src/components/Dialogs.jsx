import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { NAV, PEOPLE } from '../data/navigation';
import { asset, dateLabel, day, houseVerified, money, ownHouses, ownRooms, publicPosts, totalInvoice, uid, visibleContracts } from '../data/selectors';
import { Avatar, Badge, Button, Empty, Field, Icon, Table } from './ui';
import ContractDetails from './ContractDetails';

export default function Dialogs() {
  const { dialog, closeDialog } = useApp();
  const ref = useRef();
  useEffect(() => { if (dialog && ref.current) { if (!ref.current.open) ref.current.showModal(); ref.current.scrollTop = 0; } }, [dialog]);
  if (!dialog) return null;
  return <dialog className={`app-dialog ${dialog.type === 'contract-detail' ? 'contract-detail-dialog' : ''}`} aria-labelledby="app-dialog-title" ref={ref} onCancel={closeDialog} onClick={e => { if (e.target === ref.current) { const r = ref.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(); } }}><DialogContent key={`${dialog.type}:${dialog.id || dialog.roomId || ''}`} /></dialog>;
}
function Frame({ title, children }) { const { closeDialog } = useApp(); return <><div className="dialog-header"><h2 id="app-dialog-title">{title}</h2><button className="icon-button" type="button" aria-label="Đóng hộp thoại" onClick={closeDialog}><Icon name="x" /></button></div><div className="dialog-content">{children}</div></>; }
function FormFooter({ label = 'Lưu thay đổi', busy = false }) { const { closeDialog } = useApp(); return <div className="form-actions"><Button onClick={closeDialog}>Hủy</Button><Button type="submit" variant="primary" disabled={busy}>{busy ? 'Đang lưu...' : label}</Button></div>; }
const options = (rows, label) => rows.map(r => [r.id, label(r)]);
const text = (name, label, extra = {}) => ({ name, label, required: true, ...extra });
const number = (name, label, extra = {}) => text(name, label, { type: 'number', min: 0, ...extra });
const select = (name, label, options, extra = {}) => text(name, label, { type: 'select', options, ...extra });
function Editor({ title, fields = [], initial = {}, onSubmit, children, submitLabel }) {
  const { closeDialog, notify } = useApp();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    for (const f of fields) if (f.type === 'number') values[f.name] = Number(values[f.name]);
    setBusy(true); setError('');
    try { await onSubmit(values, form); closeDialog(); notify('Đã lưu thay đổi trong bản trải nghiệm.'); }
    catch (error) { setError(error.message || 'Vui lòng kiểm tra thông tin và thử lại.'); setBusy(false); }
  };
  return <Frame title={title}><form onSubmit={submit}><div className="form-grid">{fields.map(f => <Field key={f.name} label={f.label} full={f.full}>{f.type === 'select' ? <select name={f.name} required={f.required} defaultValue={initial[f.name] ?? f.options[0]?.[0]}>{f.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select> : f.type === 'textarea' ? <textarea name={f.name} defaultValue={initial[f.name] || ''} required={f.required} maxLength={f.maxLength || 10000} placeholder={f.placeholder} /> : <input type={f.type || 'text'} name={f.name} defaultValue={initial[f.name] ?? f.defaultValue ?? ''} required={f.required} min={f.min} max={f.max} step={f.type === 'number' ? f.step || 'any' : undefined} minLength={f.minLength} maxLength={f.maxLength || 500} placeholder={f.placeholder} accept={f.accept} />}</Field>)}</div>{children}{error && <p className="form-error" role="alert">{error}</p>}<FormFooter label={submitLabel} busy={busy} /></form></Frame>;
}
function PhotoInput({ photo }) {
  const [preview, setPreview] = useState(null), [error, setError] = useState('');
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return <div className="photo-input"><img src={preview || asset(photo)} alt="Ảnh phòng xem trước" /><Field label="Chọn ảnh phòng (JPG, PNG, WebP; tối đa 2 MB)"><input type="file" name="photoFile" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files[0]; if (file && (file.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { e.target.value = ''; setError('Chọn ảnh JPG, PNG hoặc WebP không quá 2 MB.'); return; } setError(''); setPreview(file ? URL.createObjectURL(file) : null); }} /></Field>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
async function readPhoto(form, fallback) {
  const file = new FormData(form).get('photoFile');
  if (!file?.size) return fallback;
  if (file.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Ảnh phải là JPG, PNG hoặc WebP, tối đa 2 MB.');
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
}

function DialogContent() {
  const app = useApp();
  const { data, dialog: d, role, me, person, room, house, contract, upsert, patch, mutate, audit, navigate, closeDialog, openDialog, notify } = app;
  const save = (collection, item, values) => upsert(collection, { ...item, ...values, id: item?.id || uid(collection) });
  const houses = ownHouses(data, me), rooms = ownRooms(data, me);
  switch (d.type) {
    case 'help': return <Frame title="Chào bạn, Trọday đây!"><div className="help-brand">trọ<span>day.</span></div><p>Một chỗ ở. Nhiều an tâm.</p><p>Tìm phòng, lưu không gian yêu thích, hẹn xem phòng và kết nối bạn ở ghép. Chủ trọ có thể quản lý nhà, người ở, hợp đồng và hóa đơn trong cùng một nơi.</p><p>Chọn vai trò ở thanh trên để trải nghiệm từng không gian. Thao tác dùng dữ liệu mẫu và được lưu riêng trên trình duyệt này.</p><Button variant="primary" onClick={closeDialog}>Bắt đầu khám phá</Button></Frame>;
    case 'menu': return <Frame title="Không gian của bạn"><div className="mobile-menu-grid">{NAV[role].map(([view, label, icon]) => <Button key={view} icon={icon} onClick={() => navigate(view)}>{label}</Button>)}</div><div className="form-actions"><Button variant="primary" onClick={() => navigate('login')}>Đăng nhập / Đăng ký</Button></div></Frame>;
    case 'notifications': return <Frame title="Thông báo"><div className="notification-list">{data.notifications.filter(n => n.userId === me).map(n => <div key={n.id} className={`notification-item ${n.read ? '' : 'unread'}`}><span className="quick-icon"><Icon name="bell" /></span><div><p>{n.text}</p>{!n.read && <Button variant="text-button" onClick={() => patch('notifications', n.id, { read: true })}>Đánh dấu đã đọc</Button>}</div></div>)}{!data.notifications.some(n => n.userId === me) && <Empty title="Bạn đã xem hết thông báo" />}</div><div className="form-actions"><Button onClick={() => mutate(next => next.notifications.filter(n => n.userId === me).forEach(n => { n.read = true; }))}>Đọc tất cả</Button></div></Frame>;
    case 'house': {
      const h = data.houses.find(h => h.id === d.id);
      return <Editor title={h ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ'} initial={h} fields={[text('name', 'Tên nhà trọ'), text('address', 'Địa chỉ đầy đủ', { full: true }), text('area', 'Khu vực / quận'), text('notes', 'Ghi chú', { type: 'textarea', required: false, full: true })]} onSubmit={v => {
        if (!v.name.trim() || !v.address.trim() || !v.area.trim()) throw new Error('Vui lòng nhập đầy đủ thông tin nhà trọ.');
        if (h && h.address !== v.address) mutate(next => next.houseVerifications.filter(x => x.houseId === h.id && x.status === 'APPROVED').forEach(x => { x.status = 'STALE'; }));
        save('houses', h, { ...v, ownerId: me, provinceCode: '01' });
      }}><p>Nhà mới được lưu nháp. Gửi hồ sơ quyền cho thuê trước khi công khai tin đăng.</p></Editor>;
    }
    case 'room': {
      const r = room(d.id), h = r?.houseId || d.houseId || houses[0]?.id;
      const live = data.contracts.some(c => c.roomId === r?.id && ['ACTIVE', 'CONFIRMED', 'PENDING_CONFIRMATION'].includes(c.status));
      return <Editor title={r ? `Sửa phòng ${r.code}` : 'Thêm phòng mới'} initial={r || { houseId: h, capacity: 2, area: 25, price: 4000000, deposit: 4000000, status: 'AVAILABLE' }} fields={[select('houseId', 'Nhà trọ', options(houses, h => h.name)), text('code', 'Mã phòng'), text('title', 'Tên / mô tả ngắn', { full: true }), number('area', 'Diện tích (m²)', { min: 1 }), number('capacity', 'Sức chứa (người)', { min: 1, step: 1 }), number('price', 'Giá thuê / tháng (đ)'), number('deposit', 'Tiền đặt cọc (đ)'), ...(!live ? [select('status', 'Trạng thái', [['AVAILABLE', 'Còn phòng'], ['MAINTENANCE', 'Đang bảo trì']])] : []), text('amenities', 'Tiện ích, cách nhau bằng dấu phẩy', { required: false, full: true, defaultValue: r?.amenities.join(', ') || 'Wi-Fi, Điều hòa' }), text('description', 'Mô tả phòng', { type: 'textarea', full: true })]} onSubmit={async (v, form) => {
        if (!houses.some(h => h.id === v.houseId)) throw new Error('Chọn một nhà trọ hợp lệ.');
        if (data.rooms.some(x => x.houseId === v.houseId && x.code === v.code.trim() && x.id !== r?.id)) throw new Error('Mã phòng đã tồn tại trong nhà này.');
        const photo = await readPhoto(form, r?.photo || 'assets/r1.webp');
        save('rooms', r, { ...v, code: v.code.trim(), status: live ? r.status : v.status, distance: r?.distance || 1, amenities: v.amenities.split(',').map(s => s.trim()).filter(Boolean), photo });
      }}><PhotoInput photo={r?.photo || 'assets/r1.webp'} /></Editor>;
    }
    case 'service': {
      const s = data.services.find(s => s.id === d.id);
      return <Editor title={s ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'} initial={s || { houseId: d.houseId, price: 0 }} fields={[select('houseId', 'Nhà trọ', options(houses, h => h.name)), text('name', 'Tên dịch vụ'), text('unit', 'Đơn vị tính', { placeholder: 'kWh, m³, phòng, người...' }), number('price', 'Đơn giá (đ)'), select('method', 'Cách tính', [['METERED', 'Theo chỉ số đồng hồ'], ['PER_ROOM', 'Theo phòng'], ['PER_PERSON', 'Theo người']], { full: true })]} onSubmit={v => save('services', s, { ...v, active: s?.active ?? true })} />;
    }
    case 'service-price': {
      const s = data.services.find(s => s.id === d.serviceId), entry = data.roomServices.find(x => x.roomId === d.roomId && x.serviceId === d.serviceId);
      return <Editor title={`Giá riêng · ${s.name} · ${room(d.roomId)?.code}`} initial={{ price: entry?.override ?? s.price }} fields={[number('price', `Đơn giá riêng (đ / ${s.unit})`)]} onSubmit={v => mutate(next => { const x = next.roomServices.find(x => x.roomId === d.roomId && x.serviceId === d.serviceId); x.override = v.price; })}><p>Giá riêng chỉ áp dụng cho phòng này. Hóa đơn đã phát hành giữ nguyên số tiền.</p><Button variant="text-button" onClick={() => { mutate(next => { next.roomServices.find(x => x.roomId === d.roomId && x.serviceId === d.serviceId).override = null; }); closeDialog(); }}>Dùng lại giá mặc định của nhà</Button></Editor>;
    }
    case 'listing': {
      const p = data.posts.find(p => p.id === d.id);
      const r = room(p?.roomId || d.roomId || rooms[0]?.id);
      return <Editor title={p ? 'Chỉnh sửa tin đăng' : 'Tạo tin đăng'} initial={p || { roomId: r?.id, title: r?.title, description: r?.description }} fields={[select('roomId', 'Chọn phòng', options(rooms, r => `${r.code} · ${r.title}`), { full: true }), text('title', 'Tiêu đề tin đăng', { full: true }), text('description', 'Nội dung mô tả', { type: 'textarea', full: true })]} onSubmit={async (v, form) => {
        if (!rooms.some(r => r.id === v.roomId)) throw new Error('Chọn một phòng thuộc nhà của bạn.');
        if (data.posts.filter(x => x.roomId === v.roomId && x.status === 'PENDING_REVIEW' && x.id !== p?.id).length >= 3) throw new Error('Phòng này đã có 3 tin đang chờ duyệt.');
        const photo = await readPhoto(form, p?.photo || room(v.roomId)?.photo);
        save('posts', p, { ...v, status: 'PENDING_REVIEW', version: (p?.version || 0) + 1, photo, rejectionReason: '' });
      }}><PhotoInput photo={p?.photo || r?.photo} /><p>Tin được gửi đến quản trị để xét duyệt trước khi hiển thị công khai.</p></Editor>;
    }
    case 'viewing': {
      const candidates = role === 'landlord' ? rooms.filter(r => r.status === 'AVAILABLE' && houseVerified(data, r.houseId)) : publicPosts(data).map(p => ({ ...room(p.roomId), postId: p.id })).filter(r => r.status === 'AVAILABLE' && (!d.peerId || house(r.houseId)?.ownerId === d.peerId));
      if (!candidates.length) return <Frame title="Lịch xem phòng"><Empty title="Chưa có phòng phù hợp để hẹn xem">Phòng cần còn trống và nhà trọ đã được xác minh.</Empty></Frame>;
      return <Editor title={role === 'landlord' ? 'Tạo lịch xem phòng' : 'Đề nghị lịch xem phòng'} initial={{ roomId: d.roomId || candidates[0].id, date: day(1), time: '17:00', tenantId: d.peerId || 'lan' }} fields={[select('roomId', 'Phòng muốn xem', options(candidates, r => `${r.code} · ${r.title}`), { full: true }), ...(role === 'landlord' ? [select('tenantId', 'Người thuê', options(Object.entries(PEOPLE).filter(([id]) => !['quan', 'huong', 'admin'].includes(id)).map(([id, p]) => ({ ...p, id })), p => p.name), { full: true })] : []), text('date', 'Ngày xem', { type: 'date', min: day() }), text('time', 'Giờ hẹn', { type: 'time' }), text('notes', 'Lời nhắn', { type: 'textarea', required: false, full: true })]} submitLabel={role === 'landlord' ? 'Tạo lịch hẹn' : 'Gửi đề nghị'} onSubmit={v => {
        if (Date.parse(`${v.date}T${v.time}:00+07:00`) <= Date.now()) throw new Error('Chọn thời gian hẹn trong tương lai.');
        const r = room(v.roomId), ownerId = house(r.houseId)?.ownerId, tenantId = role === 'tenant' ? me : v.tenantId;
        const collection = role === 'landlord' ? 'viewings' : 'viewingProposals';
        save(collection, null, { ...v, tenantId, ownerId, postId: d.postId || data.posts.find(p => p.roomId === r.id)?.id, status: role === 'landlord' ? 'SCHEDULED' : 'PENDING', decision: 'WAITING' });
      }} />;
    }
    case 'accept-viewing': {
      const v = data.viewingProposals.find(v => v.id === d.id);
      return <Editor title="Chấp nhận đề nghị xem phòng" onSubmit={() => { if (room(v.roomId)?.status !== 'AVAILABLE') throw new Error('Phòng hiện không còn trống.'); patch('viewingProposals', v.id, { status: 'ACCEPTED' }); save('viewings', null, { ...v, id: uid('viewing'), status: 'SCHEDULED', decision: 'WAITING' }); }} submitLabel="Xác nhận lịch hẹn"><p>Hẹn {person(v.tenantId).name} xem phòng {room(v.roomId)?.code} lúc {v.time}, ngày {dateLabel(v.date)}.</p></Editor>;
    }
    case 'contract-detail': return <Frame title={`Chi tiết hợp đồng ${contract(d.id)?.number || ''}`}><ContractDetails id={d.id} /></Frame>;
    case 'contract': return <ContractEditor />;
    case 'invoice': return <InvoiceEditor />;
    case 'invoice-detail': return <InvoiceDetail />;
    case 'move-in': {
      const c = contract(d.id), planned = c.members.filter(m => m.status === 'PLANNED');
      return <Editor title={`Xác nhận vào ở · ${room(c.roomId)?.code}`} fields={[text('moveIn', 'Ngày vào ở', { type: 'date', defaultValue: day() })]} onSubmit={(v, form) => { const ids = new FormData(form).getAll('members'); if (!ids.length) throw new Error('Chọn ít nhất một người vào ở.'); mutate(next => { const x = next.contracts.find(x => x.id === c.id); x.members.filter(m => ids.includes(m.id)).forEach(m => { m.status = 'ACTIVE'; m.moveIn = v.moveIn; }); x.status = 'ACTIVE'; next.rooms.find(r => r.id === c.roomId).status = 'OCCUPIED'; }); }} submitLabel="Xác nhận vào ở"><div className="member-checkboxes">{planned.map(m => <label key={m.id} className="checkbox-row"><input type="checkbox" name="members" value={m.id} defaultChecked /><span>{m.name}</span></label>)}</div></Editor>;
    }
    case 'move-out': {
      const c = contract(d.contractId), member = c.members.find(m => m.id === d.id), successors = c.members.filter(m => m.status === 'ACTIVE' && m.id !== member.id);
      return <Editor title="Ghi nhận rời phòng" fields={[text('date', 'Ngày rời phòng', { type: 'date', defaultValue: day() }), ...(c.tenantId === member.tenantId && successors.length ? [select('successorId', 'Đại diện tiếp theo', successors.map(m => [m.id, m.name]))] : []), text('reason', 'Ghi chú', { type: 'textarea', full: true })]} onSubmit={v => mutate(next => { const x = next.contracts.find(x => x.id === c.id); const m = x.members.find(m => m.id === member.id); m.status = 'LEFT'; m.moveOut = v.date; if (v.successorId) x.tenantId = x.members.find(m => m.id === v.successorId).tenantId; if (!x.members.some(m => m.status === 'ACTIVE')) { x.status = 'TERMINATED'; next.rooms.find(r => r.id === c.roomId).status = 'AVAILABLE'; } })}><p>Ghi nhận {member.name} rời phòng {room(c.roomId)?.code}.</p></Editor>;
    }
    case 'contract-feedback': return <Editor title="Góp ý hợp đồng" fields={[text('feedback', 'Nội dung cần chỉnh sửa', { type: 'textarea', full: true })]} onSubmit={v => patch('contracts', d.id, v)} submitLabel="Gửi góp ý" />;
    case 'contract-change': return <Editor title="Đề nghị thay đổi hợp đồng" initial={{ type: d.changeType, effective: contract(d.id).end }} fields={[select('type', 'Loại đề nghị', [['RENEWAL', 'Gia hạn'], ['TRANSFER', 'Chuyển phòng'], ['TERMINATION', 'Kết thúc']]), text('effective', 'Ngày hiệu lực', { type: 'date' }), text('note', 'Nội dung đề nghị', { type: 'textarea', full: true })]} onSubmit={v => save('changeRequests', null, { ...v, contractId: d.id, requestedBy: me, status: 'PENDING' })} submitLabel="Gửi đề nghị" />;
    case 'apply-change': {
      const change = data.changeRequests.find(x => x.id === d.id), c = contract(change.contractId), available = rooms.filter(r => r.status === 'AVAILABLE' && houseVerified(data, r.houseId));
      return <Editor title="Xử lý thay đổi hợp đồng" initial={{ end: c.end }} fields={change.type === 'RENEWAL' ? [text('end', 'Ngày kết thúc mới', { type: 'date', min: c.end })] : change.type === 'TRANSFER' ? [select('roomId', 'Chuyển sang phòng', options(available, r => `${r.code} · ${r.title}`))] : []} submitLabel="Duyệt đề nghị" onSubmit={v => mutate(next => { next.changeRequests.find(x => x.id === change.id).status = 'APPROVED'; next.changeRequests.find(x => x.id === change.id).approvedValues = v; })}><p>{change.note}</p><p>Ngày hiệu lực đề nghị: {dateLabel(change.effective)}. Việc áp dụng thực tế sẽ cần xác nhận của hai bên khi kết nối API.</p></Editor>;
    }
    case 'approve-join': {
      const j = data.joinRequests.find(j => j.id === d.id), c = contract(j.contractId);
      return <Editor title="Duyệt thêm người ở ghép" onSubmit={() => { if (c.members.filter(m => ['ACTIVE', 'PLANNED'].includes(m.status)).length >= room(c.roomId).capacity) throw new Error('Phòng đã đủ sức chứa.'); mutate(next => { next.joinRequests.find(x => x.id === j.id).status = 'APPROVED'; next.contracts.find(x => x.id === c.id).members.push({ id: uid('member'), tenantId: j.applicantId, name: person(j.applicantId).name, status: 'PLANNED', identity: '', moveIn: '' }); }); }} submitLabel="Duyệt yêu cầu"><p>Thêm {person(j.applicantId).name} vào danh sách chờ vào ở của phòng {room(c.roomId)?.code}.</p></Editor>;
    }
    case 'roommate-profile': {
      const p = data.roommateProfile;
      return <Editor title={p ? 'Sửa hồ sơ ở ghép' : 'Tạo hồ sơ ở ghép'} initial={p || { location: 'Cầu Giấy', budgetMin: 2000000, budgetMax: 4000000, available: day() }} fields={[text('location', 'Khu vực mong muốn'), text('available', 'Có thể ở từ ngày', { type: 'date' }), number('budgetMin', 'Ngân sách từ (đ)'), number('budgetMax', 'Ngân sách đến (đ)'), text('habits', 'Thói quen & mong muốn', { type: 'textarea', full: true })]} onSubmit={v => { if (v.budgetMax < v.budgetMin) throw new Error('Ngân sách tối đa phải lớn hơn hoặc bằng tối thiểu.'); mutate(next => { next.roommateProfile = { ...v, active: true }; }); }} />;
    }
    case 'roommate-person': {
      const p = data.roommateProfiles[d.id], sent = data.roommateInvites.some(i => [i.senderId, i.receiverId].includes(me) && [i.senderId, i.receiverId].includes(d.id) && ['PENDING', 'ACCEPTED'].includes(i.status));
      return <Editor title={person(d.id).name} fields={sent ? [] : [text('note', 'Lời chào của bạn', { type: 'textarea', full: true, placeholder: 'Chào bạn, mình cũng đang tìm phòng...' })]} onSubmit={v => { if (sent) return; if (!data.roommateProfile) throw new Error('Hãy tạo hồ sơ ở ghép trước khi gửi lời mời.'); save('roommateInvites', null, { senderId: me, receiverId: d.id, status: 'PENDING', scenario: 'SEARCH_TOGETHER', note: v.note }); }} submitLabel={sent ? 'Đóng' : 'Gửi lời mời kết nối'}><p>{p.location} · {money(p.budgetMin)} — {money(p.budgetMax)} / tháng</p><p>{p.habits}</p>{sent && <Badge tone="green">Đã gửi lời mời hoặc đã kết nối</Badge>}</Editor>;
    }
    case 'share-post': {
      const peers = data.roommateInvites.filter(i => i.status === 'ACCEPTED' && [i.senderId, i.receiverId].includes(me)).map(i => i.senderId === me ? i.receiverId : i.senderId);
      if (!peers.length) return <Frame title="Chia sẻ phòng"><Empty title="Kết nối với một người bạn trước nhé" action={<Button variant="primary" onClick={() => navigate('roommates')}>Tìm bạn ở ghép</Button>}>Bạn có thể chia sẻ phòng với người đã chấp nhận kết nối.</Empty></Frame>;
      return <Editor title="Chia sẻ phòng cho bạn ghép" fields={[select('peerId', 'Gửi cho', peers.map(id => [id, person(id).name])), text('note', 'Lời nhắn kèm theo', { type: 'textarea', required: false, full: true })]} onSubmit={v => { mutate(next => { let c = next.conversations.find(c => c.type === 'ROOMMATE' && c.users.includes(me) && c.users.includes(v.peerId)); if (!c) { c = { id: uid('chat'), type: 'ROOMMATE', users: [me, v.peerId], messages: [] }; next.conversations.push(c); } c.messages.push({ id: uid('message'), senderId: me, sharedPostId: d.postId, text: v.note, time: 'Vừa xong' }); }); }} submitLabel="Chia sẻ phòng" />;
    }
    case 'report': return <Editor title="Báo cáo tin đăng" fields={[text('reason', 'Nội dung cần kiểm tra', { type: 'textarea', full: true })]} onSubmit={v => save('reports', null, { ...v, from: me, postId: d.postId, target: data.posts.find(p => p.id === d.postId)?.title || room(d.roomId)?.title, status: 'PENDING', date: day() })} submitLabel="Gửi báo cáo" />;
    case 'resolve-report': return <Editor title="Xử lý báo cáo" fields={[text('resolution', 'Kết luận và hướng xử lý', { type: 'textarea', full: true })]} onSubmit={v => { patch('reports', d.id, { ...v, status: 'RESOLVED' }); audit('Xử lý báo cáo', data.reports.find(r => r.id === d.id)?.target, v.resolution); }} />;
    case 'identity': return <Editor title="Hồ sơ xác minh danh tính" fields={[text('fullName', 'Họ và tên', { defaultValue: person(me).name }), text('identity', 'Số giấy tờ định danh', { minLength: 9, maxLength: 20 }), text('note', 'Ghi chú', { type: 'textarea', required: false, full: true })]} onSubmit={(v, form) => { const files = [...form.querySelector('[name="documents"]').files]; if (!files.length) throw new Error('Chọn ít nhất một tệp minh chứng.'); validateDocuments(files); save('verifications', data.verifications.find(x => x.userId === me), { userId: me, type: 'Căn cước người thuê', status: 'PENDING', date: day(), fullName: v.fullName, identity: v.identity, note: v.note, documents: files.map(f => ({ name: f.name, type: f.type, size: f.size })) }); }} submitLabel="Gửi hồ sơ"><DocumentInput /></Editor>;
    case 'house-proof': {
      const existing = data.houseVerifications.filter(v => v.houseId === d.houseId).at(-1);
      return <Editor title={`Quyền cho thuê · ${house(d.houseId)?.name}`} initial={{ rightType: existing?.rightType || 'OWNER' }} fields={[select('rightType', 'Căn cứ cho thuê', [['OWNER', 'Chủ sở hữu'], ['AUTHORIZED', 'Được ủy quyền'], ['SUBLESSOR', 'Được cho thuê lại']], { full: true }), text('validFrom', 'Có hiệu lực từ', { type: 'date', defaultValue: day() }), text('validUntil', 'Hết hiệu lực ngày', { type: 'date', required: false }), text('scope', 'Phạm vi quyền cho thuê', { full: true })]} submitLabel="Gửi xét duyệt" onSubmit={(v, form) => { const files = [...form.querySelector('[name="documents"]').files]; if (!files.length) throw new Error('Chọn minh chứng quyền cho thuê.'); validateDocuments(files); if (v.rightType !== 'OWNER' && !v.validUntil) throw new Error('Ủy quyền và cho thuê lại cần ngày hết hiệu lực.'); if (v.validUntil && v.validUntil < v.validFrom) throw new Error('Ngày hết hiệu lực phải sau ngày bắt đầu.'); save('houseVerifications', null, { ...v, houseId: d.houseId, applicantId: me, status: 'PENDING', documents: files.map(f => ({ name: f.name, type: f.type, size: f.size })) }); }}>{existing && <p>Hồ sơ gần nhất: <Badge status={existing.status} /> {existing.reason}</p>}<DocumentInput /></Editor>;
    }
    case 'verification': {
      const collection = d.kind === 'house' ? 'houseVerifications' : 'verifications', v = data[collection].find(v => v.id === d.id);
      return <Frame title="Chi tiết hồ sơ xác minh"><div className="stack"><Badge status={v.status} /><h3>{d.kind === 'house' ? house(v.houseId)?.name : person(v.userId).name}</h3><p>{v.scope || v.type}</p>{v.documents?.map((f, i) => <div className="list-row" key={i}><Icon name="file-text" /><strong>{f.name}</strong><span className="muted tiny">{Math.ceil(f.size / 1024)} KB</span></div>)}<p className="muted tiny">{v.isDemo ? 'Hồ sơ mẫu, không chứa giấy tờ thực.' : 'Bản giao diện lưu tên tệp đã chọn. Nội dung minh chứng chưa được tải lên máy chủ.'}</p>{v.reason && <p>Lý do: {v.reason}</p>}{v.status === 'PENDING' && <div className="form-actions"><Button onClick={() => openDialog('decision', { collection, id: v.id, status: 'REJECTED', title: 'Từ chối hồ sơ', reason: true })}>Từ chối</Button><Button variant="primary" onClick={() => openDialog('decision', { collection, id: v.id, status: 'APPROVED', title: 'Duyệt hồ sơ xác minh', evidence: true })}>Duyệt hồ sơ</Button></div>}{v.status === 'APPROVED' && d.kind === 'house' && <Button variant="danger" onClick={() => openDialog('decision', { collection, id: v.id, status: 'REVOKED', title: 'Thu hồi xác minh', reason: true })}>Thu hồi xác minh</Button>}</div></Frame>;
    }
    case 'template': {
      const t = data.templates.find(t => t.id === d.id);
      return <Editor title={t ? 'Chỉnh sửa mẫu hợp đồng' : 'Thêm mẫu hợp đồng'} initial={t} fields={[text('name', 'Tên mẫu hợp đồng', { full: true }), text('content', 'Nội dung và điều khoản', { type: 'textarea', full: true })]} onSubmit={v => save('templates', t, { ...v, version: (t?.version || 0) + 1, active: t?.active ?? true })} />;
    }
    case 'user-lock': {
      const locked = data.lockedUsers.includes(d.id);
      return <Editor title={`${locked ? 'Mở khóa' : 'Khóa'} tài khoản`} fields={[text('reason', 'Lý do thực hiện', { type: 'textarea', full: true })]} onSubmit={v => { mutate(next => { next.lockedUsers = locked ? next.lockedUsers.filter(id => id !== d.id) : [...next.lockedUsers, d.id]; }); audit(locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản', person(d.id).name, v.reason); }}><p>Tài khoản: {person(d.id).name}</p></Editor>;
    }
    case 'decision': return <Editor title={d.title} fields={d.reason ? [text('reason', 'Lý do / ghi chú', { type: 'textarea', full: true })] : []} onSubmit={(v, form) => {
      if (d.evidence && !form.elements.evidence.checked) throw new Error('Xác nhận đã đối chiếu minh chứng.');
      if (d.collection === 'posts' && d.status === 'APPROVED') { const p = data.posts.find(p => p.id === d.id); if (!houseVerified(data, room(p.roomId)?.houseId)) throw new Error('Nhà trọ cần được xác minh quyền cho thuê trước.'); }
      patch(d.collection, d.id, { ...v, status: d.status, ...(d.status === 'REJECTED' ? { rejectionReason: v.reason } : {}) });
      if (d.collection === 'contracts' && d.status === 'CANCELLED') mutate(next => { const c = next.contracts.find(c => c.id === d.id); if (!next.contracts.some(x => x.roomId === c.roomId && x.id !== c.id && ['ACTIVE', 'CONFIRMED', 'PENDING_CONFIRMATION'].includes(x.status))) next.rooms.find(r => r.id === c.roomId).status = 'AVAILABLE'; });
      if (role === 'admin') audit(d.title, data[d.collection].find(x => x.id === d.id)?.title || d.id, v.reason || 'Đã kiểm tra hồ sơ');
    }} submitLabel="Xác nhận"><p>{d.title} trong bản trải nghiệm?</p>{d.evidence && <label className="checkbox-row"><input type="checkbox" name="evidence" required /><span>Tôi đã đối chiếu thông tin và minh chứng của hồ sơ.</span></label>}</Editor>;
    default: return <Frame title="Trọday"><Empty title="Nội dung không còn khả dụng" /></Frame>;
  }
}

function DocumentInput() { return <Field label="Minh chứng (PDF, JPG, PNG, WebP; tối đa 8 tệp, 5 MB/tệp)"><input name="documents" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" multiple required /><small className="muted">Bản xem trước chỉ lưu tên tệp, chưa tải giấy tờ lên máy chủ.</small></Field>; }
function validateDocuments(files) { if (files.length > 8 || files.some(f => f.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(f.type))) throw new Error('Chọn tối đa 8 tệp PDF/JPG/PNG/WebP, không quá 5 MB mỗi tệp.'); }

function ContractEditor() {
  const { data, dialog: d, me, room, house, person, upsert, mutate } = useApp();
  const c = data.contracts.find(c => c.id === d.id), v = data.viewings.find(v => v.id === d.viewingId);
  const rooms = ownRooms(data, me).filter(r => (r.status === 'AVAILABLE' || r.id === c?.roomId || r.id === d.roomId) && houseVerified(data, r.houseId));
  if (!rooms.length) return <Frame title="Lập hợp đồng"><Empty title="Chưa có phòng phù hợp">Phòng cần sẵn sàng và nhà đã được xác minh.</Empty></Frame>;
  return <Editor title={c ? 'Chỉnh sửa hợp đồng' : 'Lập hợp đồng thuê phòng'} initial={c || { roomId: d.roomId || rooms[0].id, tenantId: v?.tenantId || 'lan', start: day(), end: day(365), rent: room(d.roomId || rooms[0].id).price, deposit: room(d.roomId || rooms[0].id).deposit, terms: data.templates.find(t => t.active)?.content }} fields={[select('roomId', 'Phòng thuê', options(rooms, r => `${r.code} · ${r.title}`)), select('tenantId', 'Đại diện người thuê', Object.entries(PEOPLE).filter(([id]) => !['quan', 'huong', 'admin'].includes(id)).map(([id, p]) => [id, p.name])), text('start', 'Ngày bắt đầu', { type: 'date' }), text('end', 'Ngày kết thúc', { type: 'date' }), number('rent', 'Tiền phòng / tháng (đ)'), number('deposit', 'Tiền đặt cọc (đ)'), text('terms', 'Điều khoản thỏa thuận', { type: 'textarea', full: true }), text('members', 'Thành viên bổ sung (mỗi người một dòng)', { type: 'textarea', required: false, full: true })]} submitLabel="Gửi hợp đồng xác nhận" onSubmit={values => {
    if (values.end <= values.start) throw new Error('Ngày kết thúc phải sau ngày bắt đầu.');
    if (data.contracts.some(x => x.roomId === values.roomId && x.id !== c?.id && ['ACTIVE', 'CONFIRMED', 'PENDING_CONFIRMATION'].includes(x.status))) throw new Error('Phòng đã có hợp đồng đang hiệu lực hoặc chờ xác nhận.');
    const extra = values.members.split('\n').map(name => name.trim()).filter(Boolean);
    if (extra.length + 1 > room(values.roomId).capacity) throw new Error('Số người vượt quá sức chứa của phòng.');
    const revision = (c?.revisionNo || 0) + 1, id = c?.id || uid('contract');
    upsert('contracts', { ...c, ...values, id, number: c?.number || `HD-${new Date().getFullYear()}-${String(data.contracts.length + 1).padStart(3, '0')}`, ownerId: me, status: 'PENDING_CONFIRMATION', source: 'NEW_RENTAL', viewingId: d.viewingId || c?.viewingId, revisionNo: revision, revisions: [...(c?.revisions || []), { version: revision, status: 'PENDING_CONFIRMATION' }], members: c?.members || [{ id: uid('member'), tenantId: values.tenantId, name: person(values.tenantId).name, status: 'PLANNED', identity: '', moveIn: '' }, ...extra.map(name => ({ id: uid('member'), name, status: 'PLANNED', identity: '', moveIn: '' }))] });
    mutate(next => { next.rooms.find(r => r.id === values.roomId).status = 'RESERVED'; next.viewings.filter(v => v.roomId === values.roomId && v.status === 'SCHEDULED').forEach(v => { v.status = 'CANCELLED'; v.reason = 'Phòng đã được giữ bằng hợp đồng.'; }); next.viewingProposals.filter(v => v.roomId === values.roomId && v.status === 'PENDING').forEach(v => { v.status = 'WITHDRAWN'; }); next.notifications.push({ id: uid('notification'), userId: values.tenantId, text: 'Bạn có hợp đồng thuê phòng mới đang chờ xác nhận.', read: false }); });
  }} />;
}

function InvoiceEditor() {
  const { data, dialog: d, me, room, upsert } = useApp();
  const invoice = data.invoices.find(i => i.id === d.id), contracts = data.contracts.filter(c => c.ownerId === me && c.status === 'ACTIVE');
  const [contractId, setContractId] = useState(invoice?.contractId || contracts[0]?.id || '');
  const c = contracts.find(c => c.id === contractId);
  const [items, setItems] = useState(invoice?.items || [{ name: 'Tiền phòng', quantity: 1, unit: 'tháng', price: c?.rent || 0 }]);
  if (!contracts.length) return <Frame title="Tạo hóa đơn"><Empty title="Chưa có hợp đồng đang hiệu lực">Xác nhận người thuê vào ở trước khi tạo hóa đơn.</Empty></Frame>;
  const changeItem = (index, key, value) => setItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: ['price', 'quantity'].includes(key) ? Number(value) : value } : item));
  return <Editor title={invoice ? 'Sửa hóa đơn nháp' : 'Tạo hóa đơn'} initial={invoice || { period: day().slice(0, 7) + '-01', due: day(5) }} fields={[text('period', 'Kỳ thu', { type: 'date' }), text('due', 'Hạn thanh toán', { type: 'date' })]} submitLabel="Lưu hóa đơn nháp" onSubmit={v => {
    if (!items.length || items.some(i => !i.name.trim() || i.quantity <= 0 || i.price < 0)) throw new Error('Mỗi khoản thu cần có tên, số lượng lớn hơn 0 và đơn giá không âm.');
    if (data.invoices.some(i => i.contractId === contractId && i.period.slice(0, 7) === v.period.slice(0, 7) && i.status !== 'CANCELLED' && i.id !== invoice?.id)) throw new Error('Đã có hóa đơn cho hợp đồng và kỳ thu này.');
    upsert('invoices', { ...invoice, ...v, id: invoice?.id || uid('invoice'), code: invoice?.code || `INV-${v.period.slice(0, 7)}-${String(data.invoices.length + 1).padStart(3, '0')}`, contractId, payerId: c.tenantId, status: 'DRAFT', items });
  }}><Field label="Hợp đồng"><select name="contractId" value={contractId} onChange={e => { setContractId(e.target.value); if (!invoice) setItems([{ name: 'Tiền phòng', quantity: 1, unit: 'tháng', price: contracts.find(c => c.id === e.target.value).rent }]); }}>{contracts.map(c => <option key={c.id} value={c.id}>{c.number} · {room(c.roomId)?.code}</option>)}</select></Field><h3 className="small-title">Các khoản thu</h3><div className="invoice-editor-items">{items.map((item, index) => <div className="invoice-editor-row" key={index}><Field label="Khoản thu"><input required aria-label={`Tên khoản ${index + 1}`} value={item.name} onChange={e => changeItem(index, 'name', e.target.value)} /></Field><Field label="Số lượng"><input required type="number" min="0.01" step="any" value={item.quantity} onChange={e => changeItem(index, 'quantity', e.target.value)} /></Field><Field label="Đơn giá (đ)"><input required type="number" min="0" value={item.price} onChange={e => changeItem(index, 'price', e.target.value)} /></Field><Button icon="x" aria-label={`Xóa khoản ${index + 1}`} onClick={() => setItems(items.filter((_, i) => i !== index))} /></div>)}</div><Button variant="text-button" icon="plus" onClick={() => setItems([...items, { name: '', quantity: 1, unit: 'lần', price: 0 }])}>Thêm khoản thu</Button><div className="total-line"><span>Tổng cộng</span><strong>{money(totalInvoice({ items }))}</strong></div></Editor>;
}
function InvoiceDetail() {
  const { data, dialog: d, role, contract, room, person, openDialog } = useApp();
  const invoice = data.invoices.find(i => i.id === d.id), c = contract(invoice.contractId);
  return <Frame title={`Hóa đơn ${invoice.code}`}><div className="invoice-detail"><div><span>Phòng</span><strong>{room(c.roomId)?.code}</strong></div><div><span>Người thanh toán</span><strong>{person(invoice.payerId).name}</strong></div><div><span>Kỳ thu</span><strong>{dateLabel(invoice.period)}</strong></div><div><span>Hạn thanh toán</span><strong>{dateLabel(invoice.due)}</strong></div></div><Badge status={invoice.status} /><Table rows={invoice.items.map((i, index) => ({ ...i, id: index + 1 }))} columns={[{ label: 'Khoản thu', key: 'name' }, { label: 'Số lượng', key: 'quantity' }, { label: 'Đơn giá', render: i => money(i.price) }, { label: 'Thành tiền', render: i => money(i.quantity * i.price * (i.type === 'DISCOUNT' ? -1 : 1)) }]} /><div className="total-line"><span>Tổng thanh toán</span><strong>{money(totalInvoice(invoice))}</strong></div>{invoice.reason && <p>Lý do hủy: {invoice.reason}</p>}{role === 'landlord' && <div className="form-actions">{invoice.status === 'DRAFT' && <><Button onClick={() => openDialog('invoice', { id: invoice.id })}>Sửa hóa đơn</Button><Button variant="primary" onClick={() => openDialog('decision', { collection: 'invoices', id: invoice.id, status: 'UNPAID', title: 'Phát hành hóa đơn' })}>Phát hành</Button></>}{invoice.status === 'UNPAID' && <><Button variant="danger" onClick={() => openDialog('decision', { collection: 'invoices', id: invoice.id, status: 'CANCELLED', title: 'Hủy hóa đơn', reason: true })}>Hủy hóa đơn</Button><Button variant="primary" onClick={() => openDialog('decision', { collection: 'invoices', id: invoice.id, status: 'PAID', title: 'Xác nhận đã thu tiền' })}>Xác nhận thu tiền</Button></>}</div>}</Frame>;
}
