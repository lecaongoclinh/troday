# Trọday Backend

Java 21 · Spring Boot 3.5.16 · Maven Wrapper 3.3.4 / Maven 3.9.9 · Spring JDBC · MySQL.

Các phiên bản được pin trong `pom.xml` và `.mvn/wrapper/maven-wrapper.properties`. Spring Boot quản lý phiên bản của các starter, driver MySQL và thư viện test.

## Phần đã triển khai

- 9 API tài khoản/phiên: đăng ký, đăng nhập, refresh, logout, `/me`, profile/cài đặt thông báo, liệt kê/thu hồi phiên. [Contract và ví dụ request](docs/contracts/auth.md).
- [43 model và 43 JDBC RowMapper](docs/models.md) cho SQL nguồn, gồm nullable/enum/JSON/decimal/UTC và cột generated/ALTER.
- BCrypt, JWT gắn session, refresh cookie HttpOnly, kiểm tra vai trò/status, Origin/CORS, rate limit và idempotency lưu MySQL có mã hóa.

Trước khi chạy: tạo database mới từ `database/source/schema.sql`, áp dụng `database/migrations/V001__api_idempotency.sql` theo [hướng dẫn DB](../database/README.md). Đặt `AUTH_SECRET` ≥32 byte ngẫu nhiên cùng các biến DB. OTP/reset mật khẩu/xét duyệt danh tính thuộc task tiếp theo.

## Cấu trúc

```text
BE/
├── pom.xml
├── mvnw / mvnw.cmd / .mvn/wrapper/
├── docs/contracts/                     # Contract API theo endpoint
├── src/main/java/com/troday/
│   ├── TrodayApplication.java
│   ├── config/                         # Cấu hình toàn ứng dụng
│   ├── controller/                     # REST endpoint
│   ├── dto/
│   │   ├── request/                    # Dữ liệu đầu vào, validation
│   │   └── response/                   # Dữ liệu trả về, response chung
│   ├── exception/                      # Exception và xử lý lỗi tập trung
│   ├── integration/                    # Client/gateway tới dịch vụ bên ngoài
│   ├── model/                          # Đối tượng nghiệp vụ và dữ liệu JDBC
│   ├── repository/                     # Truy vấn và lưu dữ liệu
│   │   ├── mapper/                     # JDBC RowMapper
│   │   └── procedure/                  # Gateway gọi stored procedure
│   ├── security/                       # Xác thực, phân quyền, principal, filter
│   ├── service/                        # Nghiệp vụ và điều phối transaction
│   └── util/                           # Hàm tiện ích dùng chung
├── src/main/resources/
│   ├── application.yml
│   └── application-local.yml
├── src/test/java/com/troday/
│   ├── TrodayApplicationTests.java      # Smoke test Spring context và Security
│   ├── config/ controller/ exception/ repository/ security/ service/
│   ├── integration/                    # Kiểm thử tích hợp
│   ├── contract/                       # Kiểm thử contract API
│   ├── e2e/                            # Kiểm thử luồng xuyên suốt
│   └── support/fixtures/               # Dữ liệu và helper dùng chung cho test
├── src/test/resources/
│   ├── application-test.yml
│   └── sql/                            # SQL fixture cho kiểm thử MySQL
└── target/                             # Output Maven, Git bỏ qua
```

Tổ chức package theo tầng kỹ thuật. Các lớp của mọi chức năng được đặt trực tiếp vào tầng tương ứng, ví dụ `controller/PropertyController.java`, `service/PropertyService.java`, `repository/PropertyRepository.java`, `repository/mapper/PropertyRowMapper.java`, `model/Property.java`, `dto/request/CreatePropertyRequest.java` và `dto/response/PropertyResponse.java`. Đây là ví dụ đặt tên cho mã sẽ triển khai; hiện chưa có các lớp này.

Luồng chính: Controller → Service → Repository / Procedure gateway → MySQL. Controller nhận request và trả response; service xử lý nghiệp vụ, gọi repository hoặc gateway bên ngoài trong `integration`. Dùng constructor injection. Các lớp xác thực đặt trong `security`, cấu hình bean nằm trong `config` (bao gồm `SecurityConfig`). `model` dùng với Spring JDBC, không yêu cầu entity JPA.

Test cho từng lớp đặt vào package tương ứng, ví dụ `service/PropertyServiceTests.java`. Test tích hợp, contract và e2e đặt theo loại kiểm thử; fixture dùng chung nằm trong `support/fixtures` và `src/test/resources/sql`. Đặt tên lớp/tệp theo chức năng để phân biệt trong cùng một tầng, không tạo lại cây thư mục theo chức năng hoặc theo người phụ trách.

