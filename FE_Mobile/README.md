# Trọday Mobile

Expo SDK 58 + React Native. API controller/service trong `../BE` là chuẩn; Mobile và Web dùng chung `../shared/api`.

Cần Node.js 22.13 trở lên; dùng Node 24 theo `.nvmrc` của repo. Giữ các phiên bản đã khóa trong package-lock. Expo Go/development build trên thiết bị cần tương thích SDK 58. Cách dựng BE + DB tự động: xem [README gốc](../README.md).

```powershell
npm.cmd ci
npm.cmd start
```

Nếu điện thoại báo `Failed to download remote update` khi mở qua LAN, có thể chạy ngrok tunnel:

```powershell
npm.cmd start -- --tunnel ngrok
```

Dự án đã khai báo `@expo/ngrok` trong devDependencies để Expo tìm được gói ngay trong project, tránh lỗi cài global xong vẫn báo `Install @expo/ngrok and try again` trên Windows. Chế độ tunnel mặc định không có `ngrok` có thể yêu cầu đăng nhập Expo. Giữ terminal chạy và quét QR mới.

Các lệnh `npm start`, `npm run web`, `npm run android` dùng launcher tự cấu hình API: Web dùng localhost, Android Emulator dùng `10.0.2.2`, điện thoại dùng IP LAN. Launcher đọc `API_PORT` từ `.env` gốc. Nếu cần ghi đè, đặt `EXPO_PUBLIC_API_BASE_URL` trong `.env` gốc hoặc Mobile, rồi khởi động lại Expo. Nếu có nhiều card mạng, đặt `LAN_IP` trong `.env` gốc.

- Expo Web cùng máy: `http://127.0.0.1:8081/api/v1`.
- Android Emulator: `http://10.0.2.2:8081/api/v1`.
- Điện thoại thật: `http://<IP-LAN-may-chay-BE>:8081/api/v1`; cần truy cập được cổng BE qua mạng.

Chạy Expo CLI trực tiếp sẽ bỏ qua launcher: khi đó cần cấu hình URL hoặc nhập trong **Tài khoản → Kết nối máy chủ**. App không tự tạo dữ liệu hay tài khoản mẫu; DB Docker mới có ba tài khoản được mô tả ở README gốc. Phiên giữ trong bộ nhớ; đóng hẳn app cần đăng nhập lại. Vai trò lấy từ BE, không có chuyển vai trò demo.

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build:web
npm.cmd run test:api-browser
npm.cmd run build:native
```

`test:api-browser` chạy bản Expo Web thật trong Chrome với HTTP fixture cục bộ, kiểm tra đăng nhập và lưu phòng; không ghi dữ liệu vào BE thật. `test:browser` kiểm tra trạng thái chưa cấu hình và điều hướng an toàn. `build:native` xuất bundle Android/iOS, không phải APK/IPA hay kiểm thử thiết bị.

Metro đã cấu hình đọc `../shared`; cần giữ thư mục này khi checkout/build. Catalogue đang chạy là `../shared/api/contract.json`, không phải các tài liệu draft cũ. Script `prepare-reference.cjs` chỉ tạo tài liệu tham khảo, không ghi đè catalogue dùng chung.

Một số thao tác tệp, reset mật khẩu và nghiệp vụ chưa đủ ở BE được hiển thị chưa khả dụng. Xem danh sách và cách chạy BE tại [API-CONNECTION.md](../docs/API-CONNECTION.md).
