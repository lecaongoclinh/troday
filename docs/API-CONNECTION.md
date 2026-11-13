# Kết nối BE, Web và Mobile

Ngày cập nhật: 12/11/2026. **Controller/service BE hiện tại là chuẩn API.** Không yêu cầu BE đổi response sang đặc tả FE cũ.

**Cách chạy mặc định cho người clone mới:** xem [README](../README.md) và [môi trường Docker](ENVIRONMENT.md). Docker tự dựng DB riêng và tạo ba tài khoản demo. Các hướng dẫn chạy từng thành phần bên dưới dành cho phát triển thủ công; không tự seed vào DB cài trên máy.

## Cách chạy với BE thật

### Backend

Cần JDK 17 trở lên, Maven 3 và MySQL với schema tương ứng `BE/schema.sql`. Chuẩn bị DB phát triển và tài khoản trước khi khởi động; lần ghép nối này không tự tạo/xóa DB, không chèn tài khoản hay sửa dữ liệu thật.

```powershell
cd BE
$env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/room_rental_v5_20261023?serverTimezone=Asia/Ho_Chi_Minh'
$env:DB_USERNAME = '<tai-khoan-db>'
$env:DB_PASSWORD = '<mat-khau-db>'
mvn -DskipTests package
java -jar target/troday-api-0.0.1-SNAPSHOT.jar
```

BE mặc định cổng **8081**, base path **`/api/v1`**. Nếu Maven chưa nằm trong PATH, dùng đường dẫn đầy đủ đến `mvn.cmd`; repo hiện không có Maven Wrapper.

Trên Windows, thư mục `ĐATN` có thể gây `ClassNotFoundException: com.troday.api.TrodayApplication` khi dùng `spring-boot:run`: plugin ghi classpath qua argfile theo native encoding Cp1252, không biểu diễn được ký tự `Đ`. Hai lệnh build/chạy JAR ở trên đã được kiểm tra với JDK 17 ngày 13/11/2026, kết nối MySQL thành công và gọi được `GET /api/v1/posts`. Kiểm tra này chỉ đọc dữ liệu, chưa nghiệm thu toàn bộ giao dịch nghiệp vụ.

`CORS_ALLOWED_ORIGINS` cho phép cấu hình các origin trình duyệt, ngăn cách bằng dấu phẩy. Mặc định có localhost/127.0.0.1 cho Web 5173, preview 4173 và Expo Web 8082. Native trên điện thoại không chịu giới hạn CORS của trình duyệt. Khi dùng một origin khác, thêm origin cụ thể vào cấu hình BE.

### Web

```powershell
cd FE_Web
npm.cmd ci
npm.cmd run dev
```

Mở **http://127.0.0.1:5173**. Chế độ dev tự chuyển `/api/**` đến `http://127.0.0.1:8081`; Web không tự khởi động BE. Có thể sao chép `.env.example` thành `.env` để đổi `API_PROXY_TARGET`.

- `API_PROXY_TARGET`: URL BE dùng cho proxy dev, không kèm `/api/v1`.
- `VITE_API_BASE_URL`: URL API tuyệt đối khi build, ví dụ `https://api.example.com/api/v1`.
- Nếu không đặt `VITE_API_BASE_URL`, bản build gọi `/api/v1` cùng origin; máy chủ phục vụ Web phải reverse proxy đường dẫn này đến BE.
- Có thể đổi địa chỉ trong **Kết nối máy chủ**. URL được nhớ trên trình duyệt; đổi URL sẽ xóa phiên hiện tại.
- Access/refresh token lưu trong `sessionStorage` của tab; khi mở lại trang, Web gọi `/me` để xác minh phiên và lấy vai trò. Dữ liệu nghiệp vụ không lưu vào localStorage, không nạp `seed.json` làm dự phòng.

Đăng nhập bằng tài khoản trong DB. Không có tài khoản tenant/landlord/admin mẫu được tự động tạo. Vai trò trên menu lấy từ response BE; query `?role=admin` không cấp quyền quản trị.

