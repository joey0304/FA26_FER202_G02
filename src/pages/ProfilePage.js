import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storeRequest } from '../services/carStoreService';

const roleLabels = {
  admin: 'Quản trị viên',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

const profileFields = [
  {
    key: 'name',
    label: 'Họ tên',
    type: 'text',
    autoComplete: 'name',
    required: true,
  },
  {
    key: 'phone',
    label: 'Số điện thoại',
    type: 'tel',
    autoComplete: 'tel',
    inputMode: 'numeric',
    pattern: '[0-9]{10}',
    maxLength: 10,
    required: false,
    help: 'Có thể để trống; nếu nhập, số điện thoại cần đủ 10 chữ số.',
  },
  {
    key: 'password',
    label: 'Mật khẩu mới',
    type: 'password',
    autoComplete: 'new-password',
    minLength: 8,
    required: false,
    help: 'Để trống nếu bạn muốn giữ mật khẩu hiện tại.',
  },
];

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({ ...user, password: '' }));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (busyAction) {
      return;
    }

    setBusyAction('save');
    setError('');
    setMessage('');

    try {
      const updatedUser = await storeRequest(
        `users/${user.id}`,
        'PUT',
        form,
      );

      setUser(updatedUser);
      setForm({ ...updatedUser, password: '' });
      setMessage('Đã cập nhật hồ sơ.');
    } catch (saveError) {
      setError(saveError.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleDelete() {
    if (busyAction) {
      return;
    }

    const confirmed = window.confirm('Bạn có chắc muốn xóa tài khoản này?');

    if (!confirmed) {
      return;
    }

    setBusyAction('delete');
    setError('');
    setMessage('');

    try {
      await storeRequest(`users/${user.id}`, 'DELETE');
      await logout();
      navigate('/', { replace: true });
    } catch (deleteError) {
      setError(deleteError.message || 'Không thể xóa tài khoản.');
    } finally {
      setBusyAction('');
    }
  }

  const roleName = roleLabels[user.role] || user.role;

  return (
    <form className="panel narrow" onSubmit={handleSave}>
      <h1>Hồ sơ cá nhân</h1>
      <p>
        {user.email} • {roleName}
      </p>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="success">
          {message}
        </p>
      )}

      {profileFields.map((field) => (
        <label key={field.key} htmlFor={`profile-${field.key}`}>
          {field.label}
          <input
            id={`profile-${field.key}`}
            name={field.key}
            type={field.type}
            autoComplete={field.autoComplete}
            inputMode={field.inputMode}
            pattern={field.pattern}
            minLength={field.minLength}
            maxLength={field.maxLength}
            required={field.required}
            value={form[field.key] || ''}
            onChange={handleChange}
          />
          {field.help && <small>{field.help}</small>}
        </label>
      ))}

      <button type="submit" disabled={Boolean(busyAction)}>
        {busyAction === 'save' ? 'Đang lưu...' : 'Lưu hồ sơ'}
      </button>

      {user.role !== 'admin' && (
        <button
          type="button"
          className="danger"
          onClick={handleDelete}
          disabled={Boolean(busyAction)}
        >
          {busyAction === 'delete' ? 'Đang xóa...' : 'Xóa tài khoản'}
        </button>
      )}
    </form>
  );
}
