import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storeRequest } from '../services/carStoreService';

export default function ProfilePage() {
    // Lấy thông tin user đăng nhập, hàm cập nhật user và hàm đăng xuất từ AuthContext
    const { user, setUser, logout } = useAuth();

    // State lưu dữ liệu form hồ sơ, khởi tạo từ thông tin user hiện tại
    const [form, setForm] = useState({
        ...user,
        password: ''
    });

    // Thông báo trạng thái cập nhật (thành công hoặc lỗi)
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    // Xử lý lưu thông tin cập nhật (Tên, SĐT, Đổi mật khẩu)
    async function save(e) {
        e.preventDefault();

        try {
            // Gửi PUT request tới endpoint 'users/:id' để cập nhật dữ liệu vào SQLite
            const updated = await storeRequest(
                'users/' + user.id,
                'PUT',
                form
            );

            // Cập nhật lại thông tin user trong Context toàn cục
            setUser(updated);

            // Reset trường mật khẩu sau khi lưu thành công
            setForm({
                ...updated,
                password: ''
            });

            setMessage('Đã cập nhật hồ sơ');
        } catch (e) {
            setMessage(e.message);
        }
    }

    // Xử lý tự xóa tài khoản của người dùng
    async function remove() {
        if (!window.confirm(
            'Xóa tài khoản của bạn? Tài khoản đã có nghiệp vụ sẽ được vô hiệu hóa.'
        )) {
            return;
        }

        try {
            // Gửi DELETE request tới endpoint 'users/:id'
            await storeRequest(
                'users/' + user.id,
                'DELETE'
            );

            // Đăng xuất và điều hướng về Trang chủ (/)
            await logout();
            navigate('/');
        } catch (e) {
            setMessage(e.message);
        }
    }

    // Cấu hình các trường nhập liệu trong form hồ sơ cá nhân
    const profileFields = [
        {
            key: 'name',
            label: 'Họ tên'
        },
        {
            key: 'phone',
            label: 'Số điện thoại'
        },
        {
            key: 'password',
            label: 'Mật khẩu mới (để trống nếu giữ nguyên)',
            type: 'password'
        }
    ];

    return (
        <form
            className="panel narrow"
            onSubmit={save}
        >
            <h1>Hồ sơ cá nhân</h1>

            {/* Hiển thị email và vai trò (role) của tài khoản */}
            <p>
                {user.email} • {user.role}
            </p>

            {/* Thông báo kết quả thao tác (Cập nhật thành công / Báo lỗi) */}
            <p role="status">
                {message}
            </p>

            {/* Map qua mảng profileFields để render các ô input */}
            {profileFields.map(f => (
                <label key={f.key}>
                    {f.label}

                    <input
                        required={f.key === 'name'}
                        type={f.type || 'text'}
                        value={form[f.key] || ''}
                        onChange={e =>
                            setForm({
                                ...form,
                                [f.key]: e.target.value
                            })
                        }
                    />
                </label>
            ))}

            {/* Nút lưu thay đổi */}
            <button>
                Lưu hồ sơ
            </button>

            {/* Nút xóa tài khoản (Chỉ hiển thị cho khách và staff, không áp dụng cho Admin tối cao) */}
            {user.role !== 'admin' && (
                <button
                    type="button"
                    className="danger"
                    onClick={remove}
                >
                    Xóa tài khoản
                </button>
            )}
        </form>
    );
}
