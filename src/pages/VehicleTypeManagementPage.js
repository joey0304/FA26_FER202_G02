import CrudPage from '../components/CrudPage';
import { activeField } from '../components/fields';
export default function VehicleTypeManagementPage() {
    return <CrudPage resource="types" title="Quản lý loại xe" defaults={{ active: 1, description: '', logo: '' }}
        fields={[{ key: 'name', label: 'Tên loại xe' }, { key: 'description', label: 'Mô tả', type: 'textarea', required: false }, { key: 'logo', label: 'Đường dẫn ảnh/logo', required: false }, activeField]}
        columns={[{ key: 'name', label: 'Tên loại xe' }, { key: 'description', label: 'Mô tả' }, { key: 'logo', label: 'Ảnh', render: r => r.logo ? <img className="table-logo" src={r.logo} alt={r.name} /> : 'Chưa có' }, { key: 'active', label: 'Hoạt động', render: r => r.active ? 'Có' : 'Không' }]} />;
}
