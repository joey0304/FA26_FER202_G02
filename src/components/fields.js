// Cấu hình dùng chung cho trường lựa chọn trạng thái hoạt động.
export const activeField = {
  key: "active",
  label: "Trạng thái",
  options: [
    { value: 1, label: "Đang hoạt động" },
    { value: 0, label: "Ngừng hoạt động" },
  ],
};

// Ánh xạ mã trạng thái nghiệp vụ sang nhãn tiếng Việt để hiển thị.
export const labels = {
  new: "Mới",
  processing: "Đang xử lý",
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Tạo cấu hình trường trạng thái theo danh sách trạng thái được phép.
export const statusField = (values) => ({
  key: "status",
  label: "Trạng thái xử lý",
  options: values.map((value) => ({
    value,
    label: labels[value],
  })),
});
