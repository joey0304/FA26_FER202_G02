// Chức năng: Read/Update/Delete lịch lái thử của tài khoản đang đăng nhập.
// Chỉ yêu cầu mới/chờ được sửa/xóa; trạng thái đã xác nhận do nhân viên xử lý.
import RequestList from "../components/RequestList";
export default function MyTestDrivesPage(){return <RequestList resource="testdrives" title="Lịch lái thử của tôi"/>;}
