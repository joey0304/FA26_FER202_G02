import { useEffect, useState } from "react";
import { storeRequest } from "../services/carStoreService";

// Component điều khiển: trạng thái bộ lọc được quản lý ở trang danh sách xe.
export default function CarFilter({ value, onChange }) {
  const [categories, setCategories] = useState([[], []]);
  const [error, setError] = useState("");

  // Tải hãng xe và loại xe để hiển thị trong các danh sách lựa chọn.
  useEffect(() => {
    Promise.all([storeRequest("brands"), storeRequest("types")])
      .then(setCategories)
      .catch((requestError) => setError(requestError.message));
  }, []);

  // Gửi giá trị bộ lọc vừa thay đổi về component cha.
  const change = (event) =>
    onChange({
      ...value,
      [event.target.name]: event.target.value,
    });

  return (
    <div className="filter-panel">
      {/* Tìm kiếm theo tên hoặc mã xe. */}
      <label>
        Tìm xe
        <input
          name="q"
          placeholder="Tên hoặc mã xe..."
          value={value.q}
          onChange={change}
        />
      </label>

      {/* Lọc theo hãng và loại xe đang hoạt động. */}
      {["brand", "type"].map((key, index) => (
        <label key={key}>
          {index ? "Loại xe" : "Hãng xe"}
          <select name={key} value={value[key]} onChange={change}>
            <option value="">Tất cả</option>
            {categories[index]
              .filter((category) => category.active)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </label>
      ))}

      {/* Lọc theo khoảng giá; bỏ trống để không giới hạn giá. */}
      <label>
        Giá từ (VNĐ)
        <input
          name="min"
          type="number"
          min="0"
          placeholder="Không giới hạn"
          value={value.min}
          onChange={change}
        />
      </label>
      <label>
        Giá đến (VNĐ)
        <input
          name="max"
          type="number"
          min="0"
          placeholder="Không giới hạn"
          value={value.max}
          onChange={change}
        />
      </label>

      {/* Chọn thứ tự sắp xếp danh sách kết quả. */}
      <label>
        Sắp xếp
        <select name="sort" value={value.sort} onChange={change}>
          <option value="default">Mặc định</option>
          <option value="priceAsc">Giá tăng dần</option>
          <option value="priceDesc">Giá giảm dần</option>
          <option value="yearDesc">Năm mới nhất</option>
          <option value="name">Tên A–Z</option>
        </select>
      </label>

      {/* Thông báo nếu không tải được dữ liệu hãng hoặc loại xe. */}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
