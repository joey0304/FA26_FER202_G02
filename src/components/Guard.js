import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guard bảo vệ điều hướng giao diện; không thay thế bảo mật phía máy chủ.
export default function Guard({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Chờ khôi phục phiên đăng nhập trước khi quyết định điều hướng.
  if (loading) {
    return <p>Đang tải phiên...</p>;
  }

  // Chuyển khách chưa đăng nhập đến trang đăng nhập và lưu đường dẫn ban đầu.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Hiển thị thông báo nếu người dùng không có vai trò được phép.
  if (roles && !roles.includes(user.role)) {
    return (
      <p className="error" role="alert">
        Bạn không có quyền truy cập trang này.
      </p>
    );
  }

  // Cho phép hiển thị trang khi phiên và quyền truy cập hợp lệ.
  return children;
}
