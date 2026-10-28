import { useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    setBusy(true);
    setError('');

    try {
      await login(email, password);

      const destination = location.state?.from || '/';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Đăng nhập không thành công.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-photo">
        <img
          src="/Images/02_2023-porsche-911-gt3-rs.jpg"
          alt="Porsche 911 GT3 RS"
        />

        <div>
          <p className="eyebrow">CHÀO MỪNG ĐẾN CARSTORE</p>
          <h2>
            Hành trình mới
            <br />
            bắt đầu tại đây.
          </h2>
        </div>
      </div>

      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>
        <p>Theo dõi yêu cầu và lịch hẹn của bạn.</p>

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}

        <label htmlFor="login-email">
          Email
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </label>

        <label htmlFor="login-password">
          Mật khẩu
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" disabled={busy}>
          {busy ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>

        <details className="demo-accounts">
          <summary>Tài khoản demo để thử chức năng</summary>
          <p>Admin: admin@carstore.local / Admin123!</p>
          <p>Nhân viên: staff@carstore.local / Staff123!</p>
          <p>Khách: customer@carstore.local / Customer123!</p>
          <small>Chỉ dùng dữ liệu thử nghiệm trong đồ án.</small>
        </details>
      </form>
    </div>
  );
}
