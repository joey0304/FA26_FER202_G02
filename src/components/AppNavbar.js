import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const { ids } = useCompare();

  const isStaff = user && ['staff', 'admin'].includes(user.role);

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
        <Link className="brand" to="/">
          <img src="/images/carstore-logo.png" alt="CarStore" />
        </Link>

        <nav aria-label="Menu chính">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/cars">Bộ sưu tập</NavLink>
          <NavLink to="/compare">So sánh ({ids.length})</NavLink>
          <NavLink to="/consultations/new">Tư vấn</NavLink>
          <NavLink to="/testdrives/new">Lái thử</NavLink>
        </nav>

        <div className="account-menu">
          {user ? (
            <>
              <Link to="/profile">{user.name}</Link>
              <button className="secondary" onClick={() => logout()}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link className="button" to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>

      {user && (
        <nav className="user-nav" aria-label="Tài khoản">
          <NavLink to="/my/consultations">Tư vấn của tôi</NavLink>
          <NavLink to="/my/testdrives">Lịch lái thử của tôi</NavLink>
          <NavLink to="/my/orders">Đơn đặt mua của tôi</NavLink>
          <NavLink to="/profile">Hồ sơ</NavLink>
        </nav>
      )}

      {isStaff && (
        <nav className="admin-nav" aria-label="Quản lý">
          <strong>QUẢN LÝ</strong>
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
