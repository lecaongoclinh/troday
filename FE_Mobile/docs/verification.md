# Kiểm tra bàn giao

Môi trường: Windows, Node.js 24.14.0, npm 11.9.0. Ngày phiên làm việc: 02/11/2026 theo Asia/Ho_Chi_Minh.

| Kiểm tra                                  | Trạng thái                                                          |
| ----------------------------------------- | ------------------------------------------------------------------- |
| Cài dependency và lockfile                | Đã cài; react-native-screens khớp Expo SDK                          |
| TypeScript strict                         | Đã qua                                                              |
| Unit test client, validation, idempotency | 37/37 qua                                                           |
| Demo bất biến                             | SHA-256 của 101 tệp khớp                                            |
| Web bundle                                | Đã xuất thành công và chạy trên Chrome                              |
| Android/iOS bundle                        | Đã xuất cả hai bundle Hermes; chưa phải APK/IPA                     |
| Chrome UI không backend                   | 9/9 kiểm tra qua; không có lỗi JavaScript, không có request API giả |
| API backend thật                          | Chưa kiểm tra: người dùng xác nhận chưa có backend                  |
| iOS/Android emulator hoặc thiết bị        | Chưa kiểm tra                                                       |

Unit test dùng transport doubles trong tests, không tạo mock API server hay dữ liệu nghiệp vụ cho app. Browser test dùng static server phục vụ app thật, không thay network bằng fixture và xác nhận không có request API khi base URL để trống.

Lệnh tái hiện có trong README. Ảnh browser và báo cáo JSON nằm tại `artifacts/` sau khi chạy test:browser.
