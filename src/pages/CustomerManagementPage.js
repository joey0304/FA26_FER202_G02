// Chức năng: admin đọc danh sách, đổi quyền và khóa/mở tài khoản.
// Create tài khoản qua RegisterPage; không cho admin tự hạ quyền/khóa chính mình.
import CrudPage from '../components/CrudPage';
import {activeField} from '../components/fields';
export default function CustomerManagementPage(){return <CrudPage resource="users" title="Quản lý tài khoản / khách hàng" canCreate={false} fields={[{key:'name',label:'Họ tên'},{key:'phone',label:'Điện thoại',required:false},{key:'role',label:'Quyền',options:['customer','staff','admin'].map(value=>({value,label:value}))},activeField]} columns={[{key:'name',label:'Họ tên'},{key:'email',label:'Email'},{key:'role',label:'Quyền'},{key:'active',label:'Hoạt động'}]}/>;}
