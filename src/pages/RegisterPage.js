import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeRequest } from '../services/carStoreService';

export default function RegisterPage() {
    // State lưu thông báo lỗi và trạng thái đang gửi request (busy)
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const navigate = useNavigate();

    // Xử lý gửi form đăng ký tài khoản khách hàng mới
    async function submit(e) {
        e.preventDefault();
        setBusy(true);

        try {
            // Chuyển toàn bộ dữ liệu FormData thành object { name, email, password }
            await storeRequest(
                'register',
                'POST',
                Object.fromEntries(
                    new FormData(e.currentTarget)
                )
            );

            // Đăng ký thành công -> Điều hướng sang trang Đăng nhập (/login)
            navigate('/login');
        } catch (e) {
            // Hiển thị lỗi (Email đã tồn tại, mật khẩu quá ngắn...)
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <form
            className="panel narrow"
            onSubmit={submit}
        >
            <h1>Đăng ký</h1>

            {/* Thông báo lỗi khi đăng ký không hợp lệ */}
            {error && (
                <p role="alert" className="error">
                    {error}
                </p>
            )}

            {/* Nhập họ và tên */}
            <label>
                Họ tên
                <input
                    name="name"
                    required
                />
            </label>

            {/* Nhập địa chỉ email */}
            <label>
                Email
                <input
                    name="email"
                    type="email"
                    required
                />
            </label>

            {/* Nhập mật khẩu (tối thiểu 8 ký tự theo quy định backend) */}
            <label>
                Mật khẩu (ít nhất 8 ký tự)
                <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                />
            </label>

            {/* Nút gửi tạo tài khoản, disable khi đang xử lý */}
            <button disabled={busy}>
                Tạo tài khoản
            </button>
        </form>
    );
}
