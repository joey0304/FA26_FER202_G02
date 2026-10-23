import {useState} from 'react';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
export default function LoginPage() {
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const {login}=useAuth(),navigate=useNavigate(),location=useLocation();
  async function submit(e){e.preventDefault();const form=new FormData(e.currentTarget);setBusy(true);setError('');try{await login(form.get('email'),form.get('password'));navigate(location.state?.from||'/',{replace:true});}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <div className="auth-layout"><div className="auth-photo"><img src="/images/02_2023-porsche-911-gt3-rs.jpg" alt="Porsche 911 GT3 RS"/><div><p className="eyebrow">CHÀO MỪNG ĐẾN CARSTORE</p><h2>Hành trình mới<br/>bắt đầu tại đây.</h2></div></div><form className="panel auth-form" onSubmit={submit}><h1>Đăng nhập</h1><p>Theo dõi yêu cầu và lịch hẹn của bạn.</p>{error&&<p role="alert" className="error">{error}</p>}
    <label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required/></label><button disabled={busy}>{busy?'Đang đăng nhập...':'Đăng nhập'}</button><p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
    <details className="demo-accounts"><summary>Tài khoản demo để thử chức năng</summary><p>Admin: admin@carstore.local / Admin123!</p><p>Nhân viên: staff@carstore.local / Staff123!</p><p>Khách: customer@carstore.local / Customer123!</p><small>Chỉ dùng dữ liệu thử nghiệm trong đồ án.</small></details>
  </form></div>;
}
