import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeRequest } from '../services/carStoreService';
import CarCard from '../components/CarCard';

export default function HomePage() {
    // State lưu trữ danh sách 6 xe nổi bật và thông báo lỗi API (nếu có)
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');

    // Gọi API lấy dữ liệu xe khi Trang chủ được mount lần đầu
    useEffect(() => {
        // Lấy toàn bộ danh mục xe từ endpoint 'cars'
        storeRequest('cars')
            .then(rows =>
                // Lọc xe đang hoạt động (active), sắp xếp theo ID và lấy 6 xe đầu làm nổi bật
                setCars(
                    rows
                        .filter(c => c.active)
                        .sort((a, b) => a.id - b.id)
                        .slice(0, 6)
                )
            )
            .catch(e => setError(e.message));
    }, []);

    return (
        <>
            {/* 1. Phần Hero Banner giới thiệu thương hiệu */}
            <section className="hero">
                <img
                    className="hero-image"
                    src="/images/04_2025-porsche-911-targa-4-gts.jpg"
                    alt="Porsche 911 Targa 4 GTS"
                />

                <div className="hero-overlay" />

                <div className="hero-content">
                    <p className="eyebrow">
                        CARSTORE / PORSCHE COLLECTION
                    </p>

                    <h1>
                        Đam mê dẫn lối.
                        <br />
                        Phong cách riêng bạn.
                    </h1>

                    <p>
                        Khám phá bộ sưu tập, so sánh mẫu xe
                        và lên lịch cho trải nghiệm lái tiếp theo.
                    </p>

                    <div className="actions">
                        {/* Nút điều hướng sang trang danh sách xe (/cars) */}
                        <Link
                            className="button light"
                            to="/cars"
                        >
                            Khám phá bộ sưu tập →
                        </Link>

                        {/* Nút điều hướng sang trang đặt lịch lái thử (/testdrives/new) */}
                        <Link
                            className="button outline"
                            to="/testdrives/new"
                        >
                            Đăng ký lái thử
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. Thống kê nhanh về quy mô bộ sưu tập */}
            <div className="intro-strip">
                <div>
                    <strong>30</strong>
                    <span>Mẫu xe trong bộ sưu tập</span>
                </div>

                <div>
                    <strong>04</strong>
                    <span>Kiểu dáng để khám phá</span>
                </div>

                <div>
                    <strong>01</strong>
                    <span>Không gian cho đam mê</span>
                </div>
            </div>

            {/* 3. Khu vực hiển thị danh sách xe nổi bật */}
            <section>
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">
                            ĐƯỢC LỰA CHỌN
                        </p>

                        <h2>
                            Những mẫu xe nổi bật
                        </h2>
                    </div>

                    {/* Điều hướng xem toàn bộ kho xe (/cars) */}
                    <Link to="/cars">
                        Xem toàn bộ xe →
                    </Link>
                </div>

                {/* Hiển thị thông báo lỗi nếu fetch API thất bại */}
                {error && (
                    <p className="error" role="alert">
                        {error}
                    </p>
                )}

                {/* Map từ state 'cars' (6 xe) render ra từng CarCard */}
                <div className="car-grid">
                    {cars.map(c => (
                        <CarCard
                            key={c.id}
                            car={c}
                            onError={setError}
                        />
                    ))}
                </div>
            </section>

            {/* 4. Khối dịch vụ nhanh - Điều hướng sang các chức năng chính */}
            <section className="service-grid">
                {/* Điều hướng sang trang So sánh xe (/compare) */}
                <Link to="/compare">
                    <span>
                        01 / KHÁM PHÁ
                    </span>

                    <h2>
                        So sánh xe
                    </h2>

                    <p>
                        Đặt thông số cạnh nhau để tìm
                        mẫu xe phù hợp.
                    </p>
                </Link>

                {/* Điều hướng sang trang Đăng ký tư vấn (/consultations/new) */}
                <Link to="/consultations/new">
                    <span>
                        02 / KẾT NỐI
                    </span>

                    <h2>
                        Yêu cầu tư vấn
                    </h2>

                    <p>
                        Gửi câu hỏi và theo dõi kết quả
                        xử lý của nhân viên.
                    </p>
                </Link>

                {/* Điều hướng sang trang Đặt lịch lái thử (/testdrives/new) */}
                <Link to="/testdrives/new">
                    <span>
                        03 / TRẢI NGHIỆM
                    </span>

                    <h2>
                        Đăng ký lái thử
                    </h2>

                    <p>
                        Chọn mẫu xe và khung giờ
                        trải nghiệm mong muốn.
                    </p>
                </Link>
            </section>
        </>
    );
}
