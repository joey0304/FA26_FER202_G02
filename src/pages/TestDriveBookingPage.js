import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createSeed } from "../seed";

const TIME_SLOTS = [
  "08:30 - 09:30",
  "10:00 - 11:00",
  "14:00 - 15:00",
  "15:30 - 16:30"
];

const DB_KEY = "carstore_lab_db";
const TD_KEY = "testdrives";

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
    console.error(`Lỗi đọc ${key}:`, err);
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
    console.error("Lỗi lưu lịch lái thử:", err);
  }
}

export default function TestDriveBookingPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryCarId = searchParams.get("carId") || "";

  const [cars, setCars] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  const [formData, setFormData] = useState({
    carId: queryCarId,
    customerName: user?.name || "",
    phone: user?.phone || "",
    date: "",
    timeSlot: TIME_SLOTS[0],
    note: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const seedData = createSeed();
    const storedCars = getStorageData("cars", seedData.cars || []);
    const storedTestDrives = getStorageData(TD_KEY, seedData.testdrives || []);

    setCars(storedCars);
    setTestDrives(storedTestDrives);

    // Business Rule 2: Chỉ lấy xe đang kinh doanh (active = 1) và hỗ trợ lái thử (test_drive = 1)
    const availableCars = storedCars.filter(
      (c) => (c.active === 1 || c.active === true || c.status === "Active") &&
             (c.test_drive === 1 || c.test_drive === true || c.supportTestDrive === true)
    );

    let targetCar = null;
    if (queryCarId) {
      targetCar = availableCars.find((c) => String(c.id) === String(queryCarId));
    }
    if (!targetCar && availableCars.length > 0) {
      targetCar = availableCars[0];
    }

    if (targetCar) {
      setSelectedCar(targetCar);
      setFormData((prev) => ({ ...prev, carId: String(targetCar.id) }));
    }
  }, [queryCarId]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  const handleCarChange = (e) => {
    const cid = e.target.value;
    const found = cars.find((c) => String(c.id) === String(cid));
    setSelectedCar(found || null);
    setFormData((prev) => ({ ...prev, carId: cid }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (user && (user.active === 0 || user.status === "Locked")) {
      setError("Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa. Không thể tạo yêu cầu mới.");
      return;
    }

    // Business Rule 2: Kiểm tra xe hợp lệ và hỗ trợ lái thử
    if (!selectedCar) {
      setError("Vui lòng chọn mẫu xe muốn đăng ký lái thử.");
      return;
    }
    const isEligible = (selectedCar.active === 1 || selectedCar.active === true || selectedCar.status === "Active") &&
                       (selectedCar.test_drive === 1 || selectedCar.test_drive === true || selectedCar.supportTestDrive === true);
    if (!isEligible) {
      setError("Mẫu xe này hiện không hỗ trợ lái thử hoặc đã ngừng kinh doanh.");
      return;
    }

    if (!formData.customerName.trim()) {
      setError("Họ và tên khách hàng không được để trống.");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError("Số điện thoại liên hệ phải gồm đúng 10 chữ số.");
      return;
    }

    // Business Rule 1: Ngày hẹn phải ở tương lai
    if (!formData.date) {
      setError("Vui lòng chọn ngày hẹn lái thử.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(formData.date);
    chosenDate.setHours(0, 0, 0, 0);

    if (chosenDate <= today) {
      setError("Ngày hẹn lái thử phải ở tương lai (bắt đầu từ ngày mai).");
      return;
    }

    // Business Rule 1: Khung giờ trong giờ làm việc
    if (!TIME_SLOTS.includes(formData.timeSlot)) {
      setError("Khung giờ được chọn không nằm trong giờ hành chính của showroom.");
      return;
    }

    // Business Rule 3: Mỗi xe chỉ nhận 1 lịch đã xác nhận trong cùng khung giờ
    const isConflict = testDrives.some(
      (td) => String(td.carId) === String(selectedCar.id) &&
              td.date === formData.date &&
              td.timeSlot === formData.timeSlot &&
              (td.status === "Đã xác nhận" || td.status === "confirmed")
    );

    if (isConflict) {
      setError(`Mẫu xe "${selectedCar.name}" đã có một lịch "Đã xác nhận" vào ngày ${formData.date} lúc ${formData.timeSlot}. Vui lòng chọn ngày hoặc giờ khác!`);
      return;
    }

    setIsSubmitting(true);

    const newTestDrive = {
      id: `TD${Date.now()}`,
      userId: user?.id || "guest",
      customerName: formData.customerName.trim(),
      phone: formData.phone.trim(),
      carId: selectedCar.id,
      carName: selectedCar.name,
      carImage: selectedCar.image || "",
      date: formData.date,
      timeSlot: formData.timeSlot,
      slot: `${formData.date} (${formData.timeSlot})`,
      note: formData.note.trim(),
      resultNote: "",
      status: "Chờ xác nhận",
      createdAt: new Date().toISOString()
    };

    const updatedList = [newTestDrive, ...testDrives];
    saveTestDrives(updatedList);
    setTestDrives(updatedList);

    setSuccess("Đăng ký lịch lái thử thành công! Showroom sẽ liên hệ để xác nhận lịch với bạn.");
    setTimeout(() => {
      navigate("/my/testdrives");
    }, 1500);
  };

  const testDriveCars = cars.filter(
    (c) => (c.active === 1 || c.active === true || c.status === "Active") &&
           (c.test_drive === 1 || c.test_drive === true || c.supportTestDrive === true)
  );

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Module 5 • Trải nghiệm thực tế</span>
          <h1>Đăng Ký Lịch Lái Thử</h1>
          <p>Trải nghiệm cảm giác lái đẳng cấp các dòng siêu xe hàng đầu tại showroom.</p>
        </div>
        <Link to="/my/testdrives" className="button secondary">
          Lịch lái thử của tôi
        </Link>
      </div>

      <div className="booking-layout">
        <div className="panel car-summary">
          <span className="eyebrow">Mẫu xe trải nghiệm</span>
          {selectedCar ? (
            <>
              <img
                src={selectedCar.image || "https://placehold.co/600x400/1B1B20/D4AF37?text=CarStore"}
                alt={selectedCar.name}
              />
              <h2>{selectedCar.name}</h2>
              <div className="price">
                {Number(selectedCar.price || 0).toLocaleString("vi-VN")} VNĐ
              </div>
              <p className="muted" style={{ fontSize: "13px", marginTop: "8px" }}>
                {selectedCar.specs || "Động cơ thể thao hiệu suất cao, hộp số tự động."}
              </p>
              <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span className="status confirmed">Hỗ trợ lái thử</span>
                <span className="status">Còn {selectedCar.stock ?? 1} xe sẵn có</span>
              </div>
            </>
          ) : (
            <div className="empty">Vui lòng chọn mẫu xe ở danh sách bên cạnh.</div>
          )}
        </div>

        <div className="panel">
          <span className="eyebrow">Thông tin cuộc hẹn</span>
          <h2>Chi tiết đặt lịch</h2>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <label>
              Chọn mẫu xe lái thử <span className="required">*</span>
              <select value={formData.carId} onChange={handleCarChange} required>
                <option value="">-- Chọn mẫu xe hỗ trợ lái thử --</option>
                {testDriveCars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({Number(c.price || 0).toLocaleString("vi-VN")} VNĐ)
                  </option>
                ))}
              </select>
            </label>

            <div className="form-grid">
              <label>
                Họ và tên khách hàng <span className="required">*</span>
                <input
                  type="text"
                  placeholder="VD: Lê Tuấn Anh"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </label>

              <label>
                Số điện thoại liên hệ <span className="required">*</span>
                <input
                  type="tel"
                  placeholder="VD: 0900000003 (10 số)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Ngày hẹn lái thử (Tương lai) <span className="required">*</span>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </label>

              <label>
                Khung giờ hành chính <span className="required">*</span>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  required
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Ghi chú cho chuyên viên tư vấn
              <textarea
                placeholder="Yêu cầu cung đường trải nghiệm, tư vấn viên kỹ thuật đồng hành..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </label>

            <div style={{ marginTop: "20px" }}>
              <button type="submit" disabled={isSubmitting} style={{ width: "100%" }}>
                {isSubmitting ? "Đang gửi đăng ký..." : "Xác Nhận Đăng Ký Lái Thử"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}