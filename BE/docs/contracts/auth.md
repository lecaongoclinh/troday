# Contract tài khoản và phiên

Triển khai API-001–005 và API-018–021 theo danh mục API 2026-10-29. Base path `/api/v1`, JSON UTF-8. OTP, reset mật khẩu và xét duyệt danh tính thuộc các task tiếp theo.

| Method | Path | Input | `data` |
| --- | --- | --- | --- |
| POST | `/auth/register` | `fullName,password`, ít nhất một `email/phoneNumber` | 201 User |
| POST | `/auth/login` | `identifier,password` | `{accessToken,expiresAt,user}` + refresh cookie |
| POST | `/auth/refresh` | Refresh cookie, Origin | `{accessToken,expiresAt,user}` + cookie mới |
| POST | `/auth/logout` | Bearer, Origin | `{revoked:true}` + xóa cookie |
| GET | `/me` | Bearer | User/profile/settings |
| GET | `/me/sessions` | Bearer; page=1,pageSize=20,sort=-createdAt | Session[] + meta.pagination |
| DELETE | `/me/sessions/{sessionId}` | Bearer | `{id,revoked:true}` |
| PATCH | `/me/profile` | Bearer; fullName bắt buộc, address/gender/occupation/university/bio/avatarFileId tùy chọn | Profile |
| PATCH | `/me/notification-settings` | Bearer; ít nhất một inAppEnabled/emailEnabled/pushEnabled boolean | NotificationSettings |

Các POST cần header `Idempotency-Key: <UUID>`. Bearer là `Authorization: Bearer <accessToken>`. Refresh token chỉ nằm trong cookie `troday_refresh`: HttpOnly, Secure mặc định, SameSite=Strict, Path=/api/v1/auth. FE dùng `credentials: 'include'`. Local HTTP dùng profile `local` với Secure=false. Refresh/logout bắt buộc header `Origin` khớp `AUTH_ALLOWED_ORIGINS`, kể cả khi gọi CLI.

Ví dụ đăng ký:

```json
{"fullName":"Nguyễn Thị Lan","email":"lan@example.com","phoneNumber":"0901234567","password":"example-password-change-me"}
```

Ví dụ đăng nhập:

```json
{"identifier":"lan@example.com","password":"example-password-change-me"}
```

Email trim/lowercase, ≤150 ký tự. Số Việt Nam `0901234567`, `+84901234567`, `0084901234567` đều lưu `+84901234567`; quốc tế dùng E.164 (8–15 chữ số). Cần ít nhất một contact. Họ tên trim, 1–150 ký tự. Mật khẩu ≥10 ký tự và ≤72 byte UTF-8; bcrypt cost=12. Đăng ký tạo `users` ACTIVE/TENANT + `tenants` + `personal_profiles` trong một transaction; phoneVerifiedAt giữ null. Không nhận role/status/actorId hoặc field ngoài whitelist.

User trả id chuỗi, fullName/email/phoneNumber/roles/status/phoneVerifiedAt/profile/notificationSettings. Profile gồm id/avatarFileId/address/gender/occupation/university/bio; ID dùng chuỗi, field nullable giữ null. Vai trò lấy từ tenants/landlords/admins; không dùng users.role để cấp quyền. Không trả password/session/refresh hash hoặc thông tin khóa nội bộ.

## Chính sách xác thực

- `AUTH_SECRET` bắt buộc ≥32 byte UTF-8 ngẫu nhiên; không có khóa mặc định cho runtime. Access JWT HS256 có issuer=troday, sub, sid, exp/nbf/iat/jti. TTL mặc định 15 phút, không vượt hạn phiên. Mỗi request đọc lại session, user ACTIVE và bảng vai trò.
- Refresh ngẫu nhiên 256 bit, DB chỉ lưu HMAC-SHA256, hạn tuyệt đối 30 ngày. Refresh khóa phiên và thay hash nguyên tử. Dùng token cũ với key mới trả 401. Thu hồi phiên chặn cả access/refresh ở request kế tiếp.
- Rate limit theo instance: 10 login/identifier/15 phút, 30 lần/endpoint/IP/15 phút; 429 có Retry-After. Không tin X-Forwarded-For. Nhiều replica cần hạn mức chung ở gateway/store phân tán.
- Idempotency lưu 24 giờ trong api_idempotency. Scope actor (hoặc public)+method+route+UUID. Fingerprint HMAC; response/cookie mã hóa AES-GCM. Business write và cache cùng commit. Cùng key/body trả lại status/body/cookie; khác body trả 409. Duplicate đồng thời chờ khóa DB; timeout trả 409 REQUEST_IN_PROGRESS. Lần đăng nhập/refresh mới dùng key mới; retry giữ key và refresh cookie gốc.
- Session list chỉ chứa id/createdAt/lastSeenAt/expiresAt/revokedAt/isCurrent. page≥1, pageSize 1–100; sort chỉ createdAt/-createdAt, tie-breaker id. Phiên ngoài scope trả 404; thu hồi lặp trả 200 khi actor còn phiên hợp lệ.
- Sai mật khẩu/tài khoản không có cùng trả 401. LOCKED/DISABLED trả 403 sau khi mật khẩu đúng hoặc khi dùng token. Route chưa triển khai bị từ chối mặc định.

Profile: bỏ field tùy chọn giữ nguyên; null xóa field nullable. Không sửa contact/role/status. Bio ≤10.000 ký tự và 65.535 byte; avatar phải là AVATAR ACTIVE của actor. Chưa có provider email/push: bật emailEnabled/pushEnabled trả 422, vẫn có thể tắt hoặc đổi in-app.

## Envelope / lỗi

```json
{"data":{"id":"123"},"meta":{"requestId":"uuid","timestamp":"2026-11-03T00:00:00Z","pagination":null},"error":null}
```

```json
{"data":null,"meta":{"requestId":"uuid","timestamp":"2026-11-03T00:00:00Z","pagination":null},"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu không hợp lệ.","details":[{"field":"email","code":"VALIDATION_ERROR","message":"Email không hợp lệ."}]}}
```

400 BAD_REQUEST: JSON/type/field/key sai. 401 UNAUTHENTICATED. 403 FORBIDDEN: Origin/quyền/status. 404 RESOURCE_NOT_FOUND. 409 STATE_CONFLICT/IDEMPOTENCY_KEY_REUSED/REQUEST_IN_PROGRESS. 422 VALIDATION_ERROR. 429 RATE_LIMITED. 503 DEPENDENCY_UNAVAILABLE. 500 INTERNAL_ERROR. Không trả SQL hoặc stack trace.

## Kiểm thử

`mvnw test` chạy smoke + JWT/tamper/expiry, mã hóa, rate limit. MySQL tests bỏ qua nếu thiếu TRODAY_MYSQL_TEST_URL. `scripts/test-mysql.py` tạo instance MySQL mới trên cổng ngẫu nhiên, import schema/migration, chạy verify và dừng instance. Không kết nối MySQL đang dùng; data/log test được giữ ở temp riêng. Có thể cấp TRODAY_MYSQL_TEST_URL/USERNAME/PASSWORD để chạy trên DB test đã chuẩn bị; dùng DB riêng vì test ghi dữ liệu và tạo/xóa trigger kiểm tra rollback.

Tham khảo: [Spring Security JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html), [Spring JDBC](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html).
