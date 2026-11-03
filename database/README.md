# Database

```text
database/
├── source/       # SQL nguồn do owner sửa và bàn giao
└── migrations/   # Migration được tích hợp, có thứ tự chạy rõ ràng
```

`source/schema.sql` là bản SQL nguồn được tích hợp từ `../../wireframe/room_rental_wireframe_v5/database/schema.sql`, có 43 bảng và các view/trigger/procedure hiện có. `migrations/V001__api_idempotency.sql` bổ sung bảng lưu gửi lặp cho API, với response xác thực được mã hóa bởi backend.

Với database mới: import `source/schema.sql` trước, sau đó chọn đúng database `room_rental_v5_20261023` và chạy migration V001. Với database đã có schema V5 tương ứng: chỉ chạy V001 sau khi kiểm tra đích. Không chạy lại source trên database hiện có. Backend không tự thực thi các file này.

Kiểm thử tự động dùng `BE/scripts/test-mysql.py`: tạo instance và datadir mới ở temp, cổng ngẫu nhiên, import cả hai file, chạy Maven rồi dừng instance. Script không dùng server MySQL đang chạy trên máy. URL test tự cấu hình chỉ được trỏ tới DB riêng vì test có ghi dữ liệu/trigger.

Schema hiện có dùng MySQL 8.0.16 trở lên, khuyến nghị MySQL 8.4; tạo database `room_rental_v5_20261023`. Script `schema.sql` tạo mới database nên phải kiểm tra môi trường và tên database trước khi chạy. Dùng database và tài khoản riêng cho local/test.

Backend dùng Spring JDBC; không tự tạo schema và không tự chạy migration khi khởi động. A tích hợp schema/migration; B giữ SQL nguồn nhà/tin/lịch, C giữ SQL giao dịch thuê theo kế hoạch.
