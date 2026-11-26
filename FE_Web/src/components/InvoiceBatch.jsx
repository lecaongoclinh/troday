import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ApiError, request } from '../data/api';
import { day, money, ownHouses } from '../data/selectors';
import { Badge, Button, Empty, Field, Icon, Table } from './ui';
import { markBatchCreated, parseBatchPreview, parseBatchResult, prepareBatchRoom } from '../../../shared/api/invoice-batch.ts';
import { batchDrafts, browserDraftStorage } from '../../../shared/api/invoice-batch-drafts.ts';

export default function InvoiceBatch() {
  const { data, me, execute } = useApp();
  const houses = ownHouses(data, me);
  const store = batchDrafts(browserDraftStorage, me);
  const [scope, setScope] = useState(() => {
    const previous = store.lastScope();
    return houses.some(house => house.id === previous?.houseId) ? previous
      : { houseId: houses[0]?.id || '', billingPeriod: `${day().slice(0, 7)}-01` };
  });
  const [draft, setDraft] = useState(() => store.read(scope, day(5)));
  const draftRef = useRef(draft);
  const [storageFailed, setStorageFailed] = useState(false);
  const [load, setLoad] = useState(null);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(null);
  const submitting = useRef(false);
  const resultRef = useRef(null);
  const { houseId, billingPeriod: period } = scope;
  const { dueDate, readings, excluded } = draft;
  const key = `${houseId}:${period}:${reload}`;

  useEffect(() => {
    batchDrafts(browserDraftStorage, me).remember({ houseId, billingPeriod: period });
  }, [me, houseId, period]);

  useEffect(() => {
    if (!houseId || !period) return;
    const controller = new AbortController();
    request(`/houses/${houseId}/invoice-batch-preview?billingPeriod=${encodeURIComponent(period)}`, { signal: controller.signal })
      .then(value => {
        if (controller.signal.aborted) return;
        const preview = parseBatchPreview(value);
        setLoad(preview?.houseId === houseId && preview.billingPeriod === period
          ? { key, rooms: preview.rooms } : { key, error: 'Máy chủ chưa trả danh sách đúng kỳ thu.' });
      })
      .catch(e => { if (!controller.signal.aborted) setLoad({ key, error: e.message }); });
    return () => controller.abort();
  }, [houseId, period, key]);

  useEffect(() => { if (result) resultRef.current?.scrollIntoView({ block: 'nearest' }); }, [result]);

  if (!houses.length) return <Empty title="Chưa có nhà trọ">Thêm nhà trọ để nhập chỉ số theo phòng.</Empty>;
  const current = load?.key === key ? load : null;
  const rows = (current?.rooms || []).map(room => ({ room, ...prepareBatchRoom(room, readings[room.contractId]) }));
  const ready = rows.filter(({ room, submission }) => submission && !excluded[room.contractId]);
  const locked = saving || !!retry;
  const changeScope = next => {
    draftRef.current = store.read(next, day(5));
    setDraft(draftRef.current);
    setScope(next);
    setStorageFailed(false);
    setResult(null);
    setError('');
  };
  const updateDraft = change => {
    const next = change(draftRef.current);
    draftRef.current = next;
    setDraft(next);
    setStorageFailed(!store.save(scope, next));
  };
  const setReading = (contractId, serviceId, field, value) => updateDraft(previous => ({
    ...previous,
    readings: {
      ...previous.readings,
      [contractId]: { ...previous.readings[contractId], [serviceId]: { ...previous.readings[contractId]?.[serviceId], [field]: value } },
    },
  }));

  const save = async event => {
    event.preventDefault();
    if (submitting.current || (!retry && (!ready.length || !dueDate))) return;
    const pending = retry || {
      key: crypto.randomUUID(), body: { billingPeriod: period, dueDate, rooms: ready.map(row => row.submission) },
    };
    submitting.current = true;
    setSaving(true);
    setError('');
    try {
      const value = await execute(() => request(`/houses/${houseId}/invoice-batches`, {
        method: 'POST', body: pending.body, headers: { 'Idempotency-Key': pending.key },
      }));
      const batch = parseBatchResult(value);
      setLoad(previous => previous?.key === key && previous.rooms
        ? { ...previous, rooms: markBatchCreated(previous.rooms, batch.created) } : previous);
      setResult(batch);
      setRetry(null);
    } catch (e) {
      setError(e.message);
      const uncertain = !(e instanceof ApiError) || !e.status || e.status >= 500
        || (e.status === 409 && e.message.includes('đang xử lý hoặc cần đối soát'));
      setRetry(uncertain ? pending : null);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return <div className="stack">
    {result && <section ref={resultRef} aria-live="polite" className="stack">
      <h3 className="small-title">Hóa đơn vừa tạo ({result.created.length})</h3>
      {result.created.length === 0 && <p className="muted">Đợt nhập này chưa tạo được hóa đơn.</p>}
      {result.created.map(({ roomCode, invoice }) => <details className="flat-surface padded" key={invoice.id}>
        <summary>Phòng {roomCode} · HĐ-{invoice.id} · {money(invoice.total)} · Bản nháp</summary>
        <Table rows={invoice.items || []} columns={[
          { label: 'Khoản thu', render: item => <>{item.name}{item.calculationMethod === 'METERED'
            && <small className="cell-sub">{item.previousReading} → {item.currentReading} {item.unit}</small>}</> },
          { label: 'Số lượng', key: 'quantity' },
          { label: 'Thành tiền', render: item => money(item.amount) },
        ]} />
      </details>)}
      {result.skipped.map(row => <p className="form-error" key={row.contractId}>
        Phòng {rows.find(({ room }) => room.contractId === row.contractId)?.room.roomCode || row.contractId} · {row.reason}
      </p>)}
    </section>}
    <form noValidate onSubmit={save}>
      <fieldset className="form-fieldset" disabled={locked}>
        <div className="form-grid invoice-batch-controls">
          <Field label="Nhà trọ"><select value={houseId} onChange={e => changeScope({ ...scope, houseId: e.target.value })}>
            {houses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select></Field>
          <Field label="Kỳ thu"><input type="month" value={period.slice(0, 7)} required
            onChange={e => changeScope({ ...scope, billingPeriod: e.target.value ? `${e.target.value}-01` : '' })} /></Field>
          <Field label="Hạn thanh toán"><input type="date" value={dueDate} required disabled={!period}
            onChange={e => { const value = e.target.value; updateDraft(previous => ({ ...previous, dueDate: value })); }} /></Field>
        </div>
        <p className={storageFailed ? 'form-error' : 'muted'} role={storageFailed ? 'alert' : undefined}>
          {storageFailed ? 'Chưa lưu được chỉ số trên trình duyệt này. Các ô đang nhập có thể bị mất khi đóng hộp thoại.'
            : 'Chỉ số tự lưu trên trình duyệt này theo nhà trọ và kỳ thu.'}
        </p>
        {period && !current && <p role="status">Đang tải các phòng cần nhập chỉ số…</p>}
        {current?.error && <p className="form-error" role="alert">{current.error}</p>}
        {current && <div className="invoice-batch-list-header">
          <h3 className="small-title">Danh sách phòng</h3>
          <Button onClick={() => setReload(v => v + 1)}>Tải lại danh sách</Button>
        </div>}
        {current?.rooms?.length === 0 && <Empty title="Chưa có phòng cần nhập chỉ số" />}
        <div className="invoice-batch-rooms">{rows.map(({ room, total, submission }) => {
          const contractId = room.contractId;
          const blocked = room.invoiceId || room.blockedReason;
          return <section className="flat-surface padded stack" key={contractId}>
            <div className="list-row">
              <div><strong>Phòng {room.roomCode}</strong><small className="cell-sub">{room.contractNumber}</small></div>
              {room.invoiceStatus === 'DRAFT' ? <Badge tone="green"><Icon name="check" />Đã tạo bản nháp</Badge>
                : room.invoiceStatus ? <Badge status={room.invoiceStatus} />
                : blocked ? <span className="muted">{room.blockedReason || 'Đã có hóa đơn trong kỳ'}</span> : <label className="checkbox-row">
                <input type="checkbox" checked={!excluded[contractId]} aria-label={`Chọn phòng ${room.roomCode}`}
                  onChange={e => { const checked = e.target.checked; updateDraft(previous => ({
                    ...previous, excluded: { ...previous.excluded, [contractId]: !checked },
                  })); }} /> Tạo hóa đơn
              </label>}
            </div>
            {!blocked && room.services.map(service => {
              const values = readings[contractId]?.[service.roomServiceId] || {};
              const label = `${service.name} · ${room.roomCode}`;
              return <div className="stack" key={service.roomServiceId}>
                <strong>{service.name} · {money(service.unitPrice)} / {service.unit}</strong>
                <div className="form-grid">
                  <Field label={`Chỉ số đầu · ${label}`}>
                    {service.previousReading !== null ? <output>{service.previousReading}</output>
                      : <input name={`batch-${contractId}-${service.roomServiceId}-previous`} type="number" min="0" step="0.001" disabled={excluded[contractId]} value={values.previousReading ?? ''}
                        onChange={e => setReading(contractId, service.roomServiceId, 'previousReading', e.target.value)} />}
                  </Field>
                  <Field label={`Chỉ số cuối · ${label}`}><input name={`batch-${contractId}-${service.roomServiceId}-current`} type="number" min="0" step="0.001" disabled={excluded[contractId]}
                    value={values.currentReading ?? ''} onChange={e => setReading(contractId, service.roomServiceId, 'currentReading', e.target.value)} /></Field>
                </div>
              </div>;
            })}
            {!blocked && <div className="total-line">
              <span>{submission ? 'Tổng hóa đơn' : 'Chờ chỉ số hợp lệ'}</span>
              <strong>{money(total)}</strong>
            </div>}
          </section>;
        })}</div>
      </fieldset>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <Button type="submit" variant="primary" disabled={saving || (!retry && (!ready.length || !dueDate))}>
          {saving ? 'Đang tạo…' : retry ? 'Thử lại tạo bản nháp' : `Tạo bản nháp hóa đơn (${ready.length})`}
        </Button>
      </div>
    </form>
  </div>;
}
