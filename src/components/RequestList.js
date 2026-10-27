import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storeRequest } from "../services/carStoreService";
import CrudPage from "./CrudPage";
import { labels, statusField } from "./fields";

// Hiển thị các yêu cầu của khách hàng hoặc hỗ trợ nhân viên quản lý chúng.
export default function RequestList({ resource, title, manage = false }) {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");

  // Tải xe để đối chiếu mã xe với tên hiển thị trong bảng yêu cầu.
  useEffect(() => {
    storeRequest("cars")
      .then(setCars)
      .catch((requestError) => setError(requestError.message));
  }, []);

  // Trạng thái ban đầu khác nhau giữa yêu cầu tư vấn và các loại yêu cầu khác.
  const start = resource === "consultations" ? "new" : "pending";

  // Tạo bộ trường nhập với trạng thái hợp lệ theo loại yêu cầu và quyền hạn.
  function fields(row) {
    const status = row?.status || start;
    const states = manage
      ? resource === "consultations"
        ? status === "new"
          ? ["new", "processing", "cancelled"]
          : ["processing", "completed", "cancelled"]
        : status === "pending"
          ? ["pending", "confirmed", "cancelled"]
          : ["confirmed", "completed", "cancelled"]
      : [start, "cancelled"];

    return [
      { key: "name", label: "Họ tên" },
      { key: "phone", label: "Số điện thoại" },
      ...(resource === "consultations"
        ? [
            { key: "content", label: "Nội dung", type: "textarea" },
            ...(manage
              ? [
                  {
                    key: "note",
                    label: "Ghi chú nhân viên",
                    type: "textarea",
                    required: false,
                  },
                ]
              : []),
          ]
        : resource === "testdrives"
          ? [
              {
                key: "slot",
                label: "Ngày giờ lái thử",
                type: "datetime-local",
                help: "Đầu giờ 08:00–16:00 Việt Nam; mỗi lượt một giờ.",
              },
            ]
          : []),
      statusField(states),
    ];
  }

  // Cho phép khách hủy lịch lái thử đã được xác nhận.
  async function cancel(row) {
    if (!window.confirm("Hủy lịch lái thử đã xác nhận này?")) return;

    await storeRequest(resource + "/" + row.id, "PUT", {
      ...row,
      status: "cancelled",
    });
  }

  // Đổi mã xe thành tên; trường hợp không có xe sẽ hiển thị thông tin phù hợp.
  const carName = (row) =>
    cars.find((car) => car.id === row.car_id)?.name ||
    (row.car_id ? "Xe #" + row.car_id : "Tư vấn chung");

  return (
    <>
      {/* Nút tạo yêu cầu mới chỉ xuất hiện trong trang của khách hàng. */}
      {!manage && (
        <div className="actions">
          <Link className="button" to={"/" + resource + "/new"}>
            + Tạo yêu cầu mới
          </Link>
        </div>
      )}
      {error && (
        <p className="error">{error}</p>
      )}

      {/* Tái sử dụng bảng CRUD chung cho danh sách yêu cầu. */}
      <CrudPage
        resource={resource}
        title={title}
        fields={fields}
        canCreate={false}
        allowEdit={(row) =>
          manage
            ? !["completed", "cancelled"].includes(row.status)
            : row.status === start
        }
        allowDelete={(row) => row.status === start}
        extraAction={
          !manage && resource === "testdrives"
            ? {
                label: "Hủy lịch",
                visible: (row) => row.status === "confirmed",
                run: cancel,
              }
            : undefined
        }
        columns={[
          { key: "car_id", label: "Xe", render: carName },
          { key: "name", label: "Khách hàng" },
          { key: "phone", label: "Điện thoại" },
          ...(resource === "orders"
            ? [{ key: "price", label: "Giá đã chốt" }]
            : resource === "testdrives"
              ? [
                  {
                    key: "slot",
                    label: "Giờ hẹn (VN)",
                    render: (row) =>
                      new Date(row.slot).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      }),
                  },
                ]
              : [
                  { key: "content", label: "Nội dung" },
                  { key: "note", label: "Ghi chú" },
                ]),
          {
            key: "status",
            label: "Trạng thái",
            render: (row) => (
              <span className={"status " + row.status}>
                {labels[row.status]}
              </span>
            ),
          },
        ]}
        detailFields={[
          { key: "user_id", label: "Mã khách hàng" },
          {
            key: "created_at",
            label: "Ngày gửi",
            render: (row) =>
              row.created_at
                ? new Date(row.created_at).toLocaleString("vi-VN")
                : "—",
          },
        ]}
      />
    </>
  );
}
