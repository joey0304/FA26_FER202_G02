import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    // State lưu thông báo lỗi và trạng thái đang xử lý (loading/busy)
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    // Lấy hàm login từ AuthContext để xác thực người dùng
    const { login } = useAuth();
    // Hook điều hướng và lấy thông tin vị trí URL trước đó
    const navigate = useNavigate();
    const location = useLocation();

    // Xử lý gửi form đăng nhập
    async function submit(e) {
        e.preventDefault();

        // Thu thập giá trị từ các trường input trong form
        const form = new FormData(e.currentTarget);

        setBusy(true);
        setError('');

        try {
            // Gọi hàm login từ AuthContext với email và password từ form
            await login(
                form.get('email'),
                form.get('password')
            );

            // Điều hướng người dùng về trang họ muốn vào trước đó (location.state.from) hoặc về Trang chủ (/)
            navigate(
                location.state?.from || '/',
                { replace: true }
            );
        } catch (e) {
            // Bắt và hiển thị lỗi từ API (sai mật khẩu, tài khoản bị khóa...)
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth-layout">
            {/* Banner hình ảnh minh họa cho trang xác thực */}
            <div className="auth-photo">
                <img
                    src="/images/02_2023-porsche-911-gt3-rs.jpg"
                    alt="Porsche 911 GT3 RS"
                />

                <div>
                    <p className="eyebrow">
                        CHÀO MỪNG ĐẾN CARSTORE
                    </p>

                    <h2>
                        Hành trình mới
                        <br />
                        bắt đầu tại đây.
                    </h2>
                </div>
            </div>

            {/* Form đăng nhập */}
            <form
                className="panel auth-form"
                onSubmit={submit}
            >
                <h1>Đăng nhập</h1>

                <p>
                    Theo dõi yêu cầu và lịch hẹn của bạn.
                </p>

                {/* Hiển thị thông báo lỗi khi đăng nhập không thành công */}
                {error && (
                    <p role="alert" className="error">
                        {error}
                    </p>
                )}

                {/* Nhập email đăng nhập */}
                <label>
                    Email
                    <input
                        name="email"
                        type="email"
                        autoComplete="username"
                        required
                    />
                </label>

                {/* Nhập mật khẩu */}
                <label>
                    Mật khẩu
                    <input
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                    />
                </label>

                {/* Nút gửi form, tự động vô hiệu hóa khi đang gửi request */}
                <button disabled={busy}>
                    {busy
                        ? 'Đang đăng nhập...'
                        : 'Đăng nhập'
                    }
                </button>

                {/* Điều hướng sang trang Đăng ký (/register) nếu chưa có tài khoản */}
                <p>
                    Chưa có tài khoản?{' '}
                    <Link to="/register">
                        Đăng ký ngay
                    </Link>
                </p>

                {/* Danh sách các tài khoản có sẵn trong DB để test chức năng */}
                <details className="demo-accounts">
                    <summary>
                        Tài khoản demo để thử chức năng
                    </summary>

                    <p>
                        Admin: admin@carstore.local / Admin123!
                    </p>

                    <p>
                        Nhân viên: staff@carstore.local / Staff123!
                    </p>

                    <p>
                        Khách: customer@carstore.local / Customer123!
                    </p>

                    <small>
                        Chỉ dùng dữ liệu thử nghiệm trong đồ án.
                    </small>
                </details>
            </form>
        </div>
    );
}
