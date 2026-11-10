# Kiến trúc và khảo sát nghiệp vụ

## Kết luận khảo sát

Nguồn tham khảo gồm wireframe HTML/JavaScript (`app.js`, `house-rights.js`, `house-proof-store.js`, CSS, HTML), tài liệu nghiệp vụ, danh mục API, SQL, bản demo Expo và các kiểm thử của demo. Danh sách tệp cùng SHA-256 nằm trong `reference-manifest.json`; danh sách hàm/form nằm trong `source-survey.md`.

Demo web dùng dữ liệu seed và localStorage; minh chứng nằm trong IndexedDB. Bản mobile cũ có engine chuyển HTML/DOM giả sang giao diện native. Dự án mới dùng component React Native trực tiếp và API HTTP; không dùng engine, DOM adapter hoặc seed của demo. Không chạy migration, sửa backend hoặc thay đổi bất kỳ tệp nào của demo.

## Vai trò và màn hình

| Vai trò    | Màn hình                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Khách      | Khám phá, xem tin công khai, đăng ký/đăng nhập/quên mật khẩu, cấu hình kết nối                                            |
| Người thuê | Khám phá, đã lưu, chat, lịch xem/đề nghị, hợp đồng/phiên bản, hóa đơn, hồ sơ ở ghép/kết nối, báo cáo, xác minh, tài khoản |
| Chủ trọ    | Dashboard, nhà/phòng/quyền cho thuê, dịch vụ, tin đăng, chat/lịch xem, hợp đồng/người ở/đại diện, hóa đơn, tài khoản      |
| Quản trị   | Dashboard, xác minh người thuê/chủ trọ/quyền nhà, duyệt tin, mẫu hợp đồng, báo cáo, người dùng, nhật ký                   |

Vai trò thực lấy từ `Session.user.roles` theo API-002. Chuyển không gian chỉ được chọn trong các vai trò đó. Không có tài khoản mẫu, chọn tên người mẫu hoặc bật quyền bằng client. Kiểm tra UI không thay thế phân quyền đối tượng ở backend.

## Luồng nghiệp vụ cần bảo toàn

1. **Tìm phòng:** GET posts với tìm kiếm/lọc/phân trang → GET chi tiết → lưu tin hoặc mở hội thoại hỏi đúng tin. Tin đã ẩn trong favorites không hiển thị lại nội dung riêng tư cũ.
2. **Lịch xem:** trao đổi trong đúng hội thoại → đề nghị → chủ chấp nhận/từ chối → lịch chính thức → ghi nhận đã xem/không đến → người thuê quyết định. Đề nghị và đồng ý thuê không tự giữ phòng.
3. **Hợp đồng:** lịch đã xem và đồng ý → chủ xem tác động đóng lịch/đề nghị → gửi hợp đồng → người thuê đối chiếu đúng revision → xác nhận → chủ ghi nhận vào ở thực tế. Chưa vào ở vẫn PLANNED; ACTIVE/OCCUPIED do server xác định.
4. **Quyền cho thuê:** tạo nhà nháp → thêm phòng/dịch vụ → tải minh chứng → gửi hồ sơ → admin đối chiếu/duyệt. Nhà nháp không tự được công khai tin hoặc tạo hợp đồng. Quá hạn/thu hồi/đổi địa chỉ phải được backend kiểm tra lại.
5. **Tin đăng:** nhiều tin cùng phòng, tối đa ba tin chờ duyệt. Ảnh và amenities phải được lưu nguyên tử phía backend (D07); client không tự chia một command thành các lần ghi có thể dở dang.
6. **Người ở:** yêu cầu tham gia → đủ đồng thuận → chủ duyệt giữ chỗ có hạn → xác nhận thực tế. Rời phòng và bàn giao đại diện không viết lại lịch sử hay người trả của hóa đơn cũ.
7. **Thay đổi thuê:** yêu cầu gia hạn/chuyển/kết thúc → chủ đề xuất/quyết định → người thuê xác nhận đúng revision/hash → chủ áp dụng. Không suy diễn trạng thái hoàn tất từ thao tác bấm nút.
8. **Hóa đơn:** tạo nháp → server chụp giá/đại diện/revision và tính tiền → phát hành → chủ ghi nhận thu **toàn bộ**. Không có thanh toán online/trả một phần/hoàn cọc trong contract hiện tại. RENT không gửi giá tự nhập; SERVICE dùng cấu hình thực tế; OTHER/DISCOUNT mới cho nhập quantity/unitPrice.
9. **Ở ghép:** hồ sơ không đồng nghĩa lời mời; chấp nhận kết nối không đồng nghĩa đã vào ở. IN_SYSTEM và thuật toán điểm do backend xác định, không hardcode.
10. **Dữ liệu:** không xóa cứng hợp đồng, phiên bản, cư trú, hóa đơn đã phát hành, minh chứng hoặc audit. Hành động hủy/thu hồi/ẩn dùng endpoint nghiệp vụ đã mô tả.

## Cấu trúc code