### Mobile / Expo

```powershell
cd FE_Mobile
npm.cmd ci
npm.cmd start
```

Trong **Tài khoản → Kết nối máy chủ**, nhập URL bao gồm `/api/v1`, hoặc đặt `EXPO_PUBLIC_API_BASE_URL` trong `.env` trước khi chạy Expo.

| Nơi chạy | URL ví dụ |
| --- | --- |
| Expo Web trên cùng máy | `http://127.0.0.1:8081/api/v1` |
| Android Emulator trên máy chạy BE | `http://10.0.2.2:8081/api/v1` |
| Điện thoại thật cùng mạng | `http://<IP-LAN-may-chay-BE>:8081/api/v1` |

Điện thoại thật cần truy cập được cổng BE qua mạng/firewall. Không dùng localhost để trỏ từ điện thoại sang máy tính. Phiên Native hiện giữ trong bộ nhớ ứng dụng; đóng hẳn app cần đăng nhập lại. Expo Web là một cách kiểm tra UI chung; không thay thế kiểm thử trên thiết bị Android/iOS.

## Những thay đổi đã thực hiện

- Hai FE dùng chung `shared/api`: client, catalogue 176 endpoint, kiểu dữ liệu, validation, định dạng, CSV và các ánh xạ nghiệp vụ Web.
- Client nhận đúng `{success,api,method,data,timestamp}` từ BE. ID số được chuyển sang chuỗi cho UI; BIGINT lớn được giữ nguyên trước khi parse JSON. Các trường tiền được chuẩn hóa để hiển thị.
- BE chưa có phân trang server. Client phân trang trên mảng BE trả về, kể cả cấu trúc `{items,counts}`; không gửi page/pageSize như thể server đã hỗ trợ.
- Không đòi ETag/If-Match hoặc Idempotency-Key của bản đặc tả cũ. Sử dụng `profileVersion`/`contentVersion` và các khóa trong body ở nơi BE có xử lý. Không tự retry mutation khi chưa biết kết quả; chat/đề nghị xem giữ khóa riêng cho cùng nội dung.
- Refresh gửi `Refresh-Token` theo BE, không gửi cookie. BE không trả refresh token mới sau khi xoay phiên; client bỏ token đã tiêu thụ. Có thể gia hạn một lần, sau đó cần đăng nhập lại khi cần một refresh token mới.
- Web chuyển các màn hình đang chạy sang danh sách, chi tiết, biểu mẫu và thao tác qua HTTP. Khung điều hướng và giao diện tài khoản được giữ lại. Các màn hình demo cũ còn trong nguồn để tham khảo, không được App sử dụng; hình minh họa trang đăng nhập là tài nguyên tĩnh.
- Đã điều chỉnh các trường BE yêu cầu: clientRequestKey cho đề nghị xem; phoneNumber khi xác nhận số điện thoại; payerRoomTenantId và giá/số lượng dòng hóa đơn; target báo cáo, moderation decision và dữ liệu tiêu chí sinh hoạt.
- PATCH hóa đơn bắt buộc có đầy đủ items và giá từng dòng, tránh lỗi BE xóa dòng khi chỉ sửa dueDate. Không tự bịa đơn vị/giá còn thiếu từ response.
- `/residents/export` hiện trả JSON; FE chuyển danh sách này thành CSV UTF-8 BOM, escape nội dung và chặn công thức bảng tính.
- Chỉ bổ sung cấu hình CORS vào BE; không sửa hợp đồng response hay nghiệp vụ BE để ép khớp FE.

## Giới hạn BE được hiển thị rõ trên FE

