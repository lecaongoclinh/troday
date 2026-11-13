# Môi trường phát triển dùng chung

## Quy ước

- Chạy lệnh Compose từ gốc repo, giữ cả `BE`, `FE_Web`, `FE_Mobile`, `shared` và `docker` khi clone.
- Java 17, Maven 3.9, Node 24, MySQL 8.4 và Nginx 1.28 được chọn trong Dockerfile; package-lock khóa dependencies FE, cài bằng `npm ci`.
- Docker không đọc cấu hình riêng `BE/.env`, `FE_Web/.env`, `FE_Mobile/.env`: các file này bị loại khỏi build context. Không đóng gói mật khẩu máy cá nhân vào image.
- Compose đọc `.env` gốc, truyền DB credentials qua environment vào BE; BE kết nối hostname `db` trong mạng Docker. Trên máy host, API dùng `localhost:8081`.
- Web build không gắn IP backend; Nginx chuyển `/api/**` tới `api:8081`. Mở Web từ máy khác cũng không phải sửa URL trong source.
- `.env.example` chỉ chứa giá trị phát triển mẫu, không có thông tin máy cá nhân.

## Lần chạy đầu

Cài Docker Desktop với WSL2/Linux containers theo hướng dẫn chính thức của Docker. Mở Docker Desktop trước khi chạy. Cần Git; Node 24 chỉ cần nếu chạy Expo hoặc script kiểm tra.

```powershell
cp .env.example .env
docker compose config --quiet
docker compose up --build -d --wait --wait-timeout 300
docker compose ps
```

Compose chờ MySQL nạp schema xong mới bật BE, chờ BE đáp ứng mới bật Web. Lần build đầu có thể lâu do tải image/dependencies; thời gian `--wait-timeout` tính cho giai đoạn chờ services sẵn sàng.

```powershell
docker compose logs --tail 100 db api web
```

Không cần import SQL thủ công. `docker/mysql/Dockerfile` lấy schema từ `BE/schema.sql`, bỏ `CREATE DATABASE`/`USE` vì image MySQL đã tạo DB theo `MYSQL_DATABASE`, sau đó chèn ba tài khoản demo. Không dùng `database/source/schema.sql` thay schema BE.

SQL khởi tạo chỉ chạy khi volume mới hoàn toàn. Sửa schema/seed rồi build lại không cập nhật DB đã tồn tại: cần migration được xem xét riêng. Thay mật khẩu `.env` cũng không tự đổi mật khẩu của DB volume cũ.

## Cấu hình

| Biến trong `.env` gốc | Mục đích |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Tách bộ container/network/volume, mặc định `troday` |
| `API_PORT` | Cổng host cho BE, mặc định `8081` |
| `WEB_PORT` | Cổng host cho Web, mặc định `5173` |
| `MYSQL_USER`, `MYSQL_PASSWORD` | Tài khoản ứng dụng của DB Docker mới |
| `MYSQL_ROOT_PASSWORD` | Mật khẩu root của DB Docker mới |
| `LAN_IP` | IP máy tính cho Expo trên điện thoại; bỏ trống để tự dò |
| `EXPO_PUBLIC_API_BASE_URL` | Ghi đè URL API của Mobile, phải gồm `/api/v1` |
| `CORS_ALLOWED_ORIGINS` | Origin bổ sung nếu mở Expo Web từ địa chỉ/cổng khác |

MySQL không mở cổng ra host để tránh xung đột MySQL có sẵn. Nếu cần truy vấn DB Docker, dùng `docker compose exec db mysql -u troday -p room_rental_v5_20261023`; mật khẩu ứng dụng nằm trong `.env` của bạn.

Ví dụ khi 8081 đang có BE chạy tay: đổi `API_PORT=18081` trong `.env`, chạy lại Compose. Web vẫn dùng proxy nội bộ, Mobile launcher tự dùng port mới. Không cần tắt BE đang chạy tay hoặc đổi cổng trong Java.

## Mobile

```powershell
npm run setup
npm run mobile:web
```

`setup` giữ nguyên `.env` đã có, cài Mobile bằng lockfile. Trình duyệt mở localhost:8082; không phải nhập URL trong màn hình Kết nối. Muốn kiểm tra UI dạng điện thoại để chia sẻ màn hình, mở DevTools và bật chế độ thiết bị.

Dừng Expo/Metro trước khi chạy lại `setup`: Windows không cho `npm ci` thay thư viện ngrok nếu `ngrok.exe` vẫn đang chạy. Lỗi `EPERM unlink ...ngrok.exe` cần đóng terminal Expo/tunnel của repo rồi chạy lại lệnh.

