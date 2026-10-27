import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { money, storeRequest } from "../services/carStoreService";

export default function RequestCreate({ resource, title, extra }) {
  // Lấy thông tin người dùng, điều hướng và xe được chọn từ URL (nếu có).
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Lưu danh sách xe, trạng thái gửi form và nội dung form dịch vụ.
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    car_id: params.get("car") || "",
    name: user.name,
    phone: user.phone || "",
    content: "",
    slot: "",
  });

  // Tải dữ liệu xe để người dùng có thể chọn xe cho yêu cầu.
  useEffect(() => {
    storeRequest("cars")
      .then(setCars)
      .catch((requestError) => setError(requestError.message));
  }, []);

  // Cập nhật đúng trường tương ứng khi người dùng nhập liệu.
  const change = (event) =>
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

  // Tìm thông tin xe đang được chọn để hiển thị phần xem trước.
  const car = cars.find((item) => item.id === Number(form.car_id));

  // Gửi yêu cầu lên API và chuyển về danh sách yêu cầu sau khi thành công.
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await storeRequest(resource, "POST", {
        ...form,
        ...(form.slot
          ? { slot: new Date(form.slot).toISOString() }
          : {}),
      });
      navigate("/my/" + resource);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="booking-layout">
      <form className="panel" onSubmit={submit}>
        {/* Tiêu đề, lỗi và trường chọn xe cho yêu cầu. */}
        <p className="eyebrow">CARSTORE / DỊCH VỤ</p>
        <h1>{title}</h1>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <label>
          Chọn xe {resource === "consultations" ? "(không bắt buộc)" : "*"}
          <select
            required={resource !== "consultations"}
            name="car_id"
            value={form.car_id}
            onChange={change}
          >
            <option value="">
              {resource === "consultations" ? "Tư vấn chung" : "-- Chọn xe --"}
            </option>
            {cars
              .filter(
                (item) =>
                  item.active &&
                  (resource !== "testdrives" || item.test_drive),
              )
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </label>

        {/* Thông tin liên hệ của người gửi yêu cầu. */}
        <label>
          Họ tên *
          <input required name="name" value={form.name} onChange={change} />
        </label>
        <label>
          Số điện thoại *
          <input
            required
            type="tel"
            pattern="[0-9]{10}"
            placeholder="10 chữ số"
            name="phone"
            value={form.phone}
            onChange={change}
          />
        </label>

        {/* Trường nhập bổ sung phụ thuộc vào loại dịch vụ được gọi. */}
        {extra === "content" && (
          <label>
            Nội dung tư vấn *
            <textarea
              required
              name="content"
              value={form.content}
              onChange={change}
            />
          </label>
        )}
        {extra === "slot" && (
          <label>
            Ngày giờ lái thử *
            <input
              required
              type="datetime-local"
              name="slot"
              value={form.slot}
              onChange={change}
            />
            <small>
              Chọn đầu mỗi giờ từ 08:00 đến 16:00 Việt Nam; một lượt 1 giờ. Nên
              đặt múi giờ máy tính theo Việt Nam.
            </small>
          </label>
        )}

        {/* Ghi chú riêng cho yêu cầu đặt mua và nút gửi form. */}
        {resource === "orders" && (
          <p className="muted">
            Đây là yêu cầu đặt mua. Nhân viên kiểm tra và xác nhận mới giữ xe.
            Chưa thanh toán trực tuyến.
          </p>
        )}
        <button disabled={busy}>
          {busy ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </form>

      {/* Hiển thị tóm tắt xe đã chọn hoặc thông tin hỗ trợ chung. */}
      <aside>
        {car ? (
          <div className="panel car-summary">
            <img src={car.image} alt={car.name} />
            <h2>{car.name}</h2>
            <p className="price">{money(car.price)}</p>
            <p>{car.stock} xe khả dụng</p>
          </div>
        ) : (
          <div className="panel">
            <h2>Luôn sẵn sàng hỗ trợ</h2>
            <p>
              Chọn mẫu xe để xem hình ảnh và giá tham khảo trước khi gửi yêu
              cầu.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
