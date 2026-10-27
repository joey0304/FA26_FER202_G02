import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Giới thiệu ngắn về cửa hàng và thông tin đồ án. */}
      <div>
        <h2>CARSTORE</h2>
        <p>Không gian dành cho những người yêu xe.</p>
        <p className="muted">Project FER • ReactJS • Dữ liệu mô phỏng</p>
      </div>

      {/* Liên kết đến các trang khám phá xe. */}
      <div>
        <h3>Khám phá</h3>
        <Link to="/cars">Bộ sưu tập</Link>
        <Link to="/compare">So sánh xe</Link>
      </div>

      {/* Liên kết đến các chức năng dịch vụ. */}
      <div>
        <h3>Trải nghiệm</h3>
        <Link to="/consultations/new">Yêu cầu tư vấn</Link>
        <Link to="/testdrives/new">Đăng ký lái thử</Link>
      </div>

      {/* Ghi chú nguồn ảnh và tính chất tham khảo của dữ liệu. */}
      <p className="footer-note">
        Ảnh sử dụng từ bộ Images.zip được cung cấp. Giá và thông số là dữ liệu
        phục vụ đồ án; không phải báo giá chính hãng.
      </p>
    </footer>
  );
}
