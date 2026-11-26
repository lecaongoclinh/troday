import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { send } from '../data/api';
import { dateLabel, money, visibleContracts } from '../data/selectors';
import { Badge, Button, Icon, PageHeader, Section, Table, Tabs } from '../components/ui';

export default function Contracts() {
  const { data, route, role, me, room, house, person, openDialog, execute, run, setListQuery } = useApp();
  const [filter, setFilter] = useState('all');
  const contracts = visibleContracts(data, me, role);
  const rows = contracts.filter(contract => filter === 'all' || contract.status === filter);
  const current = contracts.find(contract => contract.status === 'ACTIVE');
  const currentRoom = room(current?.roomId);
  const currentHouse = house(currentRoom?.houseId);
  const changes = data.changeRequests.filter(change => contracts.some(contract => contract.id === change.contractId));
  const linkedContractId = contracts.find(contract => contract.id === route.id)?.id;

  useEffect(() => {
    if (linkedContractId) openDialog('contract-detail', { id: linkedContractId });
  }, [linkedContractId, openDialog]);

  return (
    <>
      <PageHeader title="Hợp đồng thuê trọ" description="Mọi thỏa thuận đều rõ ràng, mọi hành trình đều an tâm.">
        {role === 'landlord' && <><Button icon="plus" variant="primary" onClick={() => openDialog('contract')}>Lập từ lịch đã xem</Button><Button onClick={() => openDialog('paper-import')}>Nhập hợp đồng giấy</Button></>}
      </PageHeader>

      {role === 'tenant' && current && (
        <div className="rental-summary">
          <span className="quick-icon"><Icon name="home" /></span>
          <div>
            <span className="eyebrow">NGÔI NHÀ HIỆN TẠI CỦA BẠN</span>
            <h2>{currentRoom?.code} · {currentHouse?.name}</h2>
            <p>{currentHouse?.address}</p>
          </div>
          <Badge status="ACTIVE" />
        </div>
      )}

      <div className="filter-bar">
        <Tabs
          value={filter}
          onChange={value => { setFilter(value);setListQuery({ status: value === 'all' ? '' : value, page: 1 }); }}
          items={[
            ['all', 'Tất cả'],
            ['ACTIVE', 'Đang hiệu lực'],
            ['PENDING_CONFIRMATION', 'Chờ xác nhận'],
            ['TERMINATED', 'Đã kết thúc'],
          ]}
        />
      </div>
      <Table
        rows={rows}
        columns={[
          { label: 'Hợp đồng', render: contract => <><strong>{contract.number}</strong><span className="cell-sub">{room(contract.roomId)?.code} · {person(contract.tenantId).name}</span></> },
          { label: 'Thời hạn', render: contract => <>{dateLabel(contract.start)}<span className="cell-sub">đến {dateLabel(contract.end)}</span></> },
          { label: 'Tiền thuê', render: contract => money(contract.rent) },
          { label: 'Trạng thái', render: contract => <Badge status={contract.status} /> },
          {
            actions: true,
            render: contract => (
              <Button
                variant="small"
                aria-label={`Chi tiết hợp đồng ${contract.number}`}
                onClick={() => openDialog('contract-detail', { id: contract.id })}
              >
                Chi tiết
              </Button>
            ),
          },
        ]}
      />

      {data.joinRequests.length > 0 && role === 'tenant' && <Section title="Yêu cầu thêm người"><Table rows={data.joinRequests} columns={[{ label: 'Người ở ghép', render: j => person(j.applicantId).name }, { label: 'Trạng thái', render: j => <Badge status={j.status} /> }, { actions: true, render: j => ['PENDING_CONSENT', 'PENDING_LANDLORD'].includes(j.status) && <div className="table-actions"><Button onClick={() => run(() => execute(() => send(`/occupant-join-requests/${j.id}/consents`, { consent: true })))}>Đồng ý</Button><Button onClick={() => run(() => execute(() => send(`/occupant-join-requests/${j.id}/cancel`, { reason: 'Rút yêu cầu' })))}>Rút yêu cầu</Button></div> }]} /></Section>}
      {changes.length > 0 && (
        <Section title="Yêu cầu thay đổi hợp đồng">
          <Table
            rows={changes}
            columns={[
              { label: 'Yêu cầu', render: change => <>{({ RENEWAL: 'Gia hạn hợp đồng', TRANSFER: 'Chuyển phòng', TERMINATION: 'Kết thúc hợp đồng' })[change.type]}<small className="cell-sub">{contracts.find(c => c.id === change.contractId)?.number}</small></> },
              { label: 'Nội dung', render: change => <>{change.note}{change.newEndDate && <small className="cell-sub">Kết thúc mới: {dateLabel(change.newEndDate)}</small>}</> },
              { label: 'Ngày hiệu lực', render: change => dateLabel(change.effective) },
              { label: 'Trạng thái', render: change => <Badge status={change.status}>{({ PENDING: 'Chờ chủ trọ duyệt', APPROVED_WAITING_CONFIRMATION: 'Chờ người thuê xác nhận', READY_TO_APPLY: 'Đủ xác nhận · Chờ áp dụng', COMPLETED: 'Đã áp dụng', EXPIRED: 'Hết hạn' })[change.status]}</Badge> },
              {
                actions: true,
                render: change => <div className="table-actions">
                  <Button variant="small" onClick={() => openDialog('review-change', { id: change.id })}>Xem phương án</Button>
                  {role === 'landlord' && change.status === 'PENDING' && <Button variant="small" onClick={() => openDialog('decision', { collection: 'changeRequests', id: change.id, status: 'REJECTED', title: 'Từ chối yêu cầu', reason: true })}>Từ chối</Button>}
                  {role === 'tenant' && change.requestedById === me && ['PENDING', 'APPROVED_WAITING_CONFIRMATION', 'READY_TO_APPLY'].includes(change.status) && <Button variant="small" onClick={() => openDialog('cancel-change', { id: change.id })}>Rút đề nghị</Button>}
                </div>,
              },
            ]}
          />
        </Section>
      )}
    </>
  );
}
