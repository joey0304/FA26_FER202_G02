// Chức năng: tài khoản đăng ký luôn có quyền customer, do dịch vụ local quyết định.
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {storeRequest} from '../services/carStoreService';
export default function RegisterPage(){const [error,setError]=useState(''),[busy,setBusy]=useState(false);const navigate=useNavigate();
 async function submit(e){e.preventDefault();setBusy(true);try{await storeRequest('register','POST',Object.fromEntries(new FormData(e.currentTarget)));navigate('/login');}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <form className="panel narrow" onSubmit={submit}><h1>Đăng ký</h1>{error&&<p role="alert" className="error">{error}</p>}<label>Họ tên<input name="name" required/></label><label>Email<input name="email" type="email" required/></label><label>Mật khẩu (ít nhất 8 ký tự)<input name="password" type="password" minLength={8} required/></label><button disabled={busy}>Tạo tài khoản</button></form>;
}
