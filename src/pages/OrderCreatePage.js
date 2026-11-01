import RequestCreate from '../components/RequestCreate';

export default function OrderCreatePage(){return <RequestCreate resource="orders" title="Tạo đơn đặt mua" extra={null}/>;}
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createSeed } from "../data/seed";
import { loadCars } from "../services/testDriveService";
import { createOrderId, loadOrders, saveOrders } from "../services/orderService";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;

export default function OrderCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [carId, setCarId] = useState(params.get("car") || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const seed = createSeed();
      setCars(loadCars(seed.cars || []));
      setOrders(loadOrders(seed.orders || []));
    } catch (storageError) {
      setError(storageError.message);
    }
  }, []);

  useEffect(() => {
    if (user?.phone) {
      setPhone((current) => current || user.phone);
    }
  }, [user]);

  const availableCars = useMemo(
    () =>
      cars.filter(
        (car) =>
          (car.active === 1 || car.active === true) &&
          Number(car.stock) > 0
      ),
    [cars]
  );

  const selectedCar = availableCars.find(
    (car) => String(car.id) === String(carId)
  );

  function submit(event) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Vui lòng đăng nhập trước khi đặt mua xe.");
      return;
    }

    if (user.active === 0 || user.status === "Locked") {
      setError("Tài khoản đã bị khóa hoặc vô hiệu hóa.");
      return;
    }

    if (!selectedCar) {
      setError("Vui lòng chọn mẫu xe còn kinh doanh.");
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Số điện thoại phải gồm đúng 10 chữ số.");
      return;
    }

    setBusy(true);

    try {
      const newOrder = {
        id: createOrderId(orders),
        userId: user.id,
        customerName: user.name || "Khách hàng",
        phone: phone.trim(),
        carId: selectedCar.id,
        carName: selectedCar.name,
        carImage: selectedCar.image || "",
        price: Number(selectedCar.price || 0),
        quantity: 1,
        note: note.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const updated = [newOrder, ...orders];

      saveOrders(updated);
      setOrders(updated);

      navigate("/my/orders", {
        state: {
          message: `Đã gửi yêu cầu đặt mua ${selectedCar.name}.`,
        },
      });
    } catch (storageError) {
      setError(storageError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARSTORE / ĐẶT MUA</p>
          <h1>Gửi yêu cầu đặt mua xe</h1>
          <p>
            Chọn mẫu xe và để lại thông tin để showroom liên hệ xác nhận đơn
            hàng.
          </p>
        </div>

        <Link className="button secondary" to="/my/orders">
          Đơn hàng của tôi
        </Link>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="booking-layout">
        <form className="panel" onSubmit={submit}>
          <h2>Thông tin đặt mua</h2>

          <label>
            Mẫu xe <span className="required">*</span>

            <select
              value={carId}
              onChange={(event) => setCarId(event.target.value)}
              required
            >
              <option value="">-- Chọn mẫu xe --</option>

              {availableCars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.name} - {money(car.price)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Họ tên khách hàng

            <input value={user?.name || ""} disabled />
          </label>

          <label>
            Số điện thoại <span className="required">*</span>

            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              pattern="[0-9]{10}"
              placeholder="10 chữ số"
              required
            />
          </label>

          <label>
            Ghi chú / yêu cầu thêm

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows="4"
              placeholder="Ví dụ: muốn được tư vấn về màu xe, phương thức thanh toán..."
            />
          </label>

          <p className="muted">
            Đây là yêu cầu đặt mua, chưa phải giao dịch thanh toán. Nhân viên
            sẽ liên hệ để xác nhận giá và thông tin đơn hàng.
          </p>

          <button
            type="submit"
            disabled={busy || availableCars.length === 0}
          >
            {busy ? "Đang gửi..." : "Gửi yêu cầu đặt mua"}
          </button>
        </form>

        <aside className="panel car-summary">
          {selectedCar ? (
            <>
              <img src={selectedCar.image} alt={selectedCar.name} />

              <p className="eyebrow">XE ĐANG CHỌN</p>

              <h2>{selectedCar.name}</h2>

              <p className="price">{money(selectedCar.price)}</p>

              <p>Còn {selectedCar.stock} xe</p>
            </>
          ) : (
            <>
              <h2>Thông tin mẫu xe</h2>

              <p className="muted">
                Chọn xe trong danh sách để xem hình ảnh và giá tham khảo.
              </p>
            </>
          )}
        </aside>
      </div>
    </>
  );
}