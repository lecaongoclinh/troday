# Đối chiếu API BE – FE ngày 12/11/2026

> Báo cáo này ghi nhận trạng thái **trước khi ghép nối**. FE hiện đã được điều chỉnh theo BE; xem [hướng dẫn và trạng thái kết nối hiện tại](API-CONNECTION.md). Các lỗi nghiệp vụ BE nêu dưới đây chỉ được sửa khi có thay đổi BE riêng.

**Kết luận: route đã khớp, nhưng chưa đủ điều kiện ghép nối toàn bộ.** Web còn là giao diện demo. Mobile đã có API client nhưng hợp đồng dữ liệu hiện khác BE, kể cả đăng nhập và các API đọc dữ liệu.

Phạm vi: mã nguồn `BE`, `FE_Web`, `FE_Mobile` trong workspace; đối chiếu toàn bộ route và kiểm tra sâu các hợp đồng dùng chung, tài khoản, nhà/phòng, tin đăng, lịch xem, hợp đồng, hóa đơn và tệp. Chưa chạy giao dịch HTTP với MySQL thật, chưa xác nhận mọi trường của mọi DTO bằng kiểm thử tích hợp. Đây không phải xác nhận 176 API đã hoạt động đúng nghiệp vụ.

## 1. Những phần đã khớp

| Nội dung | Kết quả |
| --- | --- |
| Base path | Cùng `/api/v1`; BE mặc định cổng `8081` |
| Mobile method + route so với controller BE | **176/176 khớp** sau khi chuẩn hóa tên placeholder |
| Route thiếu/thừa/trùng | 0/0/0 |
| Đăng nhập | Cùng gửi `identifier`, `password`; token truy cập dùng `Authorization: Bearer ...` |
| Các thao tác nghiệp vụ | Đã có controller và service theo nhóm chức năng; vẫn có nhánh chưa thực hiện đủ nghiệp vụ |

7 khác biệt `{id}` so với `{verificationId}`/`{sessionId}` ở API-008, 011, 013, 014, 016, 017, 021 **không làm sai URL thực tế** và không phải lỗi chặn ghép nối.

Nguồn đối chiếu route: catalogue Mobile cũ, nay chuyển sang [contract dùng chung](../shared/api/contract.json), và [controllers BE](../BE/src/main/java/com/troday/api/controller). [Danh mục Markdown BE](../BE/Troday-176-API-va-JSON.md) cũng là đặc tả; cần lấy controller/service làm bằng chứng triển khai.

## 2. Các điểm chặn dùng chung

