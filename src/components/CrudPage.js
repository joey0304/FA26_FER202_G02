import { useCallback, useEffect, useState } from "react";
import { money, storeRequest } from "../services/carStoreService";
import { labels } from "./fields";

// Bảng CRUD tổng quát; trang cha truyền cấu hình cột, form và quyền thao tác.
export default function CrudPage({
  resource,
  title,
  fields,
  columns,
  defaults = {},
  canCreate = true,
  canDelete = true,
  allowEdit = () => true,
  allowDelete = () => true,
  extraAction,
  detailFields = [],
}) {
  // Trạng thái dữ liệu, form, chi tiết, thông báo và tìm kiếm của bảng.
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  // Đọc danh sách bản ghi hiện tại từ API.
  const load = useCallback(async () => {
    setRows(await storeRequest(resource));
  }, [resource]);

  // Tải lại dữ liệu khi resource thay đổi và báo lỗi nếu API thất bại.
  useEffect(() => {
    load().catch((requestError) => setError(requestError.message));
  }, [load]);

  // Hỗ trợ cấu hình trường tĩnh hoặc tạo trường dựa trên bản ghi đang sửa.
  const currentFields = typeof fields === "function" ? fields(form) : fields;

  // Tạo bản ghi mới hoặc cập nhật bản ghi hiện tại rồi nạp lại danh sách.
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await storeRequest(
        resource + (form.id ? "/" + form.id : ""),
        form.id ? "PUT" : "POST",
        form,
      );
      setForm(null);
      setMessage("Đã lưu dữ liệu.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  // Xóa bản ghi sau khi người dùng xác nhận và cập nhật lại bảng.
  async function remove(row) {
    if (!window.confirm("Bạn muốn xóa hồ sơ #" + row.id + "?")) return;

    setError("");
    setMessage("");
    try {
      await storeRequest(resource + "/" + row.id, "DELETE");
      await load();
      setMessage("Đã xóa hồ sơ.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  // Thực hiện thao tác bổ sung do trang cha cung cấp, ví dụ hủy lịch.
  async function action(row) {
    setError("");
    try {
      await extraAction.run(row);
      await load();
      setMessage("Đã cập nhật trạng thái.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  // Chuyển giá trị của một cột thành nội dung có thể hiển thị trong bảng.
  function value(row, column) {
    if (column.render) return column.render(row);
    if (column.key === "price") return money(row.price);
    if (column.key === "status") return labels[row.status];
    return String(row[column.key] ?? "—");
  }

  // Lọc các bản ghi dựa trên nội dung tìm kiếm không phân biệt hoa thường.
  const visible = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section>
      {/* Tiêu đề, số lượng bản ghi và nút mở form tạo mới. */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">CARSTORE / QUẢN LÝ</p>
          <h1>{title}</h1>
          <p>{rows.length} hồ sơ trong hệ thống</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setError("");
              setForm({ ...defaults });
            }}
          >
            + Thêm mới
          </button>
        )}
      </div>

      {/* Khu vực thông báo lỗi hoặc kết quả thao tác. */}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}

      {/* Form dùng chung để thêm mới hoặc chỉnh sửa bản ghi. */}
      {form && (
        <form className="panel edit-form" onSubmit={save}>
          <h2>{form.id ? "Cập nhật #" + form.id : "Thêm mới"}</h2>
          <div className="form-grid">
            {currentFields
              .filter((field) => !field.onlyCreate || !form.id)
              .map((field) => (
                <label key={field.key}>
                  {field.label}
                  {field.required !== false && (
                    <span className="required"> *</span>
                  )}

                  {/* Dùng select, textarea hoặc input theo cấu hình trường. */}
                  {field.options ? (
                    <select
                      required={field.required !== false}
                      disabled={field.disabled}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          [field.key]: event.target.value,
                        })
                      }
                    >
                      <option value="">-- Chọn --</option>
                      {field.options.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      required={field.required !== false}
                      value={form[field.key] ?? ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          [field.key]: event.target.value,
                        })
                      }
                    />
                  ) : (
                    <input
                      required={field.required !== false}
                      disabled={field.disabled}
                      type={field.type || "text"}
                      min={field.min}
                      max={field.max}
                      step={field.type === "number" ? 1 : undefined}
                      value={
                        field.type === "datetime-local" && form[field.key]
                          ? localTime(form[field.key])
                          : form[field.key] ?? ""
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          [field.key]:
                            field.type === "datetime-local"
                              ? event.target.value
                                ? new Date(event.target.value).toISOString()
                                : ""
                              : event.target.value,
                        })
                      }
                    />
                  )}

                  {/* Hiển thị hướng dẫn thêm nếu trường có cấu hình help. */}
                  {field.help && <small>{field.help}</small>}
                </label>
              ))}
          </div>

          {/* Lưu form hoặc đóng mà không gửi dữ liệu. */}
          <div className="actions">
            <button disabled={busy}>
              {busy ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => setForm(null)}
            >
              Đóng
            </button>
          </div>
        </form>
      )}

      {/* Ô tìm kiếm và tổng số kết quả sau lọc. */}
      <div className="table-toolbar">
        <input
          aria-label="Tìm trong bảng"
          placeholder="Tìm theo mã, khách hàng, nội dung..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span>{visible.length} kết quả</span>
      </div>

      {/* Bảng dữ liệu với các nút thao tác theo quyền của từng bản ghi. */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td>#{row.id}</td>
                {columns.map((column) => (
                  <td key={column.key}>{value(row, column)}</td>
                ))}
                <td>
                  <div className="row-actions">
                    <button
                      className="secondary"
                      onClick={() => setDetail(row)}
                    >
                      Chi tiết
                    </button>
                    {allowEdit(row) && (
                      <button
                        onClick={() => {
                          setError("");
                          setForm({ ...row, password: "" });
                          window.scrollTo(0, 0);
                        }}
                      >
                        Sửa
                      </button>
                    )}
                    {canDelete && allowDelete(row) && (
                      <button
                        className="danger"
                        onClick={() => remove(row)}
                      >
                        Xóa
                      </button>
                    )}
                    {extraAction && extraAction.visible(row) && (
                      <button
                        className="danger"
                        onClick={() => action(row)}
                      >
                        {extraAction.label}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="empty">Chưa có dữ liệu phù hợp.</div>
        )}
      </div>

      {/* Hộp thoại hiển thị dữ liệu chi tiết của bản ghi được chọn. */}
      {detail && (
        <div className="modal-backdrop">
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-label={"Chi tiết #" + detail.id}
          >
            <h2>Chi tiết hồ sơ #{detail.id}</h2>
            <dl className="detail-list">
              {[
                ...columns,
                ...detailFields.filter(
                  (field) => !columns.some((column) => column.key === field.key),
                ),
              ].map((column) => (
                <div key={column.key}>
                  <dt>{column.label}</dt>
                  <dd>{value(detail, column)}</dd>
                </div>
              ))}
            </dl>
            <button onClick={() => setDetail(null)}>Đóng chi tiết</button>
          </section>
        </div>
      )}
    </section>
  );
}

// Chuyển thời gian ISO sang định dạng local để dùng trong input datetime-local.
function localTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
}
