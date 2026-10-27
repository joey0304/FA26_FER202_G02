import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCompare } from "../context/CompareContext";

// Các liên kết công khai luôn hiển thị trên thanh điều hướng chính.
const mainLinks = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/cars", label: "Bộ sưu tập" },
  { to: "/compare", label: "So sánh" },
  { to: "/consultations/new", label: "Tư vấn" },
  { to: "/testdrives/new", label: "Lái thử" },
];

// Các liên kết quản lý dành cho nhân viên và quản trị viên.
const staffLinks = [
  { path: "", label: "Tổng quan" },
  { path: "cars", label: "Xe" },
  { path: "brands", label: "Hãng" },
  { path: "types", label: "Loại xe" },
  { path: "consultations", label: "Tư vấn" },
  { path: "testdrives", label: "Lái thử" },
  { path: "orders", label: "Đơn mua" },
];

export default function AppNavbar() {
  // Lấy thông tin đăng nhập và số xe người dùng đã chọn để so sánh.
  const { user, logout } = useAuth();
  const { ids } = useCompare();
  const isStaff = user && ["staff", "admin"].includes(user.role);

  // Chỉ quản trị viên mới được xem mục quản lý tài khoản.
  const managementLinks =
    user?.role === "admin"
      ? [...staffLinks, { path: "users", label: "Tài khoản" }]
      : staffLinks;

  return (
    <header className="site-header">
      <div className="nav-main">
        {/* Logo liên kết về trang chủ. */}
        <Link className="brand" to="/">
          <img src="/images/carstore-logo.png" alt="CarStore" />
        </Link>

        {/* Điều hướng các trang chính của cửa hàng. */}
        <nav aria-label="Menu chính">
          {mainLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {label}
              {to === "/compare" ? ` (${ids.length})` : ""}
            </NavLink>
          ))}
        </nav>

        {/* Hiển thị lựa chọn tài khoản tùy theo trạng thái đăng nhập. */}
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
              <Link className="button" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Các lối tắt tài khoản chỉ dành cho người dùng đã đăng nhập. */}
      {user && (
        <nav className="user-nav" aria-label="Tài khoản">
          <NavLink to="/my/consultations">Tư vấn của tôi</NavLink>
          <NavLink to="/my/testdrives">Lịch lái thử của tôi</NavLink>
          <NavLink to="/my/orders">Đơn đặt mua của tôi</NavLink>
          <NavLink to="/profile">Hồ sơ</NavLink>
        </nav>
      )}

      {/* Nhân viên và quản trị viên có menu quản lý theo quyền hạn. */}
      {isStaff && (
        <nav className="admin-nav" aria-label="Quản lý">
          <strong>QUẢN LÝ</strong>
          {managementLinks.map(({ path, label }) => (
            <NavLink
              key={path || "dashboard"}
              end
              to={`/admin${path ? `/${path}` : ""}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
