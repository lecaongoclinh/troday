# Trạng thái triển khai

> Phần mô tả dưới đây là lịch sử trước khi ghép BE. Trạng thái hiện tại, hợp đồng BE đang dùng và các thao tác chưa khả dụng được cập nhật tại [API-CONNECTION.md](../../docs/API-CONNECTION.md) và [feature-api-map.md](feature-api-map.md).

## Đã viết code frontend

- Dự án React Native/Expo độc lập, TypeScript strict, component native trực tiếp; không ảnh hưởng source demo.
- Shell phong cách xanh/kem của demo, responsive, font Be Vietnam Pro, bottom tabs, tiện ích và stack chi tiết/form.
- Điều hướng người thuê/chủ trọ/admin dựa trên vai trò thật sau login, kiểm tra quyền trước đọc/gửi; deep link không cấp quyền.
- Các màn hình Khám phá/đã lưu/chat/lịch xem/hợp đồng/hóa đơn/ở ghép/tài khoản, dashboard/nhà/phòng/dịch vụ/tin/người ở, xác minh/duyệt tin/mẫu/báo cáo/người dùng/audit.
- Danh mục request 176 endpoint có nguồn gốc từ đặc tả, phân nhóm nghiệp vụ, request builder và menu thao tác theo quyền. Đây là **wiring theo bản nháp**, không phải 176 tính năng đã nghiệm thu.
- Form dựa trên inputFields từng endpoint, trường primitive/nested được xác nhận, picker tài nguyên/tệp, kiểm tra dữ liệu và bước xác nhận.
- HTTP client dùng base URL env hoặc cấu hình phiên, timeout/cancel, trạng thái chưa cấu hình/loading/empty/error/success, envelope/field errors/requestId, 401 và version conflict.
- Tìm theo q/lọc giá/diện tích/mã tỉnh; phân trang các danh sách chính theo meta của API. Các tab quan hệ hiện đọc tối đa 100 bản ghi; chưa có trải nghiệm phân trang đầy đủ cho mọi tab phụ.
- POST chống bấm trùng trong app, giữ UUID/payload khi kết quả mơ hồ; PUT/PATCH version theo ETag được server trả.
- Chat văn bản, các form ảnh/chia sẻ tin/read-state/preferences và lịch liên quan theo danh mục; polling foreground 15 giây, không có SSE giả.
- Tải tệp qua session → signed PUT → complete; SHA-256, kiểm tra minh chứng nhà 5 MB/định dạng, nhớ tệp ACTIVE trong phiên. Xuất CSV người ở qua endpoint đặc tả.
- Không lưu phiên dài hạn/token/mật khẩu vào storage; không tạo seed/mock backend.

## Chưa thể nghiệm thu vì không có backend

**Toàn bộ gọi API thật.** Chưa xác minh đăng nhập/đăng ký/OTP, roles, scope quyền, CRUD, chat nhiều tài khoản, quyết định thuê, trạng thái hợp đồng/cư trú, tổng hóa đơn, upload/storage, CSV thật, idempotency/transaction hay ETag thật.

Không thể kiểm tra layout với dữ liệu riêng tư thật của chủ trọ/admin khi chưa có phiên hợp lệ. Không tự thêm chế độ cấp quyền demo để vượt rào này.

## Chức năng bị khóa hoặc còn hạn chế theo contract

| Phần                                        | Lý do / công việc còn lại                                                                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| API-018 refresh                             | Cần native credential transport, rotation và logout đã thống nhất. Hiện yêu cầu login lại.                            |
| API-067 lifestyles                          | Kiểu selfValue/preferredValue theo từng criterion chưa đủ rõ; không dựng object JSON tự đoán.                         |
| API-090 SSE                                 | Chưa có transport native/replay/event store đã xác nhận. Dùng GET và polling chat.                                    |
| API-113 nhập hợp đồng giấy                  | `members` có cấu trúc chưa chốt và transaction còn D11.                                                               |
| API-069/070 allowedValues                   | Trường object tùy chọn chưa có schema; UI không cho gửi object tự đoán. Chưa đủ cho mọi loại criterion.               |
| Ảnh tin                                     | Chưa có DTO phần tử images. Chỉ nhận URL string, không đoán `url`, `downloadUrl` hay object key mới.                  |
| Sửa/duyệt tin chờ                           | Thiếu endpoint chi tiết riêng và ETag từng post đã xác nhận. Không dùng ETag của danh sách.                           |
| Version tài nguyên ngoài House/Post/Profile | D15 chưa chốt. Cập nhật cần If-Match sẽ khóa nếu chưa có ETag từ chi tiết.                                            |
| Sort và danh mục địa điểm                   | Chưa có whitelist sort và nguồn province/locality đã chốt. Không tự thêm API hoặc hardcode danh mục demo.             |
| Picker cho mọi quan hệ                      | Một số quan hệ chưa có danh sách/projection đầy đủ; tạm nhận mã server thực. Chưa đạt trải nghiệm sản phẩm cuối cùng. |
| Chat lịch sử dài                            | Mới đọc 100 tin; cursor response/before encoding chưa chốt để tải tiếp chính xác.                                     |
| Các tab phụ phân trang                      | Hiện giới hạn một trang 100; cần bổ sung pager trước khi nghiệm thu tập dữ liệu lớn.                                  |
| API-103/109, atomicity tin và hóa đơn       | Client đã có request nhưng backend cần D07/D09/D10 và review R02… trước khi vận hành.                                 |
| Review policy, ghép cặp, email/push         | Cần quyết định D02/D03/D04/D13. Không tạo điểm ghép, email/push hoặc trạng thái giả.                                  |
| APK/IPA và thiết bị                         | Chỉ kiểm tra xuất bundle; cần emulator/device, signing và build phát hành riêng.                                      |

15 quyết định gốc được giữ trong `backend-decisions.json`. Bảng đầy đủ endpoint/method/màn hình/trạng thái có tại `feature-api-map.md`.
