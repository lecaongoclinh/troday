# Trọday Backend

Java 21 · Spring Boot 3.5.16 · Maven Wrapper 3.3.4 / Maven 3.9.9 · Spring JDBC · MySQL.

Các phiên bản được pin trong `pom.xml` và `.mvn/wrapper/maven-wrapper.properties`. Spring Boot quản lý phiên bản của các starter, driver MySQL và thư viện test.

## Cấu trúc

```text
BE/
├── pom.xml
├── mvnw / mvnw.cmd / .mvn/wrapper/
├── docs/contracts/                     # Contract API theo module
├── src/main/java/com/troday/
│   ├── TrodayApplication.java
│   ├── config/                         # Cấu hình toàn ứng dụng
│   ├── shared/                         # api, error, security, transaction,
│   │                                   # audit, event, idempotency, time
│   ├── identity/ files/ messaging/ notifications/ billing/
│   ├── accountadmin/ audit/ admindashboard/
│   ├── properties/ houserights/ posts/ services/
│   ├── viewings/ roommates/ reviews/ reports/
│   └── rentals/
│       ├── contracts/ revisions/ residents/ joins/
│       └── changes/ representatives/ templates/ residencylink/
├── src/main/resources/
│   ├── application.yml
│   └── application-local.yml
├── src/test/java/com/troday/             # Test theo module, contract, e2e, fixture
├── src/test/resources/                  # Profile test và SQL fixture theo A/B/C
└── target/                             # Output Maven, Git bỏ qua
```

Mỗi chức năng có `controller`, `dto/request`, `dto/response`, `service`, `repository/mapper`, `domain`, `port`, `adapter`. Các tệp `.gitkeep` giữ thư mục rỗng trong Git; xóa chúng khi thư mục có mã thật.

Luồng chính: Controller → Service → Repository / Procedure adapter → MySQL. Các module gọi nhau qua Java port; dùng constructor injection. `TrodayApplication` ở package gốc `com.troday` để Spring tự quét bean.

## Phân công theo kế hoạch

| Người | Phạm vi |
| --- | --- |
| A | `config`, `shared`, identity, files, messaging, notifications, billing, accountadmin, audit, admindashboard; POM, Wrapper, profile |
| B | properties, houserights, posts, services, viewings, roommates, reviews, reports |
| C | rentals và các package con |

`docs/contracts`, test và fixture theo cùng phạm vi. Các thư mục này là khung để phát triển, chưa có API nghiệp vụ hay contract đã chốt.

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

Smoke test tải Spring context và kiểm tra yêu cầu API chưa xác thực trả 401. Profile `test` tắt datasource nên không truy cập MySQL. Chưa có kiểm thử SQL tích hợp; khi triển khai cần MySQL test độc lập, không dùng H2 thay trigger/procedure MySQL. Hiện `verify` chạy smoke test và đóng gói JAR.

POM nạp Mockito agent khi JVM test khởi động, theo [hướng dẫn Mockito cho Java 21+](https://javadoc.io/doc/org.mockito/mockito-core/latest/org.mockito/org/mockito/Mockito.html#0.3), tránh phụ thuộc cơ chế tự attach agent trên máy phát triển.

## Chạy local

Chuẩn bị MySQL và schema theo [hướng dẫn database](../database/README.md). `.env.example` chỉ liệt kê biến mẫu; Spring Boot không tự đọc `.env`.

Thiết lập biến trong PowerShell, thay bằng cấu hình local của bạn:

```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/room_rental_v5_20261023?connectionTimeZone=UTC'
$env:DB_USERNAME = 'troday'
$env:DB_PASSWORD = 'your-local-password'
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=local'
```

Ứng dụng dùng cổng 8080, có thể đổi qua `SERVER_PORT`. Khung Security mặc định từ chối truy cập; xác thực và các route công khai sẽ được triển khai theo BE-A03.

## Quy ước CSDL

Dùng `NamedParameterJdbcTemplate` cho truy vấn/CRUD, `SimpleJdbcCall` hoặc `CallableStatement` cho procedure hiện có. Không tự tạo/cập nhật schema bằng ORM và không chạy SQL khởi tạo khi ứng dụng khởi động.

Service tự ghi nhiều bảng dùng transaction Spring. Procedure tự `START TRANSACTION`/`COMMIT` cần gateway bean riêng với `Propagation.NEVER` khi được triển khai; tránh bọc bằng transaction Spring hoặc self-invocation bỏ qua proxy.

Tiền dùng `BigDecimal`, ID JSON dùng chuỗi theo đặc tả; thời điểm dùng UTC `Instant`, ngày nghiệp vụ dùng `LocalDate` theo Việt Nam.

## Tài liệu nền tảng

- [Yêu cầu hệ thống Spring Boot 3.5](https://docs.spring.io/spring-boot/3.5/system-requirements.html)
- [Apache Maven Wrapper](https://maven.apache.org/tools/wrapper/)
