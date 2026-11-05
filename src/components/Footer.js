import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Thông tin giới thiệu chung về website */}
      <div>
        <h2>CARSTORE</h2>
        <p>Không gian dành cho những người yêu xe.</p>
        <p className="muted">Project FER • ReactJS • Dữ liệu mô phỏng</p>
      </div>

      {/* Cột điều hướng: Nhóm chức năng Khám phá (Bộ sưu tập & So sánh xe) */}
      <div>
        <h3>Khám phá</h3>
        <Link to="/cars">Bộ sưu tập</Link>
        <Link to="/compare">So sánh xe</Link>
      </div>

      {/* Cột điều hướng: Nhóm chức năng Trải nghiệm (Tạo yêu cầu tư vấn & Đặt lịch lái thử) */}
      <div>
        <h3>Trải nghiệm</h3>
        <Link to="/consultations/new">Yêu cầu tư vấn</Link>
        <Link to="/testdrives/new">Đăng ký lái thử</Link>
      </div>

      {/* Ghi chú chân trang về bản quyền và nguồn dữ liệu */}
      <p className="footer-note">
        Ảnh sử dụng từ bộ Images.zip được cung cấp. Giá và thông số là dữ liệu phục vụ đồ án; không phải báo giá chính hãng.
      </p>
    </footer>
  );
}