| Mức | Vấn đề | FE mong đợi | BE hiện tại và tác động |
| --- | --- | --- | --- |
| P0 | Response thành công | `{data, meta:{requestId,timestamp}, error:null}` | `ApiResponseDto` trả `{success,api,method,data,timestamp}`. Mobile ném `CONTRACT_MISMATCH` ngay cả khi HTTP 200 |
| P0 | ID | Chuỗi, kể cả `user.id` lúc đăng nhập | DTO/map BE trả nhiều `Long` dưới dạng số JSON. Sau khi sửa envelope, đăng nhập vẫn bị từ chối vì `user.id` không phải string; chọn tài nguyên cũng bị ảnh hưởng |
| P0 | Phân trang | 43 endpoint yêu cầu `meta.pagination:{page,pageSize,total,totalPages}`, page bắt đầu từ 1 | Không thấy cơ chế phân trang/metadata tương ứng trong BE; các hàm thường trả toàn bộ danh sách. Chỉ bổ sung envelope chưa đủ |
| P0 cho trình duyệt | CORS | Web cổng 5173 hoặc bản web Mobile gọi BE 8081 | Không có cấu hình CORS trong nguồn BE; Vite Web chưa có proxy. Gọi khác origin bằng JSON/Authorization sẽ cần preflight được cho phép. Native không chịu CORS trình duyệt |
| P1 | ETag/phiên bản | 6 API yêu cầu `If-Match`; FE phải đọc ETag trước khi sửa | BE không phát ETag/không kiểm tra `If-Match`. FE chặn bằng `MISSING_VERSION`: API-032, 044, 052, 054, 063, 148. Tạo hồ sơ ở ghép còn dùng `If-None-Match: *` |
| P1 | Idempotency | 83 endpoint khai báo `Idempotency-Key` | Không thấy BE đọc/xử lý header này. Chat và đề nghị xem có khóa riêng trong body, nhưng không thay thế cơ chế dùng chung. Retry sau mất mạng có thể lặp thao tác |
| P1 | Refresh token | Đặc tả mô tả cookie HttpOnly; Mobile chủ động khóa API-018, gửi `credentials: omit` | BE trả refresh token trong JSON lúc login và đọc header `Refresh-Token`; Mobile không lưu/gửi giá trị này. `loginForUser` sau refresh còn không tạo refresh token kế tiếp |
| P1 | Vai trò tài khoản | Mobile mở chức năng từ `user.roles` | `userData` chỉ dùng `users.role`; duyệt hồ sơ landlord chỉ đổi trạng thái hồ sơ, chưa cấp bản ghi landlord/cập nhật roles. Có thể được duyệt nhưng không mở được chức năng chủ trọ |
| P1 | Response lỗi | `error.code`, `error.details[]`, `meta.requestId` | Không có exception handler chung để trả cấu trúc này; FE sẽ mất mã lỗi nghiệp vụ, lỗi từng trường và requestId |
| P2 | HTTP status thành công | 35 endpoint quy định 201 hoặc 202 | Controller trả DTO trực tiếp, không đặt status tương ứng nên mặc định 200. Mobile hiện chấp nhận `response.ok`, vì vậy riêng lệch này chưa chặn UI |
| P1 | Kiểu tiền/thời gian | Tiền là chuỗi decimal; datetime có offset và đúng thời điểm | Một số map trả `BigDecimal` trực tiếp thành JSON number; nhiều response dùng `LocalDateTime` không offset. `ViewingService.parseTime` bỏ offset bằng `toLocalDateTime()`, có thể làm lệch thời điểm nếu FE gửi offset khác +07:00 |

Bằng chứng chính:

- [ApiResponseDto.java](../BE/src/main/java/com/troday/api/dto/ApiResponseDto.java), dòng 5; [client.ts](../FE_Mobile/src/api/client.ts), dòng 268–306; [AppContext Mobile](../FE_Mobile/src/contexts/AppContext.tsx), dòng 68–84.
- [AccountService.java](../BE/src/main/java/com/troday/api/service/AccountService.java), dòng 76–78, 116–121; [workflows.ts](../FE_Mobile/src/services/workflows.ts), dòng 25.
- [application.yml](../BE/src/main/resources/application.yml); [vite.config.js](../FE_Web/vite.config.js); [ViewingService.java](../BE/src/main/java/com/troday/api/service/ViewingService.java), dòng 21.

## 3. Sai khác cụ thể theo luồng

Các lỗi dưới đây vẫn cần sửa sau khi đã thống nhất envelope/ID/phân trang.

