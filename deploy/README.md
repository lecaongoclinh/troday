# Deploy Trọday: BE + MySQL + web trên Oracle, mobile bằng APK

Cập nhật ngày 17/11/2026. Các lệnh Windows chạy trong **PowerShell trên máy của bạn**; các lệnh Bash chạy trong **terminal SSH của VM Ubuntu**. Thay `YOUR-NAME.duckdns.org`, `PUBLIC_IP` và đường dẫn khóa SSH bằng thông tin thật của bạn.

**Sau merge 19/11/2026:** stack HTTPS được giữ trong `compose.production.yaml`. Các lệnh `deploy/dc.sh` bên dưới đã trỏ tới file này. `compose.yaml` dành cho demo local, dùng `.env` gốc; production tiếp tục dùng `deploy/.env`. Gói ZIP nay kèm cả `shared/api` và cấu hình Docker local.

Kết quả sau khi hoàn thành:

| Thành phần | Địa chỉ / nơi lưu |
| --- | --- |
| Web | `https://YOUR-NAME.duckdns.org` |
| BE | `https://YOUR-NAME.duckdns.org/api/v1` |
| Mobile Android | APK cài trực tiếp, gọi cùng BE HTTPS |
| MySQL | Chỉ trong mạng Docker, không mở cổng 3306 ra Internet |
| Tệp tải lên | Volume `troday_uploads` |
| CSDL | Volume `troday_mysql_data` |

## 1. Tạo VM Oracle Always Free

1. Đăng ký [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/), xác minh tài khoản và chọn home region có Ampere A1. Oracle thường yêu cầu thẻ để xác minh; hạn mức trial có thời hạn khác với Always Free.
2. Vào **Compute → Instances → Create instance**; đặt tên `troday`.
3. Chọn image **Ubuntu 24.04 ARM64**; shape **VM.Standard.A1.Flex**, cấu hình đề xuất **2 OCPU, 8 GB RAM**. Chọn tài nguyên trong hạn mức miễn phí của tài khoản. Tại ngày kiểm tra, tổng A1 Always Free là 1.500 OCPU giờ và 9.000 GB giờ/tháng, tương đương 2 OCPU/12 GB nếu chạy liên tục.
4. Boot volume khoảng **50 GB**. Kiểm tra cả các VM/volume đang tồn tại để tổng dung lượng không vượt hạn mức miễn phí.
5. Tạo hoặc chọn **VCN có Internet Gateway**, public subnet, route `0.0.0.0/0 → Internet Gateway`; bật gán **public IPv4** cho VM.
6. Chọn sinh SSH key pair và tải private key về máy. Giữ riêng khóa này; không đưa vào repository hay ZIP.
7. Tạo VM, chờ trạng thái **Running**, ghi lại public IP.

Nếu báo `Out of host capacity`, thử availability domain khác trong home region hoặc tạo lại sau. Oracle có thể thu hồi VM Always Free nhàn rỗi; cần giữ bản sao lưu bên ngoài VM. Tham khảo [hạn mức và điều kiện Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) và [tạo instance](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm).

## 2. Mở cổng mạng

Trong VCN → subnet/security list, hoặc NSG gắn vào VNIC của VM, thêm ingress **stateful**, source port `All`, destination port như sau:

| Source CIDR | Protocol | Destination port | Dùng cho |
| --- | --- | --- | --- |
| IP Internet của bạn `/32` | TCP | 22 | SSH |
| `0.0.0.0/0` | TCP | 80 | HTTPS certificate và chuyển hướng |
| `0.0.0.0/0` | TCP | 443 | Web và API HTTPS |

Giữ egress ra Internet để tải image, dependency và cấp chứng chỉ. Không thêm ingress cho 3306 hoặc 8081. Nếu có sẵn rule SSH `0.0.0.0/0`, sửa source về IP của bạn. Xem [Oracle Security Rules](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securityrules.htm).

## 3. Đăng ký tên miền DuckDNS

