# Trọday Web — kết nối API và bàn giao BE

**Cập nhật 17/11/2026:** BE và FE đã được chỉnh sửa theo báo cáo. Xem **[danh sách thay đổi, API phân trang, cấu hình và kết quả kiểm tra hiện tại](../docs/BE_FE_2026-11-17.md)**. Web có phân trang/tìm kiếm, upload minh chứng, chọn người vào ở, áp dụng điều chỉnh, CSV và SSE; mobile có adapter tương thích mới.

## Báo cáo gốc ngày 13/11/2026

Phần bên dưới lưu kết quả trước khi sửa. Các nhận định “BE đang lỗi/chặn” và “không sửa BE” mô tả phiên rà soát cũ; trạng thái hiện tại và các giới hạn còn lại nằm ở tài liệu 17/11 liên kết phía trên.

Rà soát ngày **13/11/2026**, đối chiếu mã nguồn BE hiện tại với **47 luồng / 176 endpoint** trong wireframe v5. FE sử dụng React 19 và Vite. **Không sửa mã nguồn, cấu hình, SQL hoặc dữ liệu hiện có của BE.** Các thay đổi BE đã có trước phiên làm việc được giữ nguyên.

Đã thay dữ liệu demo và thao tác `localStorage` bằng HTTP API. FE cập nhật dữ liệu nghiệp vụ sau khi máy chủ phản hồi và tải lại dữ liệu; các lỗi quản lý kết quả tìm kiếm, trạng thái đọc và nháp chat được ghi rõ trong lần rà soát bổ sung bên dưới. Vai trò lấy từ tài khoản đăng nhập, không chuyển sang tài khoản mẫu bằng thanh chọn vai trò.

**Có đủ 176 route trong controller, khớp method + đường dẫn của catalogue wireframe sau khi chuẩn hóa tên path variable. Không có route nào thiếu trong danh sách đó. Có route vẫn chưa triển khai đủ nghiệp vụ; có API upload/download được BE trả về nhưng chưa tồn tại.** “Đã nối FE” trong tài liệu này không có nghĩa là BE đã chạy thành công toàn bộ nghiệp vụ.

## Chạy FE

Cần Node.js 22.12 trở lên. Chạy BE riêng theo [hướng dẫn của BE](../BE/README.md), sau đó:

```powershell
cd troday/FE_Web
npm.cmd ci
npm.cmd run dev
```

Mở `http://127.0.0.1:5173`. FE gọi `/api/v1`; Vite chuyển tiếp `/api` tới `http://127.0.0.1:8081`. Cả dev và preview đều có proxy, không cần sửa CORS của BE để chạy local.

Nếu BE chạy cổng khác:

```powershell
$env:API_PROXY_TARGET = 'http://127.0.0.1:8082'
npm.cmd run dev
```

`VITE_API_BASE_URL` cho phép đổi base URL API khi build; mặc định `/api/v1`. Khi triển khai bản tĩnh, web server cần chuyển tiếp `/api` tới BE hoặc BE phải cho phép origin của FE. Vite proxy chỉ dùng khi chạy Vite. Không có file cấu hình mới bắt buộc phải tạo.

Khách có thể tìm và xem tin công khai. Chức năng cá nhân yêu cầu đăng nhập. Các tài khoản trong `BE/insert_data.sql`: `tenant01@troday.example`, `landlord01@troday.example`, `admin@troday.example`; mật khẩu dữ liệu mẫu `123456`. Form đăng nhập chấp nhận mật khẩu hiện có này; form đăng ký yêu cầu ít nhất 10 ký tự.

Access token được giữ trong `sessionStorage` của tab; không lưu mật khẩu, refresh token hoặc dữ liệu nghiệp vụ vào `localStorage`. Khi tải lại trang, FE xác minh token qua `GET /me`. HTTP 401 thu hồi trạng thái FE và yêu cầu đăng nhập lại. FE chưa dùng refresh vì hợp đồng refresh hiện chưa hoàn chỉnh, xem BE-14.

## Kiểm tra đã thực hiện

```powershell
npm.cmd run build
npm.cmd test
```

- Build FE thành công.
- Kiểm thử Chrome với HTTP fixture: **104 lượt màn hình/kích thước**, 26 màn hình ở 1440/900/390/320 px. **69 mẫu endpoint** được gọi trong kiểm thử được đối chiếu lại với controller BE. Fixture nằm trong test, không được import vào ứng dụng.
- Kiểm tra đăng nhập thật qua HTTP fixture, tìm kiếm phía máy chủ, lưu/bỏ lưu và tải lại trang, sửa hồ sơ, tin nhắn và trạng thái đã đọc, hồ sơ/thói quen ở ghép, chấp nhận lời mời, chat và chia sẻ tin cho bạn ghép, đề nghị/duyệt lịch, quyết định thuê, tạo nhà/tin, hợp đồng/xác nhận/vào ở, hóa đơn/phát hành/thu tiền và quản trị. Kiểm tra lỗi 400/403/404/409/500, giữ dữ liệu form và chống gửi hai lần; 401 xóa dữ liệu riêng tư. Hội thoại có hơn hai người không được tải nội dung tin nhắn.
- Build BE nguyên trạng thành công bằng Maven/JDK; BE hiện chưa có test Java. Không coi việc build thành công là xác nhận nghiệp vụ đúng.
- Đã tạo **MySQL tạm riêng**, nhập nguyên trạng `schema.sql` và `insert_data.sql`, chạy BE tại `127.0.0.1:18081`, MySQL ở cổng `33571`. **52 lượt màn hình/kích thước với BE thật** (26 màn hình, desktop/mobile) đã qua, gồm đăng nhập/đăng xuất và kiểm tra không vỡ giao diện. Kiểm tra API ghi riêng trên dữ liệu tạm đã xác nhận các lỗi dưới đây. Kiểm tra hợp đồng dùng thêm một lịch `COMPLETED/AGREED` làm fixture trong CSDL tạm để không phải chờ ngày hẹn; không sửa schema để vượt trigger.

Có thể chạy lại lượt kiểm tra đọc với một BE đã nạp dữ liệu mẫu:

```powershell
$env:TRODAY_LIVE_API_URL = 'http://127.0.0.1:8081'
npm.cmd test
Remove-Item Env:TRODAY_LIVE_API_URL
```

Lượt `live` dùng ba tài khoản mẫu nói trên, đọc các màn hình và tạo/đăng xuất phiên. Lượt mặc định dùng HTTP fixture và kiểm tra thao tác ghi. Ảnh kiểm tra nằm trong `.cache/screenshots/`, được Git bỏ qua. Cần Chrome; có thể đặt `CHROME_PATH` nếu Chrome ở đường dẫn khác.

## Đối chiếu logic BE với nghiệp vụ và API wireframe

**Kết luận: BE chưa khớp đầy đủ nghiệp vụ wireframe.** Đủ tên route không đồng nghĩa đúng quyền, dữ liệu đầu vào/đầu ra, chuyển trạng thái và tác dụng phụ của luồng. Lần đối chiếu này đọc controller, service, entity/repository và các ràng buộc/thủ tục SQL; không chỉ kiểm tra màn hình hoặc HTTP 200.

Nguồn đối chiếu trực tiếp:

- [business-rules.md](../../wireframe/room_rental_wireframe_v5/docs/business-rules.md): mã TK/PH/TD/HT/LX/HD/NO/DC/DV/TT/OG và các quy tắc v5.
- [business-guide.js](../../wireframe/room_rental_wireframe_v5/business-guide.js): 47 luồng, bước xử lý, trạng thái và quyền.
- [api-catalog.json](../../wireframe/room_rental_wireframe_v5/docs/api-catalog.json): bản `1.0-draft`, ngày 29/10/2026, đủ 176 API, input/output, standards, decisions và jobs. Đã kiểm tra SHA-256: cả năm nguồn trong `sourceHashes` vẫn khớp catalogue, không dùng bản tài liệu lệch nguồn.
- [SQL wireframe](../../wireframe/room_rental_wireframe_v5/database/schema.sql) và [SQL BE](../BE/schema.sql): nội dung giống nhau, chỉ khác hai dòng tạo/chọn tên CSDL. Nhiều bảo vệ đã tồn tại ở SQL nhưng service chưa thực hiện đầy đủ giao dịch tương ứng.

Đối chiếu tự động method + path sau chuẩn hóa tên path variable: **176/176 khớp, không thiếu hoặc dư route**. Phần logic vẫn có các sai lệch dưới đây. Các phát hiện đã tái hiện trước nằm ở BE-01…BE-19; phát hiện bổ sung của lần đối chiếu này nằm ở BE-20…BE-27. Không tự sửa BE, SQL, wireframe hoặc dữ liệu đang chạy.

### Ma trận đối chiếu 47 luồng nghiệp vụ BE

**Một phần**: đã có bước đúng nhưng chưa hoàn tất luồng. **Chưa đạt**: có sai lệch ảnh hưởng kết quả/quyền hoặc bước chính bị lỗi. **Ngoài HTTP**: cần kiểm tra ở triển khai/worker, không phải bổ sung route nghiệp vụ. Trạng thái này đánh giá luồng BE, độc lập với bảng kết nối FE phía dưới.

