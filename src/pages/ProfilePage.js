// Chức năng: chỉ lấy /me; dịch vụ local không cho khách hàng đổi role/active/email.
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {storeRequest} from '../services/carStoreService';
export default function ProfilePage(){const {user,setUser,logout}=useAuth();const [form,setForm]=useState({...user,password:''}),[message,setMessage]=useState('');const navigate=useNavigate();
 async function save(e){e.preventDefault();try{const updated=await storeRequest('users/'+user.id,'PUT',form);setUser(updated);setForm({...updated,password:''});setMessage('Đã cập nhật hồ sơ');}catch(e){setMessage(e.message);}}
 async function remove(){if(!window.confirm('Xóa tài khoản của bạn?'))return;try{await storeRequest('users/'+user.id,'DELETE');await logout();navigate('/');}catch(e){setMessage(e.message);}}
 return <form className="panel narrow" onSubmit={save}><h1>Hồ sơ cá nhân</h1><p>{user.email} • {user.role}</p><p role="status">{message}</p>{[{key:'name',label:'Họ tên'},{key:'phone',label:'Số điện thoại'},{key:'password',label:'Mật khẩu mới (để trống nếu giữ nguyên)',type:'password'}].map(f=><label key={f.key}>{f.label}<input required={f.key==='name'} type={f.type||'text'} value={form[f.key]||''} onChange={e=>setForm({...form,[f.key]:e.target.value})}/></label>)}<button>Lưu hồ sơ</button>{user.role!=='admin'&&<button type="button" className="danger" onClick={remove}>Xóa tài khoản</button>}</form>;
}
