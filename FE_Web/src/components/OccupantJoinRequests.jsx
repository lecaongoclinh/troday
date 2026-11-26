import { useApp } from '../context/AppContext';
import { send } from '../data/api';
import { dateLabel, day } from '../data/selectors';
import { Badge, Button, Section, Table } from './ui';

export default function OccupantJoinRequests() {
  const { data, role, me, person, contract, room, openDialog, execute, run } = useApp();
  const landlord = role === 'landlord';
  const requests = data.joinRequests.filter(j => landlord
    ? (j.landlordId || contract(j.contractId)?.ownerId) === me && j.status !== 'PENDING_CONSENT'
    : j.applicantId === me || j.requestedBy === me);
  if (!requests.length && !landlord) return null;

  const submit = (id, action, body) => run(() => execute(() => send(`/occupant-join-requests/${id}/${action}`, body)));
  const actions = j => {
    if (landlord) {
      if (j.status === 'PENDING_LANDLORD') return <div className="table-actions">
        <Button variant="small primary" onClick={() => openDialog('approve-join', { id: j.id })}>Duyệt yêu cầu</Button>
        <Button variant="small" onClick={() => openDialog('decision', { collection: 'joinRequests', id: j.id, status: 'REJECTED', title: 'Từ chối yêu cầu thêm người', reason: true })}>Từ chối</Button>
      </div>;
      if (j.status === 'APPROVED') return <div className="table-actions">
        <Button variant="small primary" disabled={j.plannedMoveInDate > day()} onClick={() => openDialog('complete-join', { id: j.id })}>Xác nhận đã vào ở</Button>
        <Button variant="small" onClick={() => openDialog('cancel-join-hold', { id: j.id })}>Hủy giữ chỗ</Button>
      </div>;
      return null;
    }
    if (!['PENDING_CONSENT', 'PENDING_LANDLORD'].includes(j.status)) return null;
    const invited = j.applicantId === me;
    const awaitingMe = invited ? !j.applicantConsented : !j.representativeConsented;
    return <div className="table-actions">
      {j.status === 'PENDING_CONSENT' && awaitingMe && <Button variant="small primary" onClick={() => submit(j.id, 'consents', { consent: true })}>Đồng ý vào ở</Button>}
      <Button variant="small" onClick={() => submit(j.id, 'cancel', { reason: invited ? 'Người được mời từ chối' : 'Đại diện rút yêu cầu' })}>{invited ? 'Từ chối lời mời' : 'Rút yêu cầu'}</Button>
    </div>;
  };

  return <Section title={landlord ? 'Duyệt yêu cầu thêm người ở ghép' : 'Yêu cầu và lời mời vào ở'}>
    <Table rows={requests} columns={[
      { label: 'Người được mời', render: j => <>{j.applicantName || person(j.applicantId).name}{j.message && <small className="cell-sub">{j.message}</small>}</> },
      { label: 'Phòng / hợp đồng', render: j => <>{[j.houseName, j.roomCode || room(contract(j.contractId)?.roomId)?.code].filter(Boolean).join(' · ')}<small className="cell-sub">{j.contractNumber || contract(j.contractId)?.number || `#${j.contractId}`}</small></> },
      { label: 'Dự kiến vào ở', render: j => dateLabel(j.plannedMoveInDate) },
      { label: 'Trạng thái', render: j => <><Badge status={j.status}>{({ PENDING_CONSENT: j.representativeConsented ? 'Chờ người được mời' : 'Chờ các bên đồng ý', APPROVED: 'Đã duyệt · Giữ chỗ', COMPLETED: 'Đã vào ở', EXPIRED: 'Hết hạn' })[j.status]}</Badge>{j.rejectionReason && <small className="cell-sub">{j.rejectionReason}</small>}</> },
      { actions: true, render: actions },
    ]} />
  </Section>;
}