| # | Luồng | API theo wireframe | Đánh giá BE | Sai lệch chính / nhóm lỗi |
| --- | --- | --- | --- | --- |
| 1 | `account-access` | 001–003 | Một phần | Đăng ký đúng TENANT và actor từ token; chưa tạo personal_profile khi đăng ký, roles chỉ lấy `users.role`, middleware chưa chặn user khóa. BE-14/15/20. |
| 2 | `profile` | 004–005 | Một phần | Có cập nhật tên/profile/settings theo actor; thiếu avatar/file validation, đọc lại settings và kiểm tra kiểu/whitelist đầy đủ. BE-18/20. |
| 3 | `identity` | 006–017 | Chưa đạt | Có kiểm tra chủ hồ sơ/PENDING; thiếu chứng cứ trong DTO, reason/audit và cấp bảng vai trò khi duyệt landlord. BE-02/15/16. |
| 4 | `sessions` | 018–028 | Chưa đạt | Logout/revoke có scope theo user; refresh, OTP, reset, lời mời/liên kết cư trú chưa đúng. BE-14/15. |
| 5 | `create-house` | 029–032 | Chưa đạt | Có scope owner; POST cùng khóa vẫn tạo hai nhà, PATCH bỏ If-Match, DTO thiếu version và quyền hiệu lực. BE-15/20. |
| 6 | `house-proof` | 033–039 | Chưa đạt | Nộp mới 500; chưa đủ snapshot/documents, xác nhận đã xem minh chứng và giao dịch duyệt. BE-02/08/16. |
| 7 | `house-rights-expiry` | 040–041 | Chưa đạt | SQL tăng version/rút hồ sơ chờ đúng; GET quyền/public không dùng đầy đủ view hiệu lực. BE-13/18/27. |
| 8 | `rooms` | 042–045, 175 | Một phần | SQL bảo vệ sức chứa và chặn AVAILABLE sai; DTO tải bằng 0, thiếu field, PATCH vẫn nhận capacity ngoài route riêng; lỗi DB chưa map. BE-18/20. |
| 9 | `room-detail` | 046–049 | Chưa đạt | Phòng chưa có tin công khai vẫn đọc không token; lộ bài chờ; residents/services luôn rỗng. BE-13/18/26. |
| 10 | `submit-post` | 050–052 | Chưa đạt | Có quota SQL 3 bài/phòng và ID riêng; PATCH lại cho đổi roomId, thiếu bắt buộc version và ảnh. BE-02/20/21. |
| 11 | `moderate-post` | 053–056 | Một phần | Kiểm tra admin/PENDING và quyền nhà qua trigger; thiếu reason/reviewer/time/version/audit/thông báo; filter chỉ trả chờ. BE-18/21. |
| 12 | `discover` | 057–061 | Chưa đạt | Có lọc giá/diện tích/amenity và lưu theo postId; lọc quyền công khai, phòng đang ở, sort newest và validation tọa độ chưa đủ. BE-13/18/20. |
| 13 | `roommate-profile` | 062–064 | Chưa đạt | Chưa tự suy IN_SYSTEM từ ACTIVE; tin memberId client, public profile không kiểm tra active/quyền lời mời. BE-15/17/22. |
| 14 | `matching-criteria` | 065–070 | Chưa đạt | Nhận giá trị sai kiểu; thay tiêu chí cũ 500; đổi kiểu criterion không giữ nghĩa lịch sử. Điểm v1 chưa có chính sách D02 được chốt. BE-17/22. |
| 15 | `roommate-invite` | 071–075 | Chưa đạt | Có chống cặp hai chiều và đúng người phản hồi; bỏ targetContractId, counts chỉ đếm PENDING, ACCEPT chưa tạo chat cùng giao dịch. BE-22. |
| 16 | `room-chat` | 076–083 | Chưa đạt | Lộ hội thoại giữa tenant; thiếu kiểm tra khóa/payload/attachment, read-state có thể lùi, timeline rỗng. BE-01/19/23. |
| 17 | `roommate-chat` | 084 | Chưa đạt | Mở chat kiểm tra ACCEPTED/ended; gửi tin không kiểm tra lại nên sau kết thúc vẫn gửi được. BE-23. Chính sách đọc lịch sử D03 còn cần chốt. |
| 18 | `share-post` | 085 | Chưa đạt | Chưa yêu cầu đúng ROOMMATE/kết nối còn hiệu lực khi share, chưa đồng bộ lastMessage/notification; kiểm tra public chưa đủ. BE-13/19/23. |
| 19 | `notifications` | 086–090 | Chưa đạt | Scope user có; unread chat sai, read-all bỏ mốc throughCreatedAt, đọc lặp đổi readAt, SSE đóng ngay. BE-19/23. |
| 20 | `propose-viewing` | 083, 091–094 | Một phần | SQL kiểm tra ngữ cảnh/trùng giờ và lịch sử; service thiếu effectiveStatus/hết hạn tức thời, duyệt lại trả 409, timezone sai. BE-12/18/20/27. |
| 21 | `schedule-viewing` | 083, 095–097 | Một phần | Có duration và overlap; chưa kiểm tra đầy đủ đã trao đổi đúng tin/tài khoản/quyền như procedure; filter ngày/UTC chưa đúng. SQL vẫn chặn một số lần ghi. BE-12/20. |
| 22 | `viewing-outcome` | 098–100 | Chưa đạt | Có quyền owner/tenant và AGREE không giữ phòng; thiếu WITHDRAWN và map 4xx cho attendance/no-show chưa tới giờ. BE-12. |
| 23 | `create-contract` | 101–103 | Chưa đạt | Có kiểm tra COMPLETED+AGREED và hợp đồng mở; bỏ extraMembers/templateId, không tạo đủ lịch sử/snapshot, quyền tenant sai. BE-03/05/06/24. |
| 24 | `reserve-cleanup` | 103–104 | Chưa đạt | Gửi hợp đồng không giữ phòng/đóng lịch/proposal/thông báo; preview counts sai. BE-06. |
| 25 | `contract-revision` | 105–109 | Chưa đạt | Yêu cầu sửa giữ bản cũ PENDING; không chuyển contract sang DRAFT, bỏ expected revision; confirm 500. BE-05/24. |
| 26 | `move-in` | 110 | Chưa đạt | Bỏ memberIds và kích hoạt toàn bộ PLANNED; chỉ nhận CONFIRMED, không hỗ trợ nhóm đến sau khi ACTIVE; thực tế 500. BE-05/24. |
| 27 | `cancel-contract` | 111–113 | Chưa đạt | Có chặn hủy riêng đại diện/chỉ PLANNED; hủy contract 500; import giấy mới tạo DRAFT, chưa đủ member/revision/history. BE-02/05/24; D11 còn cần thiết kế. |
| 28 | `residents` | 114–116 | Chưa đạt | List chưa áp dụng bộ lọc; thiếu thông tin đại diện/đối soát; export trả JSON, chưa là CSV đúng phạm vi. BE-18/26. |
| 29 | `join-consent` | 117–120 | Chưa đạt | Có hai consent riêng; quyền dựa viewing tenant/người yêu cầu cũ, nhánh CONFIRMED trái yêu cầu ACTIVE và bị trigger chặn. BE-03/11. |
| 30 | `join-hold` | 121–124 | Một phần | Có trạng thái và giữ 48 giờ; SQL kiểm tra tải; thiếu effective expiry/worker, dùng ngày dự kiến làm ngày thực tế, chưa đủ metadata/sync/idempotency. BE-11/27. |
| 31 | `departure` | 125 | Chưa đạt | Chỉ đổi member LEFT; chưa đóng contract/history/yêu cầu của người cuối, trả AVAILABLE cố định. BE-11. |
| 32 | `handover` | 126–128 | Chưa đạt | History GET 500, thứ tự ghi chưa đáp ứng trigger; chưa đủ chuỗi trước-sau/consent, lọc tài khoản kế nhiệm và hủy yêu cầu cũ. BE-03/11. |
| 33 | `change-request` | 129–135 | Chưa đạt | Có base revision lúc tạo/apply; đại diện sai, duyệt không tạo proposed revision, confirm chưa kiểm tra lại base/đại diện, chưa chặn apply trước ngày. BE-10/24. |
| 34 | `renewal` | 130, 135 | Chưa đạt | Áp dụng dùng effectiveDate thay cho newEndDate, chưa tạo revision đã đồng ý. BE-10. |
| 35 | `transfer` | 130, 135–136 | Chưa đạt | Chỉ cho cùng nhà thay vì cùng chủ; preview openMemberCount=0, thiếu tải/quyền/giá phương án và chuyển toàn bộ thành viên. BE-10/18/24. |
| 36 | `end-lease` | 130, 135 | Chưa đạt | Chỉ set TERMINATED, chưa đóng lượt ACTIVE/PLANNED/yêu cầu/history và metadata theo ngày hiệu lực. Trigger chặn thay vì hoàn tất. BE-10/11. |
| 37 | `services` | 137–144 | Một phần | Owner và giá 0/null có xử lý; tạo cấu hình lần đầu 500, custom service 400, API đọc public rỗng. BE-07/18. |
| 38 | `bill` | 145–148 | Chưa đạt | Snapshot/payer sai contract, thiếu tính dịch vụ phía server; tổng DISCOUNT sai, PATCH dueDate làm mất items. BE-04/25. |
| 39 | `pay-invoice` | 149–152 | Một phần | Thu đủ/hủy có kiểm tra owner/trạng thái, SQL giữ dòng đã phát hành; replacement thiếu snapshot, quá hạn/notification/idempotency chưa đủ. BE-04/20/27. |
| 40 | `review` | 153–155 | Một phần | Có FK chứng cứ/unique/rating; public không kiểm tra quyền xem room; moderation audit lỗi. Thời điểm đánh giá D13 chưa chốt, không coi TERMINATED là quy tắc đã duyệt. BE-09/26. |
| 41 | `report` | 156–160 | Chưa đạt | Mẫu targetType/targetId bị từ chối; chưa kiểm tra quyền target/liên kết evidence; quyết định audit 500. BE-09/26. |
| 42 | `lock-account` | 161–164 | Chưa đạt | Có admin/state checks; ghi audit 500 và chưa revoke sessions; token cũ vẫn dùng được với fixture LOCKED. BE-09/14. |
| 43 | `templates` | 165–167 | Chưa đạt | Có tạo row theo version; admin không thấy inactive, PATCH cho đổi content của row cũ trái whitelist active. BE-18/20/24. |
| 44 | `audit` | 168–169, 176 | Chưa đạt | Có admin read; before/after sai/không phải JSON, thiếu mục tiêu/filter và dashboard không đúng các hàng đợi. BE-09/18. |
| 45 | `data-safety` | Quy tắc xuyên suốt | Chưa đạt | Transaction JPA chưa đủ để thay procedure/khóa/thứ tự flush; chưa có idempotency chung, version CAS, UTC và phát sau commit. BE-05/20/27. |
| 46 | `file-storage` | 170–174 | Chưa đạt | Có metadata STAGED/owner nhưng chưa lưu/đọc bytes, complete giả, quyền reviewer/context/retention chưa đủ. BE-02/27. |
| 47 | `migration` | OPS01, không có HTTP | Ngoài HTTP | Schema BE khớp wireframe ngoài tên DB. Đã tạo mới trên MySQL tạm; chưa xác nhận nâng cấp dữ liệu thật. Không cần và không nên tạo API chạy SQL migration. |

### Những phần đã khớp hoặc được SQL bảo vệ

- Actor lấy từ session; đăng ký không nhận vai trò ADMIN/LANDLORD từ body; logout/revoke kiểm tra user của phiên.
- Scope owner cho sửa nhà/phòng/dịch vụ, nhiều bước owner/tenant trong lịch xem, và admin cho các quyết định quản trị đã có. Các khoảng trống cụ thể được ghi riêng, không kết luận toàn bộ BE không có phân quyền.
- Tin và phòng có ID riêng; lưu tin theo postId. SQL bảo vệ tối đa ba PENDING_REVIEW/phòng, không giới hạn tổng bài hoặc số APPROVED; đủ ba vẫn sửa được bài đang chờ.
- SQL giữ sức chứa gồm ACTIVE + PLANNED trên hợp đồng mở + hold còn hạn; chặn giảm sức chứa và đổi AVAILABLE không hợp lệ, trùng lịch đã chốt, quan hệ FK và một ACTIVE/user.
- Hóa đơn đã phát hành được SQL bảo vệ dòng tiền bất biến; thu đủ và hủy có trạng thái riêng. Kết thúc kết nối ở ghép không tự tạo cư trú/giữ chỗ.

Các bảo vệ này không thay thế việc service thực hiện đủ tác dụng phụ, đọc trạng thái hiệu lực và trả lỗi domain. Ví dụ SQL chặn confirm hoặc capacity bằng SIGNAL không có nghĩa endpoint trả 500 đã đáp ứng nghiệp vụ.

### Phân biệt lỗi triển khai với điểm đặc tả cần chốt

- **D02**: chưa chốt thuật toán/trọng số ghép cặp. BE tự trả score và `algorithmVersion=v1` chưa có căn cứ phê duyệt; lỗi chắc chắn là bỏ lọc/ngữ nghĩa tiêu chí đã mô tả và validation kiểu, không kết luận một công thức điểm cụ thể là bắt buộc.
- **D03**: quyền đọc chat sau ended còn cần chốt. Quyền **gửi tin mới** sau ended đã có quy tắc chặn rõ; BE hiện vi phạm quy tắc đó. Không tự yêu cầu xóa lịch sử hoặc cấm đọc vĩnh viễn.
- **D05/D06/D11/D13**: retention/kho tệp, xác minh người nhận liên kết, import giấy và thời điểm đánh giá còn cần quyết định. Các lỗi bytes/quyền đối tượng/response giả hoặc thiếu dữ liệu vẫn là lỗi triển khai; không tự thêm thanh toán online, chữ ký số hay chính sách chỉ đánh giá sau TERMINATED.
- **D07/D08/D09/D10/D14/D15**: nguyên tử ảnh/amenity, get-or-create chat, kho idempotency/replay, expected revision và audit/version tổng quát cần thiết kế adapter/migration. Có file `database/migrations/V001__api_idempotency.sql` nhưng chưa có service dùng store này; không được coi file DDL là cơ chế idempotency đang hoạt động.
- **API-014** mô tả quyết định identity nhưng dòng logic chung nhắc APPROVE landlord tạo `landlords`; đây là nội dung dùng chung với API-017 cần làm rõ trong catalogue. Không lấy dòng đó để tự cấp vai trò chủ trọ khi chỉ duyệt identity. API-017 duyệt landlord mới cần cấp vai trò theo luồng.
- Lịch JOB01…JOB06 là đề xuất vận hành; logic hết hạn/đọc hiệu lực/phát sau commit đã được mô tả, còn tần suất/TTL/provider phải chốt. OPS03 ghi rõ chưa có chính sách tự đóng hợp đồng khi hết ngày: không đánh dấu việc chưa tự đóng là lỗi, không đóng mà bỏ lại cư dân ACTIVE.

## Rà soát bổ sung FE và BE ngày 13/11/2026

Lần kiểm tra này giữ nguyên mã FE/BE, cấu hình và CSDL đang chạy. Chỉ cập nhật tài liệu bàn giao này; không tạo thêm báo cáo hay test được theo dõi trong Git.

- Build FE và Maven `test` đều thành công; Maven báo **No tests to run**, chưa có kiểm thử Java để bảo vệ nghiệp vụ.
- Chạy lại bộ kiểm thử FE hiện có: **104 lượt màn hình/kích thước đạt**, đối chiếu **69 mẫu endpoint** với 176 controller mappings.
- Kiểm tra thêm sáu tình huống bằng Chrome và HTTP fixture: **cả sáu tái hiện lỗi FE**. Kết quả 104 lượt đạt ở trên không bao phủ sáu trường hợp này và không chứng minh API thật hoạt động đúng.
- Chạy BE nguyên trạng với MySQL mới ở cổng tạm, nhập nguyên `schema.sql` và `insert_data.sql`: ghi nhận **39 trường hợp API**, bao gồm bước chuẩn bị thành công và trường hợp lỗi. Không phải 39 lỗi độc lập. Khi kiểm tra vào ở dùng fixture hợp đồng CONFIRMED; khi kiểm tra token tài khoản khóa dùng fixture LOCKED vì API khóa đang lỗi. Chỉ thiết lập fixture trong CSDL tạm, không bỏ trigger hoặc sửa schema.
- Các kết quả 52 màn hình dùng BE thật ở mục trước là lần kiểm tra trước. Lần rà soát bổ sung này tập trung kiểm chứng API ghi và các tình huống FE còn thiếu.

Mức ưu tiên: **P0** — quyền truy cập, mất an toàn dữ liệu hoặc chặn nghiệp vụ cốt lõi; **P1** — sai kết quả/trạng thái hoặc thiếu chức năng cần thiết; **P2** — trải nghiệm, hiệu năng, hiển thị. Các mã BE-01…BE-19 bên dưới là **nhóm vấn đề**, không phải số lỗi đơn lẻ.

### Lỗi FE đã tái hiện bằng trình duyệt

