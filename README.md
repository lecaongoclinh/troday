# Trọday

Spring Boot API + React Web + Expo Mobile. **BE là chuẩn API**; hai frontend dùng chung `shared/api`.

## Clone và chạy Web + BE + DB

Cài **Git + Docker Desktop**, mở Docker Desktop ở chế độ Linux containers. Không cần cài Java, Maven hoặc MySQL trên máy để chạy bộ Docker. Lần đầu cần Internet tải image và dependencies.

Chạy tại thư mục gốc repo sau khi clone:

```powershell
cp .env.example .env
docker compose up --build -d --wait --wait-timeout 300
```

- Web: **http://localhost:5173** — tự kết nối BE.
- API: **http://localhost:8081/api/v1**.
- MySQL 8.4 được tạo riêng trong Docker, tự nạp schema từ `BE/schema.sql`. Dữ liệu được giữ trong volume qua các lần tắt/mở. MySQL cài sẵn trên máy không bị thay đổi.

DB Docker mới có các tài khoản:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Người thuê | `tenant@troday.test` | `TrodayDemo@123` |
| Chủ trọ | `landlord@troday.test` | `TrodayDemo@123` |
| Quản trị | `admin@troday.test` | `TrodayDemo@123` |

Đây là môi trường phát triển/demo, có tài khoản và mật khẩu công khai. Chỉ seed tài khoản, chưa seed phòng, hợp đồng hay hóa đơn. Không dùng cấu hình này để triển khai production.

```powershell
docker compose logs -f --tail 100
docker compose down
```

`down` giữ DB. Không thêm `-v` nếu muốn giữ dữ liệu.

## Chạy Mobile / chia sẻ màn hình app trên máy tính

Cài thêm **Node.js 24** (phiên bản trong `.nvmrc`). Tại gốc repo:

```powershell
npm run setup
npm run dev
npm run mobile:web
```

`setup` tạo `.env` nếu chưa có và cài thư viện Mobile theo lockfile; `dev` bật bộ Docker. Mở **http://localhost:8082** để demo app trên trình duyệt và chia sẻ màn hình. API được điền tự động.

Các lựa chọn khác, chạy trong terminal riêng sau khi Docker đã sẵn sàng:

```powershell
npm run mobile
npm run mobile:tunnel
npm run mobile:android
```

- `mobile`: Expo Go trên điện thoại cùng mạng, tự lấy IP LAN của máy tính.
- `mobile:tunnel`: tunnel ngrok cho Expo; API vẫn cần điện thoại truy cập được qua LAN hoặc URL API công khai.
- `mobile:android`: Android Emulator đã cài sẵn, dùng địa chỉ `10.0.2.2` để gọi BE.

Expo Go/development build cần tương thích SDK 58. Nếu máy có nhiều card mạng, đặt `LAN_IP` trong `.env`. Nếu BE ở máy khác, đặt `EXPO_PUBLIC_API_BASE_URL`; hai trường hợp này đều không cần sửa source. Khởi động lại Expo sau khi đổi cấu hình.

## Cấu hình và kiểm tra

`.env.example` là cấu hình mẫu được commit; `.env` và `BE/.env` chứa cấu hình riêng và được Git bỏ qua. Có thể đổi `API_PORT`, `WEB_PORT` trong `.env` nếu cổng đã bị chiếm. Khi đổi port, chạy lại `docker compose up -d`; Mobile tự đọc `API_PORT` trong lần khởi động tiếp theo.

```powershell
npm run test:env
npm run smoke
npm run check:api
```

`smoke` kiểm tra Web → proxy → BE → MySQL và đăng nhập 3 tài khoản demo; chỉ chạy sau khi bộ Docker sẵn sàng. Không thay thế kiểm thử toàn bộ nghiệp vụ.

Hướng dẫn chi tiết: [Môi trường và xử lý lỗi](docs/ENVIRONMENT.md), [API và 9 thao tác BE chưa hoàn chỉnh](docs/API-CONNECTION.md). Các thao tác chưa đủ ở BE vẫn được chặn tại FE.

| Thư mục | Nội dung |
| --- | --- |
| `BE/` | Spring Boot 3.5, Java 17, Maven |
| [FE_Web](FE_Web/README.md) | React + Vite |
| [FE_Mobile](FE_Mobile/README.md) | Expo SDK 58 + React Native |
| `shared/api/` | Client và catalogue 176 endpoint dùng chung |
| `docker/` | Khởi tạo DB demo và reverse proxy |
| `database/` | SQL thiết kế cũ; Docker dùng schema hiện hành trong `BE/` |

Nhánh chính: `main`. Quy ước nhánh BE: `be/<owner>/<task-id>-<slug>`.
