# Database

```text
database/
├── source/       # SQL nguồn do owner sửa và bàn giao
└── migrations/   # Migration được tích hợp, có thứ tự chạy rõ ràng
```

Trong workspace hiện tại, schema và migration đã có tại `../../wireframe/room_rental_wireframe_v5/database/`. Thư mục đó nằm ngoài repository Trọday; cần tích hợp bản SQL đã review vào repository khi thực hiện task database. Khung này chưa sao chép, thay đổi hoặc thực thi SQL.

Schema hiện có dùng MySQL 8.0.16 trở lên, khuyến nghị MySQL 8.4; tạo database `room_rental_v5_20261023`. Script `schema.sql` tạo mới database nên phải kiểm tra môi trường và tên database trước khi chạy. Dùng database và tài khoản riêng cho local/test.

Backend dùng Spring JDBC; không tự tạo schema và không tự chạy migration khi khởi động. A tích hợp schema/migration; B giữ SQL nguồn nhà/tin/lịch, C giữ SQL giao dịch thuê theo kế hoạch.
