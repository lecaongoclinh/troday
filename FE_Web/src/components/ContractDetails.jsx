import { useApp } from '../context/AppContext';
import { dateLabel, money, visibleContracts } from '../data/selectors';
import { Badge, Button, Empty, Icon } from './ui';

export default function ContractDetails({ id }) {
  const { data, role, me, room, house, person, openDialog, closeDialog } = useApp();
  const contract = visibleContracts(data, me, role).find(contract => contract.id === id);
  if (!contract) return <Empty title="Không tìm thấy hợp đồng">Hợp đồng không còn khả dụng trong tài khoản của bạn.</Empty>;

  return (
    <>
      <div className="contract-detail-version"><Badge tone="gray">Phiên bản {contract.revisionNo || 1}</Badge></div>
      <div className="contract-layout" id="contract-details">
        <div className="flat-surface padded">
          <div className="contract-paper-head">
            <Icon name="file-text" />
            <span>HỢP ĐỒNG THUÊ PHÒNG TRỌ</span>
            <strong>{contract.number}</strong>
            <Badge status={contract.status} />
          </div>
          <div className="invoice-detail">
            <div><span>Bên cho thuê</span><strong>{person(contract.ownerId).name}</strong></div>
            <div><span>Đại diện bên thuê</span><strong>{contract.tenantId ? person(contract.tenantId).name : 'Chưa có thông tin đại diện'}</strong></div>
            <div><span>Phòng thuê</span><strong>{room(contract.roomId)?.code} · {house(room(contract.roomId)?.houseId)?.name}</strong></div>
            <div><span>Thời hạn</span><strong>{dateLabel(contract.start)} — {dateLabel(contract.end)}</strong></div>
            <div><span>Tiền phòng / tháng</span><strong>{money(contract.rent)}</strong></div>
            <div><span>Tiền đặt cọc</span><strong>{money(contract.deposit)}</strong></div>
          </div>
          <h3 className="small-title">Điều khoản thỏa thuận</h3>
          <p className="contract-terms">{contract.terms}</p>
          {contract.feedback && <div className="flow-banner">Góp ý từ người thuê: {contract.feedback}</div>}
          <h3 className="small-title">Người trong hợp đồng</h3>
          {contract.members.map(member => (
            <div className="list-row" key={member.id}>
              <div><strong>{member.name}</strong><small>{member.identity || 'Chưa cập nhật giấy tờ'}</small></div>
              <Badge status={member.status} />{role === 'landlord' && member.status === 'PLANNED' && member.id !== String(contract.representativeRoomTenantId) && <Button onClick={() => openDialog('cancel-member', { id: member.id, contractId: contract.id })}>Hủy thành viên dự kiến</Button>}
            </div>
          ))}
        </div>

        <aside className="stack">
          <div className="subtle-panel">
            <h3>Thao tác hợp đồng</h3>
            <div className="stack">
              {role === 'tenant' && contract.members.some(m => m.tenantId === me && ['ACTIVE', 'LEFT'].includes(m.status)) && <Button onClick={() => openDialog('review', { roomId: contract.roomId, contractId: contract.id, memberId: contract.members.find(m => m.tenantId === me && ['ACTIVE', 'LEFT'].includes(m.status)).id })}>Đánh giá phòng đã thuê</Button>}
              {contract.status === 'PENDING_CONFIRMATION' && role === 'tenant' && contract.tenantId === me && (
                <>
                  <Button variant="primary" icon="check" onClick={() => openDialog('decision', { collection: 'contracts', id: contract.id, status: 'CONFIRMED', title: 'Xác nhận hợp đồng' })}>Xác nhận hợp đồng</Button>
                  <Button onClick={() => openDialog('contract-feedback', { id: contract.id })}>Gửi góp ý chỉnh sửa</Button>
                </>
              )}
              {['CONFIRMED', 'ACTIVE'].includes(contract.status) && role === 'landlord' && contract.members.some(member => member.status === 'PLANNED') && (
                <Button variant="primary" onClick={() => openDialog('move-in', { id: contract.id })}>Xác nhận vào ở</Button>
              )}
              {contract.status === 'DRAFT' && role === 'landlord' && contract.revisions.some(revision => revision.status === 'DRAFT') && (
                <Button onClick={() => openDialog('contract', { id: contract.id })}>Chỉnh sửa và gửi lại</Button>
              )}
              {contract.status === 'ACTIVE' && role === 'tenant' && contract.tenantId === me && (
                <>
                  <Button onClick={() => openDialog('join', { id: contract.id })}>Mời người ở ghép vào phòng</Button>
                  {!data.changeRequests.some(change => change.contractId === contract.id && ['PENDING', 'APPROVED_WAITING_CONFIRMATION', 'READY_TO_APPLY'].includes(change.status)) && <Button onClick={() => openDialog('contract-change', { id: contract.id })}>Đề nghị điều chỉnh</Button>}
                </>
              )}
              {['PENDING_CONFIRMATION', 'CONFIRMED'].includes(contract.status) && role === 'landlord' && (
                <Button variant="danger" onClick={() => openDialog('decision', { collection: 'contracts', id: contract.id, status: 'CANCELLED', title: 'Hủy hợp đồng', reason: true })}>Hủy hợp đồng</Button>
              )}
              {['TERMINATED', 'CANCELLED'].includes(contract.status) && <p className="muted tiny">Hợp đồng được lưu để bạn xem lại lịch sử.</p>}
            </div>
          </div>
          <div className="flat-surface padded">
            <h3 className="small-title">Lịch sử phiên bản</h3>
            {(contract.revisions || []).map(revision => (
              <details key={revision.id} className="contract-version">
                <summary>Phiên bản {revision.version}{revision.id === String(contract.currentRevisionId) && ' · Hiện hành'}</summary>
                <Badge status={revision.status} />
                <p>{dateLabel(revision.startDate)} – {dateLabel(revision.endDate)}</p>
                {revision.rentAmount != null && <p>Tiền thuê {money(revision.rentAmount)} · Tiền cọc {money(revision.depositAmount)}</p>}
                {revision.templateName && <p>Mẫu {revision.templateName} · Phiên bản mẫu {revision.templateVersion}</p>}
                <p className="contract-terms">{revision.content}</p>
              </details>
            ))}
          </div>
        </aside>
      </div>
      <div className="form-actions"><Button onClick={closeDialog}>Đóng</Button></div>
    </>
  );
}
