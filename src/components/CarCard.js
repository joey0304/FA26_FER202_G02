import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { money } from "../services/carStoreService";

export default function CarCard({ car, onError = () => {} }) {
  // Lấy danh sách xe đang so sánh và thao tác cập nhật danh sách đó.
  const { ids, toggle } = useCompare();

  // Thêm hoặc bỏ xe khỏi danh sách so sánh, đồng thời báo lỗi cho trang cha.
  function compare() {
    try {
      toggle(car.id);
      onError("");
    } catch (error) {
      onError(error.message);
    }
  }

  return (
    <article className="car-card">
      {/* Ảnh và nhãn năm của xe cùng liên kết đến trang chi tiết. */}
      <Link to={"/cars/" + car.id} className="car-photo">
        <img
          loading="lazy"
          src={car.image || "/images/carstore-logo.png"}
          alt={car.name}
        />
        <span className="year-tag">{car.year}</span>
      </Link>

      {/* Hiển thị thông tin cơ bản và các thao tác dành cho xe. */}
      <div className="car-card-body">
        <p className="eyebrow">
          {car.fuel} / {car.transmission}
        </p>
        <h2>
          <Link to={"/cars/" + car.id}>{car.name}</Link>
        </h2>
        <p className="price">{money(car.price)}</p>
        <p className="stock">
          {car.stock > 0 ? car.stock + " xe khả dụng" : "Tạm hết xe"} •{" "}
          {car.seats} chỗ
        </p>

        <div className="card-actions">
          <Link to={"/cars/" + car.id}>Khám phá xe →</Link>
          <button
            className="compare-button"
            aria-pressed={ids.includes(car.id)}
            onClick={compare}
          >
            {ids.includes(car.id) ? "✓ Đã chọn" : "+ So sánh"}
          </button>
        </div>
      </div>
    </article>
  );
}
