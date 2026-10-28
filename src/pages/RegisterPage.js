import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storeRequest } from '../services/carStoreService';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const accountData = Object.fromEntries(formData.entries());

    setBusy(true);
    setError('');

    try {
      await storeRequest('register', 'POST', accountData);
      navigate('/login');
    } catch (registrationError) {
      setError(
        registrationError.message || 'Không thể tạo tài khoản. Vui lòng thử lại.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel narrow" onSubmit={handleSubmit}>
      <h1>Đăng ký</h1>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <label htmlFor="register-name">
        Họ tên
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          required
        />
      </label>

      <label htmlFor="register-email">
        Email
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label htmlFor="register-password">
        Mật khẩu (ít nhất 8 ký tự)
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      <button type="submit" disabled={busy}>
        {busy ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
      </button>

      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </form>
  );
}