`npm run mobile` tự lấy IPv4 LAN, bỏ qua loopback và các card mạng ảo thông dụng. Nếu chọn sai card mạng, khai báo `LAN_IP` rồi chạy lại. Điện thoại cần cùng mạng và truy cập được cổng API đã mở trên host. `mobile:tunnel` chỉ chuyển đường truyền Expo, không đưa BE lên Internet.

Thứ tự cấu hình URL Mobile: biến môi trường terminal → `FE_Mobile/.env` → `.env` gốc → địa chỉ tự dò. Khi dùng URL tự dò, chế độ Web dùng `127.0.0.1`, Android Emulator dùng `10.0.2.2`, điện thoại dùng LAN IP. Biến trống cho phép tự dò.

Không đưa bí mật vào `EXPO_PUBLIC_*` hoặc `VITE_*`, vì chúng được đóng gói vào frontend. URL API là cấu hình công khai. Root `.env` chứa mật khẩu MySQL không được đọc trực tiếp bởi Expo; launcher chỉ chuyển các biến `EXPO_PUBLIC_*` cần thiết.

Nếu muốn khởi động Expo CLI trực tiếp thay launcher, cần tự đặt `EXPO_PUBLIC_API_BASE_URL` trong `FE_Mobile/.env` hoặc terminal.

## Chạy Java trực tiếp khi phát triển BE

Docker là cách chạy mặc định cho người mới. Khi cần debug bằng IntelliJ, có thể dùng MySQL riêng đã import đúng `BE/schema.sql`, cài JDK 17 + Maven 3.9 và tạo `BE/.env` từ `BE/.env.example`. Sửa DB credentials trong file riêng này; Spring đọc file khi chạy từ thư mục `BE`.

```powershell
cd BE
mvn -DskipTests package
java -jar target/troday-api-0.0.1-SNAPSHOT.jar
```

Lệnh Maven cần có trong PATH. Dùng JAR để tránh lỗi classpath argfile với đường dẫn Windows có chữ `Đ`. Nếu chạy IntelliJ, đặt Working directory là thư mục `BE`; biến môi trường terminal/Run Configuration được ưu tiên hơn file `.env`.

## Dừng, cập nhật và kiểm tra

```powershell
docker compose down
docker compose up --build -d --wait --wait-timeout 300
npm run test:env
npm run smoke
```

`down` giữ volume DB. Không dùng `down -v` trừ khi chủ động chấp nhận xóa toàn bộ dữ liệu Docker của project. DB MySQL cài trên máy không được dùng bởi bộ Docker này.

`smoke` gọi Web, BE, proxy, đăng nhập ba tài khoản và kiểm tra `/me`, sau đó logout. Chạy với DB demo; nếu đã đổi mật khẩu tài khoản demo thì phần đăng nhập sẽ báo lỗi. Kiểm tra này tạo các phiên xác thực đã thu hồi, không tạo phòng/hợp đồng/hóa đơn.

Lỗi kết nối Docker engine: kiểm tra Docker Desktop đang chạy và ở chế độ Linux containers. Lỗi port: đổi `API_PORT`/`WEB_PORT` trong `.env`. Lỗi đăng nhập demo trên DB cũ: seed chỉ có trên DB Docker mới, không tự ghi đè DB đang có.

Tham khảo cơ chế chính thức: [thứ tự khởi động và healthcheck](https://docs.docker.com/compose/how-tos/startup-order/), [khởi tạo MySQL image](https://hub.docker.com/_/mysql).

## Đã kiểm tra ngày 13/11/2026

Build Docker từ source với volume MySQL mới: cả ba service healthy, Web gọi API qua Nginx được, đăng nhập và `/me` thành công với cả TENANT/LANDLORD/ADMIN. Build BE chạy đủ 6 test. Mobile qua typecheck và 30 test client; 4 test môi trường qua. Launcher mở Metro/Expo Web và URL API tự động xuất hiện đúng trong bundle.

`npm run setup` cũng đã chạy thành công trên bản sao cấu hình sạch chưa có `.env` hay `node_modules`, tự tạo file môi trường và cài dependencies Mobile theo lockfile.

Các kiểm tra này xác nhận môi trường và kết nối cơ bản; chưa nghiệm thu toàn bộ nghiệp vụ hoặc chạy lại trên điện thoại thật. Những API BE chưa hoàn chỉnh vẫn giữ giới hạn tại FE theo tài liệu kết nối.
