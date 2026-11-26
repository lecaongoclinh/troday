import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import OccupantJoinRequests from '../components/OccupantJoinRequests';
import { exportResidents, isOnListPage } from '../data/api';
import { dateLabel, money, totalInvoice } from '../data/selectors';
import { Avatar, Badge, Button, PageHeader, Table, Tabs } from '../components/ui';

export function Residents() {
  const { data, route, me, room, openDialog, run, setListQuery } = useApp();
  const filter = route.listQuery.status || 'all';
  const contracts = data.contracts.filter(c => c.ownerId === me);
  const residents = data.residents.map(m => ({ ...m, representative: !!m.tenantId && m.tenantId === contracts.find(c => c.id === m.contractId)?.tenantId }));
  const exportCSV = () => run(async () => {
    const url = URL.createObjectURL(await exportResidents());
    const a = document.createElement('a'); a.href = url; a.download = 'troday-danh-sach-nguoi-o.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'Đã xuất danh sách người ở.');
  return <><PageHeader title="Người ở" description="Quản lý cư trú và những người đang gọi nơi đây là nhà."><Button icon="download" onClick={exportCSV}>Xuất danh sách</Button></PageHeader><div className="filter-bar"><Tabs value={filter} onChange={value => setListQuery({ status: value === 'all' ? '' : value })} items={ [['ACTIVE', 'Đang ở'], ['PLANNED', 'Chờ vào ở'], ['LEFT', 'Đã rời phòng'], ['all', 'Tất cả']] } /></div><Table rows={residents} columns={[{ label: 'Người ở', render: m => <div className="room-row"><Avatar id={m.tenantId} /><div><strong>{m.name}</strong><span className="cell-sub">{m.representative ? 'Đại diện hợp đồng' : 'Thành viên'}</span></div></div> }, { label: 'Phòng', render: m => room(m.roomId)?.code }, { label: 'Giấy tờ', key: 'identity' }, { label: 'Ngày vào ở', render: m => dateLabel(m.moveIn) }, { label: 'Trạng thái', render: m => <Badge status={m.status} /> }, { actions: true, render: m => m.status === 'ACTIVE' ? <Button variant="small" onClick={() => openDialog('move-out', { id: m.id, contractId: m.contractId })}>Ghi nhận rời phòng</Button> : m.status === 'PLANNED' ? <Button variant="small primary" onClick={() => openDialog('move-in', { id: m.contractId })}>Xác nhận vào ở</Button> : null }]} /><OccupantJoinRequests /></>;
}

export function Invoices() {
  const { data, route, role, me, room, contract, openDialog, setListQuery } = useApp();
  const filter = route.listQuery.status || 'all';
  const visible = data.invoices.filter(invoice => isOnListPage(data, invoice.id));
  const linkedInvoiceId = data.invoices.find(invoice => invoice.id === route.id)?.id;
  useEffect(() => { if (linkedInvoiceId) openDialog('invoice-detail', { id: linkedInvoiceId }); }, [linkedInvoiceId, openDialog]);
  const unpaid = visible.filter(i => i.status === 'UNPAID');
  return <><PageHeader title="Hóa đơn" description={role === 'landlord' ? 'Theo dõi thu chi, rõ ràng từng khoản thanh toán.' : 'Mọi khoản chi cho ngôi nhà của bạn, rõ ràng trong một nơi.'}>{role === 'landlord' && <><Button onClick={() => openDialog('invoice-batch')}>Nhập chỉ số theo nhà</Button><Button variant="primary" icon="plus" onClick={() => openDialog('invoice')}>Tạo hóa đơn</Button></>}</PageHeader><div className="kpi-grid invoice-kpis">{[['Chưa thanh toán', money(unpaid.reduce((sum, i) => sum + totalInvoice(i), 0)), `${unpaid.length} hóa đơn`], ['Đã thanh toán', money(visible.filter(i => i.status === 'PAID').reduce((sum, i) => sum + totalInvoice(i), 0)), 'Tổng trong dữ liệu hiện tại'], ['Tổng hóa đơn', visible.length, 'Được lưu theo từng kỳ']].map(([label, value, foot]) => <div className="kpi" key={label}><span className="kpi-label">{label}</span><div className="kpi-value">{value}</div><div className="kpi-foot">{foot}</div></div>)}</div><div className="filter-bar"><Tabs value={filter} onChange={value => setListQuery({ status: value === 'all' ? '' : value })} items={ [['all', 'Tất cả'], ['UNPAID', 'Chưa thanh toán'], ['PAID', 'Đã thanh toán'], ['DRAFT', 'Bản nháp'], ['CANCELLED', 'Đã hủy']] } /></div><Table rows={visible} columns={[{ label: 'Hóa đơn', render: i => <><strong>{i.code}</strong><span className="cell-sub">Phòng {room(i.roomId)?.code || `#${i.roomId}`}</span></> }, { label: 'Kỳ thu', render: i => dateLabel(i.period).slice(3) }, { label: 'Hạn thanh toán', render: i => dateLabel(i.due) }, { label: 'Tổng cộng', render: i => <strong className="teal">{money(totalInvoice(i))}</strong> }, { label: 'Trạng thái', render: i => <Badge status={i.status} /> }, { actions: true, render: i => <div className="table-actions"><Button variant="small" onClick={() => openDialog('invoice-detail', { id: i.id })}>Chi tiết</Button>{role === 'landlord' && i.status === 'DRAFT' && <Button variant="small" onClick={() => openDialog('invoice', { id: i.id })}>Sửa</Button>}{role === 'landlord' && i.status === 'UNPAID' && <Button variant="small primary" onClick={() => openDialog('decision', { collection: 'invoices', id: i.id, status: 'PAID', title: 'Xác nhận đã thu tiền' })}>Xác nhận thu</Button>}</div> }]} /></>;
}
