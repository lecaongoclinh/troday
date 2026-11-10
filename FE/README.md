# Trọday Web — ReactJS

Frontend **React 19 + Vite**, viết bằng JavaScript/JSX. Giao diện lấy bảng màu, font Be Vietnam Pro, thẻ bo góc và phong cách từ app mobile; các màn hình dựa trên wireframe v5 của dự án.

**Chưa kết nối API.** Dữ liệu mẫu và thay đổi được lưu riêng trong `localStorage` của trình duyệt. Không cần chạy backend hoặc MySQL. Ảnh, biểu tượng và font được đóng gói cùng mã nguồn.

## Chạy ứng dụng

Cần Node.js 22.12 trở lên.

```powershell
cd troday/FE
npm.cmd install
npm.cmd run dev
```

Mở địa chỉ Vite in trong terminal, mặc định **http://127.0.0.1:5173**. PowerShell có thể chặn `npm.ps1`; các lệnh dùng `npm.cmd` để tránh lỗi này. Nếu đang ở thư mục `troday`, dùng `cd FE`.

```powershell
npm.cmd run build      # Tạo bản tĩnh trong dist/
npm.cmd run preview    # Xem bản đã build, mặc định cổng 4173
```

Ứng dụng React cần chạy qua Vite hoặc web server; không mở `index.html` bằng cách nhấp đúp.

## Màn hình

Chọn **Người thuê / Chủ trọ / Quản trị** ở thanh trên. Trên điện thoại, nút **Tiện ích** mở đầy đủ chức năng của vai trò hiện tại.

| Không gian | Màn hình |
| --- | --- |
| Người thuê | Khám phá và lọc phòng; chi tiết tin/phòng; đã lưu; tin nhắn; lịch xem; hợp đồng; hóa đơn; tìm bạn ở ghép và lời mời; tài khoản |
| Chủ trọ | Tổng quan; nhà & phòng; dịch vụ theo nhà/phòng; tin đăng; tin nhắn; lịch xem; hợp đồng; người ở; hóa đơn; tài khoản |
| Quản trị | Tổng quan; xác minh danh tính/quyền cho thuê; kiểm duyệt tin; mẫu hợp đồng; báo cáo; người dùng; nhật ký; tài khoản |
| Tài khoản | Đăng nhập; đăng ký; quên mật khẩu; sửa hồ sơ; thông báo và phiên mẫu |

Các biểu mẫu hỗ trợ thao tác mẫu: thêm/sửa nhà, phòng, dịch vụ, tin đăng; gửi/chấp nhận đề nghị xem phòng; lập/xác nhận hợp đồng; ghi nhận vào/rời phòng; tạo hóa đơn nhiều khoản, phát hành/xác nhận thu; tạo hồ sơ ở ghép, kết nối, nhắn tin và chia sẻ tin; xét duyệt, báo cáo và ghi nhật ký.

URL có thể mở trực tiếp và dùng nút Back/Forward, ví dụ:

```text
/?role=tenant&view=discover
/?role=tenant&view=detail&id=p-r1
/?role=landlord&view=dashboard
/?role=admin&view=moderation
/?role=tenant&view=login
```

Đăng nhập/đăng ký chỉ xem trước biểu mẫu rồi vào tài khoản mẫu. Mật khẩu không được lưu hoặc gửi đi; quên mật khẩu không gửi email. Tệp xác minh chỉ lưu tên, loại và kích thước để minh họa; nội dung tệp không được tải lên. Ảnh phòng tự chọn được lưu tại trình duyệt, tối đa 2 MB/ảnh.

Xóa dữ liệu mẫu bằng DevTools Console rồi tải lại trang:

```js
localStorage.removeItem('troday-react-demo-v1');
location.reload();
```

## Cấu trúc

```text
src/
  main.jsx                 # React root
  App.jsx                  # Chọn màn hình
  components/
    Layout.jsx             # Sidebar, topbar, điều hướng mobile
    ui.jsx                 # Button, Icon, Badge, Table, Tabs, Field...
    Dialogs.jsx            # Biểu mẫu và hộp thoại nghiệp vụ
  context/AppContext.jsx   # State React, dữ liệu demo, điều hướng URL
  pages/                   # Màn hình JSX theo nhóm chức năng
  data/
    seed.json              # Dữ liệu mẫu độc lập với backend
    navigation.js          # Vai trò và danh mục màn hình
    selectors.js           # Truy vấn dữ liệu, tiền, ngày và ảnh
  styles/
    components.css         # Bố cục thành phần theo wireframe
    theme.css              # Màu sắc và phong cách mobile cho web
    react.css              # Bố cục các component React
assets/fonts/              # Font được Vite đóng gói
public/assets/             # Ảnh phòng và favicon
tests/browser.cjs          # Kiểm tra trình duyệt thực
```

State và dữ liệu mẫu tách khỏi các màn hình. Khi nối backend, thay lớp thao tác dữ liệu trong context bằng service gọi API và bổ sung xác thực/phân quyền thực. Chọn vai trò trong bản demo chỉ nhằm xem giao diện.

## Kiểm tra

```powershell
npm.cmd run build
npm.cmd test
```

`npm test` tự mở Vite và Chrome headless, kiểm tra 26 màn hình theo vai trò ở bốn chiều rộng 1440/900/390/320 px (104 lượt), 11 biểu mẫu ở desktop/mobile (22 lượt), các thao tác chính, dữ liệu sau tải lại và không có request API/tài nguyên bên ngoài. Ảnh chụp nằm trong `.cache/screenshots/` và không được đưa vào Git. Cần Chrome cài sẵn; đặt biến `CHROME_PATH` nếu Chrome nằm ở vị trí khác mặc định Windows.

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm.cmd test
```