| Mã | Mức | Cách tái hiện và kết quả | Nguồn / hướng xử lý |
| --- | --- | --- | --- |
| FE-01 | P1 | Tenant lưu một tin → tìm từ khóa không khớp, danh sách ban đầu rỗng → mở thông báo và chọn đọc tất cả. Sau tải lại dữ liệu, tin đã lưu xuất hiện trong kết quả dù từ khóa vẫn giữ nguyên. Polling hoặc thao tác ghi khác cũng có thể gây ra. | [api.js:102](src/data/api.js#L102) thêm mọi `favorites[].post` vào cùng `data.posts`, trong khi [Discover:35](src/pages/Discover.jsx#L35) dựa vào bộ lọc phía server. Tách danh sách kết quả tìm kiếm khỏi kho tin theo ID và danh sách yêu thích. |
| FE-02 | P1 | Mở màn hình chat trên mobile 390 px, chỉ thấy danh sách hội thoại và chưa mở nội dung. FE vẫn gửi một PUT read-state của hội thoại đầu tiên, dù pane có `display:none`. | [Community:13](src/pages/Community.jsx#L13), [Community:16](src/pages/Community.jsx#L16), [react.css:134](src/styles/react.css#L134). Chỉ tải/đánh dấu đọc khi người dùng thực sự mở hội thoại và nội dung đang hiển thị. |
| FE-03 | P2 | Nhập nháp chat chưa gửi → chuyển màn hình → quay lại. Nội dung nháp trở thành chuỗi rỗng. | [Community:10](src/pages/Community.jsx#L10) giữ drafts trong state của component; [App:19](src/App.jsx#L19) unmount màn hình khi tải lại/điều hướng. Giữ nháp theo conversation và phiên người dùng ở nơi không mất khi đổi màn hình. |
| FE-04 | P1 | Cho API verify reset trả `resetGrant` hợp lệ bằng fixture. FE vẫn đứng ở form nhập mã, không có form mật khẩu mới và không gọi complete. | [Auth:28](src/pages/Auth.jsx#L28) chỉ kiểm tra có grant rồi dừng. Cần state bước nhập mật khẩu/xác nhận và POST `/auth/password-resets/complete` theo contract BE đã thống nhất. Đây là thiếu sót FE riêng, vẫn tồn tại sau khi BE-14 được sửa. |
| FE-05 | P2 | Với fixture chủ trọ chỉ có một nhà/một hợp đồng, mở Hồ sơ cá nhân phát sinh **21 GET**, gồm hợp đồng, hóa đơn, lịch xem, danh mục dịch vụ và hai API con của nhà. Việc này lặp lại khi chuyển màn hình và polling 30 giây. | [AppContext:40](src/context/AppContext.jsx#L40), [AppContext:73](src/context/AppContext.jsx#L73), [api.js:75](src/data/api.js#L75). Tải theo màn hình và quyền, tái sử dụng dữ liệu còn hiệu lực; tránh tải toàn bộ nghiệp vụ cho mỗi lần sửa/xem profile. |
| FE-06 | P1 | Giữ chậm phản hồi tìm kiếm public 2,5 giây → đăng nhập admin và mở hàng chờ duyệt → thả phản hồi tìm kiếm rỗng. Phản hồi cũ ghi đè `data.posts`, hàng chờ admin biến mất. | [AppContext:116](src/context/AppContext.jsx#L116) không hủy request tìm kiếm hoặc kiểm tra thế hệ phiên/điều hướng; `clearSession` chỉ hủy tải snapshot. Cần abort và bỏ phản hồi cũ khi phiên thay đổi; tách kết quả public khỏi dữ liệu duyệt tin. |

### Lỗi và phần thiếu FE xác nhận qua mã nguồn

| Mã | Mức | Hiện trạng | Nguồn / hướng xử lý |
| --- | --- | --- | --- |
| FE-07 | P2 | Form hóa đơn thay thế vẫn cho sửa kỳ thu/người thanh toán nhưng payload chỉ gửi `dueDate/items`; BE sao chép kỳ và payer từ hóa đơn cũ. Lựa chọn trên form bị bỏ qua. Chưa kiểm chứng lưu thành công vì BE-04 đang chặn tạo bản thay thế. | [Dialogs:185](src/components/Dialogs.jsx#L185), [Dialogs:190](src/components/Dialogs.jsx#L190), [BillingService.replacement](../BE/src/main/java/com/troday/api/service/BillingService.java#L33). Theo contract hiện có cần để các trường kế thừa chỉ đọc và giải thích rõ. |
| FE-08 | P2 | Tên nhà dự phòng ở danh sách xác minh hiển thị `Nh? #...` khi không có house trong bộ dữ liệu. | [Admin:9](src/pages/Admin.jsx#L9). Sửa chuỗi thành `Nhà #...`; cần giữ UTF-8 khi chỉnh sửa. |

FE còn thiếu thao tác hoàn chỉnh cho OTP điện thoại/liên kết cư trú, hủy riêng thành viên PLANNED, rút yêu cầu thay đổi, rút quyết định đồng ý thuê, và đọc lại trạng thái archive/delete hội thoại. Mẫu hợp đồng inactive chưa có danh sách để bật lại. Chi tiết trạng thái từng luồng ở bảng 47 luồng; không gộp các phần này thành “BE thiếu route”, vì nhiều route đã tồn tại nhưng FE hoặc nghiệp vụ BE chưa hoàn tất.

### Kết quả BE vừa kiểm chứng lại

Mọi đường dẫn trong bảng có tiền tố `/api/v1`. Các lỗi BE đã có phần nguyên nhân và hướng sửa theo mã ở bên dưới.

| Nhóm | Kết quả thực tế trong CSDL tạm |
| --- | --- |
| BE-01 — hội thoại | Hai tenant cùng mở một tin nhận cùng conversation, số participant tăng từ 3 lên 4. Tenant mới GET được hai tin nhắn của người khác. |
| BE-02 — tệp | Tạo phiên upload 200; PUT/GET `/files/{id}/content` đều 404; complete vẫn 200/ACTIVE khi chưa upload nội dung. |
| BE-03 — quyền hợp đồng | Tenant ACTIVE đọc `/contracts` nhận `[]`, đọc `/contracts/1` nhận 403, nhưng vẫn đọc được hai hóa đơn thuộc hợp đồng. |
| BE-04 — hóa đơn | POST `/invoices` với payer thuộc hợp đồng và kỳ chưa có hóa đơn trả 500: `payer_snapshot cannot be null`. |
| BE-05 — vòng đời hợp đồng | Confirm, cancel và move-ins đều 500. Move-ins được gọi riêng với fixture CONFIRMED, lỗi `Active contract requires an active confirmed representative`; không chỉ bị chặn gián tiếp bởi confirm. |
| BE-06 — giữ phòng | Tạo hợp đồng 200 nhưng phòng vẫn AVAILABLE, còn một lịch SCHEDULED và hai proposal PENDING. API ảnh hưởng báo pending bằng 0 trong khi CSDL có 2. |
| BE-07 — dịch vụ | Dịch vụ custom không có serviceId trả 400. Tạo catalog/thêm vào nhà thành công; PUT cấu hình phòng lần đầu với giá 0 trả 500. |
| BE-08 — xác minh nhà | POST hồ sơ quyền cho thuê trả 500: `house_snapshot` không có giá trị mặc định. |
| BE-09 — khóa tài khoản | POST admin lock trả 500 do JSON không hợp lệ ở `moderation_actions.after_snapshot`. |
| BE-11 — lịch sử đại diện | GET representative-history trả 500/NullPointerException. |
| BE-12 — lịch xem | Attendance cho lịch trong tương lai trả 500 thay vì lỗi nghiệp vụ 4xx. Tin FULL có GET public detail 404 nhưng POST room-inquiries vẫn 200, điều kiện khả dụng giữa hai service chưa thống nhất. |
| BE-13 — công khai tin | GET `/rooms/{id}/posts` không token trả cả PENDING_REVIEW. Sau admin revoke quyền nhà thành công, GET public tin của nhà đó vẫn 200/APPROVED/OPEN. |
| BE-14 — xác thực | Refresh 200 có access token nhưng không có refresh token mới. Token cũ của fixture user LOCKED vẫn GET `/me` 200. Một tài khoản khác dùng selector xác minh điện thoại của người khác và số điện thoại khác mục tiêu vẫn được xác minh thành công. |
| BE-15 — vai trò | Tenant POST `/houses` thành công và BE tự tạo hàng trong `landlords` cho tenant đó. |
| BE-18 — ảnh | 57 tin public trong dữ liệu mẫu đều không có `photoUrl/images` trong response. URL minh họa trên FE không chứng minh BE đã có nội dung ảnh; cần xử lý đồng thời BE-02 và DTO/liên kết ảnh. |
| BE-19 — realtime | GET `/events` trả đúng một sự kiện connected rồi đóng stream, không phải kênh realtime duy trì kết nối. |

Ưu tiên sửa BE: rò rỉ hội thoại/public và xác thực/quyền → vòng đời hợp đồng/hóa đơn → lưu tệp/xác minh/dịch vụ → DTO, lịch sử, realtime và hiệu năng. Sau mỗi nhóm cần kiểm tra cả response, dữ liệu sau commit/rollback và quyền của tài khoản khác; build thành công không đủ xác nhận đã sửa lỗi.

## Danh sách 47 luồng và trạng thái kết nối

**Nối**: FE đã gọi API và xử lý phản hồi/lỗi. **Một phần**: chỉ những bước được nêu đã nối. **Chặn BE**: FE giữ chức năng chưa sẵn sàng, không lưu giả. **Ngoài FE**: công việc máy chủ/CSDL.

| # | Luồng wireframe | Phần FE đã kết nối | Phần còn thiếu / lỗi BE |
| --- | --- | --- | --- |
| 1 | `account-access` — tài khoản và vai trò | Nối đăng ký, đăng nhập, đọc `/me`, bảo vệ màn hình theo vai trò thật | BE-14, BE-15: vòng đời token, quyền và validation cần hoàn thiện |
| 2 | `profile` — hồ sơ cá nhân | Nối đọc/sửa tên, địa chỉ, giới thiệu, nghề nghiệp, trường học; cập nhật lựa chọn thông báo | Email/điện thoại chỉ đọc vì PATCH profile không cập nhật hai trường này; `/me` thiếu trạng thái thiết lập thông báo |
| 3 | `identity` — xác minh tài khoản | Một phần: lịch sử, rút hồ sơ; admin đọc chi tiết và từ chối có lý do | Chặn gửi tệp/phê duyệt khi chưa đọc được minh chứng; BE-02, BE-16 |
| 4 | `sessions` — OTP, reset, phiên, liên kết cư trú | Nối danh sách phiên, thu hồi, đăng xuất; gọi bước yêu cầu/kiểm tra mã reset | Chưa hoàn tất reset, OTP điện thoại, refresh và liên kết cư trú; BE-14, BE-15 |
| 5 | `create-house` — thêm/sửa nhà | Nối `GET/POST /houses`, `PATCH /houses/{id}` với tên, địa chỉ, mã tỉnh/phường | BE-15, BE-18: quyền, version/snapshot và DTO nhà |
| 6 | `house-proof` — quyền cho thuê | Một phần: đọc lịch sử, rút, admin xem/từ chối | Gửi mới và phê duyệt bị chặn; upload thiếu và tạo hồ sơ lỗi 500, BE-02, BE-08 |
| 7 | `house-rights-expiry` — thu hồi/hết quyền | Nối admin thu hồi quyền đã duyệt | Thiếu xử lý hết hạn, đổi định danh và vô hiệu hóa tin liên quan; BE-15, BE-18 |
| 8 | `rooms` — phòng/sức chứa/trạng thái | Nối thêm/sửa phòng, giá, cọc, diện tích, sức chứa, trạng thái thủ công khi không có hợp đồng mở | BE-18: tải cư trú và DTO thiếu; cần kiểm tra điều kiện bằng BE, không chỉ dựa vào FE |
| 9 | `room-detail` — tin/người ở/dịch vụ | Nối dữ liệu tin/phòng, người ở của chủ trọ, cấu hình dịch vụ; đọc đánh giá | Public services/residents theo phòng vẫn trả rỗng; BE-18. Không gọi API public trả lộ tin chưa duyệt, BE-13 |
| 10 | `submit-post` — tạo/sửa/gửi duyệt | Nối nội dung, phòng, amenities và `contentVersion`; dùng trạng thái trả về | Ảnh chưa tải được; BE-02. Kiểm tra đồng thời/hạn mức và version cần hoàn thiện |
| 11 | `moderate-post` — duyệt/từ chối/ẩn/khôi phục | Nối các command theo trạng thái | `GET /admin/posts` chỉ trả tin chờ, nên chưa lấy đầy đủ tin từ chối/ẩn để xử lý lại sau lần tải mới; BE-18 |
| 12 | `discover` — tìm/xem/lưu tin | Nối tìm `q/provinceCode/maxRent/minArea/amenities`, sắp xếp, bán kính với vị trí thật, chi tiết và lưu/bỏ lưu | BE-13, BE-18: điều kiện công khai, ảnh, khoảng cách; không gán ảnh/khoảng cách demo |
| 13 | `roommate-profile` — hồ sơ ở ghép | Nối đọc/lưu chỗ ở, khu vực, ngày sẵn sàng, ngân sách và profile version | BE cần xác minh `currentRoomTenantId` thật thuộc người dùng; BE-15 |
| 14 | `matching-criteria` — tiêu chí/độ phù hợp | Nối đọc tiêu chí, đọc/lưu self/preferred value, importance/mandatory, đọc danh sách phù hợp | Thuật toán hiện chỉ xét chỗ ở/ngân sách, chưa dùng đầy đủ tiêu chí bắt buộc; BE-17 |
| 15 | `roommate-invite` — ba tab/lời mời | Nối ba tab người phù hợp/nhận/đã mời; chấp nhận, từ chối, rút, kết thúc kết nối | Hồ sơ public không có `tenantId`; FE chặn lời mời mới từ profile chỉ có profile ID, BE-17 |
| 16 | `room-chat` — chat chủ trọ | Nối mở hội thoại, đọc/gửi tin, read-state, cập nhật muted | BE-01: hội thoại đang gộp người thuê; FE không đọc/gửi khi số người khác 2 |
| 17 | `roommate-chat` — chat bạn ghép | Nối tạo/mở chat từ lời mời đã chấp nhận và gửi tin | Chưa có realtime đúng nghĩa, BE-19 |
| 18 | `share-post` — chia sẻ tin | Nối chọn kết nối, mở hội thoại và `POST post-shares`, hiển thị thẻ tin | BE chưa cập nhật last message và thông báo cho POST_SHARE; BE-19 |
| 19 | `notifications` — chuông/đọc/popup | Nối danh sách, đánh dấu từng mục/tất cả, mở màn hình đích; polling khi tab hiển thị mỗi 30 giây | SSE đóng ngay, chưa có popup nhận tức thì; unread message đếm sai, BE-19 |
| 20 | `propose-viewing` — đề nghị lịch | Nối tạo từ tin/chat với conversation, duration, offset và client key; nhận/rút/chấp nhận/từ chối | BE-01, BE-12: ngữ cảnh, UTC, hết hạn, idempotency và lỗi từ trigger |
| 21 | `schedule-viewing` — chủ trọ hẹn | Nối tạo từ hội thoại hai bên đã có và phòng còn trống | BE-12: xác minh hội thoại thuộc đúng phòng/tin; lỗi nghiệp vụ cần trả 4xx |
| 22 | `viewing-outcome` — kết quả/ý định thuê | Nối đã đến/không đến/hủy; đồng ý/không thuê | Ghi nhận trước giờ bị DB chặn nhưng BE trả 500; chưa hỗ trợ rút quyết định đồng ý trong UI, BE-12 |
| 23 | `create-contract` — hợp đồng từ lịch | Nối chọn lịch đã xem/đồng ý, đọc ảnh hưởng, gửi hợp đồng | BE-05, BE-06: xác nhận và đồng bộ giữ phòng/lịch còn lỗi |
| 24 | `reserve-cleanup` — đóng lịch khi giữ phòng | FE đọc kết quả máy chủ; không tự đổi trạng thái phòng/lịch | Chặn BE: chưa chạy cleanup đồng bộ trong transaction, BE-06 |
| 25 | `contract-revision` — phiên bản/xác nhận/sửa | Nối lịch sử, góp ý tạo nháp, chủ trọ sửa nháp/gửi lại, người thuê xác nhận | Confirm thật trả 500; DTO chưa có đủ feedback/version-check, BE-05 |
| 26 | `move-in` — vào ở | Nối `move-ins` với ngày thực tế, ghi nhận toàn bộ thành viên PLANNED theo API hiện có | Với fixture CONFIRMED vẫn 500 vì điều kiện đại diện ACTIVE chưa thỏa; thiếu `activated_at` và chọn tập thành viên, BE-05 |
| 27 | `cancel-contract` — hủy/hủy thành viên/nhập giấy | Nối hủy hợp đồng trước vào ở | Hủy thật trả 500; nhập giấy bị chặn do upload; hủy riêng thành viên chưa có UI, BE-02, BE-05 |
| 28 | `residents` — người ở/CSV | Nối `/residents`, gọi `/residents/export` rồi tạo CSV theo bộ lọc | DTO thiếu thông tin đại diện, giấy tờ và một số trường lịch sử; BE-18 |
| 29 | `join-consent` — thêm người/hai đồng ý | Nối đề nghị từ kết nối đã chấp nhận, hiển thị yêu cầu, consent và rút | Quyền của đại diện đang dựa vào viewing tenant, sai với hợp đồng giấy/bàn giao; BE-03, BE-11 |
| 30 | `join-hold` — duyệt/giữ chỗ/vào ở | Nối duyệt/từ chối, hoàn tất vào ở, hủy giữ chỗ | BE-11: thứ tự cập nhật, hạn giữ chỗ và đồng bộ trạng thái cần hoàn thiện |
| 31 | `departure` — rời phòng/người cuối | Nối command rời phòng với ngày thực tế | BE-11: người cuối, đóng hợp đồng và đồng bộ phòng chưa đủ |
| 32 | `handover` — bàn giao đại diện | Nối chọn người kế nhiệm đang ở và ghi nhận consent | BE-03, BE-11: lịch sử/đổi đại diện và quyền còn sai; GET lịch sử thật trả 500 |
| 33 | `change-request` — yêu cầu thay đổi | Nối đọc/tạo yêu cầu, chủ trọ duyệt/từ chối, người thuê xác nhận | Áp dụng bị chặn; rút yêu cầu chưa có UI; BE-10 |
| 34 | `renewal` — gia hạn | Nối đề nghị với ngày hiệu lực tách khỏi ngày kết thúc mới | Không gọi apply vì service dùng nhầm hai ngày, BE-10 |
| 35 | `transfer` — chuyển phòng | Nối đọc phòng đích cùng nhà và gửi/xét/xác nhận đề nghị | Không gọi apply vì chưa chuyển đầy đủ người/revision/hóa đơn/trạng thái, BE-10 |
| 36 | `end-lease` — kết thúc hợp đồng | Nối gửi/xét/xác nhận đề nghị chấm dứt | Không gọi apply khi chưa đóng cư trú đúng thứ tự, BE-10 |
| 37 | `services` — nhà/phòng/giá riêng | Nối danh mục dùng chung, thêm từ danh mục, sửa/bật/tắt; command cấu hình/giá riêng/kế thừa theo phòng | Tạo cấu hình lần đầu lỗi 500; dịch vụ tự đặt tên lỗi 400, BE-07 |
| 38 | `bill` — hóa đơn nháp | Nối đọc, tạo/sửa khoản thu thủ công, chọn payer member và kỳ thu | Tạo/thay thế thật lỗi snapshot; sửa hóa đơn có SERVICE bị chặn vì DTO thiếu chỉ số/cách tính, BE-04 |
| 39 | `pay-invoice` — phát hành/thu/hủy/thay thế | Nối issue/payment/cancel và tạo bản thay thế | BE-04: tạo bản mới còn lỗi; xử lý quá hạn/job chưa có |
| 40 | `review` — đánh giá phòng | Nối đọc; đánh giá từ thành viên ACTIVE/LEFT trong hợp đồng; admin ẩn từ chi tiết tin | Hợp đồng giấy không tải được ở tenant, GET admin reviews còn thiếu; audit khi ẩn lỗi, BE-03, BE-09 |
| 41 | `report` — báo cáo/xử lý | Nối báo cáo tin, admin đọc/điều tra/giải quyết/bác bỏ | Quyết định admin ghi audit JSON sai và rollback, BE-09 |
| 42 | `lock-account` — khóa/mở | Nối danh sách user thật, command khóa/mở có lý do | Khóa thật lỗi 500 do audit JSON; vòng đời phiên cần bổ sung, BE-09, BE-14 |
| 43 | `templates` — mẫu hợp đồng | Nối danh sách đang hoạt động, thêm, sửa nội dung, ngừng dùng | PATCH đang sửa tại chỗ; thiếu danh sách mẫu ngừng dùng để bật lại và chính sách version bất biến, BE-18 |
| 44 | `audit` — nhật ký | Nối đọc danh sách từ server, không tự thêm log bằng FE | Log ghi chưa bao phủ đủ command, trường before/after chưa đúng; BE-09 |
| 45 | `data-safety` — giao dịch/lịch sử | FE dùng ID thật, chống submit lặp và xử lý thất bại; không vá dữ liệu BE trong trình duyệt | Ngoài FE: transaction, lock và thứ tự flush/procedure, xem BE-05…BE-12 |
| 46 | `file-storage` — tệp/quyền đọc | Chặn chọn/upload giả và không tạo file ACTIVE khi chưa có bytes | Thiếu content endpoints và kiểm tra quyền/trạng thái; BE-02 |
| 47 | `migration` — tạo mới/nâng cấp | Không thực hiện lên CSDL hiện có; chỉ kiểm tra schema/seed trên MySQL tạm | Ngoài FE; BE Dev cần giữ nguyên ràng buộc và hoàn thiện service theo schema |

## Lỗi BE cần sửa trước — đã tái hiện trên BE thật

Các ID trong ví dụ thuộc dữ liệu mẫu của CSDL tạm; thay bằng ID tương ứng khi tái hiện. Không tắt trigger hoặc nới constraint để làm request thành công. Các procedure hiện có trong schema đã mô tả thứ tự nghiệp vụ cần giữ.

### BE-01 · P0 · Hội thoại lộ dữ liệu giữa các người thuê

API: `POST /conversations/room-inquiries`, `GET /conversations/{id}`, `GET /conversations/{id}/messages`.

Tái hiện: đăng nhập hai tenant khác nhau, cùng mở một `postId`. Cả hai nhận cùng conversation ID; participant được thêm vào hội thoại có sẵn. Dữ liệu mẫu đã có người thuê khác nên có thể nhận ngay hội thoại hơn hai người. Người mới có thể đọc nội dung của các người cũ.

Nguyên nhân: [MessagingService.roomInquiry](../BE/src/main/java/com/troday/api/service/MessagingService.java) tìm theo `postId + type`, không theo cặp landlord/tenant. Cần khóa/unique theo đúng ngữ cảnh hai bên, không thêm người thứ ba vào hội thoại riêng. GET/send/share/timeline phải kiểm tra lại quan hệ. FE tạm không fetch/render nội dung hoặc gửi tin trong hội thoại có số người khác 2; biện pháp FE không sửa được lỗ hổng BE.

### BE-02 · P0 · Upload/download chưa có nội dung tệp

`POST /files/upload-sessions` trả `uploadUrl=/api/v1/files/{id}/content`, nhưng **PUT và GET đường dẫn này trả 404**. `POST /files/{id}/complete` vẫn trả 200/ACTIVE dù chưa tải byte nào. `download-links` cũng tạo URL trỏ tới content endpoint không tồn tại.

Nguồn: [IntegrationController](../BE/src/main/java/com/troday/api/controller/IntegrationController.java), [IntegrationService](../BE/src/main/java/com/troday/api/service/IntegrationService.java). Cần endpoint nhận/đọc bytes hoặc signed URL storage thực; kiểm tra hash/size/type trước complete; quyền đọc minh chứng cho reviewer, token download có xác thực/TTL. Hiện `owned()` chỉ cho owner, admin không đọc được tệp người nộp. Đây là điểm chặn ảnh tin, giấy tờ, hồ sơ nhà, hợp đồng giấy và ảnh chat.

### BE-03 · P0 · Người ở hợp pháp không thấy hợp đồng

Với `tenant01@troday.example` trong seed: `GET /contracts` trả `[]`, `GET /contracts/1` trả **403**, trong khi `GET /invoices` trả hai hóa đơn của hợp đồng 1 và `room_tenants` có người này đang ACTIVE.

Nguồn: [ContractService.list/access](../BE/src/main/java/com/troday/api/service/ContractService.java), cùng cách kiểm tra trong ResidentService và ContractChangeService. Chỉ dùng `viewingTenantId` bỏ sót hợp đồng PAPER_IMPORT, thành viên và đại diện sau bàn giao. Cần quyền đọc theo quan hệ cư trú/hợp đồng; quyền xác nhận/điều chỉnh theo `representativeRoomTenantId` hiện tại. DTO hợp đồng cần trả đại diện hiện tại, không dùng viewing tenant thay thế. FE đã hiển thị các hóa đơn được API cho phép xem ngay cả khi BE thiếu hợp đồng liên quan.

### BE-04 · P0 · Tạo/thay thế hóa đơn thiếu snapshot

Ví dụ tạo hóa đơn hợp lệ cho contract 1, payer member 1, kỳ chưa có hóa đơn, `items=[{type:"RENT",name:"Rent",unit:"month",quantity:1,unitPrice:4500000}]`: **POST /invoices trả 500**, log `Column 'payer_snapshot' cannot be null`.

Nguồn: [BillingService.createInvoice/replacement](../BE/src/main/java/com/troday/api/service/BillingService.java). Cả hai không gán `payerSnapshot`. Cần snapshot JSON từ payer thật thuộc hợp đồng, revision và số người đúng kỳ; không nhận snapshot tùy ý từ FE. Bản thay thế phải giữ liên kết/lịch sử. `invoiceData()` cộng cả DISCOUNT như khoản dương; cần đồng nhất với view SQL tính chiết khấu âm. GET items phải trả `unit`, calculation method, previous/current reading và snapshot để FE có thể sửa nháp dịch vụ mà không làm mất dữ liệu. FE tạm chặn sửa hóa đơn có SERVICE qua form khoản thu đơn giản.

### BE-05 · P0 · Xác nhận/hủy/vào ở sai thứ tự với trigger

Sau khi tạo hợp đồng mới từ lịch đã hoàn thành/đồng ý:

- `POST /contracts/{id}/confirm` trả **500**: `Contract requires its confirmed or imported current revision`; hợp đồng vẫn PENDING_CONFIRMATION sau rollback.
- `POST /contracts/{id}/cancel` trả **500**: `Close or cancel every open stay before closing the contract`.
- `POST /contracts/{id}/move-ins` với fixture CONFIRMED cũng trả **500**: `Active contract requires an active confirmed representative`. Service chưa bảo đảm flush thành viên ACTIVE trước khi cập nhật contract; timestamp xác nhận dùng `LocalDateTime.now()` cũng cần thống nhất UTC với trigger. Đọc nguồn còn thấy entity Contract không ánh xạ/gán `activated_at`, `closed_at`, `closure_reason` mà trigger bắt buộc; sau khi sửa thứ tự cần kiểm tra tiếp các metadata này.

Nguồn: [ContractService](../BE/src/main/java/com/troday/api/service/ContractService.java), [Contract entity](../BE/src/main/java/com/troday/api/entity/Contract.java). Gọi `save()` trên revision/member trước contract không đảm bảo thứ tự UPDATE khi JPA flush. Cần transaction với thứ tự flush rõ ràng hoặc adapter phù hợp cho `sp_confirm_contract`, `sp_confirm_move_in`, `sp_cancel_contract`. Phải hoàn thành metadata/kết thúc các lượt ở trước khi đóng hợp đồng.

Ngoài lỗi 500, `confirm()` bỏ qua `body.revisionId` và xác nhận revision hiện tại. Đây là phát hiện qua mã nguồn: cần so sánh revision người thuê đã xem với revision đang chờ để tránh xác nhận nhầm nội dung vừa thay đổi. Chưa kiểm chứng chuỗi xác nhận thành công vì lỗi flush đang chặn.

### BE-06 · P0 · Gửi hợp đồng chưa giữ phòng/đóng lịch

`POST /contracts` trả 200/PENDING_CONFIRMATION nhưng `GET /rooms/{id}` vẫn **AVAILABLE**. Lịch tương lai và đề nghị liên quan không được cleanup; `contract-impact` ghi cứng số proposal là 0.

Nguồn: [ContractService.create/contractImpact](../BE/src/main/java/com/troday/api/service/ContractService.java). Cần thực hiện nghiệp vụ tương đương `sp_create_rental_contract`, `_v5_close_viewings_for_contract` và `_v5_sync_room` trong cùng giao dịch. Bao gồm giữ phòng, hủy lịch sắp tới, xử lý đề nghị chờ/hết hạn, thông báo, history và kết quả ảnh hưởng chính xác. FE không tự sửa các collection để che vấn đề.

### BE-07 · P0 · Cấu hình dịch vụ phòng lần đầu lỗi 500

Tạo một catalog service mới bằng admin → thêm vào nhà của owner → `PUT /rooms/{roomId}/service-settings/{houseServiceId}` với `{active:true,unitPriceOverride:0}`. **Trả 500/NullPointerException**, GET lại không có cấu hình đó.

Nguồn: [BillingService.roomSet/roomServiceData](../BE/src/main/java/com/troday/api/service/BillingService.java). Bản RoomServiceSetting mới không được `roomServices.save()`, `id` còn null nhưng được đưa vào `Map.of`. Cần lưu/flush trước khi map DTO. Với bản ghi đã tồn tại, JPA dirty checking có thể lưu được, nên cần test riêng create và update. Giá 0 khác null (kế thừa).

Ngoài ra tạo dịch vụ tự đặt tên không có `serviceId` trả **400** `serviceId không hợp lệ`: helper `longValue(..., Long fallback)` dùng ternary khiến fallback null bị unbox. FE đã nối cách thêm từ danh mục dùng chung; cần sửa nhánh custom và trả 409 cho tên trùng, không để SQL unique thành 500.

### BE-08 · P0 · Hồ sơ quyền nhà không có snapshot bắt buộc

Tạo nhà mới thành công, gửi `POST /houses/{id}/verifications` với `rightType`, `scopeDescription`, `validFrom` hợp lệ: **500**, log `Field 'house_snapshot' doesn't have a default value`.

Nguồn: [HouseService.submitVerification](../BE/src/main/java/com/troday/api/service/HouseService.java), entity RentalHouseVerification và `sp_submit_house_verification` trong schema. Cần snapshot/version phía server, liên kết documents đúng purpose/owner, thời hạn theo loại quyền; phê duyệt phải đối chiếu evidence và đúng snapshot. FE chặn nộp mới khi chưa thể gửi/đọc minh chứng.

### BE-09 · P0 · Nhật ký JSON làm rollback quản trị

`POST /admin/users/{id}/lock` với lý do hợp lệ trả **500**; tài khoản vẫn ACTIVE sau rollback. Log: `Invalid JSON text ... moderation_actions.after_snapshot`. Cùng helper được gọi ở unlock, xử lý report và moderation review.

Nguồn: [AdminService.log](../BE/src/main/java/com/troday/api/service/AdminService.java): ghi chuỗi `ACTIVE/LOCKED/...` thẳng vào cột JSON. Cần serialize JSON hợp lệ; giữ before snapshot trước khi đổi object. `reportDecision` hiện lấy before sau khi set status nên hai snapshot có thể giống nhau. Bổ sung audit cho post/xác minh/nhà và những command cần truy vết.

### BE-10 · P0 · Áp dụng điều chỉnh không khớp nghiệp vụ

**Phát hiện qua đọc nguồn, chưa xác nhận thành công toàn bộ chuỗi trên BE thật.** [ContractChangeService.apply](../BE/src/main/java/com/troday/api/service/ContractChangeService.java) gán ngày kết thúc gia hạn bằng `requestedEffectiveDate`, không lấy `newEndDate` trong proposal. Duyệt chưa tạo proposed revision; confirm chỉ đổi trạng thái request. Transfer tạo hợp đồng DRAFT nhưng không chuyển đủ thành viên, đại diện, revision và snapshot. Termination đổi trạng thái trước khi đóng cư trú. Chưa ràng buộc đủ ngày áp dụng.

Cần triển khai giao dịch theo `sp_apply_contract_change`, kiểm tra base/proposed revision, ngày hiệu lực, consent và trạng thái phòng. **FE đã nối gửi/duyệt/xác nhận, chủ động không gọi apply** để tránh rút ngắn hợp đồng hoặc chuyển dữ liệu sai.

### BE-11 · P1 · Người ở/bàn giao thiếu lịch sử và chuyển trạng thái

Đã tái hiện `GET /contracts/1/representative-history` trả **500/NullPointerException**: `historyData()` dùng `Map.of` với `endedAt=null` của nhiệm kỳ hiện tại.

Đọc nguồn [ResidentService](../BE/src/main/java/com/troday/api/service/ResidentService.java) còn thấy: handover cập nhật đại diện trước khi tạo đầy đủ lịch sử mà trigger yêu cầu; thiếu previous history/member metadata; moveOut trả `roomStatus:"AVAILABLE"` cố định và không đóng hợp đồng/người cuối theo procedure. complete-join cần đồng bộ room và tên thật từ user, kiểm tra ngày vào ở. Cần theo `sp_handover_representative`, `sp_move_out`, `sp_complete_occupant_join`; DTO dùng map cho phép null.

### BE-12 · P1 · Lịch xem: giờ/ngữ cảnh/lỗi nghiệp vụ

Đã tái hiện attendance cho lịch tương lai trả **500** do trigger `Attendance cannot precede the appointment`; điều kiện nghiệp vụ cần trả 409/422 với mã lỗi, không thành lỗi máy chủ. Đọc [ViewingService](../BE/src/main/java/com/troday/api/service/ViewingService.java) thấy offset bị bỏ bằng `OffsetDateTime.toLocalDateTime()`, trong khi schema/seed/procedure dùng UTC. Cần chuyển instant về UTC nhất quán và trả offset rõ ràng.

Cần kiểm tra conversation đúng room/post và hai bên, tài khoản/quyền còn hiệu lực; đề nghị chờ không giữ giờ như lịch đã chốt; kiểm tra hết hạn tức thời; duyệt lặp phải trả lịch cũ thay vì 409. Không chỉ để trigger từ chối rồi trả 500. Job hết hạn chưa có trong Java.

### BE-13 · P0 · API public lộ tin chưa duyệt; lọc công khai chưa đủ

Đã tái hiện gọi **không token** `GET /rooms/{roomId}/posts` với room có bài chờ duyệt: trả 200 và cả bài PENDING_REVIEW. [HouseService.roomPosts](../BE/src/main/java/com/troday/api/service/HouseService.java) trả thẳng entity, không lọc status/quyền. Cần DTO public lọc đúng; owner/admin mới đọc lịch sử riêng tư. FE hiện lấy public qua `/posts`, owner qua `/landlord/posts`, không dùng endpoint lộ dữ liệu này.

[PostService.explore/isPublic/effectiveRight](../BE/src/main/java/com/troday/api/service/PostService.java) cũng chưa kiểm tra đầy đủ quyền nhà còn hạn/đúng version, owner ACTIVE và tình trạng phòng khi đọc public; `effectiveRight` chỉ kiểm tra tồn tại APPROVED. Trigger chặn một số lần ghi không thay thế được điều kiện truy vấn public. Sắp xếp newest đang so ID dạng chuỗi.

## Các phần BE cần hoàn thiện thêm

### BE-14 · P0 · Refresh, OTP và reset

Nguồn: [AccountService](../BE/src/main/java/com/troday/api/service/AccountService.java).

- Login trả refresh token, nhưng refresh tạo session mới qua `loginForUser` không cấp token/hash refresh mới; không xoay vòng đầy đủ. Đã gọi refresh 200 và xác nhận response thiếu refresh token mới.
- `currentUser/currentSession` không kiểm tra lại status user cho mọi request; lock không thu hồi phiên. Vì API khóa hiện lỗi BE-09, lần rà soát bổ sung đặt user thành LOCKED trong CSDL tạm rồi dùng access token cũ: `GET /me` vẫn 200 và trả user status LOCKED. Cần kiểm tra lại toàn chuỗi khóa bằng API sau khi BE-09 được sửa.
- OTP điện thoại ghi cứng `123456`, không có adapter gửi. Reset tạo UUID nhưng không gửi mã; bước verify tạo grant chỉ trả selector, không trả secret; complete lại dùng cùng `resetGrant` làm selector và secret. Chưa có chuỗi reset khả dụng. Đã kiểm tra bước yêu cầu reset chỉ trả selector/expires/retryAfter, chưa kiểm chứng gửi SMS/email thực tế.
- `consume`/confirm phone cần ràng buộc user, purpose và targetValue; không nhận số điện thoại khác mục tiêu đã xác minh. Cần giới hạn gửi/thử, thu hồi phiên khi đổi mật khẩu và kiểm tra trạng thái user khi refresh.
- Hash mật khẩu hiện là SHA-256 không salt; cần bộ mã hóa mật khẩu phù hợp và kế hoạch tương thích dữ liệu mẫu/cũ.

**Đã tái hiện xác minh chéo tài khoản/khác mục tiêu:** tenant A POST `/auth/phone-verifications` cho số thử nghiệm `0990000001`, nhận selector; tenant B POST `/auth/phone-verifications/confirm` với selector đó, mã ghi cứng hiện tại và số `0990000002`. BE trả **200**, `phoneNumber=0990000002`, `phoneVerifiedAt` có giá trị. Không có SMS thực trong thử nghiệm. Cần token gắn với đúng user/target/purpose, số điện thoại lấy từ target đã kiểm chứng; không tin trường phoneNumber tùy ý trong request confirm.

### BE-15 · P0 · Quyền và kiểm tra đầu vào còn thiếu

Account invitation hiện chỉ yêu cầu đang đăng nhập rồi đọc member ID; chưa xác minh người gọi sở hữu hợp đồng/quyền tạo lời mời. Residency link chưa đối chiếu đủ người nhận/trạng thái/identity; chưa thể đưa vào UI như luồng hoàn chỉnh.

`HouseService.create` tự thêm hàng Landlord cho bất kỳ user đang đăng nhập; `adminLandlordDecision(APPROVE)` không đồng bộ vai trò/bảng landlord. Cần quy định quyền dựa trên các bảng vai trò đã được duyệt, không coi `users.role` đơn lẻ là toàn bộ quyền. Roommate IN_SYSTEM phải kiểm tra lượt ở thuộc tenant và đang hoạt động. File IDs cần kiểm tra owner/purpose/status trước liên kết.

Các DTO account có annotation nhưng controller/service đọc JsonNode thủ công và không chạy Bean Validation đầy đủ. Cần kiểm tra null/whitelist/độ dài/chuẩn hóa email-phone/số tiền/ngày và chuyển constraint violation thành lỗi 4xx thống nhất. Không trả stack trace cho FE.

### BE-16 · P1 · DTO xác minh chưa đủ để reviewer quyết định

`AccountService.verificationData()` chỉ trả `id/status`; không có applicant, thời gian, số giấy tờ được che phù hợp, reason hay file metadata. Các quyết định identity/landlord bỏ qua reason. House verification DTO cũng thiếu documents/applicant/snapshot/version cần đối chiếu. FE phân biệt identity/landlord bằng key riêng, không gán ID hồ sơ thành ID người dùng và không tự phê duyệt khi không có minh chứng.

### BE-17 · P1 · Hồ sơ public ở ghép thiếu tài khoản đích

`RoommateService.publicProfileData()` không trả tenantId/display name. `roommate-matches` chỉ có profile ID; profile ID không phải user ID của `POST /roommate-requests.receiverId`. Cần trả public user reference được phép sử dụng hoặc API gửi lời mời theo profileId có kiểm tra server. Không dùng suy đoán/ghép ID ở FE.

Scoring hiện dựa vào housing/budget/location; chưa lọc đầy đủ tiêu chí bắt buộc hoặc giải thích theo dữ liệu lifestyles. Thuật toán/trọng số vẫn thuộc D02 cần chốt, không khẳng định một công thức điểm cụ thể là yêu cầu đã duyệt. Cần xử lý status/housing thực. Lời mời nên có public profile reference để người nhận xem hồ sơ trước khi phản hồi.

### BE-18 · P1 · Các API đọc rỗng/cố định hoặc thiếu trường

| API / dữ liệu | Hiện tại | Cần bổ sung |
| --- | --- | --- |
| `GET /rooms/{id}/residents` | Luôn `[]` | Cư trú ACTIVE và quyền owner/admin |
| `GET /rooms/{id}/services` | Luôn `[]` | Dịch vụ bật ở nhà/phòng, giá effective, method/unit và override kể cả 0 |
| `GET /conversations/{id}/viewing-timeline` | Hai mảng rỗng | Proposal + viewing đúng conversation, trạng thái đồng bộ |
| `GET /viewings/{id}/contract-impact` | Proposal counts cố định 0 | Đếm đúng theo thời điểm đọc, kiểm tra lại trong transaction gửi hợp đồng |
| Room DTO | `currentLoad=0` cố định | Tải cư trú/giữ chỗ thực tế; không trả số 0 như dữ liệu thật |
| House DTO | Không có landlordId, areaLabel, notes/version/snapshot cần thiết | Public/owner DTO rõ ràng; trả lại các field cho phép sửa |
| Post DTO | Thiếu ảnh/file URL, rejectionReason và một số thông tin vị trí | Public image URL an toàn, dữ liệu phản hồi duyệt và khoảng cách nếu có |
| Admin posts | Bất kể filter chỉ lấy PENDING_REVIEW | Danh sách có status/filter/paging; đọc tin ẩn/từ chối để khôi phục/đối chiếu |
| Notification settings | PATCH lưu nhưng `/me` không trả settings | Endpoint GET hoặc trường settings trong `/me` |
| Templates | GET chỉ active; PATCH sửa content tại chỗ | Danh sách cả inactive theo quyền admin; tạo version mới nếu thay nội dung đã dùng |
| Dashboard | `pendingReviewCount` đang đếm review PUBLISHED | Thống nhất tên/số liệu hàng đợi; không suy diễn toàn hệ thống từ danh sách chờ |
| Report/audit DTO | Thiếu thời gian/đối tượng đầy đủ | Trả createdAt, target references và before/after hợp lệ |
| Invoice item DTO | Thiếu unit/method/readings/snapshot | Đủ dữ liệu sửa nháp dịch vụ và đọc lịch sử bất biến |

### BE-19 · P1 · SSE và trạng thái đọc tin nhắn chưa hoàn chỉnh

`MessagingService.events()` gửi đúng một `connected` rồi `complete()`, chưa có registry/subscription/replay. FE dùng polling 30 giây cho tab đang hiển thị, tạm dừng khi có dialog/đang ghi. Không coi polling là realtime tức thì.

`notificationCounts()` cộng toàn bộ tin từ người khác, không loại tin trước `lastReadAt`. `post-shares` không cập nhật `Conversation.lastMessageId/At` và không tạo notification. Preferences được ghi nhưng list DTO chưa trả trạng thái/không lọc archived/deleted. Cần cùng một pipeline gửi tin/notification/read state, tôn trọng notification settings, và SSE không đóng ngay.

## Sai lệch bổ sung phát hiện khi đối chiếu nghiệp vụ

Đã chạy thêm **18 kịch bản đối chiếu API trên BE thật với MySQL tạm mới**, nguyên schema/seed; cả 18 ghi nhận sai lệch với đặc tả. Một số kịch bản chứa nhiều assertion liên quan nên không quy đổi thành “18 lỗi độc lập”. Đây là lượt bổ sung cho 39 trường hợp của lần rà soát trước, không phải kiểm thử runtime toàn bộ 176 endpoint.

Fixture bổ sung chỉ gồm nhà/phòng chưa có tin công khai, một hóa đơn DRAFT có snapshot/dòng RENT hợp lệ, và một lịch COMPLETED/AGREED để tạo hợp đồng mà không đợi ngày hẹn. Không sửa constraint hoặc tắt trigger; không thay CSDL đang dùng. Script/log tạm được dọn sau khi ghi kết quả vào tài liệu này.

| # | API / yêu cầu wireframe | Thử nghiệm và thực tế |
| --- | --- | --- |
| 1 | 057: pageSize 1–100; sai trả 422 | GET `/posts?pageSize=101` vẫn **200**, trả 57 tin, không có pagination. |
| 2 | 046: người ngoài chỉ xem phòng có tin công khai | Tạo phòng mới chưa đăng tin, đếm `v_public_house_posts=0`; GET `/rooms/{id}` **không token vẫn 200**. |
| 3 | 030: cùng actor/Idempotency-Key/payload trả kết quả cũ | Gửi cùng POST `/houses` hai lần với cùng UUID: **200/200, hai houseId khác nhau**. |
| 4 | 032: If-Match cũ phải bị từ chối | PATCH nhà với `If-Match: "0"` vẫn **200**, ghi đè tên; response không có rowVersion. |
| 5 | 052: sửa tin giữ nguyên roomId, kiểm tra version | PATCH tin của owner sang một phòng khác cùng owner, If-Match cũ: **200**, roomId thực sự thay đổi. |
| 6 | 156: nhận targetType/targetId theo mẫu catalogue | POST báo cáo đúng `targetType:POST,targetId` trả **400** vì BE đòi một trong các FK khác tên. |
| 7 | 147: server xác định payer hiện tại | POST hóa đơn bằng các field catalogue, không tự gửi payer: **400** vì BE bắt buộc `payerRoomTenantId`. Bổ sung field riêng của BE thì gặp lỗi snapshot BE-04. |
| 8 | 148: PATCH field nào thay field đó | Hóa đơn DRAFT có một dòng RENT → PATCH chỉ `dueDate` → **200 nhưng items từ 1 thành 0**. |
| 9 | 073: ACCEPT tạo/lấy ROOMMATE cùng transaction | Chấp nhận lời mời **200**, `conversationId=null`; truy vấn DB ngay sau accept có **0 conversation**. Chỉ khi gọi API-084 riêng mới tạo chat. |
| 10 | 080: cùng khóa, khác payload phải 409 | Gửi hai TEXT khác nội dung với cùng clientMessageKey → **200/200**, lần hai trả nội dung cũ; response retry còn khác cấu trúc response gửi mới. |
| 11 | 081: lastReadAt chỉ tăng | Đọc tin mới rồi PUT lại ID tin cũ → **200**, lastReadAt bị lùi về thời điểm tin cũ. |
| 12 | 080: IMAGE phải có CHAT_IMAGE hợp lệ | POST `type:IMAGE` không có fileIds vẫn **200**, lưu tin IMAGE không có ảnh. |
| 13 | 075/080: kết nối ended không gửi mới | End kết nối **200**, sau đó POST TEXT mới vào conversation cũ vẫn **200**. |
| 14 | 067: BOOLEAN phải đúng kiểu JSON | Tạo criterion BOOLEAN rồi PUT selfValue là object, preferredValue là string tùy ý → **200**. |
| 15 | 067: thay lại bộ tiêu chí hợp lệ | PUT lại chính criterion đó với boolean hợp lệ → **500**, log `Duplicate entry ... profile_lifestyles.uq_profile_lifestyle`. |
| 16 | 089: read-all chỉ tới throughCreatedAt | Tạo thông báo mới; POST read-all mốc `2000-01-01T00:00:00Z` → **200**, thông báo mới vẫn bị đánh dấu đã đọc. |
| 17 | 116: export là CSV | GET `/residents/export` **200 application/json**, không phải CSV/attachment. |
| 18 | 103/106: lưu đủ thành viên/mẫu, hủy bản chờ khi yêu cầu sửa | Gửi một extraMember và templateId hợp lệ → **200 nhưng chỉ có một member đại diện**, template_id trong revision NULL. Gửi revision-request **200**, revision cũ và contract vẫn PENDING_CONFIRMATION. |

### BE-20 · P1 · Chưa tuân thủ contract API chung, idempotency và version

Đặc tả: `api-catalog.json.standards`, API-001/003/030/032/052/063 và các POST. Nguồn: [ApiResponseDto](../BE/src/main/java/com/troday/api/dto/ApiResponseDto.java), [AccountService:37](../BE/src/main/java/com/troday/api/service/AccountService.java#L37), [HouseService:28](../BE/src/main/java/com/troday/api/service/HouseService.java#L28), controller và repository.

- **Đã tái hiện** POST tạo nhà cùng Idempotency-Key vẫn tạo mới; PATCH bỏ qua If-Match; pageSize không được kiểm tra. Source chưa có middleware/store xử lý Idempotency-Key, ETag/CAS hoặc paging/cursor đầy đủ. Các khóa riêng của chat/proposal không so hash payload; không thay thế được contract chung.
- Envelope hiện `{success,api,method,data,timestamp}` khác `{data,meta,error}`; create trả 200 thay 201, reset không trả 202 đồng nhất, chưa có requestId/fieldErrors/domain error mapper. ID vẫn có chỗ trả JSON number; datetime LocalDateTime thiếu offset, thay vì UTC Z. Money/quantity chưa validate đầy đủ precision. Đây là sai contract, kể cả khi FE hiện đã có adapter để đọc.
- Đăng ký chưa tạo `personal_profiles` trong cùng transaction như API-001; `/me.roles` lấy một `users.role` thay vì các bảng vai trò. Có thể sửa profile sau để tạo profile còn thiếu, nhưng không đáp ứng atomic contract đăng ký. Các điểm đã khớp như actor từ session/TENANT mặc định vẫn được giữ.

Hướng sửa: chốt/migrate contract có kiểm soát giữa BE và các FE; triển khai wrapper/error mapping và validation; idempotency theo actor+method+route+key+payload, replay response ổn định; version bắt buộc và so dưới khóa/CAS. Không chỉ thêm tên header rồi bỏ qua hoặc dựa vào việc ẩn nút ở FE. SQL đã tự tăng version nhà, service cần trả/so đúng version đó.

### BE-21 · P1 · Đổi danh tính bài đăng và kiểm duyệt thiếu chứng cứ

Đặc tả: TD-09/11/12, API-052/054/055/056. Nguồn: [PostService:44](../BE/src/main/java/com/troday/api/service/PostService.java#L44), [PostService:54](../BE/src/main/java/com/troday/api/service/PostService.java#L54).

**Đã tái hiện** sửa một post sang roomId khác thành công. `update()` nhận roomId và đổi cả room/house, chỉ kiểm tra body contentVersion nếu có; không nhận If-Match đúng contract. Điều này đổi ý nghĩa ID đã được lưu/chia sẻ, trái quy tắc giữ phòng khi sửa bài. Trigger quota vẫn giữ tối đa ba bài chờ, không bảo vệ được ý nghĩa ID nghiệp vụ này.

Đọc nguồn: decision không ghi reason/reviewer/time, không kiểm tra expected content version dưới khóa; hide bỏ reason, restore không ghi metadata/audit. Nhánh gửi lại không xóa đầy đủ metadata duyệt cũ theo procedure. Cần giữ nguyên room, bắt buộc version, duyệt đúng bản nội dung và lưu lịch sử quyết định/thông báo; không nới quota SQL.

### BE-22 · P1 · Hồ sơ ở ghép, tiêu chí và chấp nhận lời mời chưa đúng luồng

Đặc tả: OG-02/03/08/09, API-063/064/067/068/070/071/072/073. Nguồn: [RoommateService:20](../BE/src/main/java/com/troday/api/service/RoommateService.java#L20), [RoommateService:24](../BE/src/main/java/com/troday/api/service/RoommateService.java#L24), [ProfileLifestyleRepository](../BE/src/main/java/com/troday/api/repository/ProfileLifestyleRepository.java).

- **Đã tái hiện** BOOLEAN nhận object/string tùy ý; PUT lại cùng criterion với dữ liệu hợp lệ trả 500/unique. `deleteByProfileId()` là derived delete của JPA, insert IDENTITY mới xảy ra trước khi hàng cũ được xóa/flush. Cần replace/upsert đúng thứ tự trong transaction và validate theo valueType/allowedValues; lỗi phải rollback giữ bộ cũ.
- **Đã tái hiện** ACCEPT 200 nhưng không có conversation trong DB và response. `respond()` chỉ đổi request, trả `conversationId=null`; API-084 được gọi sau mới tạo chat. Cần get-or-create đúng hai participant cùng giao dịch accept, giữ unique roommate_request_id, không tạo yêu cầu cư trú/consent thay thế.
- Qua nguồn: `applyProfile()` tin housingStatus/currentRoomTenantId từ body thay vì tra ACTIVE theo actor. IN_SYSTEM còn gán externalContext chuỗi rỗng thay vì SQL NULL, có thể bị CHECK từ chối; không kết luận đã khai thác được memberId của người khác qua nhánh đang lỗi. Sau khi sửa NULL phải kiểm tra owner và cư trú hiệu lực. `publicProfile()` đọc bất kỳ profile ID khi đăng nhập, chưa kiểm tra active/quyền lời mời.
- `sendRequest()` bỏ `targetContractId`, làm JOIN_SYSTEM_ROOM không đáp ứng CHECK context; counts chỉ tính PENDING trái bộ đếm toàn tab. PATCH criterion đòi đủ field và cho đổi kiểu đang được sử dụng. Điểm v1 tự đặt chưa được chốt D02, không được trình bày là thuật toán đã đạt yêu cầu.

### BE-23 · P1 · Gửi/đọc chat và thông báo có thể làm sai trạng thái

Đặc tả: HT-03/07/11, API-080/081/085/088/089. Nguồn: [MessagingService:12](../BE/src/main/java/com/troday/api/service/MessagingService.java#L12), [MessagingService:13](../BE/src/main/java/com/troday/api/service/MessagingService.java#L13), [MessagingService:17](../BE/src/main/java/com/troday/api/service/MessagingService.java#L17), [MessagingService:20](../BE/src/main/java/com/troday/api/service/MessagingService.java#L20).

**Đã tái hiện:** gửi sau ended vẫn 200; IMAGE không file vẫn 200; khóa tin cũ + payload khác trả 200; read-state lùi; read-all bỏ mốc thời gian. `member()` chỉ kiểm tra có hàng participant, không kiểm tra left/deleted và trạng thái kết nối khi gửi/share. `sendMessage()` không liên kết fileIds, chưa giới hạn TEXT 2.000 ký tự. Nhánh retry trả message trực tiếp, nhánh mới trả `{message,eventId}`.

`readState()` gán thẳng sentAt của message cũ và trả unreadCount=0. `notificationReadAll()` bỏ hoàn toàn body throughCreatedAt; đọc một notification lặp lại cũng ghi lại readAt. Nhánh share chưa bắt buộc ROOMMATE và chưa dùng pipeline lastMessage/notification như gửi TEXT; số chưa đọc vẫn sai BE-19.

Hướng sửa: kiểm tra lại membership/connection ở cùng transaction gửi; validate/khóa file đúng context; so payload khi retry; dùng max của mốc đọc với so thứ tự `(sentAt,id)` thích hợp; update read-all có cutoff/user scope và giữ readAt lần đầu. Quyền đọc lịch sử sau ended phải chốt D03 riêng, không tự xóa chat.

### BE-24 · P0 · Bỏ dữ liệu hợp đồng và chưa xử lý đúng phiên bản/nhóm vào ở

Đặc tả: HD-03/05/07, DC-02/06/07, API-103/106/108/110/113/130/132/133/135/136/167. Nguồn: [ContractService:8](../BE/src/main/java/com/troday/api/service/ContractService.java#L8), [ContractService:11](../BE/src/main/java/com/troday/api/service/ContractService.java#L11), [ContractService:15](../BE/src/main/java/com/troday/api/service/ContractService.java#L15), [ContractChangeService:7](../BE/src/main/java/com/troday/api/service/ContractChangeService.java#L7), [AdminService:21](../BE/src/main/java/com/troday/api/service/AdminService.java#L21).

- **Đã tái hiện:** `extraMembers` có một người hợp lệ nhưng chỉ tạo đại diện; templateId hợp lệ không được ghi vào revision. FullName đại diện bị thay bằng `Tenant {id}`. Service cũng chưa tạo giai đoạn đại diện ban đầu và snapshot thành viên đầy đủ như procedure. Không được trả thành công khi bỏ dữ liệu người dùng đã gửi.
- **Đã tái hiện:** yêu cầu sửa tạo DRAFT mới nhưng không CANCELLED revision chờ cũ, không đưa contract/currentRevision về trạng thái phù hợp. Cần hủy bản chờ dưới khóa, chọn bản hiện tại rõ ràng; sau khi BE-05 được sửa phải test rằng bản cũ không còn xác nhận được.
- **Qua nguồn, hiện bị lỗi confirm/move-in chặn:** move-ins bỏ `memberIds`, lặp toàn bộ PLANNED, chỉ cho contract CONFIRMED. Cần vào ở đúng tập đã chọn, lần đầu có đại diện, người đến sau vẫn được xử lý khi contract ACTIVE; không kích hoạt người chưa đến.
- Request điều chỉnh chỉ lưu JSON body, chưa chuẩn hóa proposal/snapshot/revision. Duyệt chưa tạo proposed revision; confirm chưa so lại base/đại diện; apply chưa kiểm tra đến ngày hiệu lực. Chuyển phòng bị giới hạn cùng nhà dù đặc tả cho cùng chủ; không tính đúng toàn nhóm ở đích. Các lỗi apply cụ thể ở BE-10.
- Import giấy hiện chỉ tạo DRAFT, chưa dựng đầy đủ dữ liệu đã ký. PATCH template hiện cho sửa content cùng row, trong khi API-167 chỉ cho active; nội dung mới cần row/version mới. Không tự mở rộng phạm vi D11 hoặc thêm chữ ký số.

### BE-25 · P0 · PATCH hóa đơn mất dòng và phép tính tiền chưa đúng

Đặc tả: TT-01…04/08, API-147/148. Nguồn: [BillingService:28](../BE/src/main/java/com/troday/api/service/BillingService.java#L28), [BillingService:34](../BE/src/main/java/com/troday/api/service/BillingService.java#L34), [BillingService:41](../BE/src/main/java/com/troday/api/service/BillingService.java#L41).

**Đã tái hiện:** PATCH chỉ `{dueDate:"2030-01-20"}` cho hóa đơn DRAFT có một dòng RENT → response 200 nhưng DB/items còn 0. `updateInvoice()` luôn gọi `replaceItems()`, hàm này xóa items trước khi kiểm tra có trường items hay không. Phải chỉ thay lines khi request có items; dueDate-only giữ nguyên lines và tổng.

**Đã tái hiện:** body API-147 không có payerRoomTenantId bị 400; đặc tả yêu cầu server suy ra đại diện/người trả hiện tại. Source còn nhận unitPrice/calculationMethod/quantity từ client thay vì kiểm tra giá dịch vụ bật đúng nhà/phòng và tính server; `occupantCount()` tính cả PLANNED/LEFT vì chỉ loại CANCELLED. Dịch vụ theo người chỉ dùng ACTIVE; PER_ROOM quantity=1, METERED theo chênh lệch chỉ số và đơn giá snapshot hiệu lực.

`invoiceData()` cộng cả DISCOUNT dương, trái view `invoice_totals`; số tiền UI đọc có thể khác tổng kế toán. SQL vẫn ngăn phát hành tổng âm và giữ lines đã phát hành, không được bỏ các trigger này. Snapshot BE-04 phải sửa trước, rồi kiểm tra lại payer/revision/count, dòng dịch vụ, giảm trừ, replace và rollback khi một dòng không hợp lệ.

### BE-26 · P1 · Quyền đọc phòng, payload báo cáo và CSV không khớp đặc tả

Đặc tả: PH-08/10, API-046/116/153/156/159. Nguồn: [HouseService:47](../BE/src/main/java/com/troday/api/service/HouseService.java#L47), [ResidentService:6](../BE/src/main/java/com/troday/api/service/ResidentService.java#L6), [AdminService:8](../BE/src/main/java/com/troday/api/service/AdminService.java#L8), [AdminService:11](../BE/src/main/java/com/troday/api/service/AdminService.java#L11).

- **Đã tái hiện:** GET room không token trả 200 cho phòng mới chưa đăng tin. `roomDetail()` không có request/auth/context; `publicReviews()` cũng chưa kiểm tra quyền xem room. Cần owner/admin scope hoặc có post public hiệu lực; riêng danh tính cư dân phải giữ nội bộ.
- **Đã tái hiện:** report body đúng catalogue `{type:"VIOLATION",targetType:"POST",targetId:"...",reason:"..."}` bị 400. Service đòi `reportedPostId/reportedUserId/contractId/roommateRequestId` thay vì ánh xạ targetType/targetId. Chưa kiểm tra quyền đọc đối tượng báo cáo hoặc ghi evidenceFileIds đúng PRIVATE/owner/purpose. FK tồn tại không chứng minh actor được đọc đối tượng đó.
- **Đã tái hiện:** export 200 application/json vì gọi lại `residents()`. Cần CSV UTF-8 BOM, Content-Disposition, chỉ ACTIVE/scoped owner và bộ lọc, giữ người còn ACTIVE trên contract đã đóng sai; escape CSV/formula injection. Các GET cư dân/report/audit/user còn bỏ nhiều filter của catalogue. FE tự tạo CSV không thay thế nghĩa vụ API-116.

### BE-27 · P1 · Chưa có xử lý hết hạn, phát sự kiện và retention theo luồng

Đặc tả: JOB01…JOB06, LX-13, PH-14, NO-06/07, TT-07, standards UTC/transaction. Source chưa có scheduler/worker/event delivery hoặc adapter gọi các thủ tục hết hạn; SSE chỉ connected rồi đóng. Lịch đề xuất trong catalogue chưa phải cron đã chốt.

Các API đọc cần tính effective expiry ngay cả khi job chưa chạy; không báo proposal/hold còn dùng được chỉ vì status DB còn PENDING/APPROVED. Quyền nhà phải đọc qua view; quá hạn hóa đơn chỉ đổi UNPAID phù hợp, không sửa PAID/CANCELLED. Timestamp ghi từ `LocalDateTime.now()` và bỏ offset cần sửa thống nhất UTC trước khi đối chiếu với trigger UTC.

Notification/audit cần ghi cùng giao dịch nghiệp vụ, phát SSE sau commit; retry/dedupe và replay bền vững thuộc phần hạ tầng D09. Dọn token/session/file staged phải giữ tệp còn tham chiếu/minh chứng theo D05, không xóa lịch sử hoặc tự đóng hợp đồng còn cư dân. Không tạo endpoint public để gọi worker/helper SQL.

### Tiêu chí nghiệm thu cho BE Dev

1. Dùng đúng request mẫu và headers trong catalogue; đối chiếu cả status, envelope, data, quyền và phiên bản, không chỉ HTTP 200.
2. Test cả trạng thái nguồn đúng/sai, tài khoản khác, LOCKED, quyền nhà hết hạn/thu hồi, form stale và request lặp/đồng thời.
3. Sau thành công phải có đủ member/revision/history/snapshot/room state/audit/notification theo luồng; sau thất bại không để cập nhật dở dang.
4. Khi dùng procedure công khai tự START/COMMIT, không bọc CALL trong transaction app; khi viết adapter JPA tương đương phải chứng minh cùng khóa/thứ tự/rollback, không tắt trigger.
5. Dùng CSDL tạm cho regression, gồm 18 kịch bản bổ sung ở trên và các lỗi BE-01…BE-19; policy D01…D15 chưa chốt phải ghi rõ người quyết định, không tự coi giả định là yêu cầu đã duyệt.

## API cần bổ sung/chốt ngoài danh mục 176 route

1. **Nhận nội dung upload**: `PUT /api/v1/files/{id}/content` hoặc URL storage thật cùng method/headers rõ ràng; hiện BE tự trả URL nội bộ không có handler.
2. **Đọc nội dung tệp**: `GET /api/v1/files/{id}/content` hoặc signed download URL thực; kiểm tra token/quyền reviewer/TTL/visibility và nội dung đã complete.
3. **Danh sách đánh giá cho admin**: hiện chỉ có GET public theo room và POST moderation; cần API lọc hidden/deleted để quản trị khôi phục và truy vết. Đây là khoảng trống ngoài catalogue hiện có.
4. **Đọc các trạng thái bị thiếu**: thêm filter vào admin posts/templates và GET notification settings hoặc mở rộng DTO hiện có; không nhất thiết tạo endpoint mới nếu có thể bổ sung contract rõ ràng.
5. **OTP/reset/realtime**: phần lớn route đã có; cần adapter/provider, response contract và job/subscription thực, không giải quyết bằng việc thêm tên route nữa.

## Quy ước payload FE đang sử dụng

Base `/api/v1`, `Authorization: Bearer <accessToken>` cho request cần đăng nhập. Thành công được đọc từ `data` trong `{success:true, api, method, data, timestamp}`. FE chấp nhận lỗi Spring HTTP hiện có, nhưng BE nên trả `code/message/fieldErrors` thống nhất để người dùng biết cách sửa. ID giữ dạng chuỗi trong React, không sinh ID nghiệp vụ ở FE.

| Luồng | Field gửi lên BE |
| --- | --- |
| Login | `identifier`, `password` |
| Room | `code`, `area`, `capacity`, `rentAmount`, `depositAmount`, `status` |
| Post | `roomId`, `title`, `content`, `amenities`, `contentVersion` khi sửa |
| Chat | `type:TEXT`, `content`, `clientMessageKey` UUID, giữ key khi thử lại cùng bản nháp |
| Proposal | `conversationId`, `roomId`, `startsAt` có `+07:00`, `durationMinutes`, `notes`, `clientRequestKey` |
| Proposal decision | `ACCEPT/REJECT`; khác `APPROVE/REJECT` của kiểm duyệt |
| Rental decision | `AGREE/DECLINE`; server trả `AGREED/DECLINED` |
| Contract | `viewingId`, `contractNumber`, `startDate`, `endDate`, `rentAmount`, `depositAmount`, `content` |
| Change request | `type`, `baseRevisionId`, `effectiveDate`, `newEndDate` cho renewal, `targetRoomId` cho transfer, `reason` |
| Invoice | `contractId`, `payerRoomTenantId` (ID member, không phải user), `billingPeriod` ngày 01, `dueDate`, `items[].unitPrice` |
| Room service | PUT với `active`, `unitPriceOverride`; `null` kế thừa, `0` miễn phí |
| Lifestyles | `criteria[]`: `criterionId`, `selfValue`, `preferredValue`, `importance`, `isMandatory` đúng kiểu JSON |

## Cấu trúc phần kết nối

- [src/data/api.js](src/data/api.js): HTTP client, xử lý response/error, adapter DTO và mapping request theo controller hiện có.
- [src/context/AppContext.jsx](src/context/AppContext.jsx): phiên, vai trò, tải dữ liệu, điều hướng, gọi command và polling; không import seed demo.
- `src/pages/`, `src/components/`: giữ bố cục web, thay thao tác giả bằng API; form chỉ báo thành công sau response.
- [tests/browser.cjs](tests/browser.cjs): HTTP fixture độc lập, trình duyệt Chrome, đối chiếu endpoint với controller; chế độ live dùng BE thật.

Chỉ thêm module API cần thiết, sửa các file FE/tài liệu/test đã có. Không tạo bản sao API guide, Postman collection, migration hoặc SQL mới.

## Danh mục 176 API thực tế

Danh sách dưới được lấy từ controller và ghép với tên/API ID của catalogue wireframe. Tất cả đường dẫn có tiền tố `/api/v1`. **Có route ≠ đã hoàn thiện nghiệp vụ**; xem bảng luồng và BE-01…BE-19 trước khi đánh dấu hoàn thành.

JSON chi tiết được đối chiếu với mã nguồn; [tài liệu API BE hiện có](../BE/Troday-176-API-va-JSON.md) và [Postman hiện có](../BE/Troday-API.postman_collection.json) giữ nguyên. Khi BE sửa hợp đồng request/response, cần cập nhật tài liệu đó cùng mã nguồn.

<!-- Controller inventory follows. -->

### Tài khoản & xác minh — 28 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-001 | `POST /auth/register` | Đăng ký tài khoản người thuê | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-002 | `POST /auth/login` | Đăng nhập và mở phiên | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-003 | `GET /me` | Đọc tài khoản và các vai trò thực | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-004 | `PATCH /me/profile` | Cập nhật hồ sơ cá nhân | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-005 | `PATCH /me/notification-settings` | Cấu hình kênh thông báo | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-006 | `POST /me/identity-verifications` | Nộp xác minh danh tính người thuê | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-007 | `GET /me/identity-verifications` | Lịch sử xác minh của mình | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-008 | `POST /me/identity-verifications/{id}/withdraw` | Rút hồ sơ danh tính đang chờ | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-009 | `POST /me/landlord-verifications` | Xin cấp vai trò chủ trọ | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-010 | `GET /me/landlord-verifications` | Lịch sử hồ sơ xin làm chủ trọ | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-011 | `POST /me/landlord-verifications/{id}/withdraw` | Rút hồ sơ chủ trọ đang chờ | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-012 | `GET /admin/identity-verifications` | Danh sách hồ sơ identity | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-013 | `GET /admin/identity-verifications/{id}` | Chi tiết hồ sơ identity | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-014 | `POST /admin/identity-verifications/{id}/decision` | Duyệt hoặc từ chối hồ sơ identity | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-015 | `GET /admin/landlord-verifications` | Danh sách hồ sơ landlord | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-016 | `GET /admin/landlord-verifications/{id}` | Chi tiết hồ sơ landlord | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-017 | `POST /admin/landlord-verifications/{id}/decision` | Duyệt hoặc từ chối hồ sơ landlord | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-018 | `POST /auth/refresh` | Luân chuyển refresh token | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-019 | `POST /auth/logout` | Đăng xuất phiên hiện tại | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-020 | `GET /me/sessions` | Danh sách phiên của mình | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-021 | `DELETE /me/sessions/{id}` | Thu hồi một phiên | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-022 | `POST /auth/phone-verifications` | Gửi OTP xác minh điện thoại | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-023 | `POST /auth/phone-verifications/confirm` | Xác nhận OTP điện thoại | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-024 | `POST /auth/password-resets` | Yêu cầu đặt lại mật khẩu | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-025 | `POST /auth/password-resets/verify` | Đổi OTP hợp lệ lấy quyền reset ngắn hạn | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-026 | `POST /auth/password-resets/complete` | Đặt mật khẩu mới | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-027 | `POST /contracts/{contractId}/members/{memberId}/account-invitations` | Mời cư dân chưa có tài khoản liên kết | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |
| API-028 | `POST /me/residency-links` | Nhận liên kết tài khoản với lượt cư trú | [AccountController](../BE/src/main/java/com/troday/api/controller/AccountController.java) |

### Nhà, quyền cho thuê & phòng — 22 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-029 | `GET /houses` | Danh sách nhà thuộc chủ trọ | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-030 | `POST /houses` | Tạo nhà nháp | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-031 | `GET /houses/{houseId}` | Chi tiết nhà quản lý | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-032 | `PATCH /houses/{houseId}` | Sửa nhà và kiểm tra phiên bản | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-033 | `GET /houses/{houseId}/verifications` | Lịch sử quyền cho thuê từng nhà | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-034 | `POST /houses/{houseId}/verifications` | Nộp minh chứng quyền cho thuê | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-035 | `GET /houses/{houseId}/verifications/{verificationId}` | Chi tiết hồ sơ quyền nhà của mình | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-036 | `POST /houses/{houseId}/verifications/{verificationId}/withdraw` | Rút hồ sơ quyền nhà đang chờ | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-037 | `GET /admin/house-verifications` | Hàng đợi xác minh quyền nhà | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-038 | `GET /admin/house-verifications/{verificationId}` | Chi tiết và minh chứng để đối chiếu | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-039 | `POST /admin/house-verifications/{verificationId}/decision` | Duyệt/từ chối quyền cho thuê | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-040 | `POST /admin/house-verifications/{verificationId}/revoke` | Thu hồi quyền đã duyệt | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-041 | `GET /houses/{houseId}/rental-right` | Đọc quyền hiệu lực hiện tại | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-042 | `GET /houses/{houseId}/rooms` | Danh sách phòng của nhà | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-043 | `POST /houses/{houseId}/rooms` | Thêm phòng trong nhà | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-044 | `PATCH /rooms/{roomId}` | Sửa thông tin vật lý và giá phòng | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-045 | `PUT /rooms/{roomId}/capacity` | Đổi sức chứa có khóa phòng | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-046 | `GET /rooms/{roomId}` | Chi tiết phòng theo quyền người xem | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-047 | `GET /rooms/{roomId}/posts` | Bài đăng của một phòng | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-048 | `GET /rooms/{roomId}/residents` | Người đang ở trong phòng | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-049 | `GET /rooms/{roomId}/services` | Dịch vụ hiệu lực của phòng | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |
| API-175 | `GET /landlord/dashboard` | Tổng quan quản lý nhà trọ | [HouseController](../BE/src/main/java/com/troday/api/controller/HouseController.java) |

### Tin đăng & tìm phòng — 12 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-050 | `GET /landlord/posts` | Danh sách tin chủ trọ quản lý | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-051 | `POST /posts` | Tạo bài mới và gửi duyệt | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-052 | `PATCH /posts/{postId}` | Sửa đúng bài và gửi duyệt lại | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-053 | `GET /admin/posts` | Hàng đợi kiểm duyệt tin | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-054 | `POST /admin/posts/{postId}/decision` | Duyệt hoặc từ chối đúng bài | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-055 | `POST /posts/{postId}/hide` | Ẩn tin đang công khai | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-056 | `POST /admin/posts/{postId}/restore` | Hiện lại tin đã ẩn | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-057 | `GET /posts` | Khám phá và lọc tin công khai | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-058 | `GET /posts/{postId}` | Chi tiết đúng tin công khai | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-059 | `GET /me/favorites` | Danh sách bài đã lưu | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-060 | `PUT /me/favorites/{postId}` | Lưu bài theo ID | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |
| API-061 | `DELETE /me/favorites/{postId}` | Bỏ lưu bài | [PostController](../BE/src/main/java/com/troday/api/controller/PostController.java) |

### Hồ sơ & kết nối ở ghép — 14 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-062 | `GET /me/roommate-profile` | Đọc hồ sơ ở ghép của mình | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-063 | `PUT /me/roommate-profile` | Tạo hoặc thay thế hồ sơ ở ghép | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-064 | `GET /roommate-profiles/{profileId}` | Xem hồ sơ ứng viên theo quyền | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-065 | `GET /lifestyle-criteria` | Danh mục tiêu chí đang áp dụng | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-066 | `GET /me/roommate-profile/lifestyles` | Đọc đặc điểm và mong muốn đã lưu | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-067 | `PUT /me/roommate-profile/lifestyles` | Thay bộ tiêu chí của hồ sơ | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-068 | `GET /roommate-matches` | Danh sách người phù hợp | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-069 | `POST /admin/lifestyle-criteria` | Tạo tiêu chí ghép linh động | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-070 | `PATCH /admin/lifestyle-criteria/{criterionId}` | Sửa/ngừng tiêu chí | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-071 | `GET /roommate-requests` | Lời mời đến/đã gửi và bộ đếm | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-072 | `POST /roommate-requests` | Gửi lời mời kết nối | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-073 | `POST /roommate-requests/{requestId}/response` | Người nhận chấp nhận/từ chối kết nối | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-074 | `POST /roommate-requests/{requestId}/cancel` | Người gửi hủy lời mời chờ | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |
| API-075 | `POST /roommate-requests/{requestId}/end` | Kết thúc kết nối đã nhận | [RoommateController](../BE/src/main/java/com/troday/api/controller/RoommateController.java) |

### Tin nhắn & thông báo — 15 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-076 | `POST /conversations/room-inquiries` | Mở/lấy hội thoại hỏi đúng bài | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-077 | `GET /conversations` | Hội thoại của tài khoản | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-078 | `GET /conversations/{conversationId}` | Chi tiết hội thoại và thành viên | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-079 | `GET /conversations/{conversationId}/messages` | Lịch sử tin và thẻ chia sẻ | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-080 | `POST /conversations/{conversationId}/messages` | Gửi tin nhắn chữ/ảnh | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-081 | `PUT /conversations/{conversationId}/read-state` | Đánh dấu đã đọc đến tin xác định | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-082 | `PATCH /conversations/{conversationId}/preferences` | Ẩn/lưu trữ/tắt thông báo phía mình | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-083 | `GET /conversations/{conversationId}/viewing-timeline` | Thẻ lịch và đề nghị trong chat | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-084 | `POST /roommate-requests/{requestId}/conversation` | Mở lại đúng chat bạn ghép | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-085 | `POST /conversations/{conversationId}/post-shares` | Chia sẻ đúng bài cho bạn ghép | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-086 | `GET /me/notifications` | Feed thông báo của mình | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-087 | `GET /me/notification-counts` | Bộ đếm chưa đọc | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-088 | `PUT /me/notifications/{notificationId}/read-state` | Đánh dấu một thông báo đã đọc | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-089 | `POST /me/notifications/read-all` | Đọc tất cả đến mốc xác định | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |
| API-090 | `GET /events` | Kênh sự kiện SSE có xác thực | [MessagingController](../BE/src/main/java/com/troday/api/controller/MessagingController.java) |

### Hẹn xem & quyết định thuê — 10 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-091 | `GET /viewing-proposals` | Danh sách đề nghị đúng các bên | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-092 | `POST /viewing-proposals` | Người thuê gửi đề nghị lịch xem | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-093 | `POST /viewing-proposals/{proposalId}/decision` | Chủ trọ chấp nhận/từ chối đề nghị | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-094 | `POST /viewing-proposals/{proposalId}/withdraw` | Rút đề nghị của mình | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-095 | `GET /viewings` | Danh sách lịch đã chốt | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-096 | `GET /viewings/{viewingId}` | Chi tiết lịch xem | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-097 | `POST /viewings` | Chủ trọ tự chốt lịch sau trao đổi | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-098 | `POST /viewings/{viewingId}/attendance` | Chủ trọ ghi nhận đã xem hoặc không đến | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-099 | `POST /viewings/{viewingId}/cancel` | Hai bên hủy lịch đang hẹn | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |
| API-100 | `POST /viewings/{viewingId}/rental-decision` | Người thuê quyết định sau khi xem | [ViewingController](../BE/src/main/java/com/troday/api/controller/ViewingController.java) |

### Hợp đồng & vào ở — 13 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-101 | `GET /contracts` | Danh sách hợp đồng được quyền xem | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-102 | `GET /contracts/{contractId}` | Chi tiết hợp đồng và quyền thao tác | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-103 | `POST /contracts` | Gửi hợp đồng thuê mới và giữ phòng | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-104 | `GET /viewings/{viewingId}/contract-impact` | Dự kiến lịch/đề nghị bị đóng khi gửi hợp đồng | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-105 | `GET /contracts/{contractId}/revisions` | Lịch sử phiên bản hợp đồng | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-106 | `POST /contracts/{contractId}/revision-requests` | Đại diện yêu cầu sửa bản đang chờ | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-107 | `PATCH /contracts/{contractId}/revisions/{revisionId}` | Chủ trọ chỉnh bản nháp hợp đồng | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-108 | `POST /contracts/{contractId}/revisions/{revisionId}/submit` | Gửi lại phiên bản nháp | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-109 | `POST /contracts/{contractId}/confirm` | Đại diện xác nhận phiên bản hiện hành | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-110 | `POST /contracts/{contractId}/move-ins` | Xác nhận vào ở theo nhóm/từng người | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-111 | `POST /contracts/{contractId}/cancel` | Hủy hợp đồng trước vào ở | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-112 | `POST /contracts/{contractId}/members/{memberId}/cancel` | Hủy thành viên dự kiến chưa đến | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |
| API-113 | `POST /contract-imports` | Nhập hợp đồng giấy có chứng cứ | [ContractController](../BE/src/main/java/com/troday/api/controller/ContractController.java) |

### Người ở & đại diện — 15 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-114 | `GET /residents` | Danh sách và lịch sử người ở quản lý | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-115 | `GET /contracts/{contractId}/members` | Thành viên của hợp đồng | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-116 | `GET /residents/export` | Xuất danh sách cư dân đang ở | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-117 | `GET /occupant-join-requests` | Yêu cầu thêm người trong phạm vi được xem | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-118 | `POST /occupant-join-requests` | Đại diện đề nghị thêm người | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-119 | `POST /occupant-join-requests/{requestId}/consents` | Ghi đồng ý riêng của đại diện hoặc người xin vào | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-120 | `POST /occupant-join-requests/{requestId}/cancel` | Rút yêu cầu chưa được duyệt | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-121 | `POST /occupant-join-requests/{requestId}/approve` | Chủ trọ duyệt và giữ một chỗ 48 giờ | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-122 | `POST /occupant-join-requests/{requestId}/reject` | Chủ trọ từ chối thêm người | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-123 | `POST /occupant-join-requests/{requestId}/cancel-hold` | Chủ trọ hủy giữ chỗ đã duyệt | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-124 | `POST /occupant-join-requests/{requestId}/complete` | Hoàn tất vào ở từ giữ chỗ | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-125 | `POST /contracts/{contractId}/members/{memberId}/move-out` | Ghi nhận thành viên thực tế rời | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-126 | `GET /contracts/{contractId}/representative-candidates` | Người đủ điều kiện nhận đại diện | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-127 | `GET /contracts/{contractId}/representative-history` | Lịch sử đại diện theo giai đoạn | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |
| API-128 | `POST /contracts/{contractId}/representative-handovers` | Bàn giao và ghi người cũ rời | [ResidentController](../BE/src/main/java/com/troday/api/controller/ResidentController.java) |

### Gia hạn, đổi phòng, kết thúc — 8 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-129 | `GET /contracts/{contractId}/change-requests` | Lịch sử yêu cầu điều chỉnh hợp đồng | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-130 | `POST /contracts/{contractId}/change-requests` | Gửi yêu cầu gia hạn/đổi phòng/chấm dứt | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-131 | `GET /contract-change-requests/{requestId}` | Đọc phương án điều chỉnh | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-132 | `POST /contract-change-requests/{requestId}/decision` | Chủ trọ duyệt/từ chối phương án | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-133 | `POST /contract-change-requests/{requestId}/confirm` | Đại diện xác nhận đúng phương án | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-134 | `POST /contract-change-requests/{requestId}/cancel` | Hủy yêu cầu điều chỉnh còn mở | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-135 | `POST /contract-change-requests/{requestId}/apply` | Áp dụng yêu cầu đã đủ xác nhận | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |
| API-136 | `GET /contracts/{contractId}/transfer-options` | Phòng đích có thể chuyển toàn bộ nhóm | [ContractChangeController](../BE/src/main/java/com/troday/api/controller/ContractChangeController.java) |

### Dịch vụ & hóa đơn — 16 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-137 | `GET /rental-services` | Danh mục dịch vụ cho cấu hình | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-138 | `POST /admin/rental-services` | Quản trị bổ sung danh mục dịch vụ | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-139 | `PATCH /admin/rental-services/{serviceId}` | Sửa nội dung mẫu dịch vụ | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-140 | `GET /houses/{houseId}/services` | Cấu hình dịch vụ của nhà | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-141 | `POST /houses/{houseId}/services` | Thêm dịch vụ vào nhà | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-142 | `PATCH /houses/{houseId}/services/{houseServiceId}` | Sửa/bật/ngừng dịch vụ nhà | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-143 | `PUT /rooms/{roomId}/service-settings/{houseServiceId}` | Gán hoặc đổi giá dịch vụ tại phòng | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-144 | `GET /rooms/{roomId}/service-settings` | Cấu hình dịch vụ phòng để quản lý | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-145 | `GET /invoices` | Danh sách hóa đơn được xem | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-146 | `GET /invoices/{invoiceId}` | Chi tiết dòng tiền và người trả tại kỳ lập | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-147 | `POST /invoices` | Lập hóa đơn nháp theo kỳ | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-148 | `PATCH /invoices/{invoiceId}` | Sửa toàn bộ nội dung hóa đơn nháp | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-149 | `POST /invoices/{invoiceId}/issue` | Phát hành hóa đơn có dòng tiền | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-150 | `POST /invoices/{invoiceId}/payment-confirmation` | Ghi nhận chủ trọ đã thu đủ | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-151 | `POST /invoices/{invoiceId}/cancel` | Hủy hóa đơn phát hành chưa thu | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |
| API-152 | `POST /invoices/{invoiceId}/replacements` | Lập bản nháp thay hóa đơn đã hủy | [BillingController](../BE/src/main/java/com/troday/api/controller/BillingController.java) |

### Đánh giá & quản trị — 18 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-153 | `GET /rooms/{roomId}/reviews` | Đánh giá phòng được công khai | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-154 | `POST /reviews` | Đánh giá bằng lượt cư trú thực tế | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-155 | `POST /admin/reviews/{reviewId}/moderation` | Ẩn/khôi phục/xóa mềm đánh giá | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-156 | `POST /reports` | Gửi báo cáo hoặc tranh chấp | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-157 | `GET /me/reports` | Báo cáo mình đã gửi và kết luận | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-158 | `GET /admin/reports` | Hàng đợi báo cáo | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-159 | `GET /admin/reports/{reportId}` | Chi tiết báo cáo và bằng chứng | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-160 | `POST /admin/reports/{reportId}/decision` | Điều tra hoặc kết luận báo cáo | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-161 | `GET /admin/users` | Quản lý tài khoản và vai trò | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-162 | `GET /admin/users/{userId}` | Chi tiết trạng thái tài khoản | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-163 | `POST /admin/users/{userId}/lock` | Khóa tài khoản có lý do | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-164 | `POST /admin/users/{userId}/unlock` | Mở khóa tài khoản | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-165 | `GET /contract-templates` | Mẫu hợp đồng theo phiên bản | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-166 | `POST /admin/contract-templates` | Tạo mẫu hoặc phiên bản tiếp theo | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-167 | `PATCH /admin/contract-templates/{templateId}` | Bật/ngừng phiên bản mẫu | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-168 | `GET /admin/moderation-actions` | Tra nhật ký quyết định | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-169 | `GET /admin/moderation-actions/{actionId}` | Chi tiết quyết định trước/sau | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |
| API-176 | `GET /admin/dashboard` | Tổng quan hàng đợi quản trị | [AdminController](../BE/src/main/java/com/troday/api/controller/AdminController.java) |

### Dữ liệu & tích hợp — 5 API

| ID | Method và đường dẫn | Chức năng | Controller |
| --- | --- | --- | --- |
| API-170 | `POST /files/upload-sessions` | Xin phiên upload theo mục đích | [IntegrationController](../BE/src/main/java/com/troday/api/controller/IntegrationController.java) |
| API-171 | `POST /files/{fileId}/complete` | Xác minh tệp upload hoàn tất | [IntegrationController](../BE/src/main/java/com/troday/api/controller/IntegrationController.java) |
| API-172 | `GET /files/{fileId}` | Metadata tệp được phép xem | [IntegrationController](../BE/src/main/java/com/troday/api/controller/IntegrationController.java) |
| API-173 | `POST /files/{fileId}/download-links` | Cấp URL đọc riêng tư có hạn | [IntegrationController](../BE/src/main/java/com/troday/api/controller/IntegrationController.java) |
| API-174 | `DELETE /files/{fileId}` | Xóa mềm tệp chưa bị giữ làm chứng cứ | [IntegrationController](../BE/src/main/java/com/troday/api/controller/IntegrationController.java) |
