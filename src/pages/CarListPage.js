import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeRequest } from '../services/carStoreService';
import CarCard from '../components/CarCard';
import CarFilter from '../components/CarFilter';
import { useCompare } from '../context/CompareContext';
const empty = { q: '', brand: '', type: '', min: '', max: '', sort: 'default' };
export default function CarListPage() {
    const [cars, setCars] = useState([]), [error, setError] = useState(''), [filter, setFilter] = useState(empty), [page, setPage] = useState(1);
    const { ids } = useCompare();
    useEffect(() => { storeRequest('cars').then(setCars).catch(e => setError(e.message)); }, []);
    function change(next) { setFilter(next); setPage(1); }
    const visible = cars.filter(c => c.active && (c.name + ' ' + c.code).toLowerCase().includes(filter.q.toLowerCase()) && (!filter.brand || c.brand_id === Number(filter.brand)) && (!filter.type || c.type_id === Number(filter.type)) && (!filter.min || c.price >= Number(filter.min)) && (!filter.max || c.price <= Number(filter.max)));
    visible.sort((a, b) => filter.sort === 'priceAsc' ? a.price - b.price : filter.sort === 'priceDesc' ? b.price - a.price : filter.sort === 'yearDesc' ? b.year - a.year : filter.sort === 'name' ? a.name.localeCompare(b.name) : a.id - b.id);
    const total = Math.max(1, Math.ceil(visible.length / 9));
    return <>
        <div className="page-heading"><div><p className="eyebrow">BỘ SƯU TẬP CARSTORE</p><h1>Chọn chiếc xe của bạn</h1><p>Khám phá {cars.filter(c => c.active).length} mẫu xe từ bộ ảnh Porsche.</p></div><Link className="button secondary" to="/compare">So sánh xe ({ids.length})</Link></div>
        <CarFilter value={filter} onChange={change} />
        {error && <p className="error" role="alert">{error}</p>}
        <div className="results-line"><span>{visible.length} xe phù hợp</span><button className="text-button" onClick={() => change(empty)}>Xóa bộ lọc</button></div>
        <div className="car-grid">{visible.slice((page - 1) * 9, page * 9).map(c => <CarCard key={c.id} car={c} onError={setError} />)}</div>
        {!visible.length && <div className="empty">Không tìm thấy xe. Hãy thử thay đổi bộ lọc.</div>}
        <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button><span>Trang {page} / {total}</span><button disabled={page >= total} onClick={() => setPage(page + 1)}>Sau →</button></div>
    </>;
}
