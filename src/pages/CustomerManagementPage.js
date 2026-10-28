import CrudPage from '../components/CrudPage';
import { activeField } from '../components/fields';

const roleOptions = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'admin', label: 'Quản trị viên' },
];

const roleLabels = Object.fromEntries(
  roleOptions.map((role) => [role.value, role.label]),
);

const accountFields = [
  {
    key: 'name',
    label: 'Họ tên',
  },
  {
    key: 'phone',
    label: 'Điện thoại',
    required: false,
  },
  {
    key: 'role',
    label: 'Quyền',
    options: roleOptions,
  },
  activeField,
];

const accountColumns = [
  {
    key: 'name',
    label: 'Họ tên',
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'role',
    label: 'Quyền',
    render: (account) => roleLabels[account.role] || account.role,
  },
  {
    key: 'active',
    label: 'Hoạt động',
    render: (account) =>
      Number(account.active) === 1 ? 'Đang hoạt động' : 'Đã khóa',
  },
];

export default function CustomerManagementPage() {
  return (
    <CrudPage
      resource="users"
      title="Quản lý tài khoản / khách hàng"
      canCreate={false}
      fields={accountFields}
      columns={accountColumns}
      allowDelete={(account) => account.role !== 'admin'}
    />
  );
}
