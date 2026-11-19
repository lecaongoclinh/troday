# Đối chiếu chức năng – API đang nối

Nguồn chuẩn: controller/service BE hiện tại. Catalogue dùng chung: `shared/api/contract.json`.
Đã nối request/response không đồng nghĩa đã nghiệm thu transaction hoặc toàn bộ nghiệp vụ với DB thật. Xem [hướng dẫn và giới hạn](../../docs/API-CONNECTION.md).

| API | Chức năng | Method | Đường dẫn | Controller BE | Trạng thái FE |
| --- | --- | --- | --- | --- | --- |
| API-001 | Đăng ký tài khoản người thuê | POST | `/api/v1/auth/register` | AccountController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-002 | Đăng nhập và mở phiên | POST | `/api/v1/auth/login` | AccountController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-003 | Đọc tài khoản và các vai trò thực | GET | `/api/v1/me` | AccountController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-004 | Cập nhật hồ sơ cá nhân | PATCH | `/api/v1/me/profile` | AccountController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-005 | Cấu hình kênh thông báo | PATCH | `/api/v1/me/notification-settings` | AccountController.java:19 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-006 | Nộp xác minh danh tính người thuê | POST | `/api/v1/me/identity-verifications` | AccountController.java:21 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-007 | Lịch sử xác minh của mình | GET | `/api/v1/me/identity-verifications` | AccountController.java:22 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-008 | Rút hồ sơ danh tính đang chờ | POST | `/api/v1/me/identity-verifications/{verificationId}/withdraw` | AccountController.java:23 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-009 | Xin cấp vai trò chủ trọ | POST | `/api/v1/me/landlord-verifications` | AccountController.java:24 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-010 | Lịch sử hồ sơ xin làm chủ trọ | GET | `/api/v1/me/landlord-verifications` | AccountController.java:25 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-011 | Rút hồ sơ chủ trọ đang chờ | POST | `/api/v1/me/landlord-verifications/{verificationId}/withdraw` | AccountController.java:26 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-012 | Danh sách hồ sơ identity | GET | `/api/v1/admin/identity-verifications` | AccountController.java:28 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-013 | Chi tiết hồ sơ identity | GET | `/api/v1/admin/identity-verifications/{verificationId}` | AccountController.java:29 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-014 | Duyệt hoặc từ chối hồ sơ identity | POST | `/api/v1/admin/identity-verifications/{verificationId}/decision` | AccountController.java:30 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-015 | Danh sách hồ sơ landlord | GET | `/api/v1/admin/landlord-verifications` | AccountController.java:31 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-016 | Chi tiết hồ sơ landlord | GET | `/api/v1/admin/landlord-verifications/{verificationId}` | AccountController.java:32 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-017 | Duyệt hoặc từ chối hồ sơ landlord | POST | `/api/v1/admin/landlord-verifications/{verificationId}/decision` | AccountController.java:33 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-018 | Luân chuyển refresh token | POST | `/api/v1/auth/refresh` | AccountController.java:35 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-019 | Đăng xuất phiên hiện tại | POST | `/api/v1/auth/logout` | AccountController.java:36 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-020 | Danh sách phiên của mình | GET | `/api/v1/me/sessions` | AccountController.java:37 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-021 | Thu hồi một phiên | DELETE | `/api/v1/me/sessions/{sessionId}` | AccountController.java:38 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-022 | Gửi OTP xác minh điện thoại | POST | `/api/v1/auth/phone-verifications` | AccountController.java:39 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-023 | Xác nhận OTP điện thoại | POST | `/api/v1/auth/phone-verifications/confirm` | AccountController.java:40 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-024 | Yêu cầu đặt lại mật khẩu | POST | `/api/v1/auth/password-resets` | AccountController.java:41 | Chưa khả dụng: Chức năng khôi phục mật khẩu hiện chưa khả dụng. Vui lòng liên hệ quản trị viên. |
| API-025 | Đổi OTP hợp lệ lấy quyền reset ngắn hạn | POST | `/api/v1/auth/password-resets/verify` | AccountController.java:42 | Chưa khả dụng: Chức năng khôi phục mật khẩu hiện chưa khả dụng. Vui lòng liên hệ quản trị viên. |
| API-026 | Đặt mật khẩu mới | POST | `/api/v1/auth/password-resets/complete` | AccountController.java:43 | Chưa khả dụng: Chức năng khôi phục mật khẩu hiện chưa khả dụng. Vui lòng liên hệ quản trị viên. |
| API-027 | Mời cư dân chưa có tài khoản liên kết | POST | `/api/v1/contracts/{contractId}/members/{memberId}/account-invitations` | AccountController.java:45 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-028 | Nhận liên kết tài khoản với lượt cư trú | POST | `/api/v1/me/residency-links` | AccountController.java:46 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-029 | Danh sách nhà thuộc chủ trọ | GET | `/api/v1/houses` | HouseController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-030 | Tạo nhà nháp | POST | `/api/v1/houses` | HouseController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-031 | Chi tiết nhà quản lý | GET | `/api/v1/houses/{houseId}` | HouseController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-032 | Sửa nhà và kiểm tra phiên bản | PATCH | `/api/v1/houses/{houseId}` | HouseController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-033 | Lịch sử quyền cho thuê từng nhà | GET | `/api/v1/houses/{houseId}/verifications` | HouseController.java:19 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-034 | Nộp minh chứng quyền cho thuê | POST | `/api/v1/houses/{houseId}/verifications` | HouseController.java:20 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-035 | Chi tiết hồ sơ quyền nhà của mình | GET | `/api/v1/houses/{houseId}/verifications/{verificationId}` | HouseController.java:21 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-036 | Rút hồ sơ quyền nhà đang chờ | POST | `/api/v1/houses/{houseId}/verifications/{verificationId}/withdraw` | HouseController.java:22 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-037 | Hàng đợi xác minh quyền nhà | GET | `/api/v1/admin/house-verifications` | HouseController.java:23 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-038 | Chi tiết và minh chứng để đối chiếu | GET | `/api/v1/admin/house-verifications/{verificationId}` | HouseController.java:24 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-039 | Duyệt/từ chối quyền cho thuê | POST | `/api/v1/admin/house-verifications/{verificationId}/decision` | HouseController.java:25 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-040 | Thu hồi quyền đã duyệt | POST | `/api/v1/admin/house-verifications/{verificationId}/revoke` | HouseController.java:26 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-041 | Đọc quyền hiệu lực hiện tại | GET | `/api/v1/houses/{houseId}/rental-right` | HouseController.java:27 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-042 | Danh sách phòng của nhà | GET | `/api/v1/houses/{houseId}/rooms` | HouseController.java:28 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-043 | Thêm phòng trong nhà | POST | `/api/v1/houses/{houseId}/rooms` | HouseController.java:29 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-044 | Sửa thông tin vật lý và giá phòng | PATCH | `/api/v1/rooms/{roomId}` | HouseController.java:30 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-045 | Đổi sức chứa có khóa phòng | PUT | `/api/v1/rooms/{roomId}/capacity` | HouseController.java:31 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-046 | Chi tiết phòng theo quyền người xem | GET | `/api/v1/rooms/{roomId}` | HouseController.java:32 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-047 | Bài đăng của một phòng | GET | `/api/v1/rooms/{roomId}/posts` | HouseController.java:33 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-048 | Người đang ở trong phòng | GET | `/api/v1/rooms/{roomId}/residents` | HouseController.java:34 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-049 | Dịch vụ hiệu lực của phòng | GET | `/api/v1/rooms/{roomId}/services` | HouseController.java:35 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-050 | Danh sách tin chủ trọ quản lý | GET | `/api/v1/landlord/posts` | PostController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-051 | Tạo bài mới và gửi duyệt | POST | `/api/v1/posts` | PostController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-052 | Sửa đúng bài và gửi duyệt lại | PATCH | `/api/v1/posts/{postId}` | PostController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-053 | Hàng đợi kiểm duyệt tin | GET | `/api/v1/admin/posts` | PostController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-054 | Duyệt hoặc từ chối đúng bài | POST | `/api/v1/admin/posts/{postId}/decision` | PostController.java:19 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-055 | Ẩn tin đang công khai | POST | `/api/v1/posts/{postId}/hide` | PostController.java:20 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-056 | Hiện lại tin đã ẩn | POST | `/api/v1/admin/posts/{postId}/restore` | PostController.java:21 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-057 | Khám phá và lọc tin công khai | GET | `/api/v1/posts` | PostController.java:22 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-058 | Chi tiết đúng tin công khai | GET | `/api/v1/posts/{postId}` | PostController.java:23 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-059 | Danh sách bài đã lưu | GET | `/api/v1/me/favorites` | PostController.java:24 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-060 | Lưu bài theo ID | PUT | `/api/v1/me/favorites/{postId}` | PostController.java:25 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-061 | Bỏ lưu bài | DELETE | `/api/v1/me/favorites/{postId}` | PostController.java:26 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-062 | Đọc hồ sơ ở ghép của mình | GET | `/api/v1/me/roommate-profile` | RoommateController.java:5 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-063 | Tạo hoặc thay thế hồ sơ ở ghép | PUT | `/api/v1/me/roommate-profile` | RoommateController.java:6 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-064 | Xem hồ sơ ứng viên theo quyền | GET | `/api/v1/roommate-profiles/{profileId}` | RoommateController.java:7 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-065 | Danh mục tiêu chí đang áp dụng | GET | `/api/v1/lifestyle-criteria` | RoommateController.java:8 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-066 | Đọc đặc điểm và mong muốn đã lưu | GET | `/api/v1/me/roommate-profile/lifestyles` | RoommateController.java:9 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-067 | Thay bộ tiêu chí của hồ sơ | PUT | `/api/v1/me/roommate-profile/lifestyles` | RoommateController.java:10 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-068 | Danh sách người phù hợp | GET | `/api/v1/roommate-matches` | RoommateController.java:11 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-069 | Tạo tiêu chí ghép linh động | POST | `/api/v1/admin/lifestyle-criteria` | RoommateController.java:12 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-070 | Sửa/ngừng tiêu chí | PATCH | `/api/v1/admin/lifestyle-criteria/{criterionId}` | RoommateController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-071 | Lời mời đến/đã gửi và bộ đếm | GET | `/api/v1/roommate-requests` | RoommateController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-072 | Gửi lời mời kết nối | POST | `/api/v1/roommate-requests` | RoommateController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-073 | Người nhận chấp nhận/từ chối kết nối | POST | `/api/v1/roommate-requests/{requestId}/response` | RoommateController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-074 | Người gửi hủy lời mời chờ | POST | `/api/v1/roommate-requests/{requestId}/cancel` | RoommateController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-075 | Kết thúc kết nối đã nhận | POST | `/api/v1/roommate-requests/{requestId}/end` | RoommateController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-076 | Mở/lấy hội thoại hỏi đúng bài | POST | `/api/v1/conversations/room-inquiries` | MessagingController.java:5 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-077 | Hội thoại của tài khoản | GET | `/api/v1/conversations` | MessagingController.java:6 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-078 | Chi tiết hội thoại và thành viên | GET | `/api/v1/conversations/{conversationId}` | MessagingController.java:7 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-079 | Lịch sử tin và thẻ chia sẻ | GET | `/api/v1/conversations/{conversationId}/messages` | MessagingController.java:8 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-080 | Gửi tin nhắn chữ/ảnh | POST | `/api/v1/conversations/{conversationId}/messages` | MessagingController.java:9 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-081 | Đánh dấu đã đọc đến tin xác định | PUT | `/api/v1/conversations/{conversationId}/read-state` | MessagingController.java:10 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-082 | Ẩn/lưu trữ/tắt thông báo phía mình | PATCH | `/api/v1/conversations/{conversationId}/preferences` | MessagingController.java:11 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-083 | Thẻ lịch và đề nghị trong chat | GET | `/api/v1/conversations/{conversationId}/viewing-timeline` | MessagingController.java:12 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-084 | Mở lại đúng chat bạn ghép | POST | `/api/v1/roommate-requests/{requestId}/conversation` | MessagingController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-085 | Chia sẻ đúng bài cho bạn ghép | POST | `/api/v1/conversations/{conversationId}/post-shares` | MessagingController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-086 | Feed thông báo của mình | GET | `/api/v1/me/notifications` | MessagingController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-087 | Bộ đếm chưa đọc | GET | `/api/v1/me/notification-counts` | MessagingController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-088 | Đánh dấu một thông báo đã đọc | PUT | `/api/v1/me/notifications/{notificationId}/read-state` | MessagingController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-089 | Đọc tất cả đến mốc xác định | POST | `/api/v1/me/notifications/read-all` | MessagingController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-090 | Kênh sự kiện SSE có xác thực | GET | `/api/v1/events` | MessagingController.java:19 | Chưa khả dụng: Thông báo trực tiếp chưa khả dụng. Hãy tải lại để nhận cập nhật. |
| API-091 | Danh sách đề nghị đúng các bên | GET | `/api/v1/viewing-proposals` | ViewingController.java:5 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-092 | Người thuê gửi đề nghị lịch xem | POST | `/api/v1/viewing-proposals` | ViewingController.java:6 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-093 | Chủ trọ chấp nhận/từ chối đề nghị | POST | `/api/v1/viewing-proposals/{proposalId}/decision` | ViewingController.java:7 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-094 | Rút đề nghị của mình | POST | `/api/v1/viewing-proposals/{proposalId}/withdraw` | ViewingController.java:8 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-095 | Danh sách lịch đã chốt | GET | `/api/v1/viewings` | ViewingController.java:9 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-096 | Chi tiết lịch xem | GET | `/api/v1/viewings/{viewingId}` | ViewingController.java:10 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-097 | Chủ trọ tự chốt lịch sau trao đổi | POST | `/api/v1/viewings` | ViewingController.java:11 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-098 | Chủ trọ ghi nhận đã xem hoặc không đến | POST | `/api/v1/viewings/{viewingId}/attendance` | ViewingController.java:12 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-099 | Hai bên hủy lịch đang hẹn | POST | `/api/v1/viewings/{viewingId}/cancel` | ViewingController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-100 | Người thuê quyết định sau khi xem | POST | `/api/v1/viewings/{viewingId}/rental-decision` | ViewingController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-101 | Danh sách hợp đồng được quyền xem | GET | `/api/v1/contracts` | ContractController.java:5 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-102 | Chi tiết hợp đồng và quyền thao tác | GET | `/api/v1/contracts/{contractId}` | ContractController.java:6 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-103 | Gửi hợp đồng thuê mới và giữ phòng | POST | `/api/v1/contracts` | ContractController.java:7 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-104 | Dự kiến lịch/đề nghị bị đóng khi gửi hợp đồng | GET | `/api/v1/viewings/{viewingId}/contract-impact` | ContractController.java:8 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-105 | Lịch sử phiên bản hợp đồng | GET | `/api/v1/contracts/{contractId}/revisions` | ContractController.java:9 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-106 | Đại diện yêu cầu sửa bản đang chờ | POST | `/api/v1/contracts/{contractId}/revision-requests` | ContractController.java:10 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-107 | Chủ trọ chỉnh bản nháp hợp đồng | PATCH | `/api/v1/contracts/{contractId}/revisions/{revisionId}` | ContractController.java:11 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-108 | Gửi lại phiên bản nháp | POST | `/api/v1/contracts/{contractId}/revisions/{revisionId}/submit` | ContractController.java:12 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-109 | Đại diện xác nhận phiên bản hiện hành | POST | `/api/v1/contracts/{contractId}/confirm` | ContractController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-110 | Xác nhận vào ở theo nhóm/từng người | POST | `/api/v1/contracts/{contractId}/move-ins` | ContractController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-111 | Hủy hợp đồng trước vào ở | POST | `/api/v1/contracts/{contractId}/cancel` | ContractController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-112 | Hủy thành viên dự kiến chưa đến | POST | `/api/v1/contracts/{contractId}/members/{memberId}/cancel` | ContractController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-113 | Nhập hợp đồng giấy có chứng cứ | POST | `/api/v1/contract-imports` | ContractController.java:17 | Chưa khả dụng: Nhập hợp đồng giấy và thành viên hiện chưa khả dụng. |
| API-114 | Danh sách và lịch sử người ở quản lý | GET | `/api/v1/residents` | ResidentController.java:5 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-115 | Thành viên của hợp đồng | GET | `/api/v1/contracts/{contractId}/members` | ResidentController.java:6 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-116 | Xuất danh sách cư dân đang ở | GET | `/api/v1/residents/export` | ResidentController.java:7 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-117 | Yêu cầu thêm người trong phạm vi được xem | GET | `/api/v1/occupant-join-requests` | ResidentController.java:8 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-118 | Đại diện đề nghị thêm người | POST | `/api/v1/occupant-join-requests` | ResidentController.java:9 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-119 | Ghi đồng ý riêng của đại diện hoặc người xin vào | POST | `/api/v1/occupant-join-requests/{requestId}/consents` | ResidentController.java:10 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-120 | Rút yêu cầu chưa được duyệt | POST | `/api/v1/occupant-join-requests/{requestId}/cancel` | ResidentController.java:11 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-121 | Chủ trọ duyệt và giữ một chỗ 48 giờ | POST | `/api/v1/occupant-join-requests/{requestId}/approve` | ResidentController.java:12 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-122 | Chủ trọ từ chối thêm người | POST | `/api/v1/occupant-join-requests/{requestId}/reject` | ResidentController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-123 | Chủ trọ hủy giữ chỗ đã duyệt | POST | `/api/v1/occupant-join-requests/{requestId}/cancel-hold` | ResidentController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-124 | Hoàn tất vào ở từ giữ chỗ | POST | `/api/v1/occupant-join-requests/{requestId}/complete` | ResidentController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-125 | Ghi nhận thành viên thực tế rời | POST | `/api/v1/contracts/{contractId}/members/{memberId}/move-out` | ResidentController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-126 | Người đủ điều kiện nhận đại diện | GET | `/api/v1/contracts/{contractId}/representative-candidates` | ResidentController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-127 | Lịch sử đại diện theo giai đoạn | GET | `/api/v1/contracts/{contractId}/representative-history` | ResidentController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-128 | Bàn giao và ghi người cũ rời | POST | `/api/v1/contracts/{contractId}/representative-handovers` | ResidentController.java:19 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-129 | Lịch sử yêu cầu điều chỉnh hợp đồng | GET | `/api/v1/contracts/{contractId}/change-requests` | ContractChangeController.java:19 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-130 | Gửi yêu cầu gia hạn/đổi phòng/chấm dứt | POST | `/api/v1/contracts/{contractId}/change-requests` | ContractChangeController.java:24 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-131 | Đọc phương án điều chỉnh | GET | `/api/v1/contract-change-requests/{requestId}` | ContractChangeController.java:30 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-132 | Chủ trọ duyệt/từ chối phương án | POST | `/api/v1/contract-change-requests/{requestId}/decision` | ContractChangeController.java:35 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-133 | Đại diện xác nhận đúng phương án | POST | `/api/v1/contract-change-requests/{requestId}/confirm` | ContractChangeController.java:41 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-134 | Hủy yêu cầu điều chỉnh còn mở | POST | `/api/v1/contract-change-requests/{requestId}/cancel` | ContractChangeController.java:47 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-135 | Áp dụng yêu cầu đã đủ xác nhận | POST | `/api/v1/contract-change-requests/{requestId}/apply` | ContractChangeController.java:53 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-136 | Phòng đích có thể chuyển toàn bộ nhóm | GET | `/api/v1/contracts/{contractId}/transfer-options` | ContractChangeController.java:58 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-137 | Danh mục dịch vụ cho cấu hình | GET | `/api/v1/rental-services` | BillingController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-138 | Quản trị bổ sung danh mục dịch vụ | POST | `/api/v1/admin/rental-services` | BillingController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-139 | Sửa nội dung mẫu dịch vụ | PATCH | `/api/v1/admin/rental-services/{serviceId}` | BillingController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-140 | Cấu hình dịch vụ của nhà | GET | `/api/v1/houses/{houseId}/services` | BillingController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-141 | Thêm dịch vụ vào nhà | POST | `/api/v1/houses/{houseId}/services` | BillingController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-142 | Sửa/bật/ngừng dịch vụ nhà | PATCH | `/api/v1/houses/{houseId}/services/{houseServiceId}` | BillingController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-143 | Gán hoặc đổi giá dịch vụ tại phòng | PUT | `/api/v1/rooms/{roomId}/service-settings/{houseServiceId}` | BillingController.java:19 | Chưa khả dụng: Lưu giá dịch vụ riêng của phòng hiện chưa khả dụng. |
| API-144 | Cấu hình dịch vụ phòng để quản lý | GET | `/api/v1/rooms/{roomId}/service-settings` | BillingController.java:20 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-145 | Danh sách hóa đơn được xem | GET | `/api/v1/invoices` | BillingController.java:21 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-146 | Chi tiết dòng tiền và người trả tại kỳ lập | GET | `/api/v1/invoices/{invoiceId}` | BillingController.java:22 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-147 | Lập hóa đơn nháp theo kỳ | POST | `/api/v1/invoices` | BillingController.java:23 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-148 | Sửa toàn bộ nội dung hóa đơn nháp | PATCH | `/api/v1/invoices/{invoiceId}` | BillingController.java:24 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-149 | Phát hành hóa đơn có dòng tiền | POST | `/api/v1/invoices/{invoiceId}/issue` | BillingController.java:25 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-150 | Ghi nhận chủ trọ đã thu đủ | POST | `/api/v1/invoices/{invoiceId}/payment-confirmation` | BillingController.java:26 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-151 | Hủy hóa đơn phát hành chưa thu | POST | `/api/v1/invoices/{invoiceId}/cancel` | BillingController.java:27 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-152 | Lập bản nháp thay hóa đơn đã hủy | POST | `/api/v1/invoices/{invoiceId}/replacements` | BillingController.java:28 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-153 | Đánh giá phòng được công khai | GET | `/api/v1/rooms/{roomId}/reviews` | AdminController.java:4 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-154 | Đánh giá bằng lượt cư trú thực tế | POST | `/api/v1/reviews` | AdminController.java:5 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-155 | Ẩn/khôi phục/xóa mềm đánh giá | POST | `/api/v1/admin/reviews/{reviewId}/moderation` | AdminController.java:6 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-156 | Gửi báo cáo hoặc tranh chấp | POST | `/api/v1/reports` | AdminController.java:7 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-157 | Báo cáo mình đã gửi và kết luận | GET | `/api/v1/me/reports` | AdminController.java:8 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-158 | Hàng đợi báo cáo | GET | `/api/v1/admin/reports` | AdminController.java:9 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-159 | Chi tiết báo cáo và bằng chứng | GET | `/api/v1/admin/reports/{reportId}` | AdminController.java:10 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-160 | Điều tra hoặc kết luận báo cáo | POST | `/api/v1/admin/reports/{reportId}/decision` | AdminController.java:11 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-161 | Quản lý tài khoản và vai trò | GET | `/api/v1/admin/users` | AdminController.java:12 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-162 | Chi tiết trạng thái tài khoản | GET | `/api/v1/admin/users/{userId}` | AdminController.java:13 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-163 | Khóa tài khoản có lý do | POST | `/api/v1/admin/users/{userId}/lock` | AdminController.java:14 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-164 | Mở khóa tài khoản | POST | `/api/v1/admin/users/{userId}/unlock` | AdminController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-165 | Mẫu hợp đồng theo phiên bản | GET | `/api/v1/contract-templates` | AdminController.java:16 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-166 | Tạo mẫu hoặc phiên bản tiếp theo | POST | `/api/v1/admin/contract-templates` | AdminController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-167 | Bật/ngừng phiên bản mẫu | PATCH | `/api/v1/admin/contract-templates/{templateId}` | AdminController.java:18 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-168 | Tra nhật ký quyết định | GET | `/api/v1/admin/moderation-actions` | AdminController.java:19 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-169 | Chi tiết quyết định trước/sau | GET | `/api/v1/admin/moderation-actions/{actionId}` | AdminController.java:20 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-170 | Xin phiên upload theo mục đích | POST | `/api/v1/files/upload-sessions` | IntegrationController.java:13 | Chưa khả dụng: Tải nội dung tệp lên hiện chưa khả dụng. |
| API-171 | Xác minh tệp upload hoàn tất | POST | `/api/v1/files/{fileId}/complete` | IntegrationController.java:14 | Chưa khả dụng: Xác nhận nội dung tệp hiện chưa khả dụng. |
| API-172 | Metadata tệp được phép xem | GET | `/api/v1/files/{fileId}` | IntegrationController.java:15 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-173 | Cấp URL đọc riêng tư có hạn | POST | `/api/v1/files/{fileId}/download-links` | IntegrationController.java:16 | Chưa khả dụng: Tải nội dung tệp về hiện chưa khả dụng. |
| API-174 | Xóa mềm tệp chưa bị giữ làm chứng cứ | DELETE | `/api/v1/files/{fileId}` | IntegrationController.java:17 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-175 | Tổng quan quản lý nhà trọ | GET | `/api/v1/landlord/dashboard` | HouseController.java:36 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
| API-176 | Tổng quan hàng đợi quản trị | GET | `/api/v1/admin/dashboard` | AdminController.java:21 | Đã nối lớp gọi BE; cần nghiệm thu nghiệp vụ với DB |
