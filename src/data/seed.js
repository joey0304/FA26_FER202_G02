const initialData={
  "users": [
    {
      "id": 1,
      "name": "Quản trị viên",
      "email": "admin@carstore.local",
      "passwordHash": "d958c9800b9e38230f839ed5e0f13203:c1195b6a28e2dfb745245d063900819ef7515f8f63112a45c18f11723ed19c37",
      "phone": "0900000001",
      "role": "admin",
      "active": 1
    },
    {
      "id": 2,
      "name": "Nhân viên",
      "email": "staff@carstore.local",
      "passwordHash": "559f76dd52e21c1be3f1ed712fc2040c:49784cb77b1689b0970e3fd1889fea935d859c0fc6f1da603e8f532d9005aacb",
      "phone": "0900000002",
      "role": "staff",
      "active": 1
    },
    {
      "id": 3,
      "name": "Khách hàng mẫu",
      "email": "customer@carstore.local",
      "passwordHash": "9f5f4c76e05c5fdeacca5f643662b54c:bd884bdeef1d34a79245cc42319858e411eb388a78c11fcf17b1ae7f45953cdc",
      "phone": "0900000003",
      "role": "customer",
      "active": 1
    }
  ],
  "brands": [
    {
      "id": 1,
      "name": "Porsche",
      "description": "Danh mục xe Porsche trong bộ ảnh được cung cấp.",
      "logo": "",
      "active": 1
    }
  ],
  "types": [
    {
      "id": 1,
      "name": "Coupe",
      "description": "Xe thể thao mui cứng",
      "logo": "",
      "active": 1
    },
    {
      "id": 2,
      "name": "SUV",
      "description": "Xe đa dụng thể thao",
      "logo": "",
      "active": 1
    },
    {
      "id": 3,
      "name": "Sedan",
      "description": "Xe thể thao bốn cửa",
      "logo": "",
      "active": 1
    },
    {
      "id": 4,
      "name": "Convertible",
      "description": "Xe mui trần và targa",
      "logo": "",
      "active": 1
    }
  ],
  "cars": [
    {
      "id": 1,
      "code": "POR001",
      "name": "Porsche 911 Carrera GTS",
      "brand_id": 1,
      "type_id": 1,
      "price": 2770000000,
      "stock": 2,
      "active": 1,
      "test_drive": 1,
      "image": "/images/01_2025-porsche-911-carrera-gts.jpg",
      "year": 2025,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 2,
      "code": "POR002",
      "name": "Porsche 911 GT3 RS",
      "brand_id": 1,
      "type_id": 1,
      "price": 3040000000,
      "stock": 3,
      "active": 1,
      "test_drive": 1,
      "image": "/images/02_2023-porsche-911-gt3-rs.jpg",
      "year": 2023,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 3,
      "code": "POR003",
      "name": "Porsche 911 Turbo s",
      "brand_id": 1,
      "type_id": 1,
      "price": 3310000000,
      "stock": 4,
      "active": 1,
      "test_drive": 1,
      "image": "/images/03_2020-porsche-911-turbo-s.jpg",
      "year": 2020,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 4,
      "code": "POR004",
      "name": "Porsche 911 Targa 4 GTS",
      "brand_id": 1,
      "type_id": 4,
      "price": 3580000000,
      "stock": 1,
      "active": 1,
      "test_drive": 1,
      "image": "/images/04_2025-porsche-911-targa-4-gts.jpg",
      "year": 2025,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 5,
      "code": "POR005",
      "name": "Porsche 911 Speedster",
      "brand_id": 1,
      "type_id": 4,
      "price": 3850000000,
      "stock": 2,
      "active": 1,
      "test_drive": 1,
      "image": "/images/05_2019-porsche-911-speedster.jpg",
      "year": 2019,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 6,
      "code": "POR006",
      "name": "Porsche 911 s t",
      "brand_id": 1,
      "type_id": 1,
      "price": 4120000000,
      "stock": 3,
      "active": 1,
      "test_drive": 1,
      "image": "/images/06_2024-porsche-911-s-t.jpg",
      "year": 2024,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 7,
      "code": "POR007",
      "name": "Porsche 911 sport classic",
      "brand_id": 1,
      "type_id": 1,
      "price": 4390000000,
      "stock": 4,
      "active": 1,
      "test_drive": 1,
      "image": "/images/07_2023-porsche-911-sport-classic.jpg",
      "year": 2023,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 8,
      "code": "POR008",
      "name": "Porsche 918 Spyder",
      "brand_id": 1,
      "type_id": 4,
      "price": 4660000000,
      "stock": 1,
      "active": 1,
      "test_drive": 1,
      "image": "/images/08_2015-porsche-918-spyder.jpg",
      "year": 2015,
      "fuel": "Hybrid",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 9,
      "code": "POR009",
      "name": "Porsche Carrera gt",
      "brand_id": 1,
      "type_id": 1,
      "price": 4930000000,
      "stock": 2,
      "active": 1,
      "test_drive": 1,
      "image": "/images/09_2004-porsche-carrera-gt.jpg",
      "year": 2004,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 10,
      "code": "POR010",
      "name": "Porsche 718 Cayman GT4 RS",
      "brand_id": 1,
      "type_id": 1,
      "price": 5200000000,
      "stock": 3,
      "active": 1,
      "test_drive": 1,
      "image": "/images/10_2022-porsche-718-cayman-gt4-rs.jpg",
      "year": 2022,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 11,
      "code": "POR011",
      "name": "Porsche 718 Cayman GTS 4 0",
      "brand_id": 1,
      "type_id": 1,
      "price": 5470000000,
      "stock": 4,
      "active": 1,
      "test_drive": 1,
      "image": "/images/11_2020-porsche-718-cayman-gts-4-0.jpg",
      "year": 2020,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 12,
      "code": "POR012",
      "name": "Porsche 718 Boxster Spyder",
      "brand_id": 1,
      "type_id": 4,
      "price": 5740000000,
      "stock": 1,
      "active": 1,
      "test_drive": 1,
      "image": "/images/12_2020-porsche-718-boxster-spyder.jpg",
      "year": 2020,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 13,
      "code": "POR013",
      "name": "Porsche 718 Boxster",
      "brand_id": 1,
      "type_id": 4,
      "price": 6010000000,
      "stock": 2,
      "active": 1,
      "test_drive": 1,
      "image": "/images/13_2017-porsche-718-boxster.jpg",
      "year": 2017,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 14,
      "code": "POR014",
      "name": "Porsche Cayenne Turbo gt",
      "brand_id": 1,
      "type_id": 2,
      "price": 6280000000,
      "stock": 3,
      "active": 1,
      "test_drive": 1,
      "image": "/images/14_2022-porsche-cayenne-turbo-gt.jpg",
      "year": 2022,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 15,
      "code": "POR015",
      "name": "Porsche Cayenne GTS",
      "brand_id": 1,
      "type_id": 2,
      "price": 6550000000,
      "stock": 4,
      "active": 1,
      "test_drive": 1,
      "image": "/images/15_2020-porsche-cayenne-gts.jpg",
      "year": 2020,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 16,
      "code": "POR016",
      "name": "Porsche Cayenne Turbo coupe",
      "brand_id": 1,
      "type_id": 2,
      "price": 6820000000,
      "stock": 1,
      "active": 1,
      "test_drive": 1,
      "image": "/images/16_2020-porsche-cayenne-turbo-coupe.jpg",
      "year": 2020,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 17,
      "code": "POR017",
      "name": "Porsche Macan Turbo",
      "brand_id": 1,
      "type_id": 2,
      "price": 7090000000,
      "stock": 2,
      "active": 1,
      "test_drive": 1,
      "image": "/images/17_2025-porsche-macan-turbo.jpg",
      "year": 2025,
      "fuel": "Điện",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 18,
      "code": "POR018",
      "name": "Porsche Macan GTS",
      "brand_id": 1,
      "type_id": 2,
      "price": 7360000000,
      "stock": 3,
      "active": 1,
      "test_drive": 1,
      "image": "/images/18_2022-porsche-macan-gts.jpg",
      "year": 2022,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 19,
      "code": "POR019",
      "name": "Porsche Macan s",
      "brand_id": 1,
      "type_id": 2,
      "price": 7630000000,
      "stock": 4,
      "active": 1,
      "test_drive": 1,
      "image": "/images/19_2019-porsche-macan-s.jpg",
      "year": 2019,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 20,
      "code": "POR020",
      "name": "Porsche 356c",
      "brand_id": 1,
      "type_id": 1,
      "price": 7900000000,
      "stock": 1,
      "active": 1,
      "test_drive": 0,
      "image": "/images/20_1964-porsche-356c.jpg",
      "year": 1964,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 21,
      "code": "POR021",
      "name": "Porsche 550 Spyder",
      "brand_id": 1,
      "type_id": 4,
      "price": 8170000000,
      "stock": 2,
      "active": 1,
      "test_drive": 0,
      "image": "/images/21_1954-porsche-550-spyder.jpg",
      "year": 1954,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 22,
      "code": "POR022",
      "name": "Porsche 914",
      "brand_id": 1,
      "type_id": 1,
      "price": 8440000000,
      "stock": 3,
      "active": 1,
      "test_drive": 0,
      "image": "/images/22_1970-porsche-914.jpg",
      "year": 1970,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 23,
      "code": "POR023",
      "name": "Porsche 924 Carrera gt",
      "brand_id": 1,
      "type_id": 1,
      "price": 8710000000,
      "stock": 4,
      "active": 1,
      "test_drive": 0,
      "image": "/images/23_1980-porsche-924-carrera-gt.jpg",
      "year": 1980,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 24,
      "code": "POR024",
      "name": "Porsche 928 GTS",
      "brand_id": 1,
      "type_id": 1,
      "price": 8980000000,
      "stock": 1,
      "active": 1,
      "test_drive": 0,
      "image": "/images/24_1991-porsche-928-gts.jpg",
      "year": 1991,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 25,
      "code": "POR025",
      "name": "Porsche 944 Turbo",
      "brand_id": 1,
      "type_id": 1,
      "price": 9250000000,
      "stock": 2,
      "active": 1,
      "test_drive": 0,
      "image": "/images/25_1985-porsche-944-turbo.jpg",
      "year": 1985,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 26,
      "code": "POR026",
      "name": "Porsche 959",
      "brand_id": 1,
      "type_id": 1,
      "price": 9520000000,
      "stock": 3,
      "active": 1,
      "test_drive": 0,
      "image": "/images/26_1986-porsche-959.jpg",
      "year": 1986,
      "fuel": "Xăng",
      "transmission": "Tự động",
      "seats": 2,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 27,
      "code": "POR027",
      "name": "Porsche Taycan Turbo gt with manthey kit",
      "brand_id": 1,
      "type_id": 3,
      "price": 9790000000,
      "stock": 4,
      "active": 1,
      "test_drive": 1,
      "image": "/images/27_2026-porsche-taycan-turbo-gt-with-manthey-kit.jpg",
      "year": 2026,
      "fuel": "Điện",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 28,
      "code": "POR028",
      "name": "Porsche Taycan Turbo gt",
      "brand_id": 1,
      "type_id": 3,
      "price": 10060000000,
      "stock": 1,
      "active": 1,
      "test_drive": 1,
      "image": "/images/28_2025-porsche-taycan-turbo-gt.jpg",
      "year": 2025,
      "fuel": "Điện",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 29,
      "code": "POR029",
      "name": "Porsche Panamera Turbo s e hybrid",
      "brand_id": 1,
      "type_id": 3,
      "price": 10330000000,
      "stock": 2,
      "active": 1,
      "test_drive": 1,
      "image": "/images/29_2025-porsche-panamera-turbo-s-e-hybrid.jpg",
      "year": 2025,
      "fuel": "Hybrid",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    },
    {
      "id": 30,
      "code": "POR030",
      "name": "Porsche Panamera Turbo e hybrid",
      "brand_id": 1,
      "type_id": 3,
      "price": 10600000000,
      "stock": 3,
      "active": 1,
      "test_drive": 1,
      "image": "/images/30_2024-porsche-panamera-turbo-e-hybrid.jpg",
      "year": 2024,
      "fuel": "Hybrid",
      "transmission": "Tự động",
      "seats": 5,
      "specs": "Dữ liệu thông số và giá phục vụ đồ án, không phải báo giá hay thông số chính hãng. Tên mẫu xe/năm lấy theo tên ảnh được cung cấp."
    }
  ],
  "consultations": [],
  "testdrives": [],
  "orders": []
};
function dateOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createSampleTestDrives(cars) {
  const slots = [
    "08:30 - 09:30",
    "10:00 - 11:00",
    "14:00 - 15:00",
    "15:30 - 16:30",
  ];
  const statuses = [
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đã hoàn thành",
    "Đã hủy",
  ];
  const notes = [
    "Muốn trải nghiệm khả năng tăng tốc và độ ổn định.",
    "Quan tâm đến độ êm ái khi di chuyển trong thành phố.",
    "Muốn tìm hiểu chế độ lái và hệ thống hỗ trợ người lái.",
    "Khách đề nghị chuẩn bị xe và tư vấn thông số trước buổi hẹn.",
    "Muốn trải nghiệm xe cùng người thân.",
    "Đã trao đổi với nhân viên về cấu hình và trang bị.",
  ];
  const resultNotes = [
    "Khách hài lòng với cảm giác lái và đang cân nhắc đặt mua.",
    "Đã tư vấn thêm về trang bị; khách sẽ liên hệ lại sau.",
    "Khách đánh giá cao khả năng vận hành và độ hoàn thiện.",
  ];
  const eligibleCars = cars.filter(
    (car) => car.active === 1 && car.test_drive === 1,
  );
  const testDrives = eligibleCars.map((car, index) => {
    const status = statuses[index % statuses.length];
    const date =
      status === "Đã hoàn thành"
        ? dateOffset(-1 - (index % 12))
        : dateOffset(3 + (index % 20));
    const timeSlot = slots[index % slots.length];
    const isCompleted = status === "Đã hoàn thành";

    return {
      id: `TD-SEED-${String(index + 1).padStart(3, "0")}`,
      userId: 3,
      customerName: "Khách hàng mẫu",
      phone: "0900000003",
      carId: car.id,
      carName: car.name,
      carImage: car.image,
      date,
      timeSlot,
      slot: `${date} (${timeSlot})`,
      note: notes[index % notes.length],
      status,
      resultNote: isCompleted
        ? resultNotes[index % resultNotes.length]
        : "",
      createdAt: new Date(
        `${date}T${isCompleted ? "09:00:00" : "08:00:00"}`,
      ).toISOString(),
    };
  });

  // Tạo một cặp lịch chờ và đã xác nhận cùng khung giờ để kiểm tra xung đột.
  const firstAppointment = testDrives[0];
  if (firstAppointment) {
    testDrives.push({
      ...firstAppointment,
      id: "TD-SEED-CONFLICT",
      status: "Đã xác nhận",
      note: "Lịch mẫu xác nhận để kiểm tra trường hợp trùng khung giờ.",
      resultNote: "",
    });
  }

  return testDrives;
}

export function createSeed() {
  const data = JSON.parse(JSON.stringify(initialData));
  data.testdrives = createSampleTestDrives(data.cars);
  return data;
}
