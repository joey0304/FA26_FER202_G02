import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createSeed } from "../data/seed";
import {
  hasConfirmedTestDriveConflict,
  isTestDriveEligibleCar,
  loadCars,
  loadTestDrives,
  saveTestDrives,
  TEST_DRIVE_TIME_SLOTS,
  validateTestDriveDetails,
} from "../services/testDriveService";

export default function TestDriveBookingPage() {
  // Lấy phiên đăng nhập, tham số xe từ URL và hàm điều hướng sau khi đặt lịch.
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Hỗ trợ cả hai dạng liên kết cũ và mới: ?carId=... hoặc ?car=...
  const queryCarId = searchParams.get("carId") || searchParams.get("car") || "";

  // Lưu danh sách xe, lịch hiện có và xe đang được chọn trong form.
  const [cars, setCars] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  // Khởi tạo thông tin liên hệ từ tài khoản nếu người dùng đã đăng nhập.
  const [formData, setFormData] = useState({
    carId: queryCarId,
    customerName: user?.name || "",
    phone: user?.phone || "",
    date: "",
    timeSlot: TEST_DRIVE_TIME_SLOTS[0],
    note: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nạp dữ liệu xe và lịch; nếu URL có mã xe hợp lệ thì chọn sẵn xe đó.
  useEffect(() => {
    try {
      const seedData = createSeed();
      const storedCars = loadCars(seedData.cars || []);
      const storedTestDrives = loadTestDrives(seedData.testdrives || []);
      const availableCars = storedCars.filter(isTestDriveEligibleCar);
      const targetCar =
        availableCars.find((car) => String(car.id) === String(queryCarId)) ||
        availableCars[0] ||
        null;

      setCars(storedCars);
      setTestDrives(storedTestDrives);
      setSelectedCar(targetCar);
      if (targetCar) {
        setFormData((prev) => ({ ...prev, carId: String(targetCar.id) }));
      }
    } catch (storageError) {
      setError(storageError.message);
    }
  }, [queryCarId]);

  // Điền tên và số điện thoại sau khi thông tin phiên đăng nhập sẵn sàng.
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  // Đồng bộ xe được chọn trên giao diện với dữ liệu form.
  const handleCarChange = (e) => {
    const cid = e.target.value;
    const found = cars.find((c) => String(c.id) === String(cid));
    setSelectedCar(found || null);
    setFormData((prev) => ({ ...prev, carId: cid }));
  };

  // Kiểm tra dữ liệu, ngăn đặt trùng lịch đã xác nhận rồi lưu lịch mới.
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (user && (user.active === 0 || user.status === "Locked")) {
      setError("Tài khoản của bạn đã bị vô hiệu hóa hoặc khóa. Không thể tạo yêu cầu mới.");
      return;
    }

    // Service kiểm tra xe hợp lệ, thông tin liên hệ, ngày tương lai và khung giờ.
    const validationError = validateTestDriveDetails({
      car: selectedCar,
      ...formData,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    // Mỗi xe chỉ có thể có một lịch đã xác nhận ở cùng ngày và khung giờ.
    if (
      hasConfirmedTestDriveConflict(testDrives, {
        carId: selectedCar.id,
        date: formData.date,
        timeSlot: formData.timeSlot,
      })
    ) {
      setError(`Mẫu xe "${selectedCar.name}" đã có một lịch "Đã xác nhận" vào ngày ${formData.date} lúc ${formData.timeSlot}. Vui lòng chọn ngày hoặc giờ khác!`);
      return;
    }

    setIsSubmitting(true);

    // Tạo bản ghi theo cấu trúc được các trang cá nhân và quản lý sử dụng.
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

    try {
      // Lưu lịch mới lên đầu danh sách và chuyển khách sang trang theo dõi.
      const updatedList = [newTestDrive, ...testDrives];
      saveTestDrives(updatedList);
      setTestDrives(updatedList);
      setSuccess("Đăng ký lịch lái thử thành công! Showroom sẽ liên hệ để xác nhận lịch với bạn.");
      setTimeout(() => navigate("/my/testdrives"), 1500);
    } catch (storageError) {
      setError(storageError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chỉ hiển thị xe đang kinh doanh và được bật chức năng lái thử.
  const testDriveCars = cars.filter(isTestDriveEligibleCar);

  return (
    <div>
      {/* Tiêu đề trang và lối tắt đến danh sách lịch cá nhân. */}
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

      {/* Bố cục gồm phần xem trước xe và form đăng ký lịch lái thử. */}
      <div className="booking-layout">
        {/* Thông tin xe thay đổi theo lựa chọn của khách hàng. */}
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

        {/* Form đặt lịch; thông báo lỗi/thành công hiển thị ngay phía trên. */}
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
                  {TEST_DRIVE_TIME_SLOTS.map((slot) => (
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