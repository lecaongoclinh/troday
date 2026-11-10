# Trọday Native

Ứng dụng React Native/Expo được viết mới từ giao diện và nghiệp vụ `troday-demo`, trong thư mục độc lập **`E:\Giao diện\troday-native`**. Source demo được giữ nguyên.

**Trạng thái: frontend có thể chạy và có API client theo đặc tả nháp; chưa phải ứng dụng hoàn chỉnh đã kiểm thử với backend.** Người dùng xác nhận hiện chưa có backend. Dự án không tạo API giả, tài khoản giả hoặc dùng dữ liệu seed để hiển thị thành dữ liệu thật. Khi chưa cấu hình API, app hiển thị “Chưa kết nối máy chủ”.

## Tài liệu bàn giao

- [Bảng đối chiếu đầy đủ 176 API](docs/feature-api-map.md)
- [Khảo sát, luồng nghiệp vụ và kiến trúc](docs/architecture.md)
- [Phần đã triển khai và phần cần backend](docs/implementation-status.md)
- [Kết quả kiểm tra](docs/verification.md)
- [15 quyết định backend chưa chốt](docs/backend-decisions.json)
- [Quy ước request/response và mã lỗi](docs/api-standards.json)
- [Khảo sát hàm/form nguồn demo](docs/source-survey.md)

## Công nghệ và yêu cầu

- Node.js **22.13+**; môi trường kiểm tra dùng Node 24.14.0 / npm 11.9.0.
- Expo SDK 58, React Native 0.88, React 19.3, TypeScript.
- React Navigation native stack, safe-area-context, react-native-screens.
- Expo Font/Be Vietnam Pro, Feather icons, LinearGradient.
- Expo DocumentPicker/FileSystem/Crypto/Sharing cho tệp.
- `fetch` cho HTTP; không cần Axios hoặc một store ngoài React cho phạm vi hiện tại.
- Android: Expo Go tương thích SDK hoặc development build/emulator. iOS Simulator cần macOS; có thể dùng thiết bị iOS với Expo Go phù hợp SDK.
- Chrome cho kiểm thử giao diện tự động trên Windows. Không bắt buộc để chạy app.

Các phiên bản đã khóa trong `package-lock.json`. Nếu Expo Go trên điện thoại chưa hỗ trợ SDK 58, dùng bản tương thích/development build; không tự nâng/hạ chỉ một package React Native.

## Cài đặt từ đầu

PowerShell:

```powershell
cd 'E:\Giao diện\troday-native'
npm.cmd ci
Copy-Item -LiteralPath '.env.example' -Destination '.env'
npm.cmd start
```

Quét QR bằng Expo Go hoặc mở emulator theo hướng dẫn của Expo CLI. Dùng `npm.cmd` nếu PowerShell chặn `npm.ps1`. Không chạy lệnh đồng bộ core của demo.

```powershell
npm.cmd run android
npm.cmd run ios
npm.cmd run web
```

Web dùng **http://localhost:8082**. Android/iOS dùng QR, emulator hoặc development build, không phải địa chỉ web này. Chưa có APK/IPA ký phát hành.

Để xem bản web đã đóng gói: `npm.cmd run build:web`, rồi `npm.cmd run preview` và mở http://localhost:8082. Đây là bản xem trước từ cùng code React Native, không phải một dự án web thay thế.

Không cần backend để khởi động giao diện công khai. Có thể kiểm tra Khám phá, bộ lọc, điều hướng, các trạng thái yêu cầu đăng nhập, form đăng ký/đăng nhập và cấu hình kết nối. Chưa có tài khoản demo do backend cung cấp.

## Kết nối backend sau này