| API / luồng | Sai khác và hệ quả | Nơi kiểm tra |
| --- | --- | --- |
| API-092: gửi đề nghị xem | FE gửi `conversationId,roomId,startsAt,durationMinutes,notes`; BE bắt buộc thêm `clientRequestKey`, không có trong inputFields. Request theo FE hiện tại bị 400 | `ViewingService.createProposal`, dòng 7; contract API-092 |
| API-147: tạo hóa đơn | FE không gửi `payerRoomTenantId`; BE bắt buộc trường này. Cần BE suy ra payer từ hợp đồng hoặc bổ sung contract và form | `BillingService.createInvoice`, dòng 28 |
| API-147/148: tính dòng hóa đơn | FE cho phép RENT/SERVICE để BE lấy giá từ hợp đồng/dịch vụ; BE lấy `unitPrice` từ body, mặc định 0 và quantity mặc định 1. Payload hợp lệ theo FE có thể thành dòng tiền 0 | `BillingService.replaceItems`, dòng 34; `validation.ts`, phần `InvoiceInputItem` |
| API-148: PATCH hóa đơn | FE cho phép chỉ đổi `dueDate`; BE luôn gọi `replaceItems`, xóa dòng cũ trước khi kiểm tra body có `items` hay không. Có nguy cơ mất toàn bộ dòng hóa đơn | `BillingService.updateInvoice`, dòng 29; `replaceItems`, dòng 34 |
| API-143: cấu hình dịch vụ phòng lần đầu | BE tạo `RoomServiceSetting` nhưng không gọi `roomServices.save`; tạo mới chưa có id, rồi đưa id null vào `Map.of`. Có thể lỗi 500 và không lưu cấu hình | `BillingService.roomSet`, dòng 24; `roomServiceData`, dòng 39 |
| API-023: xác nhận điện thoại | FE chỉ gửi selector/code. BE lấy `r.phoneNumber()` từ body để cập nhật, thay vì lấy targetValue đã lưu trong token; trường này sẽ null với payload FE | `AccountService.confirmPhone`, dòng 83 |
| API-024–026: quên mật khẩu | API-024 không trả `{accepted:true}` theo đặc tả; API-025 không trả `resetGrant` nên FE không chuyển bước tự động. Token grant được tạo với selector/raw khác nhau nhưng API-026 lại truyền cùng resetGrant cho cả hai tham số kiểm tra. Chưa thấy adapter gửi mã cho người dùng | `AccountService`, dòng 84–86, 114–115; `OperationScreen.tsx`, xử lý API-025 |
| API-170/173: URL tệp | BE trả URL tương đối `/api/v1/files/{id}/content`; FE chỉ nhận URL HTTP(S) tuyệt đối. Upload còn yêu cầu fileId string nhưng BE trả số | `IntegrationService`, dòng 20, 23; `UploadScreen.tsx`, dòng 119; `client.safeHttpUrl` |
| Nội dung upload/download | Không có GET/PUT `/files/{fileId}/content` trong controller, dù URL được trả cho FE. `complete` chỉ đổi STAGED thành ACTIVE, chưa kiểm chứng bytes upload | `IntegrationController.java`; `IntegrationService.complete`, dòng 21 |
| API-116: xuất cư dân | FE yêu cầu `text/csv` và tải tệp; BE trả JSON danh sách cư dân qua `ApiResponseDto` | `ResidentService.export`, dòng 8; `features/files/transfers.ts` |
| API-004/034/044 | BE chưa xử lý một số trường FE gửi: avatarFileId; documents minh chứng quyền nhà; code/allowAdditionalOccupants/notes của PATCH phòng. Có thể báo thành công dù dữ liệu không được lưu | `AccountService.updateProfile`; `HouseService.submitVerification`, `roomUpdate`, `applyRoom` |
| API-051/052/057/058 | BE chưa xử lý `imageFileIds`; response `postData` thiếu images/landlordSummary được mô tả trong contract. Tin tạo được nhưng ảnh và thông tin chủ trọ chưa đủ cho giao diện | `PostService.apply`, dòng 131; `postData`, dòng 114 |
| API-103: thành viên hợp đồng | FE gửi `extraMembers`; BE hiện chỉ tạo đại diện từ viewing, không xử lý mảng người ở thêm | `ContractService.create`, dòng 8 |
| API-113: hợp đồng giấy | FE khóa thao tác này chờ chốt contract. BE mới tạo hợp đồng DRAFT, chưa xử lý đầy đủ danh sách members/revision như luồng mô tả | `workflows.blockedOperations`; `ContractService.importPaper`, dòng 18 |
| API-048/049/083 | Danh sách cư dân phòng, dịch vụ phòng và timeline lịch xem của hội thoại đang trả rỗng cố định | `HouseService.roomResidents/roomServices`, dòng 49–50; `MessagingService.viewingTimeline`, dòng 15 |
| API-080: chat ảnh | FE gửi `fileIds` cho IMAGE; BE chưa gắn fileIds khi lưu message | `MessagingService.sendMessage`, dòng 12 |
| API-090: sự kiện | Mobile đang khóa SSE và dùng tải lại định kỳ; BE chỉ gửi sự kiện connected rồi đóng stream, chưa phát cập nhật liên tục | `workflows.blockedOperations`; `MessagingService.events`, dòng 22 |
| API-175: dashboard chủ trọ | BE trả houseCount/roomCount/availableRoomCount/houses, còn thiếu nhiều thống kê hóa đơn, hợp đồng, lịch xem như contract | `HouseService.dashboard`, dòng 51 |

Các API bị khóa rõ ràng trên Mobile: **API-018, API-067, API-090, API-113**. Có endpoint phía BE không đồng nghĩa người dùng Mobile thực hiện được thao tác tương ứng.

