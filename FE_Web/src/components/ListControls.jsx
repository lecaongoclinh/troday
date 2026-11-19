import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui';

export default function ListControls() {
  const { data, route, setListQuery, loading } = useApp();
  const [query, setQuery] = useState(route.listQuery?.q || '');
  useEffect(() => setQuery(route.listQuery?.q || ''), [route.view, route.listQuery?.q]);
  const page = data.pagination;
  if (!page) return null;
  return <section className="server-list-controls" aria-label="Tìm kiếm và phân trang">
    {route.view !== 'discover' && <form onSubmit={e => { e.preventDefault(); setListQuery({ q: query.trim(), page: 1 }); }}>
      <input aria-label="Tìm trong danh sách" placeholder="Tìm trong danh sách…" value={query} onChange={e => setQuery(e.target.value)} />
      <Button type="submit" disabled={loading}>Tìm kiếm</Button>
    </form>}
    <div className="list-paging">
      <span>{page.totalItems} kết quả · Trang {page.page} / {Math.max(1, page.totalPages)}</span>
      <label>Số dòng <select aria-label="Số dòng mỗi trang" value={page.pageSize} onChange={e => setListQuery({ pageSize: Number(e.target.value), page: 1 })}>{[10, 20, 50, 100].map(size => <option key={size}>{size}</option>)}</select></label>
      <Button disabled={loading || page.page <= 1} onClick={() => setListQuery({ page: page.page - 1 })}>Trước</Button>
      <Button disabled={loading || !page.hasNext} onClick={() => setListQuery({ page: page.page + 1 })}>Sau</Button>
    </div>
  </section>;
}
