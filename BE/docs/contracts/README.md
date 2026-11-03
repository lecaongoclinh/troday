# Contract API

[Tài khoản và phiên](auth.md) mô tả 9 endpoint đã triển khai, request/response, lỗi, cookie, idempotency và chính sách cấu hình. Các endpoint khác được bổ sung khi triển khai.

Đặt contract JSON/schema tại đây khi được chốt trong từng task. Chưa tạo contract giả cho API chưa triển khai.

Đặt tệp trực tiếp trong thư mục này, đặt tên theo endpoint hoặc tài nguyên, ví dụ `create-property.request.schema.json` và `property.response.schema.json`. Đây là ví dụ đặt tên, chưa phải contract đã chốt. Kiểm thử tương ứng đặt tại `src/test/java/com/troday/contract`.

Phân công theo chức năng trong [README backend](../../README.md#phân-công-theo-kế-hoạch); cả nhóm dùng chung thư mục contract.

Contract chung được chốt tại BE-A02 sau bàn giao phân tích BE-B01 và BE-C01.
