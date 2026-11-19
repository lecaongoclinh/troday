# Backend Trọday

Yêu cầu: JDK 17 trở lên, Maven và MySQL.

## Cấu hình dùng chung

Trong thư mục `BE`, tạo file `.env` từ mẫu nếu chưa có:

```powershell
Copy-Item .env.example .env
```

Chỉnh các biến theo môi trường của bạn:

| Biến | Ý nghĩa |
| --- | --- |
| `PORT` | Cổng HTTP của backend, mặc định `8081`. |
| `DB_URL` | JDBC URL của cơ sở dữ liệu MySQL. |
| `DB_USERNAME` | Tài khoản MySQL. |
| `DB_PASSWORD` | Mật khẩu MySQL; để trống nếu tài khoản không có mật khẩu. |

Backend tự đọc `.env` khi chạy từ thư mục `BE` hoặc thư mục gốc repository. Biến môi trường của hệ điều hành được ưu tiên hơn giá trị trong file. Khởi động lại backend sau khi sửa cấu hình.

File dùng định dạng `KEY=value`, không thêm `export` hoặc dấu nháy bao quanh giá trị. `.env` đã được Git bỏ qua; chỉ chia sẻ `.env.example` và không điền thông tin bí mật vào file mẫu.

Việc đọc file sử dụng [cơ chế nhập cấu hình của Spring Boot](https://docs.spring.io/spring-boot/3.5/reference/features/external-config.html#features.external-config.files.importing.extensionless).

## Chạy local

Nhập `schema.sql` vào MySQL để tạo cơ sở dữ liệu `troday`, sau đó nhập `insert_data.sql` vào cơ sở dữ liệu này để thêm dữ liệu mẫu. Hai file chỉ chạy một lần trên cơ sở dữ liệu mới. Các tài khoản demo có mật khẩu `123456`, ví dụ `admin@troday.example`, `landlord01@troday.example`, `tenant01@troday.example`.

Sau đó chạy trong thư mục `BE`:

```powershell
mvn spring-boot:run
```

API sử dụng tiền tố `/api/v1`; với cấu hình mẫu, địa chỉ là `http://localhost:8081/api/v1`.

## Cập nhật BE/FE ngày 17/11/2026

Xem [bảng thay đổi theo BE-01…BE-27, FE-01…FE-06 và kiểm tra](../docs/BE_FE_2026-11-17.md).

Các GET danh sách nhận `page=1&pageSize=20&q=...`, trả `data.items` và `meta.pagination`; pageSize từ 1 đến 100. Khởi động lại cả BE và FE để dùng adapter mới. Thêm PUT/GET `/files/{id}/content` để tải/đọc bytes.

Spring tạo các bảng phụ bằng `src/main/resources/api-support.sql` (CREATE TABLE IF NOT EXISTS), giữ nguyên schema nghiệp vụ và dữ liệu cũ. Tài khoản DB cần quyền tạo bảng ở lần đầu, hoặc DBA chạy file này trước. Pool MySQL được đặt UTC/READ COMMITTED. Không chạy lại schema/seed trên DB đã có dữ liệu.

Tham khảo các biến mới trong `.env.example`: kho tệp/khóa ký URL, provider gửi mã hoặc inbox local cho phát triển, allowlist `PAPER_IMPORT_USER_IDS` và bật/tắt worker. Mặc định không cấp quyền import và không giả gửi mã khi chưa cấu hình provider. Với local có thể đặt `VERIFICATION_LOCAL_INBOX=../.cache/local-inbox` trong `.env`; thư mục này chỉ dùng cho phát triển.

Maven build kiểm tra biên dịch. Bộ hồi quy API thật dùng Python, có yêu cầu cờ ghi rõ ràng và DB tạm; xem hướng dẫn trong tài liệu thay đổi. Các kiểm tra trên DB tạm không thay thế kiểm tra migration/backup dữ liệu thật.
