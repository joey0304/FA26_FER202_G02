import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createSeed } from '../data/seed';

const TIME_SLOTS = [
  '08:30 - 09:30',
  '10:00 - 11:00',
  '14:00 - 15:00',
  '15:30 - 16:30'
];

const DB_KEY = 'carstore_lab_db';
const TD_KEY = 'testdrives';

function getStorageData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    const dbRaw = localStorage.getItem(DB_KEY);
    if (dbRaw) {
      const db = JSON.parse(dbRaw);
      if (Array.isArray(db[key])) return db[key];
    }
  } catch (err) {
    console.error(err);
  }
  return fallback;
}

function saveTestDrives(list) {
  try {
    localStorage.setItem(TD_KEY, JSON.stringify(list));
    const dbRaw = localStorage.getItem(DB_KEY);
    if (dbRaw) {
      const db = JSON.parse(dbRaw);
      db.testdrives = list;
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
  } catch (err) {
    console.error(err);
  }
}

function renderStatusBadge(status) {
  switch (status) {
    case 'Chờ xác nhận':
    case 'pending':
    case 'Mới':
      return <span className="status pending">{status}</span>;
    case 'Đã xác nhận':
    case 'confirmed':
      return <span className="status confirmed">{status}</span>;
    case 'Đã hoàn thành':
    case 'completed':
      return <span className="status completed">{status}</span>;
    case 'Đã hủy':
    case 'cancelled':
      return <span className="status cancelled">{status}</span>;
    default:
      return <span className="status">{status}</span>;
  }
}

export default function MyTestDrivesPage() {
  const { user } = useAuth();
  const [allTestDrives, setAllTestDrives] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', timeSlot: TIME_SLOTS[0], note: '' });

  useEffect(() => {
    const seedData = createSeed();
    const data = getStorageData(TD_KEY, seedData.testdrives || []);
    setAllTestDrives(data);
  }, []);

  // Business Rule 4: Khách hàng chỉ xem lịch của chính mình
  const myList = allTestDrives.filter((item) => {
    if (!user?.id) return true;
    return String(item.userId) === String(user.id);
  });

  const filteredList = myList.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const handleStartEdit = (item) => {
    // Business Rule 5: Lịch hoàn thành không được chỉnh sửa
    if (item.status === 'Đã hoàn thành' || item.status === 'completed') {
      setMessage({ type: 'error', text: 'Lịch lái thử đã hoàn tất không thể chỉnh sửa!' });
      return;
    }
    if (item.status !== 'Chờ xác nhận' && item.status !== 'pending' && item.status !== 'Mới') {
      setMessage({ type: 'error', text: 'Chỉ có thể đổi lịch khi yêu cầu đang ở trạng thái "Chờ xác nhận"!' });
      return;
    }

    setEditingItem(item);
    setEditForm({
      date: item.date || '',
      timeSlot: item.timeSlot || TIME_SLOTS[0],
      note: item.note || ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();

    // Business Rule 1: Ngày mới phải ở tương lai
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(editForm.date);
    chosen.setHours(0, 0, 0, 0);

    if (chosen <= today) {
      setMessage({ type: 'error', text: 'Ngày đổi lịch lái thử phải ở tương lai (bắt đầu từ ngày mai)!' });
      return;
    }

    // Business Rule 3: Tránh xung đột với lịch đã xác nhận khác của cùng xe
    const conflict = allTestDrives.some(
      (td) => td.id !== editingItem.id &&
              String(td.carId) === String(editingItem.carId) &&
              td.date === editForm.date &&
              td.timeSlot === editForm.timeSlot &&
              (td.status === 'Đã xác nhận' || td.status === 'confirmed')
    );
    if (conflict) {
      setMessage({
        type: 'error',
        text: `Mẫu xe này đã có một lịch "Đã xác nhận" vào ngày ${editForm.date} khung giờ (${editForm.timeSlot}). Vui lòng chọn giờ khác!`
      });
      return;
    }

    const updated = allTestDrives.map((td) =>
      td.id === editingItem.id
        ? {
            ...td,
            date: editForm.date,
            timeSlot: editForm.timeSlot,
            slot: `${editForm.date} (${editForm.timeSlot})`,
            note: editForm.note
          }
        : td
    );

    saveTestDrives(updated);
    setAllTestDrives(updated);
    setEditingItem(null);
    setMessage({ type: 'success', text: 'Cập nhật thay đổi lịch hẹn lái thử thành công!' });
  };

  const handleDeleteOrCancel = (item) => {
    // Business Rule 5: Lịch hoàn thành không được xóa/hủy
    if (item.status === 'Đã hoàn thành' || item.status === 'completed') {
      setMessage({ type: 'error', text: 'Lịch lái thử đã hoàn tất không thể xóa hoặc hủy!' });
      return;
    }

    const isPending = item.status === 'Chờ xác nhận' || item.status === 'pending' || item.status === 'Mới';
    const isConfirmed = item.status === 'Đã xác nhận' || item.status === 'confirmed';

    if (isPending) {
      if (!window.confirm(`Bạn có chắc chắn muốn xóa yêu cầu lái thử mã #${item.id}?`)) return;
      const updated = allTestDrives.filter((td) => td.id !== item.id);
      saveTestDrives(updated);
      setAllTestDrives(updated);
      setMessage({ type: 'success', text: `Đã xóa yêu cầu lái thử #${item.id} thành công.` });
    } else if (isConfirmed) {
      if (!window.confirm('Lịch này đã được cửa hàng xác nhận. Bạn có chắc muốn HỦY lịch hẹn này không?')) return;
      const updated = allTestDrives.map((td) =>
        td.id === item.id ? { ...td, status: 'Đã hủy' } : td
      );
      saveTestDrives(updated);
      setAllTestDrives(updated);
      setMessage({ type: 'success', text: `Đã hủy lịch lái thử #${item.id} thành công.` });
    }
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Quản lý cá nhân</span>
          <h1>Lịch Lái Thử Của Tôi</h1>
          <p>Theo dõi tiến trình tiếp nhận, đổi ngày giờ hoặc hủy lịch lái thử đã đăng ký.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            style={{ width: 'auto', margin: 0 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">-- Tất cả trạng thái ({myList.length}) --</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
          <Link to="/testdrives/new" className="button">
            + Đặt Lịch Mới
          </Link>
        </div>
      </div>

      {message.text && <div className={message.type}>{message.text}</div>}

      {editingItem && (
        <div className="panel edit-form" style={{ marginBottom: '24px' }}>
          <span className="eyebrow">Chỉnh sửa cuộc hẹn</span>
          <h2>Đổi Lịch Lái Thử: {editingItem.carName}</h2>
          <form onSubmit={handleSaveEdit}>
            <div className="form-grid">
              <label>
                Ngày hẹn mới (Tương lai) <span className="required">*</span>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  required
                />
              </label>

              <label>
                Khung giờ mới <span className="required">*</span>
                <select
                  value={editForm.timeSlot}
                  onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                  required
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Ghi chú cập nhật
              <input
                type="text"
                placeholder="Lý do đổi lịch hoặc yêu cầu thêm..."
                value={editForm.note}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              />
            </label>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="submit">Lưu Thay Đổi</button>
              <button
                type="button"
                className="secondary"
                onClick={() => setEditingItem(null)}
              >
                Hủy Bỏ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã lịch</th>
              <th>Mẫu xe</th>
              <th>Ngày & Khung giờ</th>
              <th>Ghi chú của bạn</th>
              <th>Trạng thái</th>
              <th>Kết quả buổi lái thử</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Không tìm thấy lịch hẹn lái thử nào của bạn.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const isPending = item.status === 'Chờ xác nhận' || item.status === 'pending' || item.status === 'Mới';
                const isConfirmed = item.status === 'Đã xác nhận' || item.status === 'confirmed';
                const isLocked = item.status === 'Đã hoàn thành' || item.status === 'completed' || item.status === 'Đã hủy';

                return (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: 'var(--accent-gold)' }}>#{item.id}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.carImage && (
                          <img
                            src={item.carImage}
                            alt=""
                            className="table-car"
                            style={{ width: '50px', height: '35px' }}
                          />
                        )}
                        <strong>{item.carName || item.carId}</strong>
                      </div>
                    </td>
                    <td>
                      <div>{item.date}</div>
                      <small className="muted">{item.timeSlot || item.slot}</small>
                    </td>
                    <td>{item.note || <span className="muted">-</span>}</td>
                    <td>{renderStatusBadge(item.status || 'Chờ xác nhận')}</td>
                    <td>
                      {item.resultNote ? (
                        <span>{item.resultNote}</span>
                      ) : (
                        <small className="muted">Chưa có kết quả từ showroom</small>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => handleStartEdit(item)}
                            >
                              Đổi lịch
                            </button>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => handleDeleteOrCancel(item)}
                            >
                              Xóa
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => handleDeleteOrCancel(item)}
                          >
                            Hủy lịch
                          </button>
                        )}
                        {isLocked && <small className="muted">Đã đóng sổ</small>}
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