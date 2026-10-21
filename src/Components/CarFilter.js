import { useEffect, useState } from 'react';
import { storeRequest } from '../services/carStoreService';

export default function CarFilter({ value, onChange }) {
    const [cats, setCats] = useState([[], []]), [error, setError] = useState('');
    useEffect(() => { Promise.all([storeRequest('brands'), storeRequest('types')]).then(setCats).catch(e => setError(e.message)); }, []);
    const change = e => onChange({ ...value, [e.target.name]: e.target.value });
    return <div className="filter-panel">
        <label>Tìm xe<input name="q" placeholder="Tên hoặc mã xe..." value={value.q} onChange={change} /></label>
        {['brand', 'type'].map((key, i) => <label key={key}>{i ? 'Loại xe' : 'Hãng xe'}<select name={key} value={value[key]} onChange={change}><option value="">Tất cả</option>{cats[i].filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>)}
        <label>Giá từ (VNĐ)<input name="min" type="number" min="0" placeholder="Không giới hạn" value={value.min} onChange={change} /></label>
        <label>Giá đến (VNĐ)<input name="max" type="number" min="0" placeholder="Không giới hạn" value={value.max} onChange={change} /></label>
        <label>Sắp xếp<select name="sort" value={value.sort} onChange={change}><option value="default">Mặc định</option><option value="priceAsc">Giá tăng dần</option><option value="priceDesc">Giá giảm dần</option><option value="yearDesc">Năm mới nhất</option><option value="name">Tên A–Z</option></select></label>
        {error && <p className="error">{error}</p>}
    </div>;
}
