# Trọday

Repository dự án Trọday. Backend nằm trong [`BE/`](BE/README.md), dùng Java 21, Spring Boot, Maven Wrapper và MySQL theo kế hoạch BE hiện có.

Frontend web **ReactJS + Vite** nằm trong [`FE/`](FE/README.md), đã có giao diện cho người thuê, chủ trọ và quản trị với dữ liệu mẫu, chưa kết nối API. Chạy `cd FE`, `npm.cmd install`, `npm.cmd run dev` để xem.

```text
troday/
├── BE/                 # Ứng dụng Spring Boot và kiểm thử
│   ├── .mvn/wrapper/
│   ├── docs/contracts/
│   ├── src/main/
│   ├── src/test/
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
├── FE/                 # Giao diện ReactJS + Vite, dữ liệu demo
├── database/           # Nguồn SQL và migration do team tích hợp
├── .editorconfig
├── .gitattributes
└── .gitignore
```

## Bắt đầu

Cần JDK 21 trở lên; `JAVA_HOME` trỏ tới thư mục JDK chứa `bin/java` và `bin/javac`. Mã được biên dịch với Java release 21. Maven Wrapper tự tải Maven 3.9.9 trong lần chạy đầu, không cần cài Maven riêng.

```powershell
cd BE
.\mvnw.cmd test
.\mvnw.cmd verify
```

Xem [hướng dẫn backend](BE/README.md) để cấu hình MySQL và chạy local. Đã triển khai đăng ký/đăng nhập, phiên, hồ sơ và toàn bộ 43 model JDBC; các API nghiệp vụ khác tiếp tục theo kế hoạch.

Backend tổ chức package theo tầng: `controller`, `service`, `repository`, `model`, `dto`, `config`, `security`, `exception`, `integration`, `util`. Mã của mỗi chức năng đặt trong các tầng tương ứng; xem [cấu trúc chi tiết](BE/README.md#cấu-trúc).

## Git

Nhánh chính: `main`. Remote: `https://github.com/lecaongoclinh/troday.git`.

Tạo nhánh công việc từ `main`, ví dụ `be/a/be-a01-bootstrap`, rồi mở pull request để review. Quy ước nhánh BE: `be/<owner>/<task-id>-<slug>`.

```powershell
git remote -v
git switch -c be/a/be-a01-bootstrap
```

Sau khi repository trên GitHub có nhánh `main`, thành viên khác dùng `git clone https://github.com/lecaongoclinh/troday.git`.