1. Mở [DuckDNS](https://www.duckdns.org/), đăng nhập.
2. Đăng ký một subdomain còn trống, ví dụ `troday-tenban`.
3. Điền **public IPv4 của VM** vào bản ghi và bấm cập nhật. Domain tương ứng là `troday-tenban.duckdns.org`.
4. Trên PowerShell kiểm tra:

```powershell
Resolve-DnsName troday-tenban.duckdns.org -Type A
```

Đợi đến khi kết quả trùng public IP. Nếu IP VM thay đổi về sau, cập nhật DuckDNS. Các bước còn lại dùng domain này thay cho `YOUR-NAME.duckdns.org`.

## 4. SSH vào VM và cài Docker

Trên **PowerShell Windows**:

```powershell
ssh -i "C:\Users\YOUR_USER\Downloads\troday.key" ubuntu@PUBLIC_IP
```

Chấp nhận host key ở lần đầu sau khi đối chiếu thông tin VM. Nếu Windows báo quyền private key quá rộng, vào Properties → Security của file và chỉ giữ quyền đọc cho tài khoản của bạn.

Trong **Ubuntu SSH**, kiểm tra hệ điều hành:

```bash
uname -m
cat /etc/os-release
```

Với A1, kiến trúc cần là `aarch64`. Cài Docker từ repository chính thức trên VM Ubuntu mới:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl unzip python3
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run --rm hello-world
sudo docker compose version
```

Hướng dẫn này dùng `sudo docker`, không cần thay quyền socket. Nguồn: [Docker Engine cho Ubuntu](https://docs.docker.com/engine/install/ubuntu/).

Kiểm tra firewall hệ điều hành:

```bash
sudo ufw status
sudo iptables -S INPUT
sudo iptables -S FORWARD
```

Nếu **UFW đang active**, cho phép SSH trước khi thay đổi các rule khác:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Không bật thêm firewall khác nếu image đang dùng iptables. Với image OCI có rule `INPUT ... REJECT` chặn 80/443, có thể thêm hai rule cho lưu lượng tới host:

```bash
sudo iptables -I INPUT 1 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 1 -p tcp --dport 443 -j ACCEPT
```

Các cổng Docker publish thường đi qua chuỗi FORWARD/DOCKER; nếu có rule REJECT/DROP tùy chỉnh ở FORWARD/DOCKER-USER, cần kiểm tra rule đó khi kết nối ngoài thất bại. Đừng xóa toàn bộ firewall. Dùng cơ chế lưu rule của image, ví dụ `sudo netfilter-persistent save` nếu lệnh này đã được cài. Rule OCI ở bước 2 vẫn phải đúng.

## 5. Đóng gói đúng mã nguồn hiện tại và chuyển lên VM

Trên **PowerShell Windows**, mở terminal khác, giữ terminal SSH:

```powershell
Set-Location "D:\Đồ án tốt nghiệp\troday"
python deploy/package.py
scp -i "C:\Users\YOUR_USER\Downloads\troday.key" ".cache\deploy\troday-deploy.zip" ubuntu@PUBLIC_IP:~/troday-deploy.zip
```

Script đóng gói mã nguồn hiện có, bao gồm thay đổi chưa commit; bỏ `.env`, khóa riêng, cache, `node_modules`, file upload và DB local. Vì vậy không phụ thuộc việc GitHub đã có các sửa đổi mới nhất hay chưa.

Trong **Ubuntu SSH**:

```bash
mkdir -p ~/apps
unzip ~/troday-deploy.zip -d ~/apps
cd ~/apps/troday
```

## 6. Tạo cấu hình bí mật trên VM

Chạy bằng tài khoản `ubuntu`:

```bash
python3 deploy/configure.py --domain YOUR-NAME.duckdns.org
chmod 600 deploy/.env
```

Script tạo `deploy/.env` với hai mật khẩu MySQL độc lập và khóa ký URL file ngẫu nhiên; không in các giá trị này ra terminal, không ghi đè file đã tồn tại. `APP_DOMAIN` chỉ chứa hostname, không có `https://` hay `/api/v1`.

Khi cần sửa các tùy chọn khác:

```bash
nano deploy/.env
```

Giữ nguyên mật khẩu DB và `FILE_SIGNING_SECRET` khi cập nhật ứng dụng. MySQL đã có dữ liệu sẽ không tự đổi mật khẩu chỉ vì bạn sửa `.env`.

## 7. Build và chạy MySQL, BE, web

Trong **Ubuntu SSH**, tại `~/apps/troday`:

```bash
sudo bash deploy/dc.sh config --quiet
sudo bash deploy/dc.sh build db
sudo bash deploy/dc.sh build be
sudo bash deploy/dc.sh build web
sudo bash deploy/dc.sh up -d --wait --wait-timeout 360
sudo bash deploy/dc.sh ps
```

Build lần lượt giúp giảm tải RAM trên VM nhỏ. Lần đầu cần tải Maven/npm và image, có thể mất vài phút. Các image dùng ở đây hỗ trợ ARM64; không ép platform `linux/amd64` trên A1.

Kết quả mong đợi: `db` và `be` **healthy**, `web` **running**. MySQL tự nhập schema khi volume mới; BE tự tạo các bảng hỗ trợ. Dockerfile DB điều chỉnh câu tạo database thành `IF NOT EXISTS` trên bản sao trong image để tương thích với `MYSQL_DATABASE`; không thay schema gốc.

Không nhập lại `BE/schema.sql` và không nạp `BE/insert_data.sql` lên DB công khai. Bộ deploy khởi tạo **DB rỗng về dữ liệu nghiệp vụ**, không có tài khoản demo dùng mật khẩu đã công bố.

Xem log nếu cần, nhấn Ctrl+C để dừng theo dõi log:

```bash
sudo bash deploy/dc.sh logs --tail=100 db be web
sudo bash deploy/dc.sh logs -f --tail=50 be web
```

Caddy tự cấp và gia hạn HTTPS khi DNS trỏ đúng, cổng 80/443 mở, volume chứng chỉ ghi được. Chứng chỉ được giữ trong `caddy_data`. Xem [Automatic HTTPS](https://caddyserver.com/docs/automatic-https).

## 8. Kiểm tra web và BE, tạo quản trị viên

Trên **PowerShell Windows** hoặc một máy ngoài VM:

```powershell
curl.exe -I https://YOUR-NAME.duckdns.org
curl.exe --fail "https://YOUR-NAME.duckdns.org/api/v1/posts?page=1&pageSize=5"
```

Web cần trả HTTP 200; API cần trả JSON có `data.items` và `meta.pagination`. Danh sách rỗng là bình thường vì chưa có dữ liệu.

Trong **Ubuntu SSH** tạo admin:

```bash
cd ~/apps/troday
sudo python3 deploy/create-admin.py
```

Nhập email thật, họ tên và mật khẩu mới ít nhất 12 ký tự. Mật khẩu được nhập ẩn. Script tạo user, vai trò admin và hồ sơ trong cùng transaction; không đổi mật khẩu tài khoản cũ và không nạp seed demo.

Mở `https://YOUR-NAME.duckdns.org`, đăng nhập tài khoản vừa tạo. Sau đó kiểm tra:

1. Đăng ký một tài khoản người thuê, đăng nhập/đăng xuất.
2. Thêm dữ liệu qua luồng nghiệp vụ và xét duyệt bằng admin khi cần.
3. Tìm kiếm, chuyển trang danh sách.
4. Tải một ảnh thật, mở lại trang để kiểm tra bytes đã lưu.
5. Kiểm tra chat/thông báo khi có hai tài khoản và dữ liệu phù hợp.

Web đã build với `VITE_API_BASE_URL=/api/v1`; Caddy giữ nguyên đường dẫn API khi proxy sang `be:8081`. File và SSE cũng qua cùng domain, không cần sửa URL trong mã nguồn. Cấu hình proxy: [Caddy reverse_proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy).

Các chức năng gửi OTP/quên mật khẩu cần webhook HTTPS gửi email/SMS thật. Nếu chưa có provider, chúng trả 503. Điền `VERIFICATION_DELIVERY_URL` và tùy chọn `VERIFICATION_DELIVERY_TOKEN` trong `deploy/.env`, rồi chạy `sudo bash deploy/dc.sh up -d be`. Provider nhận POST JSON `{userId,target,purpose,code}`; token được gửi qua `Authorization: Bearer ...`. Không dùng inbox phát triển trên máy công khai.

Nếu cần import hợp đồng giấy, điền danh sách ID được phép vào `PAPER_IMPORT_USER_IDS`, ví dụ `1,7`, rồi tạo lại container BE bằng lệnh trên. Chỉ thêm tài khoản thực sự cần quyền này.

## 9. Build APK Android bằng Expo

Làm trên **PowerShell Windows**, trong thư mục mobile; không cần cài Android Studio nếu dùng cloud build. Cần Node đáp ứng `FE_Mobile/package.json`, tài khoản Expo và mạng Internet.

```powershell
Set-Location "D:\Đồ án tốt nghiệp\troday\FE_Mobile"
npm.cmd ci
npm.cmd run typecheck
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest init
```

Trong `init`, tạo hoặc liên kết đúng project Trọday của tài khoản bạn. EAS có thể thêm `extra.eas.projectId`/owner vào `app.json`; đó là dữ liệu riêng của project, không dùng UUID của người khác. Nếu có yêu cầu thiết lập Git, dùng repository Git hiện có. Lưu các thay đổi project config sau khi liên kết.

File `FE_Mobile/eas.json` đã có profile `preview` tạo **APK**. Tạo biến trên Expo, không dựa vào file `.env` local vốn có thể bị loại khỏi upload:

1. Trong Expo dashboard, mở project → **Project settings → Environment variables → Add Variables**.
2. Name: `EXPO_PUBLIC_API_BASE_URL`.
3. Value: `https://YOUR-NAME.duckdns.org/api/v1`.
4. Environment: **preview**; Visibility: **Plain text**; lưu lại.

Có thể dùng CLI hiện hành thay dashboard:

```powershell
npx.cmd eas-cli@latest env:set --name EXPO_PUBLIC_API_BASE_URL --value https://YOUR-NAME.duckdns.org/api/v1 --environment preview --visibility plaintext
npx.cmd eas-cli@latest env:list --environment preview
```

URL API là thông tin công khai; không thêm mật khẩu DB, khóa ký hay token bí mật vào biến `EXPO_PUBLIC_*`. Hướng dẫn: [Expo environment variables](https://docs.expo.dev/eas/environment-variables/manage/).

Bắt đầu build:

```powershell
npx.cmd eas-cli@latest build --platform android --profile preview
```

Nếu được hỏi tạo Android keystore, chọn để Expo sinh keystore mới cho project lần đầu. Giữ cùng keystore cho các bản cập nhật. Khi xong, mở link build trên điện thoại Android, tải APK và cho phép cài đặt từ nguồn đang tải. Không dùng profile `production` cho bước này vì profile đó tạo AAB.

Mở app, kiểm tra phần **Tài khoản → Kết nối máy chủ** là `https://YOUR-NAME.duckdns.org/api/v1`. Một bản cài cũ có thể đã lưu URL khác; sửa tại màn hình này. `localhost` trên điện thoại là chính điện thoại.

Kiểm tra đăng nhập, tìm kiếm/phân trang, tải ảnh và chat bằng 4G/Wi-Fi ngoài mạng máy tính. APK chạy độc lập, không cần Metro/Expo Go đang mở. `npm run build:native` chỉ export JS/assets, không tạo APK có thể cài đặt.

Nguồn: [thiết lập build](https://docs.expo.dev/build/setup/), [APK cho Android](https://docs.expo.dev/build-reference/apk/), [build trong monorepo](https://docs.expo.dev/build-reference/build-with-monorepos/). Tại ngày kiểm tra, [Expo Free](https://expo.dev/pricing) có 15 Android và 15 iOS build/tháng, hàng đợi ưu tiên thấp. Hết quota cần chờ chu kỳ mới hoặc tự build local.

## 10. iPhone và phát hành lên store

Android APK cài trực tiếp phù hợp mục tiêu miễn phí. File APK không cài trên iPhone. iOS phát hành thông thường qua TestFlight/App Store cần Apple Developer Program, hiện 99 USD/năm; một số tổ chức đủ điều kiện có thể được miễn. Xem [Apple membership](https://developer.apple.com/help/account/membership/program-enrollment/).

Để demo miễn phí trên iPhone, dùng website qua Safari; trải nghiệm không hoàn toàn giống native app. Nếu dùng Expo Go để thử trong phát triển, cần phiên bản Expo Go hỗ trợ SDK của project và máy dev vẫn phục vụ bundle. Đó không phải APK/IPA độc lập.

## 11. Cập nhật sau này

Trước cập nhật, sao lưu theo bước 12. Đóng gói/chuyển ZIP mới như bước 5. Trong SSH:

```bash
unzip -o ~/troday-deploy.zip -d ~/apps
cd ~/apps/troday
sudo bash deploy/dc.sh build be
sudo bash deploy/dc.sh build web
sudo bash deploy/dc.sh up -d --wait --wait-timeout 360
sudo bash deploy/dc.sh ps
```

ZIP không chứa `deploy/.env`, nên cấu hình server được giữ lại. Các volume giữ DB, upload và chứng chỉ khi container được tạo lại. Không dùng `docker compose down -v` hoặc xóa volume khi cập nhật.

Thay đổi schema nghiệp vụ cần migration riêng; sửa schema trong image không tự cập nhật DB đã tồn tại. Hướng dẫn khởi tạo này không phải quy trình migration DB đang dùng. Nếu đã có dữ liệu thật trên máy local, cần backup/restore cả SQL lẫn thư mục upload thay vì nạp lại seed.

Mobile thay đổi JS/config native thì build APK mới theo bước 9; không tự cấu hình OTA update trong bộ này. Muốn đổi domain cho các bản cài mới, sửa biến Expo và build lại; bản cài hiện tại có thể đổi URL trong màn hình kết nối.

## 12. Sao lưu

Trong SSH:

```bash
cd ~/apps/troday
sudo bash deploy/backup.sh
```

Script dừng BE tạm thời để chụp SQL và upload ở cùng trạng thái, tự khởi động lại BE khi kết thúc. Nó lưu ba file trong `.cache/backups/<timestamp>/`:

- `database.sql.gz`: DB, routine, trigger, event.
- `uploads.tar.gz`: bytes của file đã tải lên.
- `deploy.env`: cấu hình/khóa ký, cần giữ bí mật.

Trong lúc backup, API có thể trả 502. Chỉ coi backup hoàn tất nếu script thành công và cả ba file có mặt. Tải bản sao ra ngoài VM qua SCP; có thể sao chép vào thư mục riêng của ubuntu trước:

```bash
sudo mkdir -p ~/troday-backups
sudo cp -a .cache/backups/. ~/troday-backups/
sudo chown -R ubuntu:ubuntu ~/troday-backups
```

Trên PowerShell:

```powershell
scp -i "C:\Users\YOUR_USER\Downloads\troday.key" -r ubuntu@PUBLIC_IP:~/troday-backups ".\troday-backups"
```

Lưu thư mục backup ngoài repository hoặc trong nơi được mã hóa; file `deploy.env` chứa mật khẩu. Chuyển tên thư mục backup local ra ngoài `troday` nếu chạy SCP từ thư mục project.

Khi cần phục hồi: dựng VM/volume mới với đúng phiên bản ứng dụng, phục hồi `deploy.env`, khởi động DB, nhập SQL backup và giải nén uploads vào volume trước khi chạy BE. Kiểm tra phục hồi trên môi trường riêng trước khi thay máy đang phục vụ.

## 13. Các lỗi thường gặp

| Hiện tượng | Kiểm tra / xử lý |
| --- | --- |
| Không SSH được | Public IP, key đúng, user `ubuntu`, rule TCP22 và IP `/32` hiện tại của bạn |
| Timeout web | DNS, public subnet/Internet Gateway/route, OCI ingress 80/443, firewall host, `dc.sh ps` |
| HTTPS chưa có chứng chỉ | DNS A/AAAA phải đúng, cổng 80/443 mở, xem `dc.sh logs --tail=100 web`; không dùng IP thay domain |
| 502 | `dc.sh logs --tail=100 be db`, kiểm tra BE healthy và mật khẩu trong `.env` khớp DB |
| DB lỗi khởi tạo | Xem log DB đầu tiên; không chạy seed hoặc schema thêm lần nữa, không xóa volume để thử nếu đã có dữ liệu |
| Trang có nhưng API trả HTML | Kiểm tra image web có đúng Caddyfile; `/api/*` phải proxy và giữ nguyên prefix |
| Ảnh mất sau deploy | Kiểm tra volume `uploads`, `FILE_STORAGE_ROOT` và việc có phục hồi bytes cùng SQL hay chưa |
| OTP trả 503 | Chưa cấu hình provider thật, provider lỗi hoặc token webhook không đúng |
| Mobile Network request failed | Thử URL HTTPS bằng trình duyệt trên điện thoại; kiểm tra `/api/v1`, chứng chỉ và URL lưu trong app |
| APK vẫn gọi URL cũ | Sửa URL trong Tài khoản → Kết nối máy chủ; kiểm tra biến Expo `preview` rồi build lại |
| Hết RAM khi build | Build từng service; không build BE và web đồng thời trên VM nhỏ |

## Phạm vi đã chuẩn bị / kiểm tra

Bộ file tạo được cấu hình, đóng gói mã nguồn hiện tại và mô tả quy trình deploy. Việc tạo tài khoản Oracle/DuckDNS/Expo, chọn domain, mở mạng và chạy cloud build cần thực hiện bằng tài khoản của bạn. Chưa có URL cloud hoặc APK đã phát hành từ bộ hướng dẫn này.

Đã kiểm tra Compose offline, cú pháp hai script Bash và ba script Python, profile APK, việc tạo cấu hình/từ chối ghi đè, và ZIP không chứa `.env`, cache hay `node_modules`. Máy soạn hướng dẫn có Docker CLI nhưng Docker Engine chưa chạy: chưa xác minh build/chạy các image thực tế hay cấp HTTPS trên VM. Cần hoàn tất kiểm tra bước 7–9 trước khi coi triển khai thành công.
