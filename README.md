# Trọday

Spring Boot/MySQL backend, web React/Vite và mobile Expo/React Native. Nhánh chính: `main`.

## Chạy local bằng Docker

Mở Docker Desktop ở chế độ Linux containers. Từ thư mục gốc repository:

```powershell
Copy-Item .env.example .env
docker compose config --quiet
docker compose up --build -d --wait --wait-timeout 300
docker compose ps
```

Chỉ sao chép `.env.example` nếu chưa có `.env`; giữ nguyên cấu hình cá nhân hiện có. Web: `http://localhost:5173`; API: `http://localhost:8081/api/v1`. Stack local dùng `compose.yaml`, project mặc định `troday-dev`, DB `troday`, volume riêng cho DB và upload. SQL/demo account chỉ được tạo ở volume mới. Đây là môi trường demo local.

```powershell
docker compose logs --tail 100 db api web
docker compose down
```

`down` giữ dữ liệu; không xóa volume khi cập nhật. Xem [môi trường dùng chung](docs/ENVIRONMENT.md) để đổi port, LAN IP và cấu hình IDE.

## Chạy BE/web trực tiếp

Cần JDK 17+, Maven và Node.js 22.13+. Node 24 được gợi ý trong `.nvmrc`. Tạo `BE/.env` từ `BE/.env.example`, nhập schema vào MySQL mới theo [BE/README.md](BE/README.md), rồi chạy trong `BE`:

```powershell
mvn spring-boot:run
```

Trong terminal khác tại gốc repository:

```powershell
npm.cmd --prefix FE_Web ci
npm.cmd --prefix FE_Web run dev
```

Web giữ các màn hình nghiệp vụ theo wireframe, đăng nhập/vai trò, tìm kiếm/phân trang, upload và SSE. API proxy mặc định tới `127.0.0.1:8081`. Xem [FE_Web/README.md](FE_Web/README.md).

## Mobile

```powershell
npm.cmd run setup
npm.cmd run mobile:web
```

`npm run mobile` dùng địa chỉ LAN cho điện thoại; `mobile:android` dùng Android Emulator. Launcher hỗ trợ cấu hình URL qua biến môi trường, `FE_Mobile/.env` và `.env` gốc. API URL gồm `/api/v1`. Mobile tái sử dụng adapter trong `shared/api`; adapter hỗ trợ phân trang BE hiện tại và dữ liệu từ server cũ.

## Kiểm tra

```powershell
npm.cmd run test:env
npm.cmd --prefix FE_Web run build
npm.cmd --prefix FE_Web run test:shared
npm.cmd --prefix FE_Web test
npm.cmd --prefix FE_Mobile run typecheck
npm.cmd --prefix FE_Mobile test
```

Kiểm tra browser cần Chrome. Xem [các thay đổi BE/FE](docs/BE_FE_2026-11-17.md) và [ghi chú gộp hai nhánh](docs/MERGE_2026-11-19.md).

## Deploy BE, web và APK Android

Xem [hướng dẫn deploy chi tiết](deploy/README.md): Oracle Always Free, MySQL 8.4, Caddy HTTPS, tạo admin và build APK Android bằng Expo. Stack HTTPS nằm trong `compose.production.yaml`, đọc `deploy/.env`, được chạy qua `deploy/dc.sh`. File `compose.yaml` dành cho local.

```bash
python3 deploy/configure.py --domain YOUR-NAME.duckdns.org
sudo bash deploy/dc.sh build
sudo bash deploy/dc.sh up -d --wait --wait-timeout 360
```

Hai stack có cấu hình và volume riêng. Không nạp tài khoản demo lên môi trường công khai. Không commit `.env`, access token, private key, dữ liệu cá nhân hoặc output kiểm tra.
