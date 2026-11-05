import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

export default function AppNavbar() {
  // Lấy dữ liệu phiên đăng nhập từ AuthContext và danh sách xe đang so sánh từ CompareContext
  const { user, logout } = useAuth();
  const { ids } = useCompare();

  // Kiểm tra quyền hạn quản trị viên hoặc nhân viên
  const isStaff = user && ['staff', 'admin'].includes(user.role);

  // Danh sách các mục quản lý cho staff/admin (Admin có thêm quản lý Xe, Hãng, Loại, Tài khoản)
  const adminNavItems = [
    ['', 'Tổng quan'],
    ...(user?.role === 'admin' ? [
      ['cars', 'Xe'],
      ['brands', 'Hãng'],
      ['types', 'Loại xe']
    ] : []),
    ['consultations', 'Tư vấn'],
    ['testdrives', 'Lái thử'],
    ['orders', 'Đơn mua'],
    ...(user?.role === 'admin' ? [['users', 'Tài khoản']] : [])
  ];

  return (
    <header className="site-header">
      <div className="nav-main">
        {/* Logo thương hiệu - Điều hướng về Trang chủ (/) */}
        <Link className="brand" to="/">
          <img src="/images/carstore-logo.png" alt="CarStore" />
        </Link>

        {/* Menu chính dành cho mọi khách truy cập */}
        <nav aria-label="Menu chính">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/cars">Bộ sưu tập</NavLink>
          <NavLink to="/compare">So sánh ({ids.length})</NavLink>
          <NavLink to="/consultations/new">Tư vấn</NavLink>
          <NavLink to="/testdrives/new">Lái thử</NavLink>
        </nav>

        {/* Khu vực trạng thái tài khoản: Nếu đã đăng nhập thì hiện tên & nút đăng xuất, chưa đăng nhập thì hiện nút Đăng nhập / Đăng ký */}
        <div className="account-menu">
          {user ? (
            <>
              {/* Điều hướng sang trang Hồ sơ cá nhân (/profile) */}
              <Link to="/profile">{user.name}</Link>
              <button className="secondary" onClick={() => logout()}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              {/* Điều hướng sang trang Đăng nhập (/login) hoặc Đăng ký (/register) */}
              <Link to="/login">Đăng nhập</Link>
              <Link className="button" to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>

      {/* Menu bổ sung cho khách hàng đã đăng nhập - Quản lý lịch sử tư vấn, lái thử, đơn mua */}
      {user && (
        <nav className="user-nav" aria-label="Tài khoản">
          <NavLink to="/my/consultations">Tư vấn của tôi</NavLink>
          <NavLink to="/my/testdrives">Lịch lái thử của tôi</NavLink>
          <NavLink to="/my/orders">Đơn đặt mua của tôi</NavLink>
          <NavLink to="/profile">Hồ sơ</NavLink>
        </nav>
      )}

      {/* Menu dành riêng cho nhân viên và admin - Map danh sách các route quản trị */}
      {isStaff && (
        <nav className="admin-nav" aria-label="Quản lý">
          <strong>QUẢN LÝ</strong>
          {/* Map danh sách mảng adminNavItems thành các thẻ NavLink điều hướng đến /admin/[path] */}
          {adminNavItems.map(([path, label]) => (
            <NavLink key={path} end to={'/admin' + (path ? '/' + path : '')}>
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
