# Model và RowMapper

`model/` gồm 43 Java record cho toàn bộ bảng trong `database/source/schema.sql`. `repository/mapper/` có 43 RowMapper và JdbcValues. Đây là snapshot nội bộ bất biến; API dùng DTO riêng. Tên đặc biệt: files → FileMetadata, rental_houses → RentalHouse, lifestyle_criteria → LifestyleCriterion.

| SQL | Java |
| --- | --- |
| BIGINT | Long; API dùng String cho ID |
| INT/TINYINT/SMALLINT | Integer |
| BOOLEAN | Boolean |
| DECIMAL | BigDecimal |
| DATETIME(6)/TIMESTAMP | Instant, đọc/ghi theo UTC |
| DATE | LocalDate |
| JSON | JsonNode |
| VARCHAR/CHAR/TEXT/LONGTEXT | String |
| CHECK field IN ('…') | Enum lồng trong record |

Nullable giữ null, không đổi thành 0/false. Các cột GENERATED ALWAYS có trong snapshot để đọc, không ghi INSERT/UPDATE. Bao phủ ALTER bổ sung name/rowVersion/verificationVersion/creationKey cho nhà. toString chỉ chứa tên model và ID; hash/session key/selector/storage key/identity number có JsonIgnore phòng ngừa serialize nhầm. PII khác vẫn cần DTO và kiểm tra quyền trong API tương ứng.

```powershell
python scripts/generate-models.py
python scripts/generate-models.py --check
```

Generator chỉ đọc SQL và viết Java, không truy cập DB. Khi sửa SQL, sinh lại và review diff. ModelMySqlTests đối chiếu đủ bảng/cột thực, kể cả generated/ALTER, rồi chạy từng mapper với dữ liệu và null để xác minh enum/JSON/decimal/UTC/nullable.

Bao phủ tài khoản/vai trò/hồ sơ, tệp/xác minh/phiên/token, nhà/phòng/dịch vụ, tin/ảnh/tiện ích/yêu thích, lịch xem/đề xuất, hợp đồng/phiên bản/cư dân/đại diện/thay đổi/tham gia, ở ghép/lối sống/kết nối, hóa đơn/dòng tiền, đánh giá/chat/thông báo/báo cáo/quản trị. View SQL sẽ có projection khi query cần dùng. api_idempotency là bảng hạ tầng bổ sung, được đóng gói trong service gửi lặp.
