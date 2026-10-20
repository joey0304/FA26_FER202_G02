import { useEffect, useState } from 'react';
import CrudPage from '../components/CrudPage';
import { activeField } from '../components/fields';
import { storeRequest } from '../services/carStoreService';
export default function CarManagementPage() {
    const [cats, setCats] = useState(null), [error, setError] = useState('');
    useEffect(() => { Promise.all([storeRequest('brands'), storeRequest('types')]).then(setCats).catch(e => setError(e.message)); }, []);
    if (error) return <p className="error">{error}</p>;
    if (!cats) return <p>Đang tải danh mục...</p>;
    const fields = [{ key: 'code', label: 'Mã xe' }, { key: 'name', label: 'Tên xe' },
    ...['brand_id', 'type_id'].map((key, i) => ({ key, label: i ? 'Loại xe' : 'Hãng xe', options: cats[i].map(c => ({ value: c.id, label: c.name + (c.active ? '' : ' (ngừng hoạt động)') })) })),
    { key: 'price', label: 'Giá tham khảo (VNĐ)', type: 'number', min: 1 }, { key: 'stock', label: 'Tồn kho khả dụng', type: 'number', min: 0 },
    { key: 'year', label: 'Năm sản xuất', type: 'number', min: 1886 }, { key: 'seats', label: 'Số chỗ', type: 'number', min: 1 },
    { key: 'fuel', label: 'Nhiên liệu', options: ['Xăng', 'Dầu', 'Hybrid', 'Điện'].map(v => ({ value: v, label: v })) },
    { key: 'transmission', label: 'Hộp số', options: ['Tự động', 'Số sàn'].map(v => ({ value: v, label: v })) },
    { key: 'image', label: 'Đường dẫn ảnh', required: false, help: 'Ví dụ: /images/01_2025-porsche-911-carrera-gts.jpg' },
    { key: 'specs', label: 'Thông số / mô tả', type: 'textarea', required: false }, activeField,
    { key: 'test_drive', label: 'Hỗ trợ lái thử', options: [{ value: 1, label: 'Có' }, { value: 0, label: 'Không' }] }];
    return <CrudPage resource="cars" title="Quản lý xe" fields={fields} defaults={{ stock: 0, active: 1, test_drive: 1, year: 2025, seats: 2, fuel: 'Xăng', transmission: 'Tự động' }}
        columns={[{ key: 'image', label: 'Ảnh', render: r => r.image ? <img className="table-car" src={r.image} alt={r.name} /> : '—' }, { key: 'code', label: 'Mã xe' }, { key: 'name', label: 'Tên xe' }, { key: 'price', label: 'Giá' }, { key: 'stock', label: 'Tồn' }, { key: 'active', label: 'Trạng thái', render: r => r.active ? 'Kinh doanh' : 'Ngừng bán' }]}
        detailFields={fields.filter(f => !['image', 'price', 'code', 'name', 'stock', 'active'].includes(f.key))} />;
}