```text
App.tsx                     Provider, boundary và React Navigation
index.ts                    Entry Expo
src/
  api/                      Contract snapshot, client, types, quyền truy cập
  assets/                   Vị trí cho tài sản giao diện của dự án mới
  components/               Shell, button, trạng thái, thẻ, data view, menu thao tác
  contexts/                 Phiên trong bộ nhớ, vai trò, kết nối, invalidation, tệp đã tải
  features/
    account/                Đăng nhập/đăng ký/khôi phục, kết nối
    files/                  Chọn/hash/upload/complete và CSV
    forms/                  Field, picker, validation, command attempt, xác nhận
    screens/                Các màn hình danh sách, chi tiết, chat và dashboard
    config.ts               Cấu hình các không gian nghiệp vụ
  hooks/                    Request, loading/error, cancellation, bỏ phản hồi cũ
  navigation/               Typed routes
  services/                 Phân nhóm nghiệp vụ và thao tác cần chốt
  theme/                    Màu sắc, typography, style dùng chung
  utils/                    Decimal display và ngày giờ Việt Nam
tests/                      Kiểm thử client/validation/command bằng transport doubles
scripts/                    Khảo sát, kiểm tra nguồn, browser verification
docs/                       Đối chiếu 176 API, quyết định, kiến trúc, giới hạn
```

Không tạo `public/`, `pages/`, `main.jsx` hoặc CSS cho native. Navigation dùng stack có Back Android, history/deep link web và màn hình chi tiết/form riêng. Main có bottom tabs và menu tiện ích; role thay đổi sẽ quay về màn hình đầu phù hợp. URL feature không hợp lệ về Khám phá; URL không tự cấp quyền.

## API, trạng thái và dữ liệu

- `contract.json` là bản chụp **metadata** API đã cung cấp, không phải DB/mock response. Không sinh URL hoặc body mới ngoài danh mục.
- Các màn hình phổ biến có bố cục riêng; form/action dùng chung được dựng từ **inputFields từng endpoint**, tránh gửi tất cả field của shared schema. Ví dụ tạo House chỉ gửi name/address/provinceCode.
- Chọn quan hệ từ danh sách API và tệp vừa tải; một số quan hệ chưa có projection/danh mục rõ vẫn cần mã tài nguyên thực. Chưa thể coi trải nghiệm các picker đó đã hoàn thiện khi chưa có backend.
- `ApiClient` kiểm tra URL, bearer, whitelist query, path ID, khóa UUID, điều kiện phiên bản, envelope và phân trang. Lỗi 400/401/403/404/409/422/429/500/503 có thông báo; field errors và requestId được giữ. Không đưa SQL/stack trace từ server lên giao diện.
- Access token chỉ giữ trong RAM. Không lưu token/mật khẩu/OTP vào localStorage, AsyncStorage hay source; refresh native bị khóa cho tới khi có contract được duyệt. Đóng app cần đăng nhập lại. Logout xóa phiên local ngay cả khi chưa xác nhận được thu hồi từ xa.
- POST dùng UUID, một attempt tại một thời điểm. Khi timeout/lỗi mạng/5xx/REQUEST_IN_PROGRESS, khóa và payload được giữ khi retry. Không tự retry mutation và không đổi payload khi kết quả còn mơ hồ.
- ETag được giữ nguyên từ response chi tiết và gửi If-Match. Không biến version tự đoán hoặc ETag của danh sách thành version của từng tài nguyên. Nếu backend chưa trả version phù hợp, form cập nhật bị khóa.
- Hook hủy request khi unmount/đổi bộ lọc/vai trò; dữ liệu từ request cũ không ghi đè màn hình mới. Mutation thành công làm invalidation để đọc lại server, không tự tăng số dư/trạng thái như demo.
- BIGINT luôn là string. Money luôn decimal string; client không tính tổng tiền bằng float. Budget compare dùng BigInt, hiển thị tiền theo chuỗi. Date/datetime kiểm tra định dạng; hiển thị theo Asia/Ho_Chi_Minh.
- Upload: chọn file → kiểm tra → SHA-256 → API-170 → PUT bytes tới signed URL **không mang API bearer/cookie** → API-171 → chỉ ghi nhận file khi ACTIVE. Giữ các khóa khi retry. Link tải chỉ mở URL HTTP(S) do API-173 cấp sau kiểm tra quyền.
- Chat hiện đọc qua HTTP, tải tối đa 100 tin gần nhất và làm mới mỗi 15 giây khi foreground. Không tự dựng SSE hoặc cursor chưa rõ. Các command sửa đọc, preferences, chia sẻ tin, lịch liên quan có trong thao tác nghiệp vụ.

## Ranh giới xác minh

Không có backend theo xác nhận của người dùng. Vì vậy mọi màn hình riêng tư, CRUD, xác thực, phân quyền server, upload thật, idempotency thật, transaction, ETag và trạng thái liên tài nguyên đều **chưa kiểm thử tích hợp**. Kiểm thử transport bằng doubles chỉ xác minh code phía client. Bundle native không thay thế kiểm thử trên emulator hoặc thiết bị.
