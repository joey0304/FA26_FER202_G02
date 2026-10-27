export const TEST_DRIVE_TIME_SLOTS = [
  "08:30 - 09:30",
  "10:00 - 11:00",
  "14:00 - 15:00",
  "15:30 - 16:30",
];

const DB_KEY = "carstore_lab_db";
const TEST_DRIVES_KEY = "testdrives";

const STATUS_ALIASES = {
  pending: ["pending", "chờ xác nhận", "đang chờ xác nhận", "mới"],
  confirmed: ["confirmed", "đã xác nhận"],
  completed: ["completed", "đã hoàn thành", "hoàn thành"],
  cancelled: ["cancelled", "canceled", "đã hủy", "đã huỷ"],
};

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

function getStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new Error("Trình duyệt không hỗ trợ lưu trữ lịch lái thử.");
  }
  return window.localStorage;
}

function readDatabase(storage) {
  const rawDatabase = storage.getItem(DB_KEY);
  if (!rawDatabase) return null;

  try {
    return JSON.parse(rawDatabase);
  } catch {
    throw new Error("Dữ liệu CarStore trong trình duyệt không hợp lệ.");
  }
}

function getRecordDate(record) {
  if (record.date) return record.date;
  const slot = record.slot || "";
  const match = slot.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

function getRecordTimeSlot(record) {
  if (record.timeSlot) return record.timeSlot;
  const slot = record.slot || "";
  const match = slot.match(/(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})/);
  return match ? match[1].replace(/\s+/g, " ") : "";
}

function getRecordCarId(record) {
  return record.carId ?? record.car_id;
}

export function normalizeTestDriveStatus(status) {
  const normalized = String(status || "").trim().toLocaleLowerCase("vi");
  return (
    Object.entries(STATUS_ALIASES).find(([, aliases]) =>
      aliases.includes(normalized),
    )?.[0] || "pending"
  );
}

export function getTestDriveStatusLabel(status) {
  return STATUS_LABELS[normalizeTestDriveStatus(status)];
}

export function loadTestDrives(fallback = []) {
  const storage = getStorage();
  const storedList = storage.getItem(TEST_DRIVES_KEY);
  if (storedList !== null) {
    try {
      const parsed = JSON.parse(storedList);
      if (!Array.isArray(parsed)) {
        throw new Error("Danh sách lịch lái thử phải là một mảng.");
      }
      return parsed;
    } catch (error) {
      throw new Error(`Không thể đọc lịch lái thử: ${error.message}`);
    }
  }

  const database = readDatabase(storage);
  const databaseList = database?.testdrives ?? database?.testDrives;
  if (databaseList !== undefined) {
    if (!Array.isArray(databaseList)) {
      throw new Error("Dữ liệu lịch lái thử trong CarStore không hợp lệ.");
    }
    return databaseList;
  }
  return fallback;
}

export function loadCars(fallback = []) {
  const storage = getStorage();
  const storedCars = storage.getItem("cars");
  if (storedCars !== null) {
    try {
      const parsed = JSON.parse(storedCars);
      if (!Array.isArray(parsed)) {
        throw new Error("Danh sách xe phải là một mảng.");
      }
      return parsed;
    } catch (error) {
      throw new Error(`Không thể đọc danh sách xe: ${error.message}`);
    }
  }

  const database = readDatabase(storage);
  if (database?.cars !== undefined) {
    if (!Array.isArray(database.cars)) {
      throw new Error("Danh sách xe trong CarStore không hợp lệ.");
    }
    return database.cars;
  }
  return fallback;
}

export function saveTestDrives(list) {
  if (!Array.isArray(list)) {
    throw new Error("Danh sách lịch lái thử phải là một mảng.");
  }

  const storage = getStorage();
  const database = readDatabase(storage);
  if (database) {
    database.testdrives = list;
    if (Object.prototype.hasOwnProperty.call(database, "testDrives")) {
      database.testDrives = list;
    }
    storage.setItem(DB_KEY, JSON.stringify(database));
  }
  storage.setItem(TEST_DRIVES_KEY, JSON.stringify(list));
}

export function getTestDrivesForUser(list, userId) {
  if (userId === undefined || userId === null || userId === "") return [];
  return list.filter(
    (record) => String(record.userId ?? record.user_id) === String(userId),
  );
}

export function isTestDriveEligibleCar(car) {
  if (!car) return false;
  const active =
    car.active === 1 ||
    car.active === true ||
    String(car.status || "").toLowerCase() === "active";
  const supportsTestDrive =
    car.test_drive === 1 ||
    car.test_drive === true ||
    car.supportTestDrive === true;
  return active && supportsTestDrive;
}

export function isFutureDate(date, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return false;
  }

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  return date > todayKey;
}

export function validateTestDriveDetails({
  car,
  date,
  timeSlot,
  customerName,
  phone,
}) {
  if (!isTestDriveEligibleCar(car)) {
    return "Mẫu xe này hiện không hỗ trợ lái thử hoặc đã ngừng kinh doanh.";
  }
  if (!String(customerName || "").trim()) {
    return "Họ và tên khách hàng không được để trống.";
  }
  if (!/^\d{10}$/.test(String(phone || "").trim())) {
    return "Số điện thoại liên hệ phải gồm đúng 10 chữ số.";
  }
  if (!isFutureDate(date)) {
    return "Ngày hẹn lái thử phải ở tương lai (bắt đầu từ ngày mai).";
  }
  if (!TEST_DRIVE_TIME_SLOTS.includes(timeSlot)) {
    return "Khung giờ được chọn không nằm trong giờ làm việc của showroom.";
  }
  return "";
}

export function hasConfirmedTestDriveConflict(
  list,
  { carId, date, timeSlot, id: ignoredId },
) {
  return list.some(
    (record) =>
      String(getRecordCarId(record)) === String(carId) &&
      String(record.id) !== String(ignoredId) &&
      getRecordDate(record) === date &&
      getRecordTimeSlot(record) === timeSlot &&
      normalizeTestDriveStatus(record.status) === "confirmed",
  );
}

export function canRescheduleTestDrive(record) {
  return normalizeTestDriveStatus(record.status) === "pending";
}

export function canCancelTestDrive(record) {
  return normalizeTestDriveStatus(record.status) === "confirmed";
}

export function canDeleteTestDrive(record) {
  return canRescheduleTestDrive(record);
}

export function canTransitionTestDriveStatus(currentStatus, nextStatus) {
  const current = normalizeTestDriveStatus(currentStatus);
  const next = normalizeTestDriveStatus(nextStatus);
  const allowedTransitions = {
    pending: ["pending", "confirmed", "cancelled"],
    confirmed: ["confirmed", "completed", "cancelled"],
    completed: ["completed"],
    cancelled: ["cancelled"],
  };
  return allowedTransitions[current].includes(next);
}
