# Trọday

Repository dự án Trọday. Backend nằm trong [`BE/`](BE/README.md), dùng Java 21, Spring Boot, Maven Wrapper và MySQL theo kế hoạch BE hiện có.

```text
troday/
├── BE/                 # Ứng dụng Spring Boot và kiểm thử
│   ├── .mvn/wrapper/
│   ├── docs/contracts/
│   ├── src/main/
│   ├── src/test/
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
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

Xem [hướng dẫn backend](BE/README.md) để cấu hình MySQL và chạy local. Đây là khung dự án, các API nghiệp vụ sẽ được triển khai theo kế hoạch.

## Git

Nhánh chính: `main`. Remote: `https://github.com/lecaongoclinh/troday.git`.

Tạo nhánh công việc từ `main`, ví dụ `be/a/be-a01-bootstrap`, rồi mở pull request để review. Quy ước nhánh BE: `be/<owner>/<task-id>-<slug>`.

```powershell
git remote -v
git switch -c be/a/be-a01-bootstrap
```

Sau khi repository trên GitHub có nhánh `main`, thành viên khác dùng `git clone https://github.com/lecaongoclinh/troday.git`.
