# Trọday Web

React 19 + Vite, kết nối trực tiếp API Spring Boot trong `../BE`. Ứng dụng đang chạy không dùng seed/localStorage để giả lập dữ liệu nghiệp vụ.

Cách chạy cả bộ sau khi clone: xem [README gốc](../README.md). Docker tự dựng Web + BE + MySQL và proxy API; không cần nhập IP hay cài Node để mở Web. Các lệnh dưới đây dùng khi phát triển Web riêng.

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở http://127.0.0.1:5173. Dev server proxy `/api` đến BE tại `http://127.0.0.1:8081`. Cần khởi động BE và MySQL riêng. Đăng nhập bằng tài khoản thật trong DB; vai trò lấy từ response BE.

Xem `.env.example` để cấu hình proxy hoặc `VITE_API_BASE_URL` cho bản build. Nếu build không có URL tuyệt đối, máy chủ phục vụ Web cần reverse proxy `/api/v1` đến BE. Có thể đổi URL trong mục Kết nối máy chủ.

```powershell
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
```

Test trình duyệt cần Chrome; có thể đặt `CHROME_PATH`. Kịch bản dùng HTTP fixture cục bộ, không ghi dữ liệu vào BE/DB thật.

API client, catalogue, validation và CSV nằm trong `../shared/api`; cần giữ thư mục này khi checkout/build Web. Các trang demo cũ còn trong nguồn để tham khảo nhưng không được App sử dụng.

Hướng dẫn BE, Mobile, môi trường và giới hạn: [API-CONNECTION.md](../docs/API-CONNECTION.md).
