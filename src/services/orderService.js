const DB_KEY = "carstore_lab_db";
const ORDERS_KEY = "orders";

const STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_ALIASES = {
  pending: ["pending", "chờ xác nhận", "mới"],
  confirmed: ["confirmed", "đã xác nhận"],
  processing: ["processing", "đang xử lý"],
  completed: ["completed", "hoàn thành", "đã hoàn thành"],
  cancelled: ["cancelled", "canceled", "đã hủy", "đã huỷ"],
};

function storage() {
  if (
    typeof window === "undefined" ||
    !window.localStorage
  ) {
    throw new Error(
      "Trình duyệt không hỗ trợ lưu dữ liệu đơn hàng."
    );
  }

  return window.localStorage;
}

function readDatabase(store) {
  const raw = store.getItem(DB_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Dữ liệu CarStore không hợp lệ.");
  }
}

export function normalizeOrderStatus(status) {
  const value = String(status || "pending")
    .trim()
    .toLocaleLowerCase("vi");

  return (
    Object.entries(STATUS_ALIASES).find(
      ([, aliases]) => aliases.includes(value)
    )?.[0] || "pending"
  );
}

export function getOrderStatusLabel(status) {
  return STATUS_LABELS[normalizeOrderStatus(status)];
}

export function loadOrders(fallback = []) {
  const store = storage();

  const raw = store.getItem(ORDERS_KEY);

  if (raw !== null) {
    try {
      const list = JSON.parse(raw);

      if (!Array.isArray(list)) {
        throw new Error(
          "Danh sách đơn hàng phải là một mảng."
        );
      }

      return list;
    } catch (error) {
      throw new Error(
        `Không thể đọc đơn hàng: ${error.message}`
      );
    }
  }

  const database = readDatabase(store);
  const list = database?.orders;

  if (list !== undefined) {
    if (!Array.isArray(list)) {
      throw new Error(
        "Dữ liệu đơn hàng không hợp lệ."
      );
    }

    return list;
  }

  return fallback;
}

export function saveOrders(list) {
  if (!Array.isArray(list)) {
    throw new Error(
      "Danh sách đơn hàng phải là một mảng."
    );
  }

  const store = storage();

  const database = readDatabase(store);

  if (database) {
    database.orders = list;

    store.setItem(
      DB_KEY,
      JSON.stringify(database)
    );
  }

  store.setItem(
    ORDERS_KEY,
    JSON.stringify(list)
  );
}

export function getOrdersForUser(list, userId) {
  if (
    userId === undefined ||
    userId === null ||
    userId === ""
  ) {
    return [];
  }

  return list.filter(
    (order) =>
      String(order.userId ?? order.user_id) ===
      String(userId)
  );
}

export function canCancelOrder(order) {
  return (
    normalizeOrderStatus(order.status) === "pending"
  );
}

export function canDeleteOrder(order) {
  const status = normalizeOrderStatus(order.status);

  return (
    status === "pending" ||
    status === "cancelled"
  );
}

export function canTransitionOrderStatus(
  currentStatus,
  nextStatus
) {
  const current = normalizeOrderStatus(currentStatus);
  const next = normalizeOrderStatus(nextStatus);

  const allowed = {
    pending: ["pending", "confirmed", "cancelled"],
    confirmed: [
      "confirmed",
      "processing",
      "cancelled",
    ],
    processing: [
      "processing",
      "completed",
      "cancelled",
    ],
    completed: ["completed"],
    cancelled: ["cancelled"],
  };

  return allowed[current].includes(next);
}

export function createOrderId(list) {
  const maxId = list.reduce((max, item) => {
    const number = Number(
      String(item.id).replace(/\D/g, "")
    );

    return Number.isFinite(number)
      ? Math.max(max, number)
      : max;
  }, 0);

  return `OD${String(maxId + 1).padStart(5, "0")}`;
}