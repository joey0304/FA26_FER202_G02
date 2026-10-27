import React, { useState, useEffect } from "react";
import { createSeed } from "../data/seed";
import {
  canTransitionTestDriveStatus,
  getTestDriveStatusLabel,
  hasConfirmedTestDriveConflict,
  loadTestDrives,
  normalizeTestDriveStatus,
  saveTestDrives,
} from "../services/testDriveService";

function renderStatusBadge(status) {
  const normalized = normalizeTestDriveStatus(status);
  return (
    <span className={`status ${normalized}`}>
      {getTestDriveStatusLabel(status)}
    </span>
  );
}

export default function TestDriveManagementPage() {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    try {
      const seedData = createSeed();
      setList(loadTestDrives(seedData.testdrives || []));
    } catch (storageError) {
      setAlertMsg({ type: "error", text: storageError.message });
    }
  }, []);

  const handleStatusChange = (item, nextStatus) => {
    setAlertMsg({ type: "", text: "" });

    if (!canTransitionTestDriveStatus(item.status, nextStatus)) {
      setAlertMsg({
        type: "error",
        text: `Không thể chuyển lịch #${item.id} từ "${getTestDriveStatusLabel(item.status)}" sang "${getTestDriveStatusLabel(nextStatus)}".`
      });
      return;
    }

    // Business Rule 3: Mỗi xe chỉ nhận 1 lịch đã xác nhận trong cùng khung giờ
    if (normalizeTestDriveStatus(nextStatus) === "confirmed") {
      const conflict = hasConfirmedTestDriveConflict(list, {
        carId: item.carId ?? item.car_id,
        date: item.date,
        timeSlot: item.timeSlot,
        id: item.id,
      });
      if (conflict) {
        setAlertMsg({
          type: "error",
          text: `XUNG ĐỘT LỊCH: Xe "${item.carName}" đã có một lịch "Đã xác nhận" vào ngày ${item.date} lúc ${item.timeSlot}. Không thể xác nhận trùng!`
        });
        return;
      }
    }

    const updated = list.map((td) => (td.id === item.id ? { ...td, status: nextStatus } : td));
    try {
      saveTestDrives(updated);
      setList(updated);
      setAlertMsg({
        type: "success",
        text: `Đã cập nhật trạng thái lịch hẹn #${item.id} sang "${getTestDriveStatusLabel(nextStatus)}".`
      });
    } catch (storageError) {
      setAlertMsg({ type: "error", text: storageError.message });
    }
  };

  const handleResultNoteBlur = (item, noteValue) => {
    if (normalizeTestDriveStatus(item.status) === "completed") return;
    const updated = list.map((td) => (td.id === item.id ? { ...td, resultNote: noteValue } : td));
    try {
      saveTestDrives(updated);
      setList(updated);
    } catch (storageError) {
      setAlertMsg({ type: "error", text: storageError.message });
    }
  };

  const handleDeleteNew = (item) => {
    const status = normalizeTestDriveStatus(item.status);
    const isDeletable = status === "pending" || status === "cancelled";
    if (!isDeletable) {
      setAlertMsg({
        type: "error",
        text: "Chỉ được xóa trực tiếp các yêu cầu còn ở trạng thái \"Chờ xác nhận\" hoặc \"Đã hủy\"!"
      });
      return;
    }

    if (!window.confirm(`Xác nhận xóa bỏ lịch hẹn lái thử #${item.id}?`)) return;

    const updated = list.filter((td) => td.id !== item.id);
    try {
      saveTestDrives(updated);
      setList(updated);
      setAlertMsg({ type: "success", text: `Đã xóa yêu cầu lái thử #${item.id}.` });
    } catch (storageError) {
      setAlertMsg({ type: "error", text: storageError.message });
    }
  };

  const stats = {
    pending: list.filter((record) => normalizeTestDriveStatus(record.status) === "pending").length,
    confirmed: list.filter((record) => normalizeTestDriveStatus(record.status) === "confirmed").length,
    completed: list.filter((record) => normalizeTestDriveStatus(record.status) === "completed").length,
    cancelled: list.filter((record) => normalizeTestDriveStatus(record.status) === "cancelled").length
  };

  const filteredList = list.filter((item) => {
    const matchStatus = statusFilter === "ALL" || normalizeTestDriveStatus(item.status) === statusFilter;
    const keyword = searchTerm.toLowerCase();
    const matchKeyword =
      !keyword ||
      (item.customerName && item.customerName.toLowerCase().includes(keyword)) ||
      (item.phone && item.phone.includes(keyword)) ||
      (item.carName && item.carName.toLowerCase().includes(keyword)) ||
      String(item.id).toLowerCase().includes(keyword);
    return matchStatus && matchKeyword;
  });

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Quản trị Showroom</span>
          <h1>Quản Lý Lịch Lái Thử</h1>
          <p>Tiếp nhận, kiểm tra khả dụng khung giờ của xe và cập nhật kết quả tư vấn trải nghiệm.</p>
        </div>
      </div>

      {alertMsg.text && <div className={alertMsg.type}>{alertMsg.text}</div>}

      <div className="stats-grid">
        <div className="stat">
          <span>Chờ xác nhận</span>
          <strong>{stats.pending}</strong>
          <span>Cần tiếp nhận</span>
        </div>
        <div className="stat">
          <span>Đã xác nhận</span>
          <strong style={{ color: "#64B5F6" }}>{stats.confirmed}</strong>
          <span>Sẵn sàng xe</span>
        </div>
        <div className="stat">
          <span>Đã hoàn thành</span>
          <strong style={{ color: "#81C784" }}>{stats.completed}</strong>
          <span>Đã lái thử</span>
        </div>
        <div className="stat">
          <span>Đã hủy</span>
          <strong style={{ color: "#E57373" }}>{stats.cancelled}</strong>
          <span>Hủy cuộc hẹn</span>
        </div>
      </div>

      <div className="panel table-toolbar" style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Tìm theo tên khách, SĐT, mẫu xe hoặc mã lịch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <select
            style={{ margin: 0, width: "220px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">-- Tất cả trạng thái ({list.length}) --</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <span className="muted" style={{ whiteSpace: "nowrap" }}>
            Hiển thị: <strong>{filteredList.length}</strong> lịch
          </span>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Mẫu xe đăng ký</th>
              <th>Ngày & Khung giờ</th>
              <th>Ghi chú của khách</th>
              <th>Trạng thái duyệt</th>
              <th>Đánh giá / Kết quả sau buổi lái thử</th>
              <th style={{ textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Không tìm thấy lịch hẹn lái thử nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const normalizedStatus = normalizeTestDriveStatus(item.status);
                const isLocked = normalizedStatus === "completed" || normalizedStatus === "cancelled";
                const canDelete = normalizedStatus === "pending" || normalizedStatus === "cancelled";

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.customerName || "Khách vãng lai"}</strong>
                      <div>
                        <small className="muted">{item.phone}</small>
                      </div>
                      <small style={{ color: "var(--accent-gold)" }}>#{item.id}</small>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.carImage && (
                          <img
                            src={item.carImage}
                            alt=""
                            className="table-car"
                            style={{ width: "48px", height: "32px" }}
                          />
                        )}
                        <div>
                          <strong>{item.carName || item.carId}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{item.date}</div>
                      <small className="muted">{item.timeSlot || item.slot}</small>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px" }}>{item.note || <span className="muted">-</span>}</span>
                    </td>
                    <td>
                      <select
                        style={{ margin: 0, padding: "6px 10px", fontSize: "13px" }}
                        value={getTestDriveStatusLabel(item.status)}
                        disabled={isLocked}
                        onChange={(e) => handleStatusChange(item, e.target.value)}
                      >
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đã hoàn thành">Đã hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                      <div style={{ marginTop: "4px" }}>{renderStatusBadge(item.status)}</div>
                    </td>
                    <td>
                      <input
                        type="text"
                        style={{ margin: 0, fontSize: "13px", padding: "6px 10px" }}
                        placeholder="Nhập kết quả lái thử..."
                        defaultValue={item.resultNote || ""}
                        disabled={isLocked}
                        onBlur={(e) => handleResultNoteBlur(item, e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                        {canDelete ? (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDeleteNew(item)}
                          >
                            Xóa
                          </button>
                        ) : (
                          <span className="muted" style={{ fontSize: "12px" }}>
                            {isLocked ? "Đã lưu trữ" : "Đang theo dõi"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}