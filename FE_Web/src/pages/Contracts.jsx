import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { dateLabel, money, visibleContracts } from '../data/selectors';
import { Badge, Button, Icon, PageHeader, Section, Table, Tabs } from '../components/ui';

export default function Contracts() {
  const { data, route, role, me, room, house, person, openDialog } = useApp();
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
        {role === 'landlord' && <Button icon="plus" variant="primary" onClick={() => openDialog('contract')}>Nhập hợp đồng</Button>}
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
          onChange={setFilter}
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

      {changes.length > 0 && (
        <Section title="Yêu cầu thay đổi hợp đồng">
          <Table
            rows={changes}
            columns={[
              { label: 'Yêu cầu', render: change => ({ RENEWAL: 'Gia hạn hợp đồng', TRANSFER: 'Chuyển phòng', TERMINATION: 'Kết thúc hợp đồng' })[change.type] },
              { label: 'Nội dung', key: 'note' },
              { label: 'Ngày hiệu lực', render: change => dateLabel(change.effective) },
              { label: 'Trạng thái', render: change => <Badge status={change.status} /> },
              {
                actions: true,
                render: change => change.status === 'PENDING' && role === 'landlord' ? (
                  <div className="table-actions">
                    <Button variant="small primary" onClick={() => openDialog('apply-change', { id: change.id })}>Xem & xử lý</Button>
                    <Button variant="small" onClick={() => openDialog('decision', { collection: 'changeRequests', id: change.id, status: 'REJECTED', title: 'Từ chối yêu cầu', reason: true })}>Từ chối</Button>
                  </div>
                ) : null,
              },
            ]}
          />
        </Section>
      )}
    </>
  );
}