| API | Tình trạng |
| --- | --- |
| 024–026 | Khôi phục mật khẩu chưa có luồng grant/gửi mã hoàn chỉnh; FE chặn thao tác |
| 090 | SSE chỉ gửi connected rồi đóng; FE dùng tải lại, chat tải lại định kỳ |
| 113 | Nhập hợp đồng giấy chưa xử lý đủ thành viên/revision; FE chặn thao tác |
| 143 | Tạo cấu hình dịch vụ phòng chưa lưu entity đúng; FE chặn thao tác |
| 170, 171, 173 | Không có endpoint nhận/trả nội dung tệp theo URL BE phát ra; FE chặn upload/complete/download |

Các giới hạn khác vẫn thuộc BE: một số danh sách trả rỗng cố định; dashboard chưa có đủ thống kê; chat ảnh và ảnh tin đăng chưa gắn tệp; tạo hợp đồng mới chưa xử lý extraMembers; việc duyệt landlord chưa tự cấp đủ vai trò. FE không tạo dữ liệu/ảnh/trạng thái giả để che những phần thiếu này. Hồ sơ cần tệp hiện chỉ có thể tham chiếu mã tệp đã tồn tại ở BE.

BE còn có các kiểm tra quyền, tính nhất quán và transaction chưa được chứng nhận bởi lần ghép FE này. Không suy ra nghiệp vụ đã hoàn chỉnh chỉ từ việc endpoint gọi được hoặc bundle thành công.

## Kiểm tra và đối chiếu

```powershell
# Từ gốc repo
node scripts/audit-api-contract.cjs
node scripts/audit-api-contract.cjs --json

# Test client và validation dùng chung
npm.cmd --prefix FE_Web test
npm.cmd --prefix FE_Mobile test

# Kiểm thử trình duyệt với HTTP fixture cục bộ
npm.cmd --prefix FE_Web run test:browser
npm.cmd --prefix FE_Mobile run build:web
npm.cmd --prefix FE_Mobile run test:api-browser

# Build và kiểm tra type
npm.cmd --prefix FE_Web run build
npm.cmd --prefix FE_Mobile run typecheck
npm.cmd --prefix FE_Mobile run build:native

# Tại BE
mvn test
```

`scripts/align-backend-contract.cjs` ghi lại các khác biệt đã kiểm tra giữa bản catalogue gốc và BE; cần đọc lại service khi BE thay đổi, không coi script này là trình sinh OpenAPI. `shared/api/contract.json` là catalogue đang chạy của cả hai FE. Script chuẩn bị tài liệu tham khảo Mobile chỉ ghi `docs/reference-contract.json`, không ghi đè catalogue đang chạy.

Test Spring dùng controller/Jackson/CORS thật và mock service. Test trình duyệt dùng HTTP fixture với response theo BE; fixture không được đóng gói vào ứng dụng. **Chưa kiểm thử giao dịch end-to-end với MySQL thật hoặc trên thiết bị Android/iOS.** MySQL không chạy và Docker daemon không sẵn sàng tại thời điểm thực hiện.

Kết quả kiểm tra bản cuối:

| Kiểm tra | Kết quả |
| --- | --- |
| Đối chiếu method/route | 176/176, không thiếu/thừa/trùng route |
| Client/validation dùng chung | 30 test đạt |
| Spring controller/Jackson/CORS | 6 test đạt |
| Web production build | Đạt |
| Web browser + HTTP fixture | Đạt: đăng nhập/đăng xuất, khôi phục phiên, yêu thích, chat, tạo/sửa nhà, hóa đơn, quyền admin, lỗi máy chủ và bố cục di động |
| Mobile TypeScript | Đạt |
| Expo Web export | Đạt |
| App React Native Web + HTTP fixture | Đạt: cấu hình kết nối, đăng nhập, xem chi tiết, lưu phòng; không có lỗi JavaScript trong kịch bản |
| Android/iOS bundle export | Đạt; đã xuất Hermes bundle, chưa tạo APK/IPA |

Báo cáo [API-INTEGRATION-AUDIT.md](API-INTEGRATION-AUDIT.md) là ảnh chụp các sai khác trước khi ghép nối; tài liệu này mô tả cách chạy và trạng thái hiện tại.
