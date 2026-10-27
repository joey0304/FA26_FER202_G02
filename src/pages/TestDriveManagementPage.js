// Chức năng: nhân viên đọc toàn bộ, cập nhật trạng thái và xóa yêu cầu còn mới.
// dịch vụ local kiểm tra chuyển trạng thái; không cho sửa hồ sơ đã hoàn tất.
import RequestList from "../components/RequestList";
export default function TestDriveManagementPage(){return <RequestList resource="testdrives" title="Quản lý lịch lái thử" manage/>;}
