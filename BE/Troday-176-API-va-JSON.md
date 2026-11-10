# Trọday | 176 API và JSON mẫu

Nguồn: danh mục API của repo tại commit `347c845`. Base path: `/api/v1`. Đây là đặc tả triển khai. Các ví dụ response được giữ nguyên từ repo và có thể chỉ minh họa một phần cấu trúc trả về. Dùng dòng **Dữ liệu trả về** để đối chiếu khi ví dụ thiếu trường.

## Danh mục theo Epic

### 01. Tài khoản & xác minh (28 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-001](#api-001) | POST | `/api/v1/auth/register` | Đăng ký tài khoản người thuê |
| [API-002](#api-002) | POST | `/api/v1/auth/login` | Đăng nhập và mở phiên |
| [API-003](#api-003) | GET | `/api/v1/me` | Đọc tài khoản và các vai trò thực |
| [API-004](#api-004) | PATCH | `/api/v1/me/profile` | Cập nhật hồ sơ cá nhân |
| [API-005](#api-005) | PATCH | `/api/v1/me/notification-settings` | Cấu hình kênh thông báo |
| [API-006](#api-006) | POST | `/api/v1/me/identity-verifications` | Nộp xác minh danh tính người thuê |
| [API-007](#api-007) | GET | `/api/v1/me/identity-verifications` | Lịch sử xác minh của mình |
| [API-008](#api-008) | POST | `/api/v1/me/identity-verifications/{verificationId}/withdraw` | Rút hồ sơ danh tính đang chờ |
| [API-009](#api-009) | POST | `/api/v1/me/landlord-verifications` | Xin cấp vai trò chủ trọ |
| [API-010](#api-010) | GET | `/api/v1/me/landlord-verifications` | Lịch sử hồ sơ xin làm chủ trọ |
| [API-011](#api-011) | POST | `/api/v1/me/landlord-verifications/{verificationId}/withdraw` | Rút hồ sơ chủ trọ đang chờ |
| [API-012](#api-012) | GET | `/api/v1/admin/identity-verifications` | Danh sách hồ sơ identity |
| [API-013](#api-013) | GET | `/api/v1/admin/identity-verifications/{verificationId}` | Chi tiết hồ sơ identity |
| [API-014](#api-014) | POST | `/api/v1/admin/identity-verifications/{verificationId}/decision` | Duyệt hoặc từ chối hồ sơ identity |
| [API-015](#api-015) | GET | `/api/v1/admin/landlord-verifications` | Danh sách hồ sơ landlord |
| [API-016](#api-016) | GET | `/api/v1/admin/landlord-verifications/{verificationId}` | Chi tiết hồ sơ landlord |
| [API-017](#api-017) | POST | `/api/v1/admin/landlord-verifications/{verificationId}/decision` | Duyệt hoặc từ chối hồ sơ landlord |
| [API-018](#api-018) | POST | `/api/v1/auth/refresh` | Luân chuyển refresh token |
| [API-019](#api-019) | POST | `/api/v1/auth/logout` | Đăng xuất phiên hiện tại |
| [API-020](#api-020) | GET | `/api/v1/me/sessions` | Danh sách phiên của mình |
| [API-021](#api-021) | DELETE | `/api/v1/me/sessions/{sessionId}` | Thu hồi một phiên |
| [API-022](#api-022) | POST | `/api/v1/auth/phone-verifications` | Gửi OTP xác minh điện thoại |
| [API-023](#api-023) | POST | `/api/v1/auth/phone-verifications/confirm` | Xác nhận OTP điện thoại |
| [API-024](#api-024) | POST | `/api/v1/auth/password-resets` | Yêu cầu đặt lại mật khẩu |
| [API-025](#api-025) | POST | `/api/v1/auth/password-resets/verify` | Đổi OTP hợp lệ lấy quyền reset ngắn hạn |
| [API-026](#api-026) | POST | `/api/v1/auth/password-resets/complete` | Đặt mật khẩu mới |
| [API-027](#api-027) | POST | `/api/v1/contracts/{contractId}/members/{memberId}/account-invitations` | Mời cư dân chưa có tài khoản liên kết |
| [API-028](#api-028) | POST | `/api/v1/me/residency-links` | Nhận liên kết tài khoản với lượt cư trú |

### 02. Nhà, quyền cho thuê & phòng (22 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-029](#api-029) | GET | `/api/v1/houses` | Danh sách nhà thuộc chủ trọ |
| [API-030](#api-030) | POST | `/api/v1/houses` | Tạo nhà nháp |
| [API-031](#api-031) | GET | `/api/v1/houses/{houseId}` | Chi tiết nhà quản lý |
| [API-032](#api-032) | PATCH | `/api/v1/houses/{houseId}` | Sửa nhà và kiểm tra phiên bản |
| [API-033](#api-033) | GET | `/api/v1/houses/{houseId}/verifications` | Lịch sử quyền cho thuê từng nhà |
| [API-034](#api-034) | POST | `/api/v1/houses/{houseId}/verifications` | Nộp minh chứng quyền cho thuê |
| [API-035](#api-035) | GET | `/api/v1/houses/{houseId}/verifications/{verificationId}` | Chi tiết hồ sơ quyền nhà của mình |
| [API-036](#api-036) | POST | `/api/v1/houses/{houseId}/verifications/{verificationId}/withdraw` | Rút hồ sơ quyền nhà đang chờ |
| [API-037](#api-037) | GET | `/api/v1/admin/house-verifications` | Hàng đợi xác minh quyền nhà |
| [API-038](#api-038) | GET | `/api/v1/admin/house-verifications/{verificationId}` | Chi tiết và minh chứng để đối chiếu |
| [API-039](#api-039) | POST | `/api/v1/admin/house-verifications/{verificationId}/decision` | Duyệt/từ chối quyền cho thuê |
| [API-040](#api-040) | POST | `/api/v1/admin/house-verifications/{verificationId}/revoke` | Thu hồi quyền đã duyệt |
| [API-041](#api-041) | GET | `/api/v1/houses/{houseId}/rental-right` | Đọc quyền hiệu lực hiện tại |
| [API-042](#api-042) | GET | `/api/v1/houses/{houseId}/rooms` | Danh sách phòng của nhà |
| [API-043](#api-043) | POST | `/api/v1/houses/{houseId}/rooms` | Thêm phòng trong nhà |
| [API-044](#api-044) | PATCH | `/api/v1/rooms/{roomId}` | Sửa thông tin vật lý và giá phòng |
| [API-045](#api-045) | PUT | `/api/v1/rooms/{roomId}/capacity` | Đổi sức chứa có khóa phòng |
| [API-046](#api-046) | GET | `/api/v1/rooms/{roomId}` | Chi tiết phòng theo quyền người xem |
| [API-047](#api-047) | GET | `/api/v1/rooms/{roomId}/posts` | Bài đăng của một phòng |
| [API-048](#api-048) | GET | `/api/v1/rooms/{roomId}/residents` | Người đang ở trong phòng |
| [API-049](#api-049) | GET | `/api/v1/rooms/{roomId}/services` | Dịch vụ hiệu lực của phòng |
| [API-175](#api-175) | GET | `/api/v1/landlord/dashboard` | Tổng quan quản lý nhà trọ |

### 03. Tin đăng & tìm phòng (12 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-050](#api-050) | GET | `/api/v1/landlord/posts` | Danh sách tin chủ trọ quản lý |
| [API-051](#api-051) | POST | `/api/v1/posts` | Tạo bài mới và gửi duyệt |
| [API-052](#api-052) | PATCH | `/api/v1/posts/{postId}` | Sửa đúng bài và gửi duyệt lại |
| [API-053](#api-053) | GET | `/api/v1/admin/posts` | Hàng đợi kiểm duyệt tin |
| [API-054](#api-054) | POST | `/api/v1/admin/posts/{postId}/decision` | Duyệt hoặc từ chối đúng bài |
| [API-055](#api-055) | POST | `/api/v1/posts/{postId}/hide` | Ẩn tin đang công khai |
| [API-056](#api-056) | POST | `/api/v1/admin/posts/{postId}/restore` | Hiện lại tin đã ẩn |
| [API-057](#api-057) | GET | `/api/v1/posts` | Khám phá và lọc tin công khai |
| [API-058](#api-058) | GET | `/api/v1/posts/{postId}` | Chi tiết đúng tin công khai |
| [API-059](#api-059) | GET | `/api/v1/me/favorites` | Danh sách bài đã lưu |
| [API-060](#api-060) | PUT | `/api/v1/me/favorites/{postId}` | Lưu bài theo ID |
| [API-061](#api-061) | DELETE | `/api/v1/me/favorites/{postId}` | Bỏ lưu bài |

### 04. Hồ sơ & kết nối ở ghép (14 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-062](#api-062) | GET | `/api/v1/me/roommate-profile` | Đọc hồ sơ ở ghép của mình |
| [API-063](#api-063) | PUT | `/api/v1/me/roommate-profile` | Tạo hoặc thay thế hồ sơ ở ghép |
| [API-064](#api-064) | GET | `/api/v1/roommate-profiles/{profileId}` | Xem hồ sơ ứng viên theo quyền |
| [API-065](#api-065) | GET | `/api/v1/lifestyle-criteria` | Danh mục tiêu chí đang áp dụng |
| [API-066](#api-066) | GET | `/api/v1/me/roommate-profile/lifestyles` | Đọc đặc điểm và mong muốn đã lưu |
| [API-067](#api-067) | PUT | `/api/v1/me/roommate-profile/lifestyles` | Thay bộ tiêu chí của hồ sơ |
| [API-068](#api-068) | GET | `/api/v1/roommate-matches` | Danh sách người phù hợp |
| [API-069](#api-069) | POST | `/api/v1/admin/lifestyle-criteria` | Tạo tiêu chí ghép linh động |
| [API-070](#api-070) | PATCH | `/api/v1/admin/lifestyle-criteria/{criterionId}` | Sửa/ngừng tiêu chí |
| [API-071](#api-071) | GET | `/api/v1/roommate-requests` | Lời mời đến/đã gửi và bộ đếm |
| [API-072](#api-072) | POST | `/api/v1/roommate-requests` | Gửi lời mời kết nối |
| [API-073](#api-073) | POST | `/api/v1/roommate-requests/{requestId}/response` | Người nhận chấp nhận/từ chối kết nối |
| [API-074](#api-074) | POST | `/api/v1/roommate-requests/{requestId}/cancel` | Người gửi hủy lời mời chờ |
| [API-075](#api-075) | POST | `/api/v1/roommate-requests/{requestId}/end` | Kết thúc kết nối đã nhận |

### 05. Tin nhắn & thông báo (15 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-076](#api-076) | POST | `/api/v1/conversations/room-inquiries` | Mở/lấy hội thoại hỏi đúng bài |
| [API-077](#api-077) | GET | `/api/v1/conversations` | Hội thoại của tài khoản |
| [API-078](#api-078) | GET | `/api/v1/conversations/{conversationId}` | Chi tiết hội thoại và thành viên |
| [API-079](#api-079) | GET | `/api/v1/conversations/{conversationId}/messages` | Lịch sử tin và thẻ chia sẻ |
| [API-080](#api-080) | POST | `/api/v1/conversations/{conversationId}/messages` | Gửi tin nhắn chữ/ảnh |
| [API-081](#api-081) | PUT | `/api/v1/conversations/{conversationId}/read-state` | Đánh dấu đã đọc đến tin xác định |
| [API-082](#api-082) | PATCH | `/api/v1/conversations/{conversationId}/preferences` | Ẩn/lưu trữ/tắt thông báo phía mình |
| [API-083](#api-083) | GET | `/api/v1/conversations/{conversationId}/viewing-timeline` | Thẻ lịch và đề nghị trong chat |
| [API-084](#api-084) | POST | `/api/v1/roommate-requests/{requestId}/conversation` | Mở lại đúng chat bạn ghép |
| [API-085](#api-085) | POST | `/api/v1/conversations/{conversationId}/post-shares` | Chia sẻ đúng bài cho bạn ghép |
| [API-086](#api-086) | GET | `/api/v1/me/notifications` | Feed thông báo của mình |
| [API-087](#api-087) | GET | `/api/v1/me/notification-counts` | Bộ đếm chưa đọc |
| [API-088](#api-088) | PUT | `/api/v1/me/notifications/{notificationId}/read-state` | Đánh dấu một thông báo đã đọc |
| [API-089](#api-089) | POST | `/api/v1/me/notifications/read-all` | Đọc tất cả đến mốc xác định |
| [API-090](#api-090) | GET | `/api/v1/events` | Kênh sự kiện SSE có xác thực |

### 06. Hẹn xem & quyết định thuê (10 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-091](#api-091) | GET | `/api/v1/viewing-proposals` | Danh sách đề nghị đúng các bên |
| [API-092](#api-092) | POST | `/api/v1/viewing-proposals` | Người thuê gửi đề nghị lịch xem |
| [API-093](#api-093) | POST | `/api/v1/viewing-proposals/{proposalId}/decision` | Chủ trọ chấp nhận/từ chối đề nghị |
| [API-094](#api-094) | POST | `/api/v1/viewing-proposals/{proposalId}/withdraw` | Rút đề nghị của mình |
| [API-095](#api-095) | GET | `/api/v1/viewings` | Danh sách lịch đã chốt |
| [API-096](#api-096) | GET | `/api/v1/viewings/{viewingId}` | Chi tiết lịch xem |
| [API-097](#api-097) | POST | `/api/v1/viewings` | Chủ trọ tự chốt lịch sau trao đổi |
| [API-098](#api-098) | POST | `/api/v1/viewings/{viewingId}/attendance` | Chủ trọ ghi nhận đã xem hoặc không đến |
| [API-099](#api-099) | POST | `/api/v1/viewings/{viewingId}/cancel` | Hai bên hủy lịch đang hẹn |
| [API-100](#api-100) | POST | `/api/v1/viewings/{viewingId}/rental-decision` | Người thuê quyết định sau khi xem |

### 07. Hợp đồng & vào ở (13 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-101](#api-101) | GET | `/api/v1/contracts` | Danh sách hợp đồng được quyền xem |
| [API-102](#api-102) | GET | `/api/v1/contracts/{contractId}` | Chi tiết hợp đồng và quyền thao tác |
| [API-103](#api-103) | POST | `/api/v1/contracts` | Gửi hợp đồng thuê mới và giữ phòng |
| [API-104](#api-104) | GET | `/api/v1/viewings/{viewingId}/contract-impact` | Dự kiến lịch/đề nghị bị đóng khi gửi hợp đồng |
| [API-105](#api-105) | GET | `/api/v1/contracts/{contractId}/revisions` | Lịch sử phiên bản hợp đồng |
| [API-106](#api-106) | POST | `/api/v1/contracts/{contractId}/revision-requests` | Đại diện yêu cầu sửa bản đang chờ |
| [API-107](#api-107) | PATCH | `/api/v1/contracts/{contractId}/revisions/{revisionId}` | Chủ trọ chỉnh bản nháp hợp đồng |
| [API-108](#api-108) | POST | `/api/v1/contracts/{contractId}/revisions/{revisionId}/submit` | Gửi lại phiên bản nháp |
| [API-109](#api-109) | POST | `/api/v1/contracts/{contractId}/confirm` | Đại diện xác nhận phiên bản hiện hành |
| [API-110](#api-110) | POST | `/api/v1/contracts/{contractId}/move-ins` | Xác nhận vào ở theo nhóm/từng người |
| [API-111](#api-111) | POST | `/api/v1/contracts/{contractId}/cancel` | Hủy hợp đồng trước vào ở |
| [API-112](#api-112) | POST | `/api/v1/contracts/{contractId}/members/{memberId}/cancel` | Hủy thành viên dự kiến chưa đến |
| [API-113](#api-113) | POST | `/api/v1/contract-imports` | Nhập hợp đồng giấy có chứng cứ |

### 08. Người ở & đại diện (15 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-114](#api-114) | GET | `/api/v1/residents` | Danh sách và lịch sử người ở quản lý |
| [API-115](#api-115) | GET | `/api/v1/contracts/{contractId}/members` | Thành viên của hợp đồng |
| [API-116](#api-116) | GET | `/api/v1/residents/export` | Xuất danh sách cư dân đang ở |
| [API-117](#api-117) | GET | `/api/v1/occupant-join-requests` | Yêu cầu thêm người trong phạm vi được xem |
| [API-118](#api-118) | POST | `/api/v1/occupant-join-requests` | Đại diện đề nghị thêm người |
| [API-119](#api-119) | POST | `/api/v1/occupant-join-requests/{requestId}/consents` | Ghi đồng ý riêng của đại diện hoặc người xin vào |
| [API-120](#api-120) | POST | `/api/v1/occupant-join-requests/{requestId}/cancel` | Rút yêu cầu chưa được duyệt |
| [API-121](#api-121) | POST | `/api/v1/occupant-join-requests/{requestId}/approve` | Chủ trọ duyệt và giữ một chỗ 48 giờ |
| [API-122](#api-122) | POST | `/api/v1/occupant-join-requests/{requestId}/reject` | Chủ trọ từ chối thêm người |
| [API-123](#api-123) | POST | `/api/v1/occupant-join-requests/{requestId}/cancel-hold` | Chủ trọ hủy giữ chỗ đã duyệt |
| [API-124](#api-124) | POST | `/api/v1/occupant-join-requests/{requestId}/complete` | Hoàn tất vào ở từ giữ chỗ |
| [API-125](#api-125) | POST | `/api/v1/contracts/{contractId}/members/{memberId}/move-out` | Ghi nhận thành viên thực tế rời |
| [API-126](#api-126) | GET | `/api/v1/contracts/{contractId}/representative-candidates` | Người đủ điều kiện nhận đại diện |
| [API-127](#api-127) | GET | `/api/v1/contracts/{contractId}/representative-history` | Lịch sử đại diện theo giai đoạn |
| [API-128](#api-128) | POST | `/api/v1/contracts/{contractId}/representative-handovers` | Bàn giao và ghi người cũ rời |

### 09. Gia hạn, đổi phòng, kết thúc (8 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-129](#api-129) | GET | `/api/v1/contracts/{contractId}/change-requests` | Lịch sử yêu cầu điều chỉnh hợp đồng |
| [API-130](#api-130) | POST | `/api/v1/contracts/{contractId}/change-requests` | Gửi yêu cầu gia hạn/đổi phòng/chấm dứt |
| [API-131](#api-131) | GET | `/api/v1/contract-change-requests/{requestId}` | Đọc phương án điều chỉnh |
| [API-132](#api-132) | POST | `/api/v1/contract-change-requests/{requestId}/decision` | Chủ trọ duyệt/từ chối phương án |
| [API-133](#api-133) | POST | `/api/v1/contract-change-requests/{requestId}/confirm` | Đại diện xác nhận đúng phương án |
| [API-134](#api-134) | POST | `/api/v1/contract-change-requests/{requestId}/cancel` | Hủy yêu cầu điều chỉnh còn mở |
| [API-135](#api-135) | POST | `/api/v1/contract-change-requests/{requestId}/apply` | Áp dụng yêu cầu đã đủ xác nhận |
| [API-136](#api-136) | GET | `/api/v1/contracts/{contractId}/transfer-options` | Phòng đích có thể chuyển toàn bộ nhóm |

### 10. Dịch vụ & hóa đơn (16 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-137](#api-137) | GET | `/api/v1/rental-services` | Danh mục dịch vụ cho cấu hình |
| [API-138](#api-138) | POST | `/api/v1/admin/rental-services` | Quản trị bổ sung danh mục dịch vụ |
| [API-139](#api-139) | PATCH | `/api/v1/admin/rental-services/{serviceId}` | Sửa nội dung mẫu dịch vụ |
| [API-140](#api-140) | GET | `/api/v1/houses/{houseId}/services` | Cấu hình dịch vụ của nhà |
| [API-141](#api-141) | POST | `/api/v1/houses/{houseId}/services` | Thêm dịch vụ vào nhà |
| [API-142](#api-142) | PATCH | `/api/v1/houses/{houseId}/services/{houseServiceId}` | Sửa/bật/ngừng dịch vụ nhà |
| [API-143](#api-143) | PUT | `/api/v1/rooms/{roomId}/service-settings/{houseServiceId}` | Gán hoặc đổi giá dịch vụ tại phòng |
| [API-144](#api-144) | GET | `/api/v1/rooms/{roomId}/service-settings` | Cấu hình dịch vụ phòng để quản lý |
| [API-145](#api-145) | GET | `/api/v1/invoices` | Danh sách hóa đơn được xem |
| [API-146](#api-146) | GET | `/api/v1/invoices/{invoiceId}` | Chi tiết dòng tiền và người trả tại kỳ lập |
| [API-147](#api-147) | POST | `/api/v1/invoices` | Lập hóa đơn nháp theo kỳ |
| [API-148](#api-148) | PATCH | `/api/v1/invoices/{invoiceId}` | Sửa toàn bộ nội dung hóa đơn nháp |
| [API-149](#api-149) | POST | `/api/v1/invoices/{invoiceId}/issue` | Phát hành hóa đơn có dòng tiền |
| [API-150](#api-150) | POST | `/api/v1/invoices/{invoiceId}/payment-confirmation` | Ghi nhận chủ trọ đã thu đủ |
| [API-151](#api-151) | POST | `/api/v1/invoices/{invoiceId}/cancel` | Hủy hóa đơn phát hành chưa thu |
| [API-152](#api-152) | POST | `/api/v1/invoices/{invoiceId}/replacements` | Lập bản nháp thay hóa đơn đã hủy |

### 11. Đánh giá & quản trị (18 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-153](#api-153) | GET | `/api/v1/rooms/{roomId}/reviews` | Đánh giá phòng được công khai |
| [API-154](#api-154) | POST | `/api/v1/reviews` | Đánh giá bằng lượt cư trú thực tế |
| [API-155](#api-155) | POST | `/api/v1/admin/reviews/{reviewId}/moderation` | Ẩn/khôi phục/xóa mềm đánh giá |
| [API-156](#api-156) | POST | `/api/v1/reports` | Gửi báo cáo hoặc tranh chấp |
| [API-157](#api-157) | GET | `/api/v1/me/reports` | Báo cáo mình đã gửi và kết luận |
| [API-158](#api-158) | GET | `/api/v1/admin/reports` | Hàng đợi báo cáo |
| [API-159](#api-159) | GET | `/api/v1/admin/reports/{reportId}` | Chi tiết báo cáo và bằng chứng |
| [API-160](#api-160) | POST | `/api/v1/admin/reports/{reportId}/decision` | Điều tra hoặc kết luận báo cáo |
| [API-161](#api-161) | GET | `/api/v1/admin/users` | Quản lý tài khoản và vai trò |
| [API-162](#api-162) | GET | `/api/v1/admin/users/{userId}` | Chi tiết trạng thái tài khoản |
| [API-163](#api-163) | POST | `/api/v1/admin/users/{userId}/lock` | Khóa tài khoản có lý do |
| [API-164](#api-164) | POST | `/api/v1/admin/users/{userId}/unlock` | Mở khóa tài khoản |
| [API-165](#api-165) | GET | `/api/v1/contract-templates` | Mẫu hợp đồng theo phiên bản |
| [API-166](#api-166) | POST | `/api/v1/admin/contract-templates` | Tạo mẫu hoặc phiên bản tiếp theo |
| [API-167](#api-167) | PATCH | `/api/v1/admin/contract-templates/{templateId}` | Bật/ngừng phiên bản mẫu |
| [API-168](#api-168) | GET | `/api/v1/admin/moderation-actions` | Tra nhật ký quyết định |
| [API-169](#api-169) | GET | `/api/v1/admin/moderation-actions/{actionId}` | Chi tiết quyết định trước/sau |
| [API-176](#api-176) | GET | `/api/v1/admin/dashboard` | Tổng quan hàng đợi quản trị |

### 12. Dữ liệu & tích hợp (5 API)

| Mã | Method | Endpoint | Chức năng |
|---|---|---|---|
| [API-170](#api-170) | POST | `/api/v1/files/upload-sessions` | Xin phiên upload theo mục đích |
| [API-171](#api-171) | POST | `/api/v1/files/{fileId}/complete` | Xác minh tệp upload hoàn tất |
| [API-172](#api-172) | GET | `/api/v1/files/{fileId}` | Metadata tệp được phép xem |
| [API-173](#api-173) | POST | `/api/v1/files/{fileId}/download-links` | Cấp URL đọc riêng tư có hạn |
| [API-174](#api-174) | DELETE | `/api/v1/files/{fileId}` | Xóa mềm tệp chưa bị giữ làm chứng cứ |

## Chi tiết request và response

### API-001

**POST `/api/v1/auth/register`** · Đăng ký tài khoản người thuê

- **Quyền** — PUBLIC
- **HTTP** — 201
- **Dữ liệu trả về** — User {id,fullName,roles,status}; không trả passwordHash
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONTACT_ALREADY_USED, 422 CONTACT_REQUIRED
- **Headers** — Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "fullName": "Nguyễn Thị Lan",
  "phoneNumber": "0901234567",
  "password": "Example-only-change-me"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-002

**POST `/api/v1/auth/login`** · Đăng nhập và mở phiên

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Session {accessToken,expiresAt,user}; refresh cookie HttpOnly
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONTACT_ALREADY_USED, 422 CONTACT_REQUIRED
- **Headers** — Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "identifier": "0901234567",
  "password": "Example-only-change-me"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-003

**GET `/api/v1/me`** · Đọc tài khoản và các vai trò thực

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — User {id,fullName,email,phoneNumber,roles,status,profile}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-004

**PATCH `/api/v1/me/profile`** · Cập nhật hồ sơ cá nhân

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — PersonalProfile sau cập nhật
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 PROFILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "fullName": "Nguyễn Thị Lan"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-005

**PATCH `/api/v1/me/notification-settings`** · Cấu hình kênh thông báo

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Settings {inAppEnabled,emailEnabled,pushEnabled}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 PROFILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "inAppEnabled": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-006

**POST `/api/v1/me/identity-verifications`** · Nộp xác minh danh tính người thuê

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — IdentityVerification {id,status:PENDING,createdAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_VERIFICATION_EXISTS, 422 FILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "identityNumber": "012345678901",
  "identityFileId": "502"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-007

**GET `/api/v1/me/identity-verifications`** · Lịch sử xác minh của mình

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — IdentityVerification[]; che số giấy tờ, không trả URL kho
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-008

**POST `/api/v1/me/identity-verifications/{verificationId}/withdraw`** · Rút hồ sơ danh tính đang chờ

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — IdentityVerification {id,status:WITHDRAWN}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_VERIFICATION_EXISTS, 422 FILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-009

**POST `/api/v1/me/landlord-verifications`** · Xin cấp vai trò chủ trọ

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 201
- **Dữ liệu trả về** — LandlordVerification {id,status:PENDING}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_VERIFICATION_EXISTS, 422 FILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "identityNumber": "012345678901",
  "identityFileId": "502"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-010

**GET `/api/v1/me/landlord-verifications`** · Lịch sử hồ sơ xin làm chủ trọ

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — LandlordVerification[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-011

**POST `/api/v1/me/landlord-verifications/{verificationId}/withdraw`** · Rút hồ sơ chủ trọ đang chờ

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — LandlordVerification {id,status:WITHDRAWN}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_VERIFICATION_EXISTS, 422 FILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-012

**GET `/api/v1/admin/identity-verifications`** · Danh sách hồ sơ identity

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Verification[]; status,applicant,submittedAt
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-013

**GET `/api/v1/admin/identity-verifications/{verificationId}`** · Chi tiết hồ sơ identity

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Verification và danh sách fileId có quyền mở
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-014

**POST `/api/v1/admin/identity-verifications/{verificationId}/decision`** · Duyệt hoặc từ chối hồ sơ identity

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Verification sau quyết định
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_VERIFICATION_EXISTS, 422 FILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "APPROVE"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-015

**GET `/api/v1/admin/landlord-verifications`** · Danh sách hồ sơ landlord

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Verification[]; status,applicant,submittedAt
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-016

**GET `/api/v1/admin/landlord-verifications/{verificationId}`** · Chi tiết hồ sơ landlord

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Verification và danh sách fileId có quyền mở
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-017

**POST `/api/v1/admin/landlord-verifications/{verificationId}/decision`** · Duyệt hoặc từ chối hồ sơ landlord

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Verification sau quyết định
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_VERIFICATION_EXISTS, 422 FILE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "APPROVE"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-018

**POST `/api/v1/auth/refresh`** · Luân chuyển refresh token

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Session {accessToken,expiresAt}; refresh cookie mới
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-019

**POST `/api/v1/auth/logout`** · Đăng xuất phiên hiện tại

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {revoked:true}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-020

**GET `/api/v1/me/sessions`** · Danh sách phiên của mình

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Session[] {id,createdAt,lastSeenAt,expiresAt,revokedAt,isCurrent}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-021

**DELETE `/api/v1/me/sessions/{sessionId}`** · Thu hồi một phiên

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {id,revoked:true}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-022

**POST `/api/v1/auth/phone-verifications`** · Gửi OTP xác minh điện thoại

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 201
- **Dữ liệu trả về** — {selector,expiresAt,retryAfterSeconds}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "phoneNumber": "0901234567"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-023

**POST `/api/v1/auth/phone-verifications/confirm`** · Xác nhận OTP điện thoại

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {phoneNumber,phoneVerifiedAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "selector": "9cf1501e-e248-4b11-8d19-4b6cb7f923d1",
  "code": "123456"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-024

**POST `/api/v1/auth/password-resets`** · Yêu cầu đặt lại mật khẩu

- **Quyền** — PUBLIC
- **HTTP** — 202
- **Dữ liệu trả về** — {accepted:true}
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "identifier": "0901234567"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-025

**POST `/api/v1/auth/password-resets/verify`** · Đổi OTP hợp lệ lấy quyền reset ngắn hạn

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — {resetGrant,expiresAt}
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "selector": "9cf1501e-e248-4b11-8d19-4b6cb7f923d1",
  "code": "123456"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-026

**POST `/api/v1/auth/password-resets/complete`** · Đặt mật khẩu mới

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — {passwordChanged:true}
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "resetGrant": "grant-example",
  "newPassword": "Another-example-only-password"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-027

**POST `/api/v1/contracts/{contractId}/members/{memberId}/account-invitations`** · Mời cư dân chưa có tài khoản liên kết

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — {selector,expiresAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-028

**POST `/api/v1/me/residency-links`** · Nhận liên kết tài khoản với lượt cư trú

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — Resident {id,tenantId,status}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 TOKEN_INVALID_OR_EXPIRED, 409 TOKEN_ALREADY_CONSUMED, 429 RATE_LIMITED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "selector": "9cf1501e-e248-4b11-8d19-4b6cb7f923d1",
  "token": "example-link-token"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-029

**GET `/api/v1/houses`** · Danh sách nhà thuộc chủ trọ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — House[] và effectiveRentalRight
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-030

**POST `/api/v1/houses`** · Tạo nhà nháp

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — House {id,rowVersion,verificationVersion,effectiveRentalRight:null}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 HOUSE_VERSION_CHANGED, 422 HOUSE_COORDINATES_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "name": "Nhà trọ Bình An",
  "address": "12 Nguyễn Văn Cừ",
  "provinceCode": "79"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-031

**GET `/api/v1/houses/{houseId}`** · Chi tiết nhà quản lý

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — House và quyền hiện hành/lịch sử tóm tắt
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-032

**PATCH `/api/v1/houses/{houseId}`** · Sửa nhà và kiểm tra phiên bản

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — House {rowVersion,verificationVersion,effectiveRentalRight}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 HOUSE_VERSION_CHANGED, 422 HOUSE_COORDINATES_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, If-Match: "<currentVersion>"

**Request**

```json
{
  "name": "Nhà trọ Bình An",
  "address": "12 Nguyễn Văn Cừ",
  "provinceCode": "79"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-033

**GET `/api/v1/houses/{houseId}/verifications`** · Lịch sử quyền cho thuê từng nhà

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification[] và effectiveRentalRight
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-034

**POST `/api/v1/houses/{houseId}/verifications`** · Nộp minh chứng quyền cho thuê

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — HouseVerification {id,status:PENDING,houseVersion}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_HOUSE_VERIFICATION_EXISTS, 422 HOUSE_PROOF_INVALID, 409 HOUSE_IDENTITY_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "rightType": "OWNER",
  "scopeDescription": "Toàn bộ nhà và các phòng",
  "validFrom": "2026-10-29",
  "documents": [
    {
      "fileId": "503",
      "documentType": "OWNER_PROOF"
    }
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-035

**GET `/api/v1/houses/{houseId}/verifications/{verificationId}`** · Chi tiết hồ sơ quyền nhà của mình

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification,houseSnapshot,documents[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-036

**POST `/api/v1/houses/{houseId}/verifications/{verificationId}/withdraw`** · Rút hồ sơ quyền nhà đang chờ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification {id,status:WITHDRAWN}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_HOUSE_VERIFICATION_EXISTS, 422 HOUSE_PROOF_INVALID, 409 HOUSE_IDENTITY_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-037

**GET `/api/v1/admin/house-verifications`** · Hàng đợi xác minh quyền nhà

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-038

**GET `/api/v1/admin/house-verifications/{verificationId}`** · Chi tiết và minh chứng để đối chiếu

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification,houseSnapshot,currentHouse,documents[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-039

**POST `/api/v1/admin/house-verifications/{verificationId}/decision`** · Duyệt/từ chối quyền cho thuê

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification và effectiveRentalRight
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PENDING_HOUSE_VERIFICATION_EXISTS, 422 HOUSE_PROOF_INVALID, 409 HOUSE_IDENTITY_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "APPROVE",
  "evidenceChecked": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-040

**POST `/api/v1/admin/house-verifications/{verificationId}/revoke`** · Thu hồi quyền đã duyệt

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — HouseVerification {id,status:REVOKED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VERIFICATION_STATE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-041

**GET `/api/v1/houses/{houseId}/rental-right`** · Đọc quyền hiệu lực hiện tại

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — {effective,verificationId,validFrom,validUntil,reason,verificationVersion}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-042

**GET `/api/v1/houses/{houseId}/rooms`** · Danh sách phòng của nhà

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Room[] kèm currentLoad,activeCount,pendingPostCount
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-043

**POST `/api/v1/houses/{houseId}/rooms`** · Thêm phòng trong nhà

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Room {id,status,capacity}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ROOM_NUMBER_EXISTS, 422 ROOM_CAPACITY_EXCEEDED, 409 ROOM_STILL_OCCUPIED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "code": "P101",
  "area": "22.00",
  "rentAmount": "3800000.00",
  "depositAmount": "3800000.00",
  "capacity": 2,
  "status": "AVAILABLE",
  "allowAdditionalOccupants": false
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-044

**PATCH `/api/v1/rooms/{roomId}`** · Sửa thông tin vật lý và giá phòng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Room sau cập nhật
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ROOM_NUMBER_EXISTS, 422 ROOM_CAPACITY_EXCEEDED, 409 ROOM_STILL_OCCUPIED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, If-Match: "<currentVersion>"

**Request**

```json
{
  "code": "P101",
  "area": "22.00",
  "rentAmount": "3800000.00",
  "depositAmount": "3800000.00",
  "status": "AVAILABLE",
  "allowAdditionalOccupants": false
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-045

**PUT `/api/v1/rooms/{roomId}/capacity`** · Đổi sức chứa có khóa phòng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Room {id,capacity,currentLoad}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ROOM_NUMBER_EXISTS, 422 ROOM_CAPACITY_EXCEEDED, 409 ROOM_STILL_OCCUPIED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "capacity": 3
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-046

**GET `/api/v1/rooms/{roomId}`** · Chi tiết phòng theo quyền người xem

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Room {id,area,rentAmount,depositAmount,capacity,status,activeCount,services}; không có danh tính cư dân
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-047

**GET `/api/v1/rooms/{roomId}/posts`** · Bài đăng của một phòng

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Post[]; chủ/admin thêm pendingReviewCount và quota=3
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-048

**GET `/api/v1/rooms/{roomId}/residents`** · Người đang ở trong phòng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng hoặc ADMIN
- **HTTP** — 200
- **Dữ liệu trả về** — Resident[] {id,fullName,isRepresentative,moveInDate,reconciliationRequired}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-049

**GET `/api/v1/rooms/{roomId}/services`** · Dịch vụ hiệu lực của phòng

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — EffectiveService[] {name,unit,method,unitPrice}
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-050

**GET `/api/v1/landlord/posts`** · Danh sách tin chủ trọ quản lý

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Post[] {id,roomId,status,contentVersion,pendingReviewCount}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-051

**POST `/api/v1/posts`** · Tạo bài mới và gửi duyệt

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Post {id,status:PENDING_REVIEW,contentVersion,pendingReviewCount}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 POST_REVIEW_QUOTA_REACHED, 409 POST_VERSION_CHANGED, 422 POST_IMAGE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "roomId": "101",
  "title": "Studio thoáng sáng",
  "content": "Phòng có bếp và vệ sinh riêng.",
  "imageFileIds": [
    "501"
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-052

**PATCH `/api/v1/posts/{postId}`** · Sửa đúng bài và gửi duyệt lại

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Post {id,status:PENDING_REVIEW,contentVersion}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 POST_REVIEW_QUOTA_REACHED, 409 POST_VERSION_CHANGED, 422 POST_IMAGE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, If-Match: "<currentVersion>"

**Request**

```json
{
  "roomId": "101",
  "title": "Studio thoáng sáng",
  "content": "Phòng có bếp và vệ sinh riêng.",
  "imageFileIds": [
    "501"
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-053

**GET `/api/v1/admin/posts`** · Hàng đợi kiểm duyệt tin

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Post[] kèm trạng thái quyền nhà
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-054

**POST `/api/v1/admin/posts/{postId}/decision`** · Duyệt hoặc từ chối đúng bài

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Post và contentVersion
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 MODERATION_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>, If-Match: "<currentVersion>"

**Request**

```json
{
  "decision": "APPROVE"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-055

**POST `/api/v1/posts/{postId}/hide`** · Ẩn tin đang công khai

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng hoặc ADMIN
- **HTTP** — 200
- **Dữ liệu trả về** — Post {id,status:HIDDEN}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 MODERATION_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-056

**POST `/api/v1/admin/posts/{postId}/restore`** · Hiện lại tin đã ẩn

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Post {id,status:APPROVED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 MODERATION_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-057

**GET `/api/v1/posts`** · Khám phá và lọc tin công khai

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Post[] {id,roomId,title,images,room,landlordSummary}
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Query** — q,provinceCode,minArea,maxRent,amenities,lat,lng,radiusKm,sort
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-058

**GET `/api/v1/posts/{postId}`** · Chi tiết đúng tin công khai

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Post {id,roomId,title,content,images,amenities,room,landlordSummary}
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-059

**GET `/api/v1/me/favorites`** · Danh sách bài đã lưu

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — Favorite[] {postId,savedAt,availability,post|null}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-060

**PUT `/api/v1/me/favorites/{postId}`** · Lưu bài theo ID

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — {postId,saved:true}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 404 POST_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-061

**DELETE `/api/v1/me/favorites/{postId}`** · Bỏ lưu bài

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — {postId,saved:false}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 404 POST_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-062

**GET `/api/v1/me/roommate-profile`** · Đọc hồ sơ ở ghép của mình

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — RoommateProfile hoặc 404 PROFILE_NOT_CREATED
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-063

**PUT `/api/v1/me/roommate-profile`** · Tạo hoặc thay thế hồ sơ ở ghép

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — RoommateProfile {id,profileVersion,...}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 PROFILE_VERSION_CHANGED, 422 HOUSING_CONTEXT_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, If-Match: "<currentVersion>"

**Request**

```json
{
  "housingStatus": "NO_ACCOMMODATION",
  "availableFrom": "2026-11-01",
  "budgetMin": "1500000.00",
  "budgetMax": "3000000.00",
  "preferredLocation": "Quận trung tâm",
  "active": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-064

**GET `/api/v1/roommate-profiles/{profileId}`** · Xem hồ sơ ứng viên theo quyền

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — PublicRoommateProfile; không có CCCD/địa chỉ cư trú cụ thể
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-065

**GET `/api/v1/lifestyle-criteria`** · Danh mục tiêu chí đang áp dụng

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — LifestyleCriterion[] {id,code,name,category,valueType,allowedValues}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-066

**GET `/api/v1/me/roommate-profile/lifestyles`** · Đọc đặc điểm và mong muốn đã lưu

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — ProfileLifestyle[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-067

**PUT `/api/v1/me/roommate-profile/lifestyles`** · Thay bộ tiêu chí của hồ sơ

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — ProfileLifestyle[] và profileVersion
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 INVALID_CRITERION_VALUE, 409 CRITERION_IN_USE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "criteria": [
    {
      "criterionId": "1",
      "selfValue": false,
      "preferredValue": false,
      "isMandatory": true,
      "importance": 5
    }
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-068

**GET `/api/v1/roommate-matches`** · Danh sách người phù hợp

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — Match[] {profile,score|null,algorithmVersion,explanations}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-069

**POST `/api/v1/admin/lifestyle-criteria`** · Tạo tiêu chí ghép linh động

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 201
- **Dữ liệu trả về** — LifestyleCriterion
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 INVALID_CRITERION_VALUE, 409 CRITERION_IN_USE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "code": "SMOKING",
  "name": "Hút thuốc",
  "category": "Thói quen",
  "valueType": "BOOLEAN",
  "active": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-070

**PATCH `/api/v1/admin/lifestyle-criteria/{criterionId}`** · Sửa/ngừng tiêu chí

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — LifestyleCriterion
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 INVALID_CRITERION_VALUE, 409 CRITERION_IN_USE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "code": "SMOKING",
  "name": "Hút thuốc",
  "category": "Thói quen",
  "valueType": "BOOLEAN",
  "active": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-071

**GET `/api/v1/roommate-requests`** · Lời mời đến/đã gửi và bộ đếm

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — {items:RoommateRequest[],counts:{incoming,outgoing}}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — direction,status
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-072

**POST `/api/v1/roommate-requests`** · Gửi lời mời kết nối

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — RoommateRequest {id,status:PENDING}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_PAIR_EXISTS, 422 PROFILE_REQUIRED, 409 CONNECTION_ENDED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "receiverId": "22",
  "scenario": "SEARCH_TOGETHER"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-073

**POST `/api/v1/roommate-requests/{requestId}/response`** · Người nhận chấp nhận/từ chối kết nối

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — RoommateRequest và conversationId|null
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_PAIR_EXISTS, 422 PROFILE_REQUIRED, 409 CONNECTION_ENDED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "ACCEPT"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-074

**POST `/api/v1/roommate-requests/{requestId}/cancel`** · Người gửi hủy lời mời chờ

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — RoommateRequest {id,status:CANCELLED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_PAIR_EXISTS, 422 PROFILE_REQUIRED, 409 CONNECTION_ENDED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-075

**POST `/api/v1/roommate-requests/{requestId}/end`** · Kết thúc kết nối đã nhận

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — RoommateRequest {id,status:ACCEPTED,endedAt,endReason}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_PAIR_EXISTS, 422 PROFILE_REQUIRED, 409 CONNECTION_ENDED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-076

**POST `/api/v1/conversations/room-inquiries`** · Mở/lấy hội thoại hỏi đúng bài

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — Conversation {id,type:ROOM_INQUIRY,postId,roomId,participants}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 403 NOT_A_PARTICIPANT, 422 MESSAGE_OR_CONTEXT_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "postId": "201"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-077

**GET `/api/v1/conversations`** · Hội thoại của tài khoản

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Conversation[] hoặc nhóm theo peer với contexts[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-078

**GET `/api/v1/conversations/{conversationId}`** · Chi tiết hội thoại và thành viên

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Conversation,participants,context,relationshipLabel
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-079

**GET `/api/v1/conversations/{conversationId}/messages`** · Lịch sử tin và thẻ chia sẻ

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Message[] {id,senderId,type,content,sentAt,sharedPost|null}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — before,limit
- **Phân trang** — cursor

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "nextCursor": null,
      "hasMore": false
    }
  },
  "error": null
}
```

### API-080

**POST `/api/v1/conversations/{conversationId}/messages`** · Gửi tin nhắn chữ/ảnh

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 201
- **Dữ liệu trả về** — Message và eventId
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 403 NOT_A_PARTICIPANT, 422 MESSAGE_OR_CONTEXT_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "clientMessageKey": "8b00655c-4028-4265-b43e-8340ef5ddcf2",
  "type": "TEXT",
  "content": "Tôi muốn hỏi thêm về phòng này."
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-081

**PUT `/api/v1/conversations/{conversationId}/read-state`** · Đánh dấu đã đọc đến tin xác định

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {conversationId,lastReadAt,unreadCount}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 403 NOT_A_PARTICIPANT, 422 MESSAGE_OR_CONTEXT_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "lastReadMessageId": "1001"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-082

**PATCH `/api/v1/conversations/{conversationId}/preferences`** · Ẩn/lưu trữ/tắt thông báo phía mình

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — ConversationPreferences
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 403 NOT_A_PARTICIPANT, 422 MESSAGE_OR_CONTEXT_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "muted": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-083

**GET `/api/v1/conversations/{conversationId}/viewing-timeline`** · Thẻ lịch và đề nghị trong chat

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {viewings:Viewing[],proposals:ViewingProposal[]}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-084

**POST `/api/v1/roommate-requests/{requestId}/conversation`** · Mở lại đúng chat bạn ghép

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — Conversation {id,type:ROOMMATE}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONNECTION_ENDED, 403 NOT_A_PARTICIPANT
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-085

**POST `/api/v1/conversations/{conversationId}/post-shares`** · Chia sẻ đúng bài cho bạn ghép

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — Message {type:POST_SHARE,sharedPostId,sharedPost}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONNECTION_ENDED, 404 POST_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "clientMessageKey": "8b00655c-4028-4265-b43e-8340ef5ddcf2",
  "postId": "201"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-086

**GET `/api/v1/me/notifications`** · Feed thông báo của mình

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Notification[] {id,type,title,content,isRead,resource,createdAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — isRead,type
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-087

**GET `/api/v1/me/notification-counts`** · Bộ đếm chưa đọc

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {notificationsUnread,messagesUnread}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-088

**PUT `/api/v1/me/notifications/{notificationId}/read-state`** · Đánh dấu một thông báo đã đọc

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — Notification {id,isRead:true,readAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 READ_MARKER_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "isRead": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-089

**POST `/api/v1/me/notifications/read-all`** · Đọc tất cả đến mốc xác định

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {updatedCount}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 READ_MARKER_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "throughCreatedAt": "2026-10-29T03:00:00Z"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-090

**GET `/api/v1/events`** · Kênh sự kiện SSE có xác thực

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — text/event-stream: {id,type,resourceId,occurredAt}; không bọc JSON HTTP thông thường
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "event": "notification.created",
  "id": "evt-example",
  "data": {
    "resourceId": "1001",
    "occurredAt": "2026-10-29T03:00:00Z"
  }
}
```

### API-091

**GET `/api/v1/viewing-proposals`** · Danh sách đề nghị đúng các bên

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ViewingProposal[] {id,status,effectiveStatus,startsAt,viewingId}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — status,roomId,conversationId
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-092

**POST `/api/v1/viewing-proposals`** · Người thuê gửi đề nghị lịch xem

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — ViewingProposal {id,status:PENDING,startsAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_TIME_OVERLAP, 409 PENDING_PROPOSAL_EXISTS, 409 PROPOSAL_EXPIRED, 422 VIEWING_TIME_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "conversationId": "301",
  "roomId": "101",
  "startsAt": "2026-11-02T09:00:00+07:00",
  "durationMinutes": 60
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-093

**POST `/api/v1/viewing-proposals/{proposalId}/decision`** · Chủ trọ chấp nhận/từ chối đề nghị

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — {proposal:ViewingProposal,viewing:Viewing|null}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_TIME_OVERLAP, 409 PENDING_PROPOSAL_EXISTS, 409 PROPOSAL_EXPIRED, 422 VIEWING_TIME_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "ACCEPT"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-094

**POST `/api/v1/viewing-proposals/{proposalId}/withdraw`** · Rút đề nghị của mình

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — ViewingProposal {id,status:WITHDRAWN}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_TIME_OVERLAP, 409 PENDING_PROPOSAL_EXISTS, 409 PROPOSAL_EXPIRED, 422 VIEWING_TIME_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-095

**GET `/api/v1/viewings`** · Danh sách lịch đã chốt

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Viewing[] và decision
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — status,from,to,roomId,conversationId
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-096

**GET `/api/v1/viewings/{viewingId}`** · Chi tiết lịch xem

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Viewing {id,startsAt,endsAt,status,tenantDecision,cancelReason}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-097

**POST `/api/v1/viewings`** · Chủ trọ tự chốt lịch sau trao đổi

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Viewing {id,status:SCHEDULED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_TIME_OVERLAP, 422 VIEWING_CONTEXT_INVALID, 422 VIEWING_TIME_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "conversationId": "301",
  "roomId": "101",
  "startsAt": "2026-11-02T09:00:00+07:00",
  "durationMinutes": 60,
  "tenantId": "21"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-098

**POST `/api/v1/viewings/{viewingId}/attendance`** · Chủ trọ ghi nhận đã xem hoặc không đến

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Viewing {id,status,attendanceConfirmedAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_STATE_CHANGED, 422 OUTCOME_NOT_YET_ALLOWED, 409 OPEN_CONTRACT_EXISTS
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "outcome": "ATTENDED"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-099

**POST `/api/v1/viewings/{viewingId}/cancel`** · Hai bên hủy lịch đang hẹn

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Viewing {id,status:CANCELLED,cancelledAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_STATE_CHANGED, 422 OUTCOME_NOT_YET_ALLOWED, 409 OPEN_CONTRACT_EXISTS
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-100

**POST `/api/v1/viewings/{viewingId}/rental-decision`** · Người thuê quyết định sau khi xem

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — Viewing {id,tenantDecision,tenantDecidedAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 VIEWING_STATE_CHANGED, 422 OUTCOME_NOT_YET_ALLOWED, 409 OPEN_CONTRACT_EXISTS
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "AGREE"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-101

**GET `/api/v1/contracts`** · Danh sách hợp đồng được quyền xem

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Contract[] {id,number,status,room,dates,currentRepresentative}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — status,roomId,source
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-102

**GET `/api/v1/contracts/{contractId}`** · Chi tiết hợp đồng và quyền thao tác

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Contract,currentRevision,members,allowedActions
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-103

**POST `/api/v1/contracts`** · Gửi hợp đồng thuê mới và giữ phòng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Contract {id,status:PENDING_CONFIRMATION,revisionId,members}; roomStatus:RESERVED
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_CONTRACT_EXISTS, 422 VIEWING_NOT_ELIGIBLE, 422 HOUSE_RIGHT_NOT_EFFECTIVE, 422 ROOM_CAPACITY_EXCEEDED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "viewingId": "701",
  "contractNumber": "HD-2026-101",
  "startDate": "2026-11-02",
  "endDate": "2027-11-01",
  "rentAmount": "3800000.00",
  "depositAmount": "3800000.00",
  "content": "Nội dung hợp đồng được hai bên đối chiếu.",
  "extraMembers": []
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-104

**GET `/api/v1/viewings/{viewingId}/contract-impact`** · Dự kiến lịch/đề nghị bị đóng khi gửi hợp đồng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — {futureViewingsCount,pendingProposalsCount,expiredProposalsCount,asOf}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-105

**GET `/api/v1/contracts/{contractId}/revisions`** · Lịch sử phiên bản hợp đồng

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractRevision[] gồm trạng thái,content,membersSnapshot,confirmedBy/At
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-106

**POST `/api/v1/contracts/{contractId}/revision-requests`** · Đại diện yêu cầu sửa bản đang chờ

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — {cancelledRevisionId,draftRevisionId,status:DRAFT}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 REVISION_CHANGED, 409 CONTRACT_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-107

**PATCH `/api/v1/contracts/{contractId}/revisions/{revisionId}`** · Chủ trọ chỉnh bản nháp hợp đồng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractRevision {id,version,status:DRAFT}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 REVISION_CHANGED, 409 CONTRACT_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "baseRevisionId": "901",
  "endDate": "2027-11-01",
  "rentAmount": "3800000.00",
  "depositAmount": "3800000.00",
  "content": "Điều khoản đã điều chỉnh"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-108

**POST `/api/v1/contracts/{contractId}/revisions/{revisionId}/submit`** · Gửi lại phiên bản nháp

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractRevision PENDING_CONFIRMATION và currentRevisionId
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 REVISION_CHANGED, 409 CONTRACT_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-109

**POST `/api/v1/contracts/{contractId}/confirm`** · Đại diện xác nhận phiên bản hiện hành

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — Contract {id,status:CONFIRMED,currentRevisionId}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 REVISION_CHANGED, 409 CONTRACT_STATE_CHANGED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "revisionId": "901"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-110

**POST `/api/v1/contracts/{contractId}/move-ins`** · Xác nhận vào ở theo nhóm/từng người

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — {contract:Contract,members:Resident[],roomStatus:OCCUPIED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ACTIVE_STAY_EXISTS, 422 ROOM_CAPACITY_EXCEEDED, 422 HOUSE_RIGHT_NOT_EFFECTIVE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "memberIds": [
    "1101"
  ],
  "moveInDate": "2026-11-02"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-111

**POST `/api/v1/contracts/{contractId}/cancel`** · Hủy hợp đồng trước vào ở

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Contract {id,status:CANCELLED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONTRACT_ALREADY_ACTIVE, 409 REPRESENTATIVE_CANNOT_BE_CANCELLED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-112

**POST `/api/v1/contracts/{contractId}/members/{memberId}/cancel`** · Hủy thành viên dự kiến chưa đến

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Resident {id,status:CANCELLED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONTRACT_ALREADY_ACTIVE, 409 REPRESENTATIVE_CANNOT_BE_CANCELLED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-113

**POST `/api/v1/contract-imports`** · Nhập hợp đồng giấy có chứng cứ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng và quyền import riêng
- **HTTP** — 201
- **Dữ liệu trả về** — ImportResult {contractId,source:PAPER_IMPORT,warnings}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 CONTRACT_ALREADY_ACTIVE, 409 REPRESENTATIVE_CANNOT_BE_CANCELLED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "paperDocumentFileId": "504",
  "roomId": "101",
  "contractNumber": "HD-GIAY-001",
  "startDate": "2026-10-01",
  "endDate": "2027-09-30",
  "rentAmount": "3800000.00",
  "depositAmount": "3800000.00",
  "content": "Điều khoản trong hợp đồng giấy"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-114

**GET `/api/v1/residents`** · Danh sách và lịch sử người ở quản lý

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Resident[] gồm status,contract,room,moveIn/Out,representative
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — houseId,roomId,contractId,status
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-115

**GET `/api/v1/contracts/{contractId}/members`** · Thành viên của hợp đồng

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Resident[] với trường được phép
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-116

**GET `/api/v1/residents/export`** · Xuất danh sách cư dân đang ở

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — text/csv UTF-8 BOM; attachment residents.csv
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

CSV attachment (ngoại lệ JSON)

### API-117

**GET `/api/v1/occupant-join-requests`** · Yêu cầu thêm người trong phạm vi được xem

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — OccupantJoinRequest[] và effectiveStatus
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — contractId,status
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-118

**POST `/api/v1/occupant-join-requests`** · Đại diện đề nghị thêm người

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — OccupantJoinRequest {id,status:PENDING_CONSENT}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_JOIN_EXISTS, 409 REPRESENTATIVE_CHANGED, 422 CONSENT_REQUIRED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "contractId": "801",
  "applicantId": "22",
  "plannedMoveInDate": "2026-11-02"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-119

**POST `/api/v1/occupant-join-requests/{requestId}/consents`** · Ghi đồng ý riêng của đại diện hoặc người xin vào

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — OccupantJoinRequest và status
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_JOIN_EXISTS, 409 REPRESENTATIVE_CHANGED, 422 CONSENT_REQUIRED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "consent": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-120

**POST `/api/v1/occupant-join-requests/{requestId}/cancel`** · Rút yêu cầu chưa được duyệt

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — OccupantJoinRequest {id,status:CANCELLED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_JOIN_EXISTS, 409 REPRESENTATIVE_CHANGED, 422 CONSENT_REQUIRED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-121

**POST `/api/v1/occupant-join-requests/{requestId}/approve`** · Chủ trọ duyệt và giữ một chỗ 48 giờ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — OccupantJoinRequest {id,status:APPROVED,holdExpiresAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 ROOM_CAPACITY_EXCEEDED, 409 ACTIVE_STAY_EXISTS, 409 HOLD_EXPIRED, 409 REPRESENTATIVE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-122

**POST `/api/v1/occupant-join-requests/{requestId}/reject`** · Chủ trọ từ chối thêm người

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — OccupantJoinRequest {id,status:REJECTED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 ROOM_CAPACITY_EXCEEDED, 409 ACTIVE_STAY_EXISTS, 409 HOLD_EXPIRED, 409 REPRESENTATIVE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-123

**POST `/api/v1/occupant-join-requests/{requestId}/cancel-hold`** · Chủ trọ hủy giữ chỗ đã duyệt

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — OccupantJoinRequest {id,status:CANCELLED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 ROOM_CAPACITY_EXCEEDED, 409 ACTIVE_STAY_EXISTS, 409 HOLD_EXPIRED, 409 REPRESENTATIVE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-124

**POST `/api/v1/occupant-join-requests/{requestId}/complete`** · Hoàn tất vào ở từ giữ chỗ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — {request:OccupantJoinRequest,member:Resident}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 ROOM_CAPACITY_EXCEEDED, 409 ACTIVE_STAY_EXISTS, 409 HOLD_EXPIRED, 409 REPRESENTATIVE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-125

**POST `/api/v1/contracts/{contractId}/members/{memberId}/move-out`** · Ghi nhận thành viên thực tế rời

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — {member:Resident,contractStatus,roomStatus}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 HANDOVER_REQUIRED, 422 MOVE_OUT_DATE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "moveOutDate": "2026-11-02"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-126

**GET `/api/v1/contracts/{contractId}/representative-candidates`** · Người đủ điều kiện nhận đại diện

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Resident[] ACTIVE cùng contract có tài khoản ACTIVE
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-127

**GET `/api/v1/contracts/{contractId}/representative-history`** · Lịch sử đại diện theo giai đoạn

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — RepresentativePeriod[] {nameSnapshot,startedAt,endedAt,consent,reason}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-128

**POST `/api/v1/contracts/{contractId}/representative-handovers`** · Bàn giao và ghi người cũ rời

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Contract và RepresentativeHistory
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 SUCCESSOR_INELIGIBLE, 409 REPRESENTATIVE_CHANGED, 409 HISTORY_RECONCILIATION_REQUIRED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "departingMemberId": "1101",
  "successorMemberId": "1102",
  "reason": "Đại diện cũ chuyển đi",
  "consentRecorded": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-129

**GET `/api/v1/contracts/{contractId}/change-requests`** · Lịch sử yêu cầu điều chỉnh hợp đồng

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractChangeRequest[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-130

**POST `/api/v1/contracts/{contractId}/change-requests`** · Gửi yêu cầu gia hạn/đổi phòng/chấm dứt

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — ContractChangeRequest {id,status:PENDING}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_CHANGE_EXISTS, 409 BASE_REVISION_CHANGED, 422 EFFECTIVE_DATE_NOT_REACHED, 422 TARGET_ROOM_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "type": "RENEWAL",
  "baseRevisionId": "901",
  "effectiveDate": "2026-11-02",
  "reason": "Gia hạn theo thỏa thuận",
  "newEndDate": "2028-11-01"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-131

**GET `/api/v1/contract-change-requests/{requestId}`** · Đọc phương án điều chỉnh

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractChangeRequest,proposalRevision,proposalSnapshot
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-132

**POST `/api/v1/contract-change-requests/{requestId}/decision`** · Chủ trọ duyệt/từ chối phương án

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractChangeRequest và proposedRevisionId
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_CHANGE_EXISTS, 409 BASE_REVISION_CHANGED, 422 EFFECTIVE_DATE_NOT_REACHED, 422 TARGET_ROOM_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "decision": "APPROVE"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-133

**POST `/api/v1/contract-change-requests/{requestId}/confirm`** · Đại diện xác nhận đúng phương án

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — ContractChangeRequest {id,status:READY_TO_APPLY}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_CHANGE_EXISTS, 409 BASE_REVISION_CHANGED, 422 EFFECTIVE_DATE_NOT_REACHED, 422 TARGET_ROOM_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "proposalHash": "example-sha256"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-134

**POST `/api/v1/contract-change-requests/{requestId}/cancel`** · Hủy yêu cầu điều chỉnh còn mở

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — ContractChangeRequest {id,status:CANCELLED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_CHANGE_EXISTS, 409 BASE_REVISION_CHANGED, 422 EFFECTIVE_DATE_NOT_REACHED, 422 TARGET_ROOM_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-135

**POST `/api/v1/contract-change-requests/{requestId}/apply`** · Áp dụng yêu cầu đã đủ xác nhận

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — {requestId,status:COMPLETED,resultContractId,contract}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 OPEN_CHANGE_EXISTS, 409 BASE_REVISION_CHANGED, 422 EFFECTIVE_DATE_NOT_REACHED, 422 TARGET_ROOM_UNAVAILABLE
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-136

**GET `/api/v1/contracts/{contractId}/transfer-options`** · Phòng đích có thể chuyển toàn bộ nhóm

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Room[] và openMemberCount
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-137

**GET `/api/v1/rental-services`** · Danh mục dịch vụ cho cấu hình

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — RentalService[] {id,name,unit,defaultCalculationMethod}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-138

**POST `/api/v1/admin/rental-services`** · Quản trị bổ sung danh mục dịch vụ

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 201
- **Dữ liệu trả về** — RentalService
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 SERVICE_NAME_EXISTS, 422 CROSS_HOUSE_SERVICE, 422 SERVICE_PRICE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "name": "Điện",
  "unit": "kWh",
  "defaultCalculationMethod": "METERED"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-139

**PATCH `/api/v1/admin/rental-services/{serviceId}`** · Sửa nội dung mẫu dịch vụ

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — RentalService
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 SERVICE_NAME_EXISTS, 422 CROSS_HOUSE_SERVICE, 422 SERVICE_PRICE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "name": "Điện",
  "unit": "kWh",
  "defaultCalculationMethod": "METERED"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-140

**GET `/api/v1/houses/{houseId}/services`** · Cấu hình dịch vụ của nhà

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — HouseService[] gồm cả inactive
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-141

**POST `/api/v1/houses/{houseId}/services`** · Thêm dịch vụ vào nhà

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — HouseService
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 SERVICE_NAME_EXISTS, 422 CROSS_HOUSE_SERVICE, 422 SERVICE_PRICE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "serviceId": "41",
  "name": "Điện",
  "unit": "kWh",
  "unitPrice": "3500.00",
  "calculationMethod": "METERED",
  "active": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-142

**PATCH `/api/v1/houses/{houseId}/services/{houseServiceId}`** · Sửa/bật/ngừng dịch vụ nhà

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — HouseService
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 SERVICE_NAME_EXISTS, 422 CROSS_HOUSE_SERVICE, 422 SERVICE_PRICE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "name": "Điện",
  "unit": "kWh",
  "unitPrice": "3500.00",
  "calculationMethod": "METERED",
  "active": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-143

**PUT `/api/v1/rooms/{roomId}/service-settings/{houseServiceId}`** · Gán hoặc đổi giá dịch vụ tại phòng

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — RoomService và effectiveUnitPrice
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 SERVICE_NAME_EXISTS, 422 CROSS_HOUSE_SERVICE, 422 SERVICE_PRICE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "active": true,
  "unitPriceOverride": "0.00",
  "calculationMethodOverride": null
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-144

**GET `/api/v1/rooms/{roomId}/service-settings`** · Cấu hình dịch vụ phòng để quản lý

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — RoomService[] gồm active/inactive/override và giá kế thừa
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-145

**GET `/api/v1/invoices`** · Danh sách hóa đơn được xem

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Invoice[] {id,period,status,payer,total,dueDate}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Query** — contractId,billingPeriod,status
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-146

**GET `/api/v1/invoices/{invoiceId}`** · Chi tiết dòng tiền và người trả tại kỳ lập

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép hoặc LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Invoice,items[],total,contractRevisionSnapshot
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-147

**POST `/api/v1/invoices`** · Lập hóa đơn nháp theo kỳ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Invoice {id,status:DRAFT,items,total,payerId}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 INVOICE_PERIOD_EXISTS, 409 INVOICE_IMMUTABLE, 422 INVOICE_TOTAL_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "contractId": "801",
  "billingPeriod": "2026-11-01",
  "dueDate": "2026-11-10",
  "items": [
    {
      "type": "SERVICE",
      "roomServiceId": "61",
      "previousReading": "100.000",
      "currentReading": "125.000"
    }
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-148

**PATCH `/api/v1/invoices/{invoiceId}`** · Sửa toàn bộ nội dung hóa đơn nháp

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Invoice {id,status:DRAFT,items,total}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 INVOICE_PERIOD_EXISTS, 409 INVOICE_IMMUTABLE, 422 INVOICE_TOTAL_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, If-Match: "<currentVersion>"

**Request**

```json
{
  "dueDate": "2026-11-10",
  "items": [
    {
      "type": "SERVICE",
      "roomServiceId": "61",
      "previousReading": "100.000",
      "currentReading": "125.000"
    }
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-149

**POST `/api/v1/invoices/{invoiceId}/issue`** · Phát hành hóa đơn có dòng tiền

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Invoice {id,status:UNPAID,updatedAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 INVOICE_STATE_CHANGED, 409 INVOICE_PERIOD_EXISTS, 422 INVOICE_TOTAL_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-150

**POST `/api/v1/invoices/{invoiceId}/payment-confirmation`** · Ghi nhận chủ trọ đã thu đủ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 201
- **Dữ liệu trả về** — Invoice {id,status:PAID,paidAt,paidById}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 INVOICE_STATE_CHANGED, 409 INVOICE_PERIOD_EXISTS, 422 INVOICE_TOTAL_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-151

**POST `/api/v1/invoices/{invoiceId}/cancel`** · Hủy hóa đơn phát hành chưa thu

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Invoice {id,status:CANCELLED,cancelledAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 INVOICE_STATE_CHANGED, 409 INVOICE_PERIOD_EXISTS, 422 INVOICE_TOTAL_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-152

**POST `/api/v1/invoices/{invoiceId}/replacements`** · Lập bản nháp thay hóa đơn đã hủy

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — Invoice {id,status:DRAFT,replacesInvoiceId}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 INVOICE_STATE_CHANGED, 409 INVOICE_PERIOD_EXISTS, 422 INVOICE_TOTAL_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "dueDate": "2026-11-10",
  "items": [
    {
      "type": "SERVICE",
      "roomServiceId": "61",
      "previousReading": "100.000",
      "currentReading": "125.000"
    }
  ]
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-153

**GET `/api/v1/rooms/{roomId}/reviews`** · Đánh giá phòng được công khai

- **Quyền** — PUBLIC
- **HTTP** — 200
- **Dữ liệu trả về** — Review[] {rating,content,reviewerDisplayName}; không có giấy tờ
- **Mã lỗi** — 400 BAD_REQUEST, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-154

**POST `/api/v1/reviews`** · Đánh giá bằng lượt cư trú thực tế

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — Review {id,status:PUBLISHED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ALREADY_REVIEWED, 422 TENANCY_EVIDENCE_REQUIRED, 422 REVIEW_NOT_YET_ALLOWED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "roomTenantId": "1101",
  "rating": 5,
  "content": "Phòng sạch, dịch vụ rõ ràng."
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-155

**POST `/api/v1/admin/reviews/{reviewId}/moderation`** · Ẩn/khôi phục/xóa mềm đánh giá

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Review {id,status}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ALREADY_REVIEWED, 422 TENANCY_EVIDENCE_REQUIRED, 422 REVIEW_NOT_YET_ALLOWED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "status": "HIDDEN",
  "reason": "Nội dung vi phạm quy định"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-156

**POST `/api/v1/reports`** · Gửi báo cáo hoặc tranh chấp

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 201
- **Dữ liệu trả về** — Report {id,status:PENDING}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 REPORT_TARGET_INVALID, 409 REPORT_ALREADY_CLOSED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "type": "VIOLATION",
  "targetType": "POST",
  "targetId": "201",
  "reason": "Thông tin không đúng thực tế"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-157

**GET `/api/v1/me/reports`** · Báo cáo mình đã gửi và kết luận

- **Quyền** — TENANT: chỉ chính người thuê và tài nguyên được phép
- **HTTP** — 200
- **Dữ liệu trả về** — Report[] không lộ dữ liệu riêng tư người bị báo cáo
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-158

**GET `/api/v1/admin/reports`** · Hàng đợi báo cáo

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Report[] và target summary
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-159

**GET `/api/v1/admin/reports/{reportId}`** · Chi tiết báo cáo và bằng chứng

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Report,evidenceFileIds,targetSnapshotIfAvailable
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-160

**POST `/api/v1/admin/reports/{reportId}/decision`** · Điều tra hoặc kết luận báo cáo

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — Report sau xử lý
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 REPORT_TARGET_INVALID, 409 REPORT_ALREADY_CLOSED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "status": "RESOLVED",
  "resolution": "Đã đối chiếu và yêu cầu chỉnh tin."
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-161

**GET `/api/v1/admin/users`** · Quản lý tài khoản và vai trò

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — User[] với thông tin tối thiểu
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-162

**GET `/api/v1/admin/users/{userId}`** · Chi tiết trạng thái tài khoản

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — User,roles,verificationSummary
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-163

**POST `/api/v1/admin/users/{userId}/lock`** · Khóa tài khoản có lý do

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — User {id,status:LOCKED,lockedAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ACCOUNT_STATE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-164

**POST `/api/v1/admin/users/{userId}/unlock`** · Mở khóa tài khoản

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — User {id,status:ACTIVE}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 ACCOUNT_STATE_CHANGED
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "reason": "Người thuê thay đổi kế hoạch"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-165

**GET `/api/v1/contract-templates`** · Mẫu hợp đồng theo phiên bản

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng hoặc ADMIN
- **HTTP** — 200
- **Dữ liệu trả về** — ContractTemplate[]
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-166

**POST `/api/v1/admin/contract-templates`** · Tạo mẫu hoặc phiên bản tiếp theo

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 201
- **Dữ liệu trả về** — ContractTemplate {id,name,version,active}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 TEMPLATE_VERSION_EXISTS, 422 TEMPLATE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "name": "Hợp đồng thuê phòng",
  "content": "Nội dung mẫu",
  "active": true
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-167

**PATCH `/api/v1/admin/contract-templates/{templateId}`** · Bật/ngừng phiên bản mẫu

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — ContractTemplate
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 409 TEMPLATE_VERSION_EXISTS, 422 TEMPLATE_INVALID
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json

**Request**

```json
{
  "active": false
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-168

**GET `/api/v1/admin/moderation-actions`** · Tra nhật ký quyết định

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — ModerationAction[] {actor,action,target,reason,occurredAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 422 VALIDATION_ERROR
- **Headers** — Authorization: Bearer <accessToken>
- **Phân trang** — page

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": [],
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "error": null
}
```

### API-169

**GET `/api/v1/admin/moderation-actions/{actionId}`** · Chi tiết quyết định trước/sau

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — ModerationAction với beforeSnapshot/afterSnapshot đã lọc
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-170

**POST `/api/v1/files/upload-sessions`** · Xin phiên upload theo mục đích

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 201
- **Dữ liệu trả về** — {fileId,status:STAGED,uploadUrl,expiresAt,requiredHeaders}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 FILE_INVALID, 403 FILE_CONTEXT_FORBIDDEN, 409 EVIDENCE_IMMUTABLE
- **Headers** — Authorization: Bearer <accessToken>, Content-Type: application/json, Idempotency-Key: <UUID>

**Request**

```json
{
  "purpose": "LANDLORD_PROOF",
  "originalName": "minh-chung.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 125000,
  "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-171

**POST `/api/v1/files/{fileId}/complete`** · Xác minh tệp upload hoàn tất

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — File {id,status:ACTIVE,purpose,sizeBytes}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 FILE_INVALID, 403 FILE_CONTEXT_FORBIDDEN, 409 EVIDENCE_IMMUTABLE
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-172

**GET `/api/v1/files/{fileId}`** · Metadata tệp được phép xem

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — File metadata an toàn; không storageKey/raw bucket URL
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-173

**POST `/api/v1/files/{fileId}/download-links`** · Cấp URL đọc riêng tư có hạn

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — {downloadUrl,expiresAt}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 FILE_INVALID, 403 FILE_CONTEXT_FORBIDDEN, 409 EVIDENCE_IMMUTABLE
- **Headers** — Authorization: Bearer <accessToken>, Idempotency-Key: <UUID>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-174

**DELETE `/api/v1/files/{fileId}`** · Xóa mềm tệp chưa bị giữ làm chứng cứ

- **Quyền** — USER: tài khoản ACTIVE; chỉ dữ liệu của mình
- **HTTP** — 200
- **Dữ liệu trả về** — File {id,status:DELETED}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT, 409 IDEMPOTENCY_KEY_REUSED, 422 VALIDATION_ERROR, 422 FILE_INVALID, 403 FILE_CONTEXT_FORBIDDEN, 409 EVIDENCE_IMMUTABLE
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-175

**GET `/api/v1/landlord/dashboard`** · Tổng quan quản lý nhà trọ

- **Quyền** — LANDLORD: sở hữu nhà/phòng/hợp đồng
- **HTTP** — 200
- **Dữ liệu trả về** — {houseCount,roomCount,occupiedRoomCount,upcomingViewingCount,unpaidInvoiceCount,unpaidAmount,pendingContractCount,pendingJoinCount,upcomingViewings}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```

### API-176

**GET `/api/v1/admin/dashboard`** · Tổng quan hàng đợi quản trị

- **Quyền** — ADMIN: tài khoản ACTIVE có dòng admins
- **HTTP** — 200
- **Dữ liệu trả về** — {pendingIdentityCount,pendingLandlordCount,pendingHouseProofCount,pendingPostCount,pendingReportCount,userCount}
- **Mã lỗi** — 400 BAD_REQUEST, 401 UNAUTHENTICATED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND
- **Headers** — Authorization: Bearer <accessToken>

**Request**

API này không có JSON body.

**Response mẫu**

```json
{
  "data": {
    "id": "1001"
  },
  "meta": {
    "requestId": "req-example",
    "timestamp": "2026-10-29T03:00:00Z"
  },
  "error": null
}
```
