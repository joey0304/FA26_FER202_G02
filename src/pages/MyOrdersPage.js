<<<<<<< HEAD
import RequestList from "../components/RequestList";
export default function MyOrdersPage(){return <RequestList resource="orders" title="Đơn đặt mua của tôi"/>;}
=======
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createSeed } from "../data/seed";

import {
  canCancelOrder,
  canDeleteOrder,
  getOrderStatusLabel,
  getOrdersForUser,
  loadOrders,
  normalizeOrderStatus,
  saveOrders,
} from "../services/orderService";

const money = (value) =>
  value == null || value === ""
    ? "Chưa chốt"
    : `${Number(value).toLocaleString("vi-VN")} VNĐ`;

export default function MyOrdersPage() {
  const { user } = useAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState(
    location.state?.message || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const seed = createSeed();
      setOrders(loadOrders(seed.orders || []));
    } catch (storageError) {
      setError(storageError.message);
    }
  }, []);

  const mine = useMemo(
    () => getOrdersForUser(orders, user?.id),
    [orders, user?.id]
  );

  const visible = mine.filter(
    (order) =>
      filter === "all" ||
      normalizeOrderStatus(order.status) === filter
  );

  function updateOrders(updated, successMessage) {
    try {
      saveOrders(updated);
      setOrders(updated);
      setMessage(successMessage);
      setError("");
    } catch (storageError) {
      setError(storageError.message);
    }
  }

  function cancelOrder(order) {
    if (!canCancelOrder(order)) return;

    if (
      !window.confirm(
        `Bạn muốn hủy yêu cầu đặt mua #${order.id}?`
      )
    ) {
      return;
    }

    updateOrders(
      orders.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: "cancelled",
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
      `Đã hủy đơn hàng #${order.id}.`
    );
  }

  function deleteOrder(order) {
    if (!canDeleteOrder(order)) return;

    if (
      !window.confirm(
        `Xóa đơn hàng #${order.id} khỏi danh sách?`
      )
    ) {
      return;
    }

    updateOrders(
      orders.filter((item) => item.id !== order.id),
      `Đã xóa đơn hàng #${order.id}.`
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARSTORE / TÀI KHOẢN</p>

          <h1>Đơn đặt mua của tôi</h1>

          <p>
            Theo dõi trạng thái xử lý các yêu cầu đặt mua xe của bạn.
          </p>
        </div>

        <Link className="button" to="/cars">
          + Đặt mua xe
        </Link>
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

      <div className="table-toolbar">
        <select
          aria-label="Lọc trạng thái đơn hàng"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">Tất cả ({mine.length})</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <span>{visible.length} đơn hàng</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Mẫu xe</th>
              <th>Ngày đặt</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
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
                  <strong>
                    {order.carName ||
                      `Xe #${order.carId ?? order.car_id}`}
                  </strong>
                </td>

                <td>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </td>

                <td>
                  {money(order.agreedPrice ?? order.price)}
                </td>

                <td>
                  <span
                    className={`status ${normalizeOrderStatus(
                      order.status
                    )}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                </td>

                <td>{order.note || "—"}</td>

                <td>
                  <div className="row-actions">
                    {canCancelOrder(order) && (
                      <button
                        className="secondary"
                        onClick={() => cancelOrder(order)}
                      >
                        Hủy đơn
                      </button>
                    )}

                    {canDeleteOrder(order) && (
                      <button
                        className="danger"
                        onClick={() => deleteOrder(order)}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div className="empty">
            Bạn chưa có đơn hàng phù hợp.
          </div>
        )}
      </div>
    </>
  );
}
>>>>>>> origin/Order
