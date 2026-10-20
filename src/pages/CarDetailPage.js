import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { storeRequest, money } from '../services/carStoreService';
import { useCompare } from '../context/CompareContext';
export default function CarDetailPage() {
    const { id } = useParams(), { ids, toggle } = useCompare();
    const [car, setCar] = useState(null), [cats, setCats] = useState([[], []]), [error, setError] = useState('');
    useEffect(() => { setCar(null); setError(''); Promise.all([storeRequest('cars/' + id), storeRequest('brands'), storeRequest('types')]).then(([c, b, t]) => { setCar(c); setCats([b, t]); }).catch(e => setError(e.message)); }, [id]);
    if (!car) return <p role="status">{error || 'Đang tải xe...'}</p>;
    function compare() { try { toggle(car.id); setError(''); } catch (e) { setError(e.message); } }
    return <><div className="breadcrumb"><Link to="/cars">Bộ sưu tập</Link><span>/</span><span>{car.name}</span></div>{error && <p className="error" role="alert">{error}</p>}
        <div className="detail-layout"><div><img className="detail-photo" src={car.image} alt={car.name} /></div><div className="detail-info"><p className="eyebrow">{cats[0].find(x => x.id === car.brand_id)?.name || 'Hãng xe'}</p><h1>{car.name}</h1><p className="price large">{money(car.price)}</p><p className="muted">Giá tham khảo phục vụ đồ án</p><p>{car.stock > 0 ? car.stock + ' xe khả dụng' : 'Tạm hết xe'}</p><dl className="spec-grid">{[['Mã xe', car.code], ['Kiểu dáng', cats[1].find(x => x.id === car.type_id)?.name], ['Năm', car.year], ['Nhiên liệu', car.fuel], ['Hộp số', car.transmission], ['Số chỗ', car.seats]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <div className="actions">{car.active && car.stock > 0 && <Link className="button" to={'/orders/new?car=' + car.id}>Gửi yêu cầu đặt mua</Link>}<button className="secondary" onClick={compare}>{ids.includes(car.id) ? '✓ Đã chọn so sánh' : '+ Thêm so sánh'}</button></div><div className="actions"><Link to={'/consultations/new?car=' + car.id}>Tư vấn mẫu xe →</Link>{!!car.test_drive && !!car.active && <Link to={'/testdrives/new?car=' + car.id}>Đăng ký lái thử →</Link>}</div></div></div>
        <section className="panel description"><h2>Thông tin mẫu xe</h2><p className="preline">{car.specs || 'Chưa có thông tin bổ sung.'}</p></section>
    </>;
}
