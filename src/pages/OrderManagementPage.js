import { useEffect, useMemo, useState } from "react";
import { createSeed } from "../data/seed";
import { loadCars } from "../services/testDriveService";

import {
  canDeleteOrder,
  canTransitionOrderStatus,
  createOrderId,
  getOrderStatusLabel,
  loadOrders,
  normalizeOrderStatus,
  saveOrders,
} from "../services/orderService";

const money = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;

const EMPTY_FORM = {
  customerName: "",
  phone: "",
  carId: "",
  price: "",
  note: "",
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [cars, setCars] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const seed = createSeed();

      setOrders(loadOrders(seed.orders || []));
      setCars(loadCars(seed.cars || []));
    } catch (storageError) {
      setError(storageError.message);
    }
  }, []);

  const visible = useMemo(
    () =>
      orders.filter((order) => {
        const keyword = search.trim().toLowerCase();

        const matchText =
          !keyword ||
          [
            order.id,
            order.customerName,
            order.phone,
            order.carName,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(keyword)
          );

        return (
          matchText &&
          (filter === "all" ||
            normalizeOrderStatus(order.status) === filter)
        );
      }),
    [orders, search, filter]
  );

  function persist(updated, text) {
    try {
      saveOrders(updated);
      setOrders(updated);
      setMessage(text);
      setError("");
    } catch (storageError) {
      setError(storageError.message);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
  }

  function startEdit(order) {
    setEditingId(order.id);

    setForm({
      customerName: order.customerName || "",
      phone: order.phone || "",
      carId: String(order.carId ?? order.car_id ?? ""),
      price: String(order.agreedPrice ?? order.price ?? ""),
      note: order.note || "",
    });

    setError("");
  }

  function saveForm(event) {
    event.preventDefault();

    const car = cars.find(
      (item) => String(item.id) === String(form.carId)
    );

    if (
      !form.customerName.trim() ||
      !/^\d{10}$/.test(form.phone.trim()) ||
      !car
    ) {
      setError(
        "Vui lòng nhập tên, số điện thoại gồm 10 chữ số và chọn mẫu xe."
      );
      return;
    }

    const price =
      form.price === ""
        ? Number(car.price || 0)
        : Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Giá đơn hàng phải là số không âm.");
      return;
    }

    if (editingId) {
      const updated = orders.map((order) =>
        order.id === editingId
          ? {
              ...order,
              customerName: form.customerName.trim(),
              phone: form.phone.trim(),
              carId: car.id,
              carName: car.name,
              carImage: car.image || "",
              agreedPrice: price,
              note: form.note.trim(),
              updatedAt: new Date().toISOString(),
            }
          : order
      );

      persist(
        updated,
        `Đã cập nhật đơn hàng #${editingId}.`
      );
    } else {
      const newOrder = {
        id: createOrderId(orders),
        userId: null,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        carId: car.id,
        carName: car.name,
        carImage: car.image || "",
        price,
        agreedPrice: price,
        note: form.note.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      persist(
        [newOrder, ...orders],
        `Đã tạo đơn hàng #${newOrder.id}.`
      );
    }

    setForm(null);
  }

  function changeStatus(order, nextStatus) {
    if (
      !canTransitionOrderStatus(order.status, nextStatus)
    ) {
      setError(
        "Không thể chuyển trạng thái đơn hàng theo quy trình hiện tại."
      );
      return;
    }

    persist(
      orders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
      `Đã cập nhật trạng thái đơn #${order.id}.`
    );
  }

  function remove(order) {
    if (!canDeleteOrder(order)) {
      setError(
        "Chỉ được xóa đơn đang chờ xác nhận hoặc đã hủy."
      );
      return;
    }

    if (
      !window.confirm(
        `Bạn chắc chắn muốn xóa đơn hàng #${order.id}?`
      )
    ) {
      return;
    }

    persist(
      orders.filter((item) => item.id !== order.id),
      `Đã xóa đơn hàng #${order.id}.`
    );
  }

  const stats = {
    pending: orders.filter(
      (item) =>
        normalizeOrderStatus(item.status) === "pending"
    ).length,

    confirmed: orders.filter(
      (item) =>
        normalizeOrderStatus(item.status) === "confirmed"
    ).length,

    processing: orders.filter(
      (item) =>
        normalizeOrderStatus(item.status) === "processing"
    ).length,

    completed: orders.filter(
      (item) =>
        normalizeOrderStatus(item.status) === "completed"
    ).length,
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARSTORE / QUẢN TRỊ</p>

          <h1>Quản lý đơn đặt mua</h1>

          <p>
            Tiếp nhận, cập nhật tiến trình và quản lý các đơn hàng.
          </p>
        </div>

        <button onClick={startCreate}>
          + Tạo đơn hàng
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat">
          <span>Chờ xác nhận</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="stat">
          <span>Đã xác nhận</span>
          <strong>{stats.confirmed}</strong>
        </div>

        <div className="stat">
          <span>Đang xử lý</span>
          <strong>{stats.processing}</strong>
        </div>

        <div className="stat">
          <span>Hoàn thành</span>
          <strong>{stats.completed}</strong>
        </div>
      </div>

      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {form && (
        <form
          className="panel edit-form"
          onSubmit={saveForm}
        >
          <h2>
            {editingId
              ? `Cập nhật đơn #${editingId}`
              : "Tạo đơn hàng mới"}
          </h2>

          <div className="form-grid">
            <label>
              Họ tên khách hàng *
              <input
                value={form.customerName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    customerName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Số điện thoại *
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone: event.target.value,
                  })
                }
                pattern="[0-9]{10}"
                required
              />
            </label>

            <label>
              Mẫu xe *
              <select
                value={form.carId}
                onChange={(event) => {
                  const car = cars.find(
                    (item) =>
                      String(item.id) === event.target.value
                  );

                  setForm({
                    ...form,
                    carId: event.target.value,
                    price: car
                      ? String(car.price)
                      : form.price,
                  });
                }}
                required
              >
                <option value="">-- Chọn xe --</option>

                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Giá chốt (VNĐ) *
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  setForm({
                    ...form,
                    price: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Ghi chú
              <textarea
                value={form.note}
                onChange={(event) =>
                  setForm({
                    ...form,
                    note: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className="actions">
            <button type="submit">
              Lưu đơn hàng
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => setForm(null)}
            >
              Đóng
            </button>
          </div>
        </form>
      )}

      <div
        className="panel table-toolbar"
        style={{ margin: "20px 0" }}
      >
        <input
          placeholder="Tìm mã đơn, khách hàng, số điện thoại, mẫu xe..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <span>
          {visible.length} / {orders.length} đơn
        </span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Mẫu xe</th>
              <th>Giá</th>
              <th>Ngày đặt</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>#{order.id}</strong>
                </td>

                <td>
                  {order.customerName}
                  <br />
                  <small className="muted">
                    {order.phone}
                  </small>
                </td>

                <td>
                  {order.carName ||
                    `Xe #${order.carId ?? order.car_id}`}
                </td>

                <td>
                  {money(order.agreedPrice ?? order.price)}
                </td>

                <td>
                  {order.createdAt
                    ? new Date(
                        order.createdAt
                      ).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                <td>
                  <select
                    aria-label={`Trạng thái đơn ${order.id}`}
                    value={normalizeOrderStatus(order.status)}
                    disabled={[
                      "completed",
                      "cancelled",
                    ].includes(
                      normalizeOrderStatus(order.status)
                    )}
                    onChange={(event) =>
                      changeStatus(
                        order,
                        event.target.value
                      )
                    }
                  >
                    <option value="pending">
                      Chờ xác nhận
                    </option>

                    <option value="confirmed">
                      Đã xác nhận
                    </option>

                    <option value="processing">
                      Đang xử lý
                    </option>

                    <option value="completed">
                      Hoàn thành
                    </option>

                    <option value="cancelled">
                      Đã hủy
                    </option>
                  </select>

                  <div>
                    <span
                      className={`status ${normalizeOrderStatus(
                        order.status
                      )}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      className="secondary"
                      onClick={() => startEdit(order)}
                      disabled={[
                        "completed",
                        "cancelled",
                      ].includes(
                        normalizeOrderStatus(order.status)
                      )}
                    >
                      Sửa
                    </button>

                    <button
                      className="danger"
                      onClick={() => remove(order)}
                      disabled={!canDeleteOrder(order)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="empty">
            Không tìm thấy đơn hàng phù hợp.
          </div>
        )}
      </div>
    </>
  );
}