## 4. Trạng thái FE Web

Web **chưa có lớp tích hợp API**: không thấy fetch/axios hay cấu hình base URL trong `src`. [AppContext.jsx](../FE_Web/src/context/AppContext.jsx) nạp `seed.json`, sửa dữ liệu bằng mutate/upsert/patch và lưu localStorage. Tài khoản lấy từ ROLE_USER theo vai trò demo; [Auth.jsx](../FE_Web/src/pages/Auth.jsx) chỉ kiểm tra form rồi chuyển màn hình, chưa gửi thông tin lên server.

Do đó, với Web chưa có request/response thực tế để kết luận khớp BE. Cần xây API client, trạng thái đăng nhập thật, ánh xạ dữ liệu cho từng trang và thay các thao tác local bằng API. Việc chỉ thay base URL không thực hiện được ghép nối.

## 5. Kiểm tra đã chạy và giới hạn

| Kiểm tra | Kết quả |
| --- | --- |
| `node scripts/audit-api-contract.cjs` | Thành công: 176 route khớp; xác nhận client hiện tại từ chối mẫu envelope BE, từ chối thiếu phân trang và URL tệp tương đối; chấp nhận envelope đối chứng đúng đặc tả |
| `cd FE_Mobile; npm.cmd test` | **37/37 pass**. Test dùng transport giả lập theo contract, không gọi BE thật |
| Maven 3.9.14 có sẵn trong cache: `mvn.cmd -o test` tại BE | **BUILD SUCCESS**, biên dịch 117 file Java; **không có test BE để chạy** |
| `cd FE_Web; npm.cmd run build` | Chưa chạy được build: thiếu dependency cài đặt, không tìm thấy vite |
| `cd FE_Mobile; npm.cmd run typecheck` | Chưa chạy được typecheck: thiếu dependency cài đặt, không tìm thấy tsc |
| HTTP + DB thật | Chưa chạy; không thấy service listen trên 8081/3306 tại thời điểm kiểm tra |

Script audit dùng Node 24+, không sửa DB, không gửi request mạng. Mẫu response trong script được dựng từ mã DTO BE để tái hiện hành vi client; **không phải response thu từ server đang chạy**. Exit code 0 chỉ có nghĩa audit thực thi và đối chiếu route thành công, không phải đã sẵn sàng tích hợp.

Chạy lại từ gốc repo:

```powershell
node scripts/audit-api-contract.cjs
# Xuất đủ ánh xạ từng endpoint sang controller/dòng nguồn:
node scripts/audit-api-contract.cjs --json
```

## 6. Thứ tự xử lý để ghép nối

1. Thống nhất contract chung giữa hai FE và BE: envelope/lỗi, string ID, decimal, datetime, phân trang. Ưu tiên hiện thực contract đã có phía Mobile, bổ sung schema response chính xác và một nguồn hợp đồng dùng chung.
2. Hoàn thiện auth và kết nối: CORS cho origin dev, login/me/logout, vai trò thực, cơ chế refresh riêng cho Web/Native đã chốt. Sau đó mới ghép màn hình đăng nhập.
3. Hoàn thiện ETag và Idempotency-Key theo contract; không tự tạo ETag giả hoặc bỏ cơ chế bảo vệ ở FE để làm luồng chạy qua.
4. Ghép lát cắt đầu tiên: đăng nhập → me → danh sách tin → chi tiết tin → yêu thích. Sau đó ghép nhà/phòng, upload và đặt lịch; sửa các payload lỗi ở bảng trên trước khi mở luồng.
5. Ghép hợp đồng/người ở/hóa đơn sau khi sửa tính tiền, PATCH xóa items và lưu dịch vụ phòng. Hoàn thiện CSV, ảnh/chat và thống kê theo từng đợt.
6. Kiểm thử trên DB riêng với ít nhất tenant, landlord và admin: đúng/sai quyền, phân trang, stale ETag, retry cùng key, upload bytes, xác nhận điện thoại/reset mật khẩu và trọn luồng lịch xem → hợp đồng → vào ở → hóa đơn.

Trong lần kiểm tra này chỉ bổ sung báo cáo và script audit; chưa thay đổi logic BE/FE.
