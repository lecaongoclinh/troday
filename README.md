# Trọday

Ứng dụng tìm và quản lý phòng trọ. Backend Spring Boot nằm trong [BE](BE/README.md); frontend React/Vite nằm trong [FE_Web](FE_Web/README.md).

FE_Web đã kết nối API hiện có theo wireframe v5. **[Báo cáo kết nối và bàn giao BE](FE_Web/README.md)** ghi trạng thái 47 luồng, danh mục 176 API, kết quả kiểm tra và các lỗi BE còn chặn nghiệp vụ. Việc có route không có nghĩa là toàn bộ luồng BE đã hoàn chỉnh.

```text
troday/
├── BE/                 # Spring Boot, JPA, API và SQL
├── FE_Web/             # React + Vite, gọi API BE
├── FE_Mobile/          # Frontend mobile
├── AI/
└── database/           # Tài liệu/nguồn dữ liệu của dự án
```

## Cập nhật BE/FE

[Danh sách sửa lỗi, phân trang/tìm kiếm và kết nối FE — 17/11/2026](docs/BE_FE_2026-11-17.md) là trạng thái mới nhất. Báo cáo rà soát 13/11 được giữ trong FE_Web để đối chiếu lịch sử.

## Chạy local

BE hiện yêu cầu Java 17 trở lên theo `BE/pom.xml`, Maven và MySQL. Thiết lập môi trường theo [BE/README.md](BE/README.md), sau đó chạy trong `BE`:

```powershell
mvn spring-boot:run
```

Ở terminal khác:

```powershell
cd FE_Web
npm.cmd ci
npm.cmd run dev
```

FE mặc định ở `http://127.0.0.1:5173`, proxy API tới BE cổng `8081`. Xem [FE_Web/README.md](FE_Web/README.md) để đổi địa chỉ API và chạy kiểm tra.

## Deploy BE, web và mobile

Xem [hướng dẫn deploy chi tiết](deploy/README.md): Oracle Always Free + MySQL 8.4 + Caddy HTTPS, tạo admin, build APK Android bằng Expo, cập nhật và sao lưu. Cấu hình Docker nằm ở `compose.yaml` và `deploy/`; cấu hình build mobile ở `FE_Mobile/eas.json`.

## Git

Nhánh chính: `main`. Remote dự án: `https://github.com/lecaongoclinh/troday.git`.

Không commit `.env`, access token, dữ liệu cá nhân hoặc output/cache kiểm thử. Các file này đã được khai báo trong `.gitignore`.