1. Đọc `docs/feature-api-map.md` và đối chiếu OpenAPI/Swagger thực tế. Danh mục đang là `1.0-draft`, ngày 29/10/2026; mọi endpoint đều chưa được xác minh đang chạy.
2. Cấu hình `.env`, ví dụ dưới đây là **placeholder**, thay bằng địa chỉ thật:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://your-server.example/api/v1
EXPO_PUBLIC_WEB_ORIGIN=http://localhost:8082
```

3. Khởi động lại Metro sau khi đổi env. Cũng có thể vào **Tài khoản → Kết nối máy chủ** để đổi địa chỉ trong phiên hiện tại. Đổi server sẽ xóa phiên đăng nhập và danh sách tệp trong bộ nhớ.
4. Điện thoại thật dùng IP LAN/domain truy cập được, không dùng `localhost` của máy tính. Android emulator thường truy cập máy tính qua `10.0.2.2`; thay PORT bằng cổng backend thật. Backend phải lắng nghe trên interface phù hợp.
5. Backend web cần CORS cho origin frontend và các header Authorization, Content-Type, Idempotency-Key, If-Match, If-None-Match; expose `ETag`. Kho tệp cũng cần CORS PUT/requiredHeaders cho bản web.
6. Trả JSON `{data, meta:{requestId,timestamp,pagination?}, error:null}`. Endpoint danh sách phân trang cần page/pageSize/total/totalPages. BIGINT và tiền là chuỗi, không phải số JS.
7. Login trả `data.accessToken`, `data.user:{id,fullName,roles,status}` với status ACTIVE. Vai trò lấy từ backend. Refresh cookie của thiết kế web chưa được tự áp dụng lên native: hiện chỉ dùng access token trong RAM và yêu cầu đăng nhập lại khi hết phiên.
8. Kiểm tra riêng hợp đồng đầy đủ cho ảnh `images[]`, projection người ở/đại diện, ETag từng tài nguyên, allowedActions, cursor chat, và enum sort trước khi hoàn thiện các UI tương ứng.

**Không đặt secret vào `EXPO_PUBLIC_*`:** các biến này được đóng gói trong app. API key bí mật thuộc backend. Không có token, mật khẩu hoặc khóa kho tệp trong source dự án.

## Sử dụng các không gian

- Khách bắt đầu tại Khám phá; mục đã lưu/chat/hợp đồng yêu cầu đăng nhập.
- Sau login, app mở không gian tương ứng vai trò thật. Nếu tài khoản có nhiều vai trò, chọn tại Tài khoản.
- Bottom tabs mở các mục chính; Tiện ích mở các màn hình còn lại.
- Thẻ tài nguyên mở chi tiết, các tab dữ liệu liên quan và thao tác phù hợp. “Các thao tác liên quan” bổ sung các hành động từ danh mục API được phép cho vai trò đó.
- Form có validation và bước xác nhận. Khi chưa rõ kết quả lần gửi trước, không sửa payload; thử lại giữ nguyên khóa để tránh tạo trùng.
- Tải tệp trước, rồi chọn tệp đã được server xác nhận ACTIVE trong form hồ sơ/tin đăng. Tệp vừa tải được nhớ trong phiên hiện tại; không giả có endpoint danh sách tệp chưa được đặc tả.

## Kiểm tra và đóng gói

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run check:reference
npm.cmd run build:web
npm.cmd run test:browser
npm.cmd run build:native
```

`build:web` xuất vào `dist/`. `build:native` xuất JavaScript/assets Android và iOS để kiểm tra đóng gói, **không tạo APK/IPA**. `test:browser` mở Chrome headless, phục vụ bundle thật bằng static server cục bộ, lưu ảnh và báo cáo ở `artifacts/`; không khởi tạo mock API. Có thể cấu hình đường dẫn Chrome:

```powershell
$env:CHROME_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
npm.cmd run test:browser
```

Tests dùng transport doubles **chỉ trong thư mục tests/** để kiểm tra lỗi HTTP, timeout, idempotency, ETag và validation. Chúng không chứng minh backend đã hoạt động. `check:reference` kiểm tra SHA-256 của 101 tệp demo; không ghi vào demo.

## Lỗi thường gặp

| Hiện tượng                             | Cách xử lý                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Chưa kết nối máy chủ                   | Đúng trạng thái khi chưa có backend; điền URL thật khi sẵn sàng.                                                      |
| Không kết nối được từ điện thoại       | Kiểm tra LAN, cổng, interface backend và địa chỉ máy tính; không dùng localhost trên điện thoại.                      |
| Web báo CORS                           | Cấu hình origin/headers ở backend và kho tệp; client không thể tự sửa CORS.                                           |
| Form cập nhật yêu cầu phiên bản        | Mở lại chi tiết để đọc ETag mới nhất; cần backend trả ETag/CORS đúng. Không dùng version giả.                         |
| 401                                    | Đăng nhập lại; chưa có refresh native được xác nhận.                                                                  |
| 409                                    | Đọc lại trạng thái/version. Nếu REQUEST_IN_PROGRESS hoặc kết quả còn mơ hồ, retry cùng payload/khóa.                  |
| Chọn được tệp nhưng chưa đính kèm được | File cần hoàn thành cả upload và complete, status ACTIVE, đúng purpose và đúng chủ sở hữu.                            |
| Không thấy ảnh dù server có images     | DTO phần tử images trong bản nháp chưa rõ; hiện chỉ hiển thị literal URL HTTP(S). Cần chốt DTO trước khi ánh xạ thêm. |
| Node test báo spawn EPERM              | Script đã dùng test-isolation=none; Chrome/Metro vẫn cần quyền khởi chạy tiến trình của môi trường.                   |
| Cổng 8082 đang dùng                    | Dừng phiên Expo cũ hoặc chạy `npx expo start --port PORT_KHAC`.                                                       |

## Tiêu chí còn thiếu để nghiệm thu toàn bộ

Cần backend thật và tài khoản từng vai trò; chốt các contract còn mở; chạy các luồng CRUD/nghiệp vụ từ đầu đến cuối trên iOS/Android; xác minh transaction, quyền đối tượng, version, tải tệp và cạnh tranh đồng thời. Không đánh dấu dự án hoàn thành nghiệp vụ chỉ vì typecheck, unit test và bundle thành công.
