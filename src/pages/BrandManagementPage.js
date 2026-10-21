import CrudPage from '../components/CrudPage';
import { activeField } from '../components/fields';
export default function BrandManagementPage() {
    return <CrudPage resource="brands" title="Quản lý hãng xe" defaults={{ active: 1, description: '', logo: '' }}
        fields={[{ key: 'name', label: 'Tên hãng' }, { key: 'description', label: 'Mô tả', type: 'textarea', required: false }, { key: 'logo', label: 'Đường dẫn logo', required: false }, activeField]}
        columns={[{ key: 'name', label: 'Tên hãng' }, { key: 'description', label: 'Mô tả' }, { key: 'logo', label: 'Logo', render: r => r.logo ? <img className="table-logo" src={r.logo} alt={r.name} /> : 'Chưa có' }, { key: 'active', label: 'Hoạt động', render: r => r.active ? 'Có' : 'Không' }]} />;
}