`TrodayApplication` ở package gốc `com.troday` để Spring tự quét bean. Các tệp `.gitkeep` giữ thư mục rỗng. API tài khoản/phiên, model và RowMapper đã có mã; contract hiện tại nằm trong `docs/contracts/auth.md`.

## Phân công theo kế hoạch

| Người | Phạm vi |
| --- | --- |
| A | Cấu hình, hạ tầng dùng chung, xác thực, tệp, tin nhắn, thông báo, thanh toán, quản trị tài khoản, nhật ký, dashboard quản trị; POM, Wrapper, profile |
| B | Nhà/phòng, quyền quản lý nhà, tin đăng, dịch vụ, lịch xem, tìm bạn ở ghép, đánh giá, báo cáo |
| C | Hợp đồng thuê, phiên bản hợp đồng, cư dân, yêu cầu tham gia, thay đổi, người đại diện, mẫu hợp đồng, liên kết cư trú |

Phân công theo chức năng; mỗi người thêm lớp vào các tầng tương ứng và cập nhật contract, test, fixture liên quan. `docs/contracts` dùng chung cho cả nhóm.

### Thứ tự chuẩn bị phần dùng chung trước service nghiệp vụ

Đề xuất làm nền tảng chung trước, rồi chuẩn bị dữ liệu vừa đủ cho từng nhóm chức năng. Với mỗi nhóm, thực hiện **chốt contract → model/projection → RowMapper → repository/query → hàm dùng chung cần thiết → service → controller → kiểm thử luồng**. Model/repository của toàn bộ hệ thống không phải điều kiện để bắt đầu service đầu tiên.

| Thứ tự | Phần cần bàn giao | Ví dụ file/hàm | Phụ trách / mốc |
| --- | --- | --- | --- |
| 1 | Contract, kiểu dữ liệu, lỗi, phân trang | Field/nullable/status từ SQL; ID JSON, tiền, ngày giờ; chữ ký query và consumer | B01, C01 phân tích; A02 chốt |
| 2 | Nền tảng toàn hệ thống | `ApiResponse`, `PageMeta`, `PageQuery`, `DomainException`, `GlobalExceptionHandler`, `ActorContext`, `ClockConfig`, `StoredProcedureGateway` | A, trước các consumer của A02 |
| 3 | Model/projection của nhóm đang làm | `User`, `FileMetadata`, `House`, `Room`, `RoomSnapshot`, `ServiceQuote`, `ContractSnapshot`, `ActiveStay` | Owner tương ứng; thêm khi luồng cần |
| 4 | Mapper và query cụ thể | `UserRowMapper.mapRow`, `UserRepository.findByLogin`, `HouseRepository.findOwnedById`, `ServiceQuoteRepository.findEffectiveByRoomId` | A: danh tính/tệp; B: nhà/dịch vụ; C: cư trú |
| 5 | Hàm được nhiều luồng sử dụng | `FilePort.assertUsable`, `TokenPort.consume`, `PropertyReadPort.getRentalSnapshot`, `ResidencyReadPort.getActiveStay`, `AuditPort.append`, `EventPort.append` | Theo provider/task đã phân; implementation và test phải sẵn trước consumer |
| 6 | Luồng nghiệp vụ đầy đủ | `AuthService.login` → `FileService.completeUpload` → `HouseService.createHouse` → `ContractService.submit` → `InvoiceService.createDraft` là các ví dụ theo thứ tự task hiện có | Owner luồng viết service/controller và kiểm thử |

Bước 3–6 lặp lại theo nhóm chức năng; các tên file/hàm trên là đề xuất, chưa phải mã nghiệp vụ đã có. `model` chứa dữ liệu nội bộ/projection; `dto/response` chỉ trả field được phép công khai. RowMapper dùng lại cho các query có cùng cấu trúc kết quả, repository cung cấp truy vấn cụ thể theo nhu cầu.

Ví dụ `InvoiceService.createDraft` chỉ bắt đầu khi báo giá dịch vụ của B và snapshot cư trú/người trả của C đã có implementation và test. Service này đọc hai nguồn, tính tiền rồi lưu invoice/items cùng snapshot trong một transaction. Các luồng gọi procedure tự `START TRANSACTION`/`COMMIT` dùng gateway riêng theo quy ước CSDL bên dưới.

