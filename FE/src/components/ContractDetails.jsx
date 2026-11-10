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
            <div><span>Đại diện bên thuê</span><strong>{person(contract.tenantId).name}</strong></div>
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
              <Badge status={member.status} />
            </div>
          ))}
        </div>

        <aside className="stack">
          <div className="subtle-panel">
            <h3>Thao tác hợp đồng</h3>
            <div className="stack">
              {contract.status === 'PENDING_CONFIRMATION' && role === 'tenant' && (
                <>
                  <Button variant="primary" icon="check" onClick={() => openDialog('decision', { collection: 'contracts', id: contract.id, status: 'CONFIRMED', title: 'Xác nhận hợp đồng' })}>Xác nhận hợp đồng</Button>
                  <Button onClick={() => openDialog('contract-feedback', { id: contract.id })}>Gửi góp ý chỉnh sửa</Button>
                </>
              )}
              {['CONFIRMED', 'ACTIVE'].includes(contract.status) && role === 'landlord' && contract.members.some(member => member.status === 'PLANNED') && (
                <Button variant="primary" onClick={() => openDialog('move-in', { id: contract.id })}>Xác nhận vào ở</Button>
              )}
              {contract.status === 'PENDING_CONFIRMATION' && role === 'landlord' && (
                <Button onClick={() => openDialog('contract', { id: contract.id })}>Chỉnh sửa và gửi lại</Button>
              )}
              {contract.status === 'ACTIVE' && (
                <>
                  <Button onClick={() => openDialog('contract-change', { id: contract.id, changeType: 'RENEWAL' })}>Đề nghị gia hạn</Button>
                  <Button onClick={() => openDialog('contract-change', { id: contract.id, changeType: 'TRANSFER' })}>Đề nghị chuyển phòng</Button>
                  <Button onClick={() => openDialog('contract-change', { id: contract.id, changeType: 'TERMINATION' })}>Đề nghị kết thúc</Button>
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
            {(contract.revisions || []).map((revision, index) => (
              <div key={index} className="list-row">
                <div><strong>Phiên bản {revision.version}</strong><small>{revision.status === 'IMPORTED' ? 'Nhập từ hồ sơ giấy' : 'Thỏa thuận trong hệ thống'}</small></div>
                <Icon name="file-text" />
              </div>
            ))}
          </div>
        </aside>
      </div>
      <div className="form-actions"><Button onClick={closeDialog}>Đóng</Button></div>
    </>
  );
}