Trước khi viết service, cần chốt chữ ký hàm và quyền theo actor/tài nguyên; có model/mapper/query đã kiểm tra, một chủ transaction rõ ràng và các ca sai quyền, dữ liệu cũ, rollback/retry liên quan. Mỗi owner làm phần dữ liệu và luồng chức năng của mình; A giữ hạ tầng chung. Chỉ bổ sung `BaseRepository`/helper chung khi có nhu cầu thực tế, tránh viết sẵn CRUD cho mọi bảng hoặc gom mọi nghiệp vụ vào một service dùng chung.

## Kiểm tra build

Cần JDK 21 trở lên. `JAVA_HOME` phải trỏ tới thư mục JDK, ví dụ `C:\Program Files\Java\jdk-21`, không trỏ vào `bin`. Lần đầu chạy cần Internet để tải Maven và dependency.

Máy hiện tại đã có JDK 23 nhưng `JAVA_HOME` đang trỏ vào `bin`. Trước khi chạy Wrapper trong PowerShell, sửa cho phiên terminal hiện tại:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-23'
```

```powershell
.\mvnw.cmd test
.\mvnw.cmd verify
```

Linux/macOS:

```sh
./mvnw test
./mvnw verify
```

Smoke test dùng profile `test` không truy cập MySQL. Unit test kiểm tra JWT, expiry/tamper, mã hóa và rate limit. Integration test chạy trên MySQL thật khi có `TRODAY_MYSQL_TEST_URL`; `scripts/test-mysql.py` tự tạo instance độc lập, import SQL, chạy `verify` rồi dừng instance. Không dùng H2 thay trigger/procedure MySQL.

```powershell
python scripts/generate-models.py --check
python scripts/test-mysql.py
```

Script test cần bộ binary MySQL; tùy chỉnh `--mysql-bin` và `--maven` nếu chưa có trong PATH/vị trí mặc định. Maven Wrapper đã xử lý trường hợp thư mục `.m2` thường không có symlink Target trên Windows PowerShell.

POM nạp Mockito agent khi JVM test khởi động, theo [hướng dẫn Mockito cho Java 21+](https://javadoc.io/doc/org.mockito/mockito-core/latest/org.mockito/org/mockito/Mockito.html#0.3), tránh phụ thuộc cơ chế tự attach agent trên máy phát triển.

## Chạy local

Chuẩn bị MySQL và schema theo [hướng dẫn database](../database/README.md). `.env.example` chỉ liệt kê biến mẫu; Spring Boot không tự đọc `.env`.

Thiết lập biến trong PowerShell, thay bằng cấu hình local của bạn:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/room_rental_v5_20261023?connectionTimeZone=UTC'
$env:DB_USERNAME = 'troday'
$env:DB_PASSWORD = 'your-local-password'
$authRandom = [byte[]]::new(48)
$authRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$authRng.GetBytes($authRandom)
$authRng.Dispose()
$env:AUTH_SECRET = [Convert]::ToBase64String($authRandom)
$env:AUTH_ALLOWED_ORIGINS = 'http://localhost:5173'
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=local'
```

Ứng dụng dùng cổng 8080, có thể đổi qua `SERVER_PORT`. Các route công khai chỉ gồm POST register/login/refresh; route khác cần xác thực và quyền theo cấu hình. Lưu AUTH_SECRET cố định trong cấu hình riêng khi cần giữ phiên qua lần restart; thay secret vô hiệu hóa access token và khiến cache idempotency cũ không giải mã được, cần dọn cache tương ứng khi luân chuyển khóa.

## Quy ước CSDL

Dùng `NamedParameterJdbcTemplate` cho truy vấn/CRUD, `SimpleJdbcCall` hoặc `CallableStatement` cho procedure hiện có. Không tự tạo/cập nhật schema bằng ORM và không chạy SQL khởi tạo khi ứng dụng khởi động.

Service tự ghi nhiều bảng dùng transaction Spring. Procedure tự `START TRANSACTION`/`COMMIT` cần gateway bean riêng với `Propagation.NEVER` khi được triển khai; tránh bọc bằng transaction Spring hoặc self-invocation bỏ qua proxy.

Tiền dùng `BigDecimal`, ID JSON dùng chuỗi theo đặc tả; thời điểm dùng UTC `Instant`, ngày nghiệp vụ dùng `LocalDate` theo Việt Nam.

## Tài liệu nền tảng

- [Yêu cầu hệ thống Spring Boot 3.5](https://docs.spring.io/spring-boot/3.5/system-requirements.html)
- [Apache Maven Wrapper](https://maven.apache.org/tools/wrapper/)
