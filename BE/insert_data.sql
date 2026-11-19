-- Troday: du lieu demo tu tin phong tro cong khai + du lieu tu sinh.
-- Schema: troday/database/source/schema.sql = wireframe/room_rental_wireframe_v5/database/schema.sql.
-- Chon database V5 da tao truoc khi import. File KHONG tao/xoa database, KHONG tat FK/trigger.
-- Chay MOT LAN; khong dung mysql --force. Email demo trung se bao loi; khong ghi de du lieu cu.
-- Moi tai khoan demo: password 123456, SHA-256 theo AccountService.java.
SET NAMES utf8mb4;
SET @seed_old_mode = @@SESSION.sql_mode, @seed_old_time_zone = @@SESSION.time_zone;
SET SESSION sql_mode = CONCAT_WS(',', NULLIF(@@SESSION.sql_mode, ''), 'NO_BACKSLASH_ESCAPES');
SET time_zone = '+00:00';
SET @seed_now = UTC_TIMESTAMP(6), @seed_today = DATE(UTC_TIMESTAMP() + INTERVAL 7 HOUR);
START TRANSACTION;

-- Tai khoan hoan toan tu sinh; khong lay danh tinh/so dien thoai nguoi dang tin.
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('admin@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Quản trị Trọday Demo', 'ADMIN', 'ACTIVE');
SET @seed_admin = LAST_INSERT_ID();
INSERT INTO `admins` (`id`) VALUES
  (@seed_admin);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_admin, 'MALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('landlord01@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Chủ trọ Demo 01', 'LANDLORD', 'ACTIVE');
SET @seed_owner1 = LAST_INSERT_ID();
INSERT INTO `landlords` (`id`) VALUES
  (@seed_owner1);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_owner1, 'MALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('landlord02@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Chủ trọ Demo 02', 'LANDLORD', 'ACTIVE');
SET @seed_owner2 = LAST_INSERT_ID();
INSERT INTO `landlords` (`id`) VALUES
  (@seed_owner2);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_owner2, 'FEMALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('landlord03@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Chủ trọ Demo 03', 'LANDLORD', 'ACTIVE');
SET @seed_owner3 = LAST_INSERT_ID();
INSERT INTO `landlords` (`id`) VALUES
  (@seed_owner3);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_owner3, 'MALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('landlord04@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Chủ trọ Demo 04', 'LANDLORD', 'ACTIVE');
SET @seed_owner4 = LAST_INSERT_ID();
INSERT INTO `landlords` (`id`) VALUES
  (@seed_owner4);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_owner4, 'MALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('landlord05@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Chủ trọ Demo 05', 'LANDLORD', 'ACTIVE');
SET @seed_owner5 = LAST_INSERT_ID();
INSERT INTO `landlords` (`id`) VALUES
  (@seed_owner5);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_owner5, 'MALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('landlord06@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Chủ trọ Demo 06', 'LANDLORD', 'ACTIVE');
SET @seed_owner6 = LAST_INSERT_ID();
INSERT INTO `landlords` (`id`) VALUES
  (@seed_owner6);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_owner6, 'MALE', 'Quản lý trọ demo', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant01@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Nguyễn Minh An', 'TENANT', 'ACTIVE');
SET @seed_tenant1 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant1);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant1, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant02@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Trần Ngọc Mai', 'TENANT', 'ACTIVE');
SET @seed_tenant2 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant2);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant2, 'FEMALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant03@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Lê Hoàng Nam', 'TENANT', 'ACTIVE');
SET @seed_tenant3 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant3);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant3, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant04@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Phạm Thu Hà', 'TENANT', 'ACTIVE');
SET @seed_tenant4 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant4);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant4, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant05@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Đặng Quốc Huy', 'TENANT', 'ACTIVE');
SET @seed_tenant5 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant5);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant5, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant06@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Vũ Bảo Ngọc', 'TENANT', 'ACTIVE');
SET @seed_tenant6 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant6);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant6, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant07@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Đỗ Gia Bảo', 'TENANT', 'ACTIVE');
SET @seed_tenant7 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant7);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant7, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant08@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Bùi Thanh Trúc', 'TENANT', 'ACTIVE');
SET @seed_tenant8 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant8);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant8, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant09@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Hồ Minh Khang', 'TENANT', 'ACTIVE');
SET @seed_tenant9 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant9);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant9, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant10@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Phan Khánh Linh', 'TENANT', 'ACTIVE');
SET @seed_tenant10 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant10);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant10, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant11@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Dương Tuấn Anh', 'TENANT', 'ACTIVE');
SET @seed_tenant11 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant11);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant11, 'MALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `role`, `status`) VALUES
  ('tenant12@troday.example', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Ngô Thảo Vy', 'TENANT', 'ACTIVE');
SET @seed_tenant12 = LAST_INSERT_ID();
INSERT INTO `tenants` (`id`) VALUES
  (@seed_tenant12);
INSERT INTO `personal_profiles` (`user_id`, `gender`, `occupation`, `bio`) VALUES
  (@seed_tenant12, 'FEMALE', 'Sinh viên', 'Tài khoản mẫu của bộ dữ liệu Trọday; không đại diện người đăng tin nguồn.');
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/identity0.pdf', 'DEMO-identity0.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'IDENTITY', 'PRIVATE', 'ACTIVE');
SET @seed_identity0 = LAST_INSERT_ID();
INSERT INTO `landlord_verifications` (`applicant_user_id`, `identity_number`, `identity_file_id`, `status`, `reviewed_by_id`, `reviewed_at`) VALUES
  (@seed_owner1, 'DEMO-OWNER-001', @seed_identity0, 'APPROVED', @seed_admin, @seed_now);
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/identity1.pdf', 'DEMO-identity1.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'IDENTITY', 'PRIVATE', 'ACTIVE');
SET @seed_identity1 = LAST_INSERT_ID();
INSERT INTO `landlord_verifications` (`applicant_user_id`, `identity_number`, `identity_file_id`, `status`, `reviewed_by_id`, `reviewed_at`) VALUES
  (@seed_owner2, 'DEMO-OWNER-002', @seed_identity1, 'APPROVED', @seed_admin, @seed_now);
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/identity2.pdf', 'DEMO-identity2.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'IDENTITY', 'PRIVATE', 'ACTIVE');
SET @seed_identity2 = LAST_INSERT_ID();
INSERT INTO `landlord_verifications` (`applicant_user_id`, `identity_number`, `identity_file_id`, `status`, `reviewed_by_id`, `reviewed_at`) VALUES
  (@seed_owner3, 'DEMO-OWNER-003', @seed_identity2, 'APPROVED', @seed_admin, @seed_now);
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/identity3.pdf', 'DEMO-identity3.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'IDENTITY', 'PRIVATE', 'ACTIVE');
SET @seed_identity3 = LAST_INSERT_ID();
INSERT INTO `landlord_verifications` (`applicant_user_id`, `identity_number`, `identity_file_id`, `status`, `reviewed_by_id`, `reviewed_at`) VALUES
  (@seed_owner4, 'DEMO-OWNER-004', @seed_identity3, 'APPROVED', @seed_admin, @seed_now);
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/identity4.pdf', 'DEMO-identity4.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'IDENTITY', 'PRIVATE', 'ACTIVE');
SET @seed_identity4 = LAST_INSERT_ID();
INSERT INTO `landlord_verifications` (`applicant_user_id`, `identity_number`, `identity_file_id`, `status`, `reviewed_by_id`, `reviewed_at`) VALUES
  (@seed_owner5, 'DEMO-OWNER-005', @seed_identity4, 'APPROVED', @seed_admin, @seed_now);
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/identity5.pdf', 'DEMO-identity5.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'IDENTITY', 'PRIVATE', 'ACTIVE');
SET @seed_identity5 = LAST_INSERT_ID();
INSERT INTO `landlord_verifications` (`applicant_user_id`, `identity_number`, `identity_file_id`, `status`, `reviewed_by_id`, `reviewed_at`) VALUES
  (@seed_owner6, 'DEMO-OWNER-006', @seed_identity5, 'APPROVED', @seed_admin, @seed_now);
INSERT INTO `rental_services` (`name`, `unit`, `default_calculation_method`) VALUES
  ('Điện demo', 'kWh', 'METERED');
SET @seed_catalog0 = LAST_INSERT_ID();
INSERT INTO `rental_services` (`name`, `unit`, `default_calculation_method`) VALUES
  ('Nước demo', 'm³', 'METERED');
SET @seed_catalog1 = LAST_INSERT_ID();
INSERT INTO `rental_services` (`name`, `unit`, `default_calculation_method`) VALUES
  ('Internet demo', 'phòng/tháng', 'PER_ROOM');
SET @seed_catalog2 = LAST_INSERT_ID();
INSERT INTO `rental_services` (`name`, `unit`, `default_calculation_method`) VALUES
  ('Vệ sinh demo', 'người/tháng', 'PER_PERSON');
SET @seed_catalog3 = LAST_INSERT_ID();
INSERT INTO `contract_templates` (`created_by_id`, `name`, `version`, `content`) VALUES
  (@seed_admin, 'Hợp đồng thuê trọ DEMO', 1, 'DỮ LIỆU MẪU. Bên cho thuê và bên thuê thống nhất thời hạn, giá thuê, tiền cọc và dịch vụ theo thông tin hợp đồng. Chỉ phục vụ kiểm thử ứng dụng.');
SET @seed_template = LAST_INSERT_ID();

-- Tin 1: https://phongtro123.com/phong-tro-ngay-thanh-thai-trung-tam-quan-10-dep-trang-bi-day-du-noi-that-pr612116.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 001 - Hồ Chí Minh', '43/3 Đường Thành Thái, Phường Diên Hồng, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/phong-tro-ngay-thanh-thai-trung-tam-quan-10-dep-trang-bi-day-du-noi-that-pr612116.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r0house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r0house, 'P101', 25.0, 4500000, 4500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r0room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r0proof.pdf', 'DEMO-r0proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r0proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r0house, @seed_owner1, 1, '{"name":"Nhà demo 001 - Hồ Chí Minh","address":"43/3 Đường Thành Thái, Phường Diên Hồng, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r0verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r0verification, @seed_r0proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r0verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r0verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r0house, @seed_r0room, 'Phòng trọ ngay Thành Thái, trung tâm Quận 10, đẹp, trang bị đầy đủ nội thất', 'Phòng cho thuê tại 43/3 Đường Thành Thái, Phường Diên Hồng, Hồ Chí Minh. Diện tích 25 m²; giá tham khảo 4,500,000 đồng/tháng. Tiện ích ghi trong tin: Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-tro-ngay-thanh-thai-trung-tam-quan-10-dep-trang-bi-day-du-noi-that-pr612116.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r0post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r0post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/27/z4064025740041-0c32a1d0197c20b63c64a57df8c64959_1674785592.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r0post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/27/z4064025765105-04e4c8e3b0c79ad50f7c6b1939162823_1674785595.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r0post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/27/z4064025759263-7ca73cc7c52cfc53a6b4a9960f37d3f8_1674785596.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r0post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/27/z4064025757084-0d37877ed5b25c44a86f2a31961b5db1_1674785595.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r0post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/27/z4064025770882-b775cc2fd6d60a9bf8f7d6ac80eedbfa_1674785594.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r0post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/27/z4064025763180-407728bc245586586561a55608daf488_1674785593.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r0post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r0house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r0hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r0room, @seed_r0house, @seed_r0hs0);
SET @seed_r0rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r0house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r0hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r0room, @seed_r0house, @seed_r0hs1);
SET @seed_r0rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r0house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r0hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r0room, @seed_r0house, @seed_r0hs2);
SET @seed_r0rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r0house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r0hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r0room, @seed_r0house, @seed_r0hs3);
SET @seed_r0rs3 = LAST_INSERT_ID();

-- Tin 2: https://phongtro123.com/phong-thue-rieng-chung-cu-era-town-quan-7-pr609404.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 002 - Hồ Chí Minh', 'Đường Nguyễn Lương Bằng, Phường Tân Mỹ, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/phong-thue-rieng-chung-cu-era-town-quan-7-pr609404.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r1house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r1house, 'P101', 28.0, 3500000, 3500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r1room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r1proof.pdf', 'DEMO-r1proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r1proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r1house, @seed_owner2, 1, '{"name":"Nhà demo 002 - Hồ Chí Minh","address":"Đường Nguyễn Lương Bằng, Phường Tân Mỹ, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r1verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r1verification, @seed_r1proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r1verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r1verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r1house, @seed_r1room, 'Cho thuê phòng Master Full nội thất tolet riêng Chung cư Era Town Đức Khải 3tr5, 3tr3tr9, 4tr3, 4tr', 'Phòng cho thuê tại Đường Nguyễn Lương Bằng, Phường Tân Mỹ, Hồ Chí Minh. Diện tích 28 m²; giá tham khảo 3,500,000 đồng/tháng. Tiện ích ghi trong tin: WC riêng, Máy giặt, Tủ lạnh, Bếp. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-thue-rieng-chung-cu-era-town-quan-7-pr609404.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r1post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r1post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/10/12/img-5718_1697075486.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r1post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/12/21/img-8354_1734749421.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r1post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/12/16/img-8115_1734321173.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r1post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/09/16/img-3453_1694868994.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r1post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/12/16/img-8114_1734321237.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r1post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/11/14/img-4035_1699942389.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r1post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r1post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r1post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r1post, 'Bếp');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r1house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r1hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r1room, @seed_r1house, @seed_r1hs0);
SET @seed_r1rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r1house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r1hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r1room, @seed_r1house, @seed_r1hs1);
SET @seed_r1rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r1house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r1hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r1room, @seed_r1house, @seed_r1hs2);
SET @seed_r1rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r1house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r1hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r1room, @seed_r1house, @seed_r1hs3);
SET @seed_r1rs3 = LAST_INSERT_ID();

-- Tin 3: https://phongtro123.com/chinh-chu-cho-thue-phong-tro-duong-ung-van-khiem-quan-binh-thanh-pr649687.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 003 - Hồ Chí Minh', '97/13 Đường Ung Văn Khiêm, Phường Thạnh Mỹ Tây, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/chinh-chu-cho-thue-phong-tro-duong-ung-van-khiem-quan-binh-thanh-pr649687.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r2house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r2house, 'P101', 20.0, 3500000, 3500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r2room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r2proof.pdf', 'DEMO-r2proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r2proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r2house, @seed_owner3, 1, '{"name":"Nhà demo 003 - Hồ Chí Minh","address":"97/13 Đường Ung Văn Khiêm, Phường Thạnh Mỹ Tây, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r2verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r2verification, @seed_r2proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r2verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r2verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r2house, @seed_r2room, 'GẦN NGOẠI THƯƠNG, GTVT, HUTECH, HỒNG BÀNG, UEF, Ga Metro-UNG VĂN KHIÊM P.Thạnh Mỹ Tây, Tp. HCM', 'Phòng cho thuê tại 97/13 Đường Ung Văn Khiêm, Phường Thạnh Mỹ Tây, Hồ Chí Minh. Diện tích 20 m²; giá tham khảo 3,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Gác lửng, Tủ lạnh, Thang máy, Chỗ để xe, Bếp. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/chinh-chu-cho-thue-phong-tro-duong-ung-van-khiem-quan-binh-thanh-pr649687.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r2post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r2post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/03/29/2_1711684797.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r2post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/03/29/3_1711684797.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r2post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/07/26/z5663647114739-bfcd830558f41c99effc8241092fd28b_1721959648.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r2post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/07/26/z5663647097259-c0d3ee70453610426b44f1e68f9599ce_1721960298.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r2post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/07/26/z5663647133669-39524d521f12dc4adcbad4664654575e_1721960313.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r2post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/07/26/z5663646861408-0b6364646a2473b5624578f1c6c5f187_1721959591.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r2post, 'Bếp');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r2house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r2hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r2room, @seed_r2house, @seed_r2hs0);
SET @seed_r2rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r2house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r2hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r2room, @seed_r2house, @seed_r2hs1);
SET @seed_r2rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r2house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r2hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r2room, @seed_r2house, @seed_r2hs2);
SET @seed_r2rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r2house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r2hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r2room, @seed_r2house, @seed_r2hs3);
SET @seed_r2rs3 = LAST_INSERT_ID();

-- Tin 4: https://phongtro123.com/phong-tro-moi-xay-48-13-luong-the-vinh-phuong-tan-thoi-hoa-tan-phu-gan-dam-sen-pr603145.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 004 - Hồ Chí Minh', '48/13 Đường Lương Thế Vinh, Phường Tân Phú, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/phong-tro-moi-xay-48-13-luong-the-vinh-phuong-tan-thoi-hoa-tan-phu-gan-dam-sen-pr603145.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r3house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r3house, 'P101', 20.0, 1900000, 1900000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r3room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r3proof.pdf', 'DEMO-r3proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r3proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r3house, @seed_owner4, 1, '{"name":"Nhà demo 004 - Hồ Chí Minh","address":"48/13 Đường Lương Thế Vinh, Phường Tân Phú, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r3verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r3verification, @seed_r3proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r3verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r3verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r3house, @seed_r3room, 'Cho thuê phòng trọ mới sơn sửa 05/2025 - Lương Thế Vinh, P. Tân Thới Hòa, Quận Tân Phú (Gần Đầm Sen)', 'Phòng cho thuê tại 48/13 Đường Lương Thế Vinh, Phường Tân Phú, Hồ Chí Minh. Diện tích 20 m²; giá tham khảo 1,900,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Gác lửng, Cửa sổ, WC riêng, Chỗ để xe. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-tro-moi-xay-48-13-luong-the-vinh-phuong-tan-thoi-hoa-tan-phu-gan-dam-sen-pr603145.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r3post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r3post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/05/08/11_1746698807.png', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r3post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/05/08/3_1746698802.png', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r3post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/05/08/8_1746698805.png', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r3post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/05/08/4_1746698803.png', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r3post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/05/08/9_1746698805.png', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r3post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/05/08/5_1746698803.png', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r3post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r3post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r3post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r3post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r3post, 'Chỗ để xe');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r3house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r3hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r3room, @seed_r3house, @seed_r3hs0);
SET @seed_r3rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r3house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r3hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r3room, @seed_r3house, @seed_r3hs1);
SET @seed_r3rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r3house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r3hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r3room, @seed_r3house, @seed_r3hs2);
SET @seed_r3rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r3house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r3hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r3room, @seed_r3house, @seed_r3hs3);
SET @seed_r3rs3 = LAST_INSERT_ID();

-- Tin 5: https://phongtro123.com/cho-thue-phong-chinh-chu-3-5trieu-25m2-day-du-tien-nghi-trung-tam-quan-1-pr311292.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 005 - Hồ Chí Minh', '212b/78 Đường Nguyễn Trãi, Phường Cầu Ông Lãnh, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/cho-thue-phong-chinh-chu-3-5trieu-25m2-day-du-tien-nghi-trung-tam-quan-1-pr311292.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r4house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r4house, 'P101', 25.0, 3600000, 3600000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r4room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r4proof.pdf', 'DEMO-r4proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r4proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r4house, @seed_owner5, 1, '{"name":"Nhà demo 005 - Hồ Chí Minh","address":"212b/78 Đường Nguyễn Trãi, Phường Cầu Ông Lãnh, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r4verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r4verification, @seed_r4proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r4verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r4verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r4house, @seed_r4room, 'Phòng trọ Full nội thất - an ninh - giờ giấc tự do - lối đi riêng', 'Phòng cho thuê tại 212b/78 Đường Nguyễn Trãi, Phường Cầu Ông Lãnh, Hồ Chí Minh. Diện tích 25 m²; giá tham khảo 3,600,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, WC riêng, Tủ lạnh, Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-chinh-chu-3-5trieu-25m2-day-du-tien-nghi-trung-tam-quan-1-pr311292.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r4post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r4post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2022/02/06/z3161610435401-889bec8460d361ae21df3396f69936e9_1644137365.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r4post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2022/02/06/z3161610491004-84eba3de0816203ea82ef9a307bec21c_1644137365.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r4post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2022/02/06/z3161610517928-9f5e98d238f9a5235b01cc6488c40c6c_1644137367.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r4post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2022/02/06/z3161616649717-8dac6262ba703ceaad5e3d06332e7d4a_1644137475.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r4post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2022/02/06/z3161617340301-f1850bfecda5a4155399be2df65772e8_1644137474.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r4post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r4post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r4post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r4post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r4house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r4hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r4room, @seed_r4house, @seed_r4hs0);
SET @seed_r4rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r4house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r4hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r4room, @seed_r4house, @seed_r4hs1);
SET @seed_r4rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r4house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r4hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r4room, @seed_r4house, @seed_r4hs2);
SET @seed_r4rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r4house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r4hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r4room, @seed_r4house, @seed_r4hs3);
SET @seed_r4rs3 = LAST_INSERT_ID();

-- Tin 6: https://phongtro123.com/cho-thue-phong-tro-trung-tam-q10-ke-ben-nha-thi-dau-phu-tho-gan-cac-truong-dai-hoc-pr607860.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 006 - Hồ Chí Minh', '224/36 Phố Lý Thường Kiệt, Phường Diên Hồng, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-trung-tam-q10-ke-ben-nha-thi-dau-phu-tho-gan-cac-truong-dai-hoc-pr607860.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r5house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r5house, 'P101', 16.0, 3300000, 3300000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r5room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r5proof.pdf', 'DEMO-r5proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r5proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r5house, @seed_owner6, 1, '{"name":"Nhà demo 006 - Hồ Chí Minh","address":"224/36 Phố Lý Thường Kiệt, Phường Diên Hồng, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r5verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r5verification, @seed_r5proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r5verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r5verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r5house, @seed_r5room, 'Cho thuê phòng trọ phố Lý Thường Kiệt, đối diện tt tdtt Phú Thọ, Q10, gần các trường đại học.', 'Phòng cho thuê tại 224/36 Phố Lý Thường Kiệt, Phường Diên Hồng, Hồ Chí Minh. Diện tích 16 m²; giá tham khảo 3,300,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Thang máy, Chỗ để xe, Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-trung-tam-q10-ke-ben-nha-thi-dau-phu-tho-gan-cac-truong-dai-hoc-pr607860.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r5post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r5post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/02/13/img-8083_1770969899.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r5post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/02/13/img-8082_1770969899.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r5post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/02/13/img-8081_1770969905.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r5post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/02/13/img-8080_1770969905.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r5post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/02/13/img-8079_1770969911.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r5post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r5post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r5post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r5post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r5house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r5hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r5room, @seed_r5house, @seed_r5hs0);
SET @seed_r5rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r5house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r5hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r5room, @seed_r5house, @seed_r5hs1);
SET @seed_r5rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r5house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r5hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r5room, @seed_r5house, @seed_r5hs2);
SET @seed_r5rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r5house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r5hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r5room, @seed_r5house, @seed_r5hs3);
SET @seed_r5rs3 = LAST_INSERT_ID();

-- Tin 7: https://phongtro123.com/cho-thue-phong-tro-gan-ngay-mat-tien-nguyen-duy-trinh-quan-2-dien-tich-tu-25m2-den-30m2-yen-tinh-tu-do-an-ninh-pr595980.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 007 - Hồ Chí Minh', '56/1 Đường số 5, Phường Bình Trưng, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-gan-ngay-mat-tien-nguyen-duy-trinh-quan-2-dien-tich-tu-25m2-den-30m2-yen-tinh-tu-do-an-ninh-pr595980.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r6house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r6house, 'P101', 30.0, 3100000, 3100000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r6room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r6proof.pdf', 'DEMO-r6proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r6proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r6house, @seed_owner1, 1, '{"name":"Nhà demo 007 - Hồ Chí Minh","address":"56/1 Đường số 5, Phường Bình Trưng, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r6verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r6verification, @seed_r6proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r6verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r6verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r6house, @seed_r6room, 'Cho thuê phòng trọ tại phường Bình Trưng Tây, Quận 2', 'Phòng cho thuê tại 56/1 Đường số 5, Phường Bình Trưng, Hồ Chí Minh. Diện tích 30 m²; giá tham khảo 3,100,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, WC riêng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-gan-ngay-mat-tien-nguyen-duy-trinh-quan-2-dien-tich-tu-25m2-den-30m2-yen-tinh-tu-do-an-ninh-pr595980.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r6post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r6post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/09/11/32ba5b3746c4cd9a94d51_1757553034.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r6post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/09/11/5bce1a4807bb8ce5d5aa6_1757553034.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r6post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/09/11/42ea986285910ecf57807_1757553035.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r6post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/09/11/64bd750268f1e3afbae03_1757553035.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r6post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/09/11/23492828479106907845_1757553036.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r6post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/09/11/a1a4f311e9e262bc3bf32_1757553037.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r6post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r6post, 'WC riêng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r6house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r6hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r6room, @seed_r6house, @seed_r6hs0);
SET @seed_r6rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r6house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r6hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r6room, @seed_r6house, @seed_r6hs1);
SET @seed_r6rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r6house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r6hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r6room, @seed_r6house, @seed_r6hs2);
SET @seed_r6rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r6house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r6hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r6room, @seed_r6house, @seed_r6hs3);
SET @seed_r6rs3 = LAST_INSERT_ID();

-- Tin 8: https://phongtro123.com/chinh-chu-cho-thue-can-ho-rong-tu-25m2-phuong-binh-an-quan-2-gia-4tr8-6tr8-thang-pr679275.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 008 - Hồ Chí Minh', '21B Đường số 10, Phường An Khánh, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/chinh-chu-cho-thue-can-ho-rong-tu-25m2-phuong-binh-an-quan-2-gia-4tr8-6tr8-thang-pr679275.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r7house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r7house, 'P101', 20.0, 3300000, 3300000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r7room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r7proof.pdf', 'DEMO-r7proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r7proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r7house, @seed_owner2, 1, '{"name":"Nhà demo 008 - Hồ Chí Minh","address":"21B Đường số 10, Phường An Khánh, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r7verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r7verification, @seed_r7proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r7verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r7verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r7house, @seed_r7room, 'Chính chủ cho thuê phòng trọ lớn rộng 20m2, phường An Khánh, TP Thủ Đức, giá 3tr3 /tháng', 'Phòng cho thuê tại 21B Đường số 10, Phường An Khánh, Hồ Chí Minh. Diện tích 20 m²; giá tham khảo 3,300,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Cửa sổ, Máy giặt, Tủ lạnh. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/chinh-chu-cho-thue-can-ho-rong-tu-25m2-phuong-binh-an-quan-2-gia-4tr8-6tr8-thang-pr679275.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r7post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r7post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/1792390283475-5031620387965032671-5031620387965032671-747c8d6ee09bf8a2c8ee22a13d024804-1792390445_1794389374.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r7post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/1792390283445-5031620387965032671-5031620387965032671-59007294e1c46a1054921e20d4088d05-1792392458_1794389374.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r7post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/1792390283504-5031620387965032671-5031620387965032671-071f9d10a60f0b57fe2e9d3dbb077513-1792392522_1794389374.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r7post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/1792390283431-5031620387965032671-5031620387965032671-46d529109b9a7c4d73f32a6a864fedab-1792390528_1794389374.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r7post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/2a-1651658363_1794389374.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r7post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/z3388820651646-d7bf6e28c49c82f8261e9b405785e7b9-1651713877_1794389374.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r7post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r7post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r7post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r7post, 'Tủ lạnh');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r7house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r7hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r7room, @seed_r7house, @seed_r7hs0);
SET @seed_r7rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r7house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r7hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r7room, @seed_r7house, @seed_r7hs1);
SET @seed_r7rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r7house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r7hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r7room, @seed_r7house, @seed_r7hs2);
SET @seed_r7rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r7house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r7hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r7room, @seed_r7house, @seed_r7hs3);
SET @seed_r7rs3 = LAST_INSERT_ID();

-- Tin 9: https://phongtro123.com/cho-thue-phong-cao-cap-day-du-tien-nghi-giam-gia-mua-dich-vo-o-lien-pr591796.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 009 - Hồ Chí Minh', '320 Đường Trường Chinh, Phường Tân Bình, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/cho-thue-phong-cao-cap-day-du-tien-nghi-giam-gia-mua-dich-vo-o-lien-pr591796.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r8house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r8house, 'P101', 30.0, 4000000, 4000000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r8room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r8proof.pdf', 'DEMO-r8proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r8proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r8house, @seed_owner3, 1, '{"name":"Nhà demo 009 - Hồ Chí Minh","address":"320 Đường Trường Chinh, Phường Tân Bình, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r8verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r8verification, @seed_r8proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r8verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r8verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r8house, @seed_r8room, 'Cho thuê phòng cao cấp, Đầy đủ tiện nghi, phòng trống giao ngay. Giá: 4 triệu/tháng', 'Phòng cho thuê tại 320 Đường Trường Chinh, Phường Tân Bình, Hồ Chí Minh. Diện tích 30 m²; giá tham khảo 4,000,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Ban công, Cửa sổ, WC riêng, Máy giặt, Tủ lạnh, Thang máy, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-cao-cap-day-du-tien-nghi-giam-gia-mua-dich-vo-o-lien-pr591796.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r8post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r8post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/03/28/h1_1743143258.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r8post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/03/28/h5_1743143291.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r8post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/03/28/h6_1743143297.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r8post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/03/28/z6282940933986-d85447eff50ac67b5078f70a0da5093d_1743143424.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r8post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/03/28/h4_1743143308.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r8post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/03/28/h2_1743143320.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Ban công');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r8post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r8house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r8hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r8room, @seed_r8house, @seed_r8hs0);
SET @seed_r8rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r8house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r8hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r8room, @seed_r8house, @seed_r8hs1);
SET @seed_r8rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r8house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r8hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r8room, @seed_r8house, @seed_r8hs2);
SET @seed_r8rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r8house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r8hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r8room, @seed_r8house, @seed_r8hs3);
SET @seed_r8rs3 = LAST_INSERT_ID();

-- Tin 10: https://phongtro123.com/phong-day-du-tien-nghi-q-binh-thanh-co-bep-co-bao-ve-thang-may-dt-20m2-gia-4tr-thang-pr309434.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 010 - Hồ Chí Minh', '44 Đường Nguyễn Cửu Vân, Phường Gia Định, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://phongtro123.com/phong-day-du-tien-nghi-q-binh-thanh-co-bep-co-bao-ve-thang-may-dt-20m2-gia-4tr-thang-pr309434.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r9house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r9house, 'P101', 20.0, 4200000, 4200000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r9room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r9proof.pdf', 'DEMO-r9proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r9proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r9house, @seed_owner4, 1, '{"name":"Nhà demo 010 - Hồ Chí Minh","address":"44 Đường Nguyễn Cửu Vân, Phường Gia Định, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r9verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r9verification, @seed_r9proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r9verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r9verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r9house, @seed_r9room, 'Phòng Đầy Đủ Tiện Nghi Q.Bình Thạnh, Có bếp, Có Bảo vệ, Thang Máy. Dt: 20m2. Giá: 4,2tr/tháng', 'Phòng cho thuê tại 44 Đường Nguyễn Cửu Vân, Phường Gia Định, Hồ Chí Minh. Diện tích 20 m²; giá tham khảo 4,200,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Máy giặt, Tủ lạnh, Thang máy, Giờ giấc tự do, Bếp, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-day-du-tien-nghi-q-binh-thanh-co-bep-co-bao-ve-thang-may-dt-20m2-gia-4tr-thang-pr309434.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r9post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r9post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/11/img-5368_1773220845.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r9post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/11/img-5370_1773220848.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r9post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/11/img-5371_1773220852.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r9post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/11/img-5372_1773220856.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r9post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/11/img-5373_1773220856.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r9post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/11/4_1773220865.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Giờ giấc tự do');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Bếp');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r9post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r9house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r9hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r9room, @seed_r9house, @seed_r9hs0);
SET @seed_r9rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r9house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r9hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r9room, @seed_r9house, @seed_r9hs1);
SET @seed_r9rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r9house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r9hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r9room, @seed_r9house, @seed_r9hs2);
SET @seed_r9rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r9house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r9hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r9room, @seed_r9house, @seed_r9hs3);
SET @seed_r9rs3 = LAST_INSERT_ID();

-- Tin 11: https://phongtro123.com/35m-du-dh-tu-quat-giuong-4nguoi-chi-tu-2tr-pr709553.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 011 - Hà Nội', 'Số 15, Ngõ 90 Đường La Tinh 2, Xã An Khánh, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/35m-du-dh-tu-quat-giuong-4nguoi-chi-tu-2tr-pr709553.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r10house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r10house, 'P101', 35.0, 2000000, 2000000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r10room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r10proof.pdf', 'DEMO-r10proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r10proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r10house, @seed_owner5, 1, '{"name":"Nhà demo 011 - Hà Nội","address":"Số 15, Ngõ 90 Đường La Tinh 2, Xã An Khánh, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r10verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r10verification, @seed_r10proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r10verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r10verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r10house, @seed_r10room, 'Phòng 35M2 từ 1tr6 đến 2tr2/1tháng LH 0962 036 228', 'Phòng cho thuê tại Số 15, Ngõ 90 Đường La Tinh 2, Xã An Khánh, Hà Nội. Diện tích 35 m²; giá tham khảo 2,000,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Ban công, Cửa sổ, Máy giặt, Tủ lạnh. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/35m-du-dh-tu-quat-giuong-4nguoi-chi-tu-2tr-pr709553.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r10post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r10post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/07/13/7_1783913395.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r10post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/21/4_1792538556.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r10post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/21/3_1792538467.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r10post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/23/20261023-163059_1792750864.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r10post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/23/20261023-164038_1792750780.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r10post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/07/13/5_1783913400.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r10post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r10post, 'Ban công');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r10post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r10post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r10post, 'Tủ lạnh');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r10house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r10hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r10room, @seed_r10house, @seed_r10hs0);
SET @seed_r10rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r10house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r10hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r10room, @seed_r10house, @seed_r10hs1);
SET @seed_r10rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r10house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r10hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r10room, @seed_r10house, @seed_r10hs2);
SET @seed_r10rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r10house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r10hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r10room, @seed_r10house, @seed_r10hs3);
SET @seed_r10rs3 = LAST_INSERT_ID();

-- Tin 12: https://phongtro123.com/cho-thue-phong-khep-kin-36m2-xuan-phuong-nam-tu-liem-chi-3-trieu-thang-pr716058.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 012 - Hà Nội', 'Số 28C, ngõ 80/101/32 Đường Xuân Phương, Phường Xuân Phương, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/cho-thue-phong-khep-kin-36m2-xuan-phuong-nam-tu-liem-chi-3-trieu-thang-pr716058.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r11house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r11house, 'P101', 36.0, 3000000, 3000000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r11room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r11proof.pdf', 'DEMO-r11proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r11proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r11house, @seed_owner6, 1, '{"name":"Nhà demo 012 - Hà Nội","address":"Số 28C, ngõ 80/101/32 Đường Xuân Phương, Phường Xuân Phương, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r11verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r11verification, @seed_r11proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r11verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r11verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r11house, @seed_r11room, 'CHO THUÊ PHÒNG KHÉP KÍN 36M² – XUÂN PHƯƠNG, NAM TỪ LIÊM – CHỈ 3 TRIỆU/THÁNG', 'Phòng cho thuê tại Số 28C, ngõ 80/101/32 Đường Xuân Phương, Phường Xuân Phương, Hà Nội. Diện tích 36 m²; giá tham khảo 3,000,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, WC riêng, Máy giặt. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-khep-kin-36m2-xuan-phuong-nam-tu-liem-chi-3-trieu-thang-pr716058.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r11post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r11post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/871102574-122264786564273109-2221305156246182204-n_1794531576.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r11post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/875878893-122264786576273109-2246256946172944618-n_1794531576.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r11post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/871281720-122264786558273109-3717968252837268792-n_1794531608.jpg', 2);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r11post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r11post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r11post, 'Máy giặt');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r11house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r11hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r11room, @seed_r11house, @seed_r11hs0);
SET @seed_r11rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r11house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r11hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r11room, @seed_r11house, @seed_r11hs1);
SET @seed_r11rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r11house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r11hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r11room, @seed_r11house, @seed_r11hs2);
SET @seed_r11rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r11house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r11hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r11room, @seed_r11house, @seed_r11hs3);
SET @seed_r11rs3 = LAST_INSERT_ID();

-- Tin 13: https://phongtro123.com/trong-phong-4tr-co-linh-gan-aeon-mall-long-bien-pr713562.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 013 - Hà Nội', 'Số 6 ngõ 188/35/14 Đường Tư Đình, Phường Long Biên, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/trong-phong-4tr-co-linh-gan-aeon-mall-long-bien-pr713562.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r12house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r12house, 'P101', 25.0, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r12room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r12proof.pdf', 'DEMO-r12proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r12proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r12house, @seed_owner1, 1, '{"name":"Nhà demo 013 - Hà Nội","address":"Số 6 ngõ 188/35/14 Đường Tư Đình, Phường Long Biên, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r12verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r12verification, @seed_r12proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r12verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r12verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r12house, @seed_r12room, 'Trống phòng 2tr5 Tư Đình cần cho thuê . Gần AEON MALL Long Biên', 'Phòng cho thuê tại Số 6 ngõ 188/35/14 Đường Tư Đình, Phường Long Biên, Hà Nội. Diện tích 25 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Cửa sổ, WC riêng, Máy giặt, Chỗ để xe, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/trong-phong-4tr-co-linh-gan-aeon-mall-long-bien-pr713562.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r12post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r12post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/02/1791968344081-2279144030379059256-7519835379620783554-6d46e2b03f9ab091f79678aaeaba6ff7_1793606226.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r12post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/02/1791968344092-2279144030379059256-7519835379620783554-cdae5ebbf92b505f224420690515635f_1793606226.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r12post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/02/1791968344102-2279144030379059256-7519835379620783554-8e21641f6a5c8214e1cf3677a497a48e_1793606228.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r12post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/24/z3182725013332-e8ed7252554a4d1a4c250984a3c5969e_1790240779.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r12post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/24/z3182725016617-10a1a50fb5cfabe975f5375b387f7505_1790240782.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r12post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/24/z3182725018425-674f59699683ac31fccc57c4095605f1_1790240782.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r12post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r12post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r12post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r12post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r12post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r12post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r12house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r12hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r12room, @seed_r12house, @seed_r12hs0);
SET @seed_r12rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r12house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r12hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r12room, @seed_r12house, @seed_r12hs1);
SET @seed_r12rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r12house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r12hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r12room, @seed_r12house, @seed_r12hs2);
SET @seed_r12rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r12house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r12hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r12room, @seed_r12house, @seed_r12hs3);
SET @seed_r12rs3 = LAST_INSERT_ID();

-- Tin 14: https://phongtro123.com/nha-khep-kin-khu-nhat-tan-tay-ho-hn-pr583316.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 014 - Hà Nội', 'Đường Âu Cơ, Phường Hồng Hà, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/nha-khep-kin-khu-nhat-tan-tay-ho-hn-pr583316.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r13house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r13house, 'P101', 35.0, 3000000, 3000000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r13room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r13proof.pdf', 'DEMO-r13proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r13proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r13house, @seed_owner2, 1, '{"name":"Nhà demo 014 - Hà Nội","address":"Đường Âu Cơ, Phường Hồng Hà, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r13verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r13verification, @seed_r13proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r13verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r13verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r13house, @seed_r13room, 'Nhà khép kín khu Nhật Tân, Tây Hồ, HN', 'Phòng cho thuê tại Đường Âu Cơ, Phường Hồng Hà, Hà Nội. Diện tích 35 m²; giá tham khảo 3,000,000 đồng/tháng. Tiện ích ghi trong tin: Gác lửng, WC riêng, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/nha-khep-kin-khu-nhat-tan-tay-ho-hn-pr583316.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r13post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r13post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/03/02/1b264294-67a4-46b8-af37-da389cb5d953_1614667496.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r13post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/03/02/6852f003-1ae0-4ee2-a74d-5ab625caf47d_1614667496.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r13post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/03/02/3d53b8b9-cd3d-4a12-a9b0-644ba2fbec91_1614667497.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r13post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/03/02/167e44b7-a063-416b-9071-6df9489205da_1614667497.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r13post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/03/02/aac23530-6db9-4d57-ad94-2920dab88b7a_1614667498.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r13post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2021/03/02/ee7ad032-dcdb-44e1-a124-c5ceb9b8e243_1614667499.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r13post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r13post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r13post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r13house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r13hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r13room, @seed_r13house, @seed_r13hs0);
SET @seed_r13rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r13house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r13hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r13room, @seed_r13house, @seed_r13hs1);
SET @seed_r13rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r13house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r13hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r13room, @seed_r13house, @seed_r13hs2);
SET @seed_r13rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r13house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r13hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r13room, @seed_r13house, @seed_r13hs3);
SET @seed_r13rs3 = LAST_INSERT_ID();

-- Tin 15: https://phongtro123.com/cho-thue-phong-tai-hem-56-gia-2-4tr-co-ban-cong-rong-nau-an-tai-ngo-89-pr647806.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 015 - Hà Nội', 'Ngõ 89 ngách 38 hẻm 56 số 12 Đường Lạc Long Quân, Phường Ba Đình, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/cho-thue-phong-tai-hem-56-gia-2-4tr-co-ban-cong-rong-nau-an-tai-ngo-89-pr647806.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r14house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r14house, 'P101', 19.0, 2400000, 2400000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r14room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r14proof.pdf', 'DEMO-r14proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r14proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r14house, @seed_owner3, 1, '{"name":"Nhà demo 015 - Hà Nội","address":"Ngõ 89 ngách 38 hẻm 56 số 12 Đường Lạc Long Quân, Phường Ba Đình, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r14verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r14verification, @seed_r14proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r14verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r14verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r14house, @seed_r14room, 'Cho thuê phòng tại hẻm 56, giá 2.4tr, có ban công rộng, nấu ăn tại Ngõ 89', 'Phòng cho thuê tại Ngõ 89 ngách 38 hẻm 56 số 12 Đường Lạc Long Quân, Phường Ba Đình, Hà Nội. Diện tích 19 m²; giá tham khảo 2,400,000 đồng/tháng. Tiện ích ghi trong tin: Ban công, Máy giặt. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tai-hem-56-gia-2-4tr-co-ban-cong-rong-nau-an-tai-ngo-89-pr647806.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r14post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r14post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/03/02/417498499-949390436747715-8933503454347832153-n_1709364872.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r14post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/03/02/417523483-949390630081029-9166662435139849031-n_1709364872.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r14post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/03/02/417547908-949390633414362-7193917740431618824-n_1709364873.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r14post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2024/03/02/417562236-949390460081046-2617473266063387769-n_1709364873.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r14post, 'Ban công');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r14post, 'Máy giặt');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r14house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r14hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r14room, @seed_r14house, @seed_r14hs0);
SET @seed_r14rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r14house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r14hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r14room, @seed_r14house, @seed_r14hs1);
SET @seed_r14rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r14house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r14hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r14room, @seed_r14house, @seed_r14hs2);
SET @seed_r14rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r14house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r14hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r14room, @seed_r14house, @seed_r14hs3);
SET @seed_r14rs3 = LAST_INSERT_ID();

-- Tin 16: https://phongtro123.com/tim-nguoi-o-ghep-khu-vuc-hai-ba-trung-pr689460.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 016 - Hà Nội', '15 Phố Mạc Thị Bưởi, Phường Vĩnh Tuy, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/tim-nguoi-o-ghep-khu-vuc-hai-ba-trung-pr689460.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r15house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r15house, 'P101', 30.0, 4000000, 4000000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r15room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r15proof.pdf', 'DEMO-r15proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r15proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r15house, @seed_owner4, 1, '{"name":"Nhà demo 016 - Hà Nội","address":"15 Phố Mạc Thị Bưởi, Phường Vĩnh Tuy, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r15verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r15verification, @seed_r15proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r15verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r15verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r15house, @seed_r15room, 'Cho thuê 1 phòng trong chung cư Hòa Bình Green, khu vực hai bà trưng', 'Phòng cho thuê tại 15 Phố Mạc Thị Bưởi, Phường Vĩnh Tuy, Hà Nội. Diện tích 30 m²; giá tham khảo 4,000,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/tim-nguoi-o-ghep-khu-vuc-hai-ba-trung-pr689460.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r15post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r15post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/08/18/image_1755479569.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r15post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/08/18/image_1755479592.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r15post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/08/18/image_1755479614.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r15post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/07/img-1695_1794017220.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r15post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/07/img-1694_1794017220.jpg', 4);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r15house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r15hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r15room, @seed_r15house, @seed_r15hs0);
SET @seed_r15rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r15house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r15hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r15room, @seed_r15house, @seed_r15hs1);
SET @seed_r15rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r15house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r15hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r15room, @seed_r15house, @seed_r15hs2);
SET @seed_r15rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r15house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r15hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r15room, @seed_r15house, @seed_r15hs3);
SET @seed_r15rs3 = LAST_INSERT_ID();

-- Tin 17: https://phongtro123.com/cho-thue-phong-o-nha-rieng-3-5-tang-gia-2-5-tr-th-ngo-254d-minh-khai-ha-noi-pr703188.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 017 - Hà Nội', 'Ngõ 254D Đường Minh Khai, Phường Tương Mai, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/cho-thue-phong-o-nha-rieng-3-5-tang-gia-2-5-tr-th-ngo-254d-minh-khai-ha-noi-pr703188.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r16house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r16house, 'P101', 15.0, 1700000, 1700000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r16room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r16proof.pdf', 'DEMO-r16proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r16proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r16house, @seed_owner5, 1, '{"name":"Nhà demo 017 - Hà Nội","address":"Ngõ 254D Đường Minh Khai, Phường Tương Mai, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r16verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r16verification, @seed_r16proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r16verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r16verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r16house, @seed_r16room, 'Cho thuê phòng ở nhà riêng 3,5 tầng, giá 1,7 tr/th, ngõ 254D Minh Khai, Hà Nội', 'Phòng cho thuê tại Ngõ 254D Đường Minh Khai, Phường Tương Mai, Hà Nội. Diện tích 15 m²; giá tham khảo 1,700,000 đồng/tháng. Tiện ích ghi trong tin: Cửa sổ, Máy giặt, Tủ lạnh, Chỗ để xe, Giờ giấc tự do, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-o-nha-rieng-3-5-tang-gia-2-5-tr-th-ngo-254d-minh-khai-ha-noi-pr703188.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r16post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r16post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/03/18/20191110-151751_1773804562.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r16post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/p1_1794409993.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r16post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/11/p2_1794410901.jpg', 2);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r16post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r16post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r16post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r16post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r16post, 'Giờ giấc tự do');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r16post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r16house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r16hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r16room, @seed_r16house, @seed_r16hs0);
SET @seed_r16rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r16house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r16hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r16room, @seed_r16house, @seed_r16hs1);
SET @seed_r16rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r16house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r16hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r16room, @seed_r16house, @seed_r16hs2);
SET @seed_r16rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r16house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r16hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r16room, @seed_r16house, @seed_r16hs3);
SET @seed_r16rs3 = LAST_INSERT_ID();

-- Tin 18: https://phongtro123.com/cho-thue-phong-tro-tai-nguyen-an-ninh-truong-dinh-gan-dhkt-xd-bk-pr315520.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 018 - Hà Nội', '57/35 Đường Nguyễn An Ninh, Phường Tương Mai, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-tai-nguyen-an-ninh-truong-dinh-gan-dhkt-xd-bk-pr315520.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r17house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r17house, 'P101', 25.0, 3500000, 3500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r17room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r17proof.pdf', 'DEMO-r17proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r17proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r17house, @seed_owner6, 1, '{"name":"Nhà demo 018 - Hà Nội","address":"57/35 Đường Nguyễn An Ninh, Phường Tương Mai, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r17verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r17verification, @seed_r17proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r17verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r17verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r17house, @seed_r17room, 'Cho thuê phòng tại Nguyễn An Ninh, Trương Định gần ĐHKT, XD, BK', 'Phòng cho thuê tại 57/35 Đường Nguyễn An Ninh, Phường Tương Mai, Hà Nội. Diện tích 25 m²; giá tham khảo 3,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, WC riêng, Máy giặt, Tủ lạnh, Chỗ để xe, Bếp, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-tai-nguyen-an-ninh-truong-dinh-gan-dhkt-xd-bk-pr315520.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r17post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r17post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2020/12/01/mt001_1606798356.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r17post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/p73_1793983528.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r17post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/05/01/z7781842667345-76204179ec42e1b438b49675bfeb1add_1777646236.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r17post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/b004_1793983619.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r17post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/05/01/b007_1777646264.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'Bếp');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r17post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r17house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r17hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r17room, @seed_r17house, @seed_r17hs0);
SET @seed_r17rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r17house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r17hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r17room, @seed_r17house, @seed_r17hs1);
SET @seed_r17rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r17house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r17hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r17room, @seed_r17house, @seed_r17hs2);
SET @seed_r17rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r17house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r17hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r17room, @seed_r17house, @seed_r17hs3);
SET @seed_r17rs3 = LAST_INSERT_ID();

-- Tin 19: https://phongtro123.com/cho-thue-phong-tro-homestay-khep-kin-o-ngo-192-kim-giang-pr602927.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 019 - Hà Nội', 'Ngõ 192 Đường Kim Giang, Phường Khương Đình, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-homestay-khep-kin-o-ngo-192-kim-giang-pr602927.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r18house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r18house, 'P101', 30.0, 3300000, 3300000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r18room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r18proof.pdf', 'DEMO-r18proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r18proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r18house, @seed_owner1, 1, '{"name":"Nhà demo 019 - Hà Nội","address":"Ngõ 192 Đường Kim Giang, Phường Khương Đình, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r18verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r18verification, @seed_r18proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r18verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r18verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r18house, @seed_r18room, 'Cho Thuê CCMN 3,3TR Khép Kín Full Đồ và Máy Giặt Máy Sấy Tại 192 Kim Giang', 'Phòng cho thuê tại Ngõ 192 Đường Kim Giang, Phường Khương Đình, Hà Nội. Diện tích 30 m²; giá tham khảo 3,300,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, WC riêng, Máy giặt, Tủ lạnh, Thang máy, Giờ giấc tự do, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-homestay-khep-kin-o-ngo-192-kim-giang-pr602927.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r18post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r18post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/03/13/z3890356541633-84d2be345b9c751261718a7a1497e7dd_1678688835.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r18post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/05/22/z3527691681962-ba01247358a8961fa42e56f4bf3a4006_1684688580.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r18post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/09/20/z3527691676014-bc70f384bcb6704f6e86fcab72441269_1695186049.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r18post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2025/10/15/z3890356534315-bff6df343c02f581dde081f8df1ab58a_1760501960.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r18post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/10/739cafa31429934de642d6818e5e13e3_1673321482.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r18post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2023/01/10/4a4a611568903150f2a02316f26aed65_1673321477.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Giờ giấc tự do');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r18post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r18house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r18hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r18room, @seed_r18house, @seed_r18hs0);
SET @seed_r18rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r18house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r18hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r18room, @seed_r18house, @seed_r18hs1);
SET @seed_r18rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r18house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r18hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r18room, @seed_r18house, @seed_r18hs2);
SET @seed_r18rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r18house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r18hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r18room, @seed_r18house, @seed_r18hs3);
SET @seed_r18rs3 = LAST_INSERT_ID();

-- Tin 20: https://phongtro123.com/cho-thue-phong-tai-nha-mat-pho-395-thuy-khue-du-noi-that-dieu-hoa-may-giat-wifi-2-pr711699.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 020 - Hà Nội', '395 đường Thụy Khuê, Phường Tây Hồ, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://phongtro123.com/cho-thue-phong-tai-nha-mat-pho-395-thuy-khue-du-noi-that-dieu-hoa-may-giat-wifi-2-pr711699.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r19house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r19house, 'P101', 15.0, 2600000, 2600000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r19room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r19proof.pdf', 'DEMO-r19proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r19proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r19house, @seed_owner2, 1, '{"name":"Nhà demo 020 - Hà Nội","address":"395 đường Thụy Khuê, Phường Tây Hồ, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r19verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r19verification, @seed_r19proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r19verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r19verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r19house, @seed_r19room, 'CHO THUÊ PHÒNG TẠI NHÀ MẶT PHỐ 395 THỤY KHUÊ ĐỦ NỘI THẤT, ĐIỀU HÒA, MÁY GIẶT, WIFI', 'Phòng cho thuê tại 395 đường Thụy Khuê, Phường Tây Hồ, Hà Nội. Diện tích 15 m²; giá tham khảo 2,600,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Ban công, Cửa sổ, Máy giặt. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tai-nha-mat-pho-395-thuy-khue-du-noi-that-dieu-hoa-may-giat-wifi-2-pr711699.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r19post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r19post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/08/18/z7555259973327-d4a3586d3ec6cb077343a1eeb6711546_1787020132.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r19post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/08/18/z7555259972951-e483f81f79c25c572169a44011b76470_1787020139.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r19post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/08/18/z7566945131817-44d89fa08d635399294293eddafeb41e_1787020144.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r19post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/08/18/z7566945181262-784ba078b93436189bd362e9d8ea5b9e_1787020147.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r19post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r19post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r19post, 'Ban công');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r19post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r19post, 'Máy giặt');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r19house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r19hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r19room, @seed_r19house, @seed_r19hs0);
SET @seed_r19rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r19house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r19hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r19room, @seed_r19house, @seed_r19hs1);
SET @seed_r19rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r19house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r19hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r19room, @seed_r19house, @seed_r19hs2);
SET @seed_r19rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r19house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r19hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r19room, @seed_r19house, @seed_r19hs3);
SET @seed_r19rs3 = LAST_INSERT_ID();

-- Tin 21: https://phongtro123.com/phong-cho-thue-410-vo-nguyen-giap-da-nang-pr715719.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 021 - Đà Nẵng', '410 Đường Võ Nguyên Giáp, Phường Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/phong-cho-thue-410-vo-nguyen-giap-da-nang-pr715719.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r20house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r20house, 'P101', 20.0, 3900000, 3900000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r20room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r20proof.pdf', 'DEMO-r20proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r20proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r20house, @seed_owner3, 1, '{"name":"Nhà demo 021 - Đà Nẵng","address":"410 Đường Võ Nguyên Giáp, Phường Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r20verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r20verification, @seed_r20proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r20verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r20verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r20house, @seed_r20room, 'PHÒNG CHO THUÊ – 410 VÕ NGUYÊN GIÁP, ĐÀ NẴNG', 'Phòng cho thuê tại 410 Đường Võ Nguyên Giáp, Phường Ngũ Hành Sơn, Đà Nẵng. Diện tích 20 m²; giá tham khảo 3,900,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, WC riêng, Giờ giấc tự do, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-cho-thue-410-vo-nguyen-giap-da-nang-pr715719.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r20post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r20post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793173396314-196440184262168613-5216912787822216698-daac96f9ef8f17c25b88c46b52e5c6bc_1793952093.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r20post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793173346516-196440184262168613-5216912787822216698-944839b9360c1ed7b2415dc691e53e9a_1793952093.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r20post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793173346503-196440184262168613-5216912787822216698-626d8e9d1d027bf5928dc2f179f87ef2_1793952095.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r20post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793173346530-196440184262168613-5216912787822216698-af336621ef473c48b983f5ad6f011ba1_1793952095.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r20post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r20post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r20post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r20post, 'Giờ giấc tự do');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r20post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r20house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r20hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r20room, @seed_r20house, @seed_r20hs0);
SET @seed_r20rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r20house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r20hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r20room, @seed_r20house, @seed_r20hs1);
SET @seed_r20rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r20house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r20hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r20room, @seed_r20house, @seed_r20hs2);
SET @seed_r20rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r20house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r20hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r20room, @seed_r20house, @seed_r20hs3);
SET @seed_r20rs3 = LAST_INSERT_ID();

-- Tin 22: https://phongtro123.com/cho-thue-phong-tro-sinh-vien-gia-re-2-5tr-thang-pr716080.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 022 - Đà Nẵng', '168 Đường Kiều Phụng, Phường Hòa Xuân, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-sinh-vien-gia-re-2-5tr-thang-pr716080.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r21house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r21house, 'P101', 40.0, 2500000, 2500000, 4, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r21room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r21proof.pdf', 'DEMO-r21proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r21proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r21house, @seed_owner4, 1, '{"name":"Nhà demo 022 - Đà Nẵng","address":"168 Đường Kiều Phụng, Phường Hòa Xuân, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r21verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r21verification, @seed_r21proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r21verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r21verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r21house, @seed_r21room, 'CHO THUÊ PHÒNG TRỌ SINH VIÊN GIÁ RẺ 2.5TR/THÁNG', 'Phòng cho thuê tại 168 Đường Kiều Phụng, Phường Hòa Xuân, Đà Nẵng. Diện tích 40 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Gác lửng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-sinh-vien-gia-re-2-5tr-thang-pr716080.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r21post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r21post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/2-1761296754_1794542259.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r21post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/3-1761296755_1794542259.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r21post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/4-1761296755_1794542260.jpg', 2);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r21post, 'Gác lửng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r21house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r21hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r21room, @seed_r21house, @seed_r21hs0);
SET @seed_r21rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r21house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r21hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r21room, @seed_r21house, @seed_r21hs1);
SET @seed_r21rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r21house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r21hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r21room, @seed_r21house, @seed_r21hs2);
SET @seed_r21rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r21house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r21hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r21room, @seed_r21house, @seed_r21hs3);
SET @seed_r21rs3 = LAST_INSERT_ID();

-- Tin 23: https://phongtro123.com/phong-tro-da-man-15-ngu-hanh-son-gia-re-day-du-noi-that-pr716070.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 023 - Đà Nẵng', 'Đường Đa Mặn 15, Phường Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/phong-tro-da-man-15-ngu-hanh-son-gia-re-day-du-noi-that-pr716070.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r22house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r22house, 'P101', 24.0, 3000000, 3000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r22room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r22proof.pdf', 'DEMO-r22proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r22proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r22house, @seed_owner5, 1, '{"name":"Nhà demo 023 - Đà Nẵng","address":"Đường Đa Mặn 15, Phường Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r22verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r22verification, @seed_r22proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r22verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r22verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r22house, @seed_r22room, 'phòng trọ Đa Mặn 15, Ngũ Hành Sơn, giá rẻ, đầy đủ nội thất', 'Phòng cho thuê tại Đường Đa Mặn 15, Phường Ngũ Hành Sơn, Đà Nẵng. Diện tích 24 m²; giá tham khảo 3,000,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Gác lửng, Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-tro-da-man-15-ngu-hanh-son-gia-re-day-du-noi-that-pr716070.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r22post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r22post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/phongtrotruoc1_1794540449.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r22post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/phongtrotruoc2_1794540449.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r22post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/13/phongtrotruoc3_1794540450.jpg', 2);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r22post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r22post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r22post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r22house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r22hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r22room, @seed_r22house, @seed_r22hs0);
SET @seed_r22rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r22house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r22hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r22room, @seed_r22house, @seed_r22hs1);
SET @seed_r22rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r22house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r22hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r22room, @seed_r22house, @seed_r22hs2);
SET @seed_r22rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r22house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r22hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r22room, @seed_r22house, @seed_r22hs3);
SET @seed_r22rs3 = LAST_INSERT_ID();

-- Tin 24: https://phongtro123.com/phong-tro-25nha-minh-co-1-phong-tro-can-cho-thue-pr715703.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 024 - Đà Nẵng', '207/31 Đường Phạm Như Xương, Phường Hòa Khánh, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/phong-tro-25nha-minh-co-1-phong-tro-can-cho-thue-pr715703.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r23house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r23house, 'P101', 20.0, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r23room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r23proof.pdf', 'DEMO-r23proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r23proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r23house, @seed_owner6, 1, '{"name":"Nhà demo 024 - Đà Nẵng","address":"207/31 Đường Phạm Như Xương, Phường Hòa Khánh, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r23verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r23verification, @seed_r23proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r23verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r23verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r23house, @seed_r23room, 'Phòng trọ 20m2, có gác lửng, điều hòa, 2,5 triêu/tháng, wifi miễn phí, an ninh tốt', 'Phòng cho thuê tại 207/31 Đường Phạm Như Xương, Phường Hòa Khánh, Đà Nẵng. Diện tích 20 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Gác lửng, WC riêng, Chỗ để xe, Bếp. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-tro-25nha-minh-co-1-phong-tro-can-cho-thue-pr715703.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r23post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r23post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793544165455-63170911842998449-63170911842998449-6bf121d90948cfed3eb008592bfdddf8_1793942394.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r23post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793544165464-63170911842998449-63170911842998449-3a673ff2dd0c2819b808526e7cd77920_1793942394.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r23post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/06/1793544165461-63170911842998449-63170911842998449-f8f4395c97ba9e5439fd51ff1d0adccc_1793942396.jpg', 2);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r23post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r23post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r23post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r23post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r23post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r23post, 'Bếp');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r23house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r23hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r23room, @seed_r23house, @seed_r23hs0);
SET @seed_r23rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r23house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r23hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r23room, @seed_r23house, @seed_r23hs1);
SET @seed_r23rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r23house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r23hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r23room, @seed_r23house, @seed_r23hs2);
SET @seed_r23rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r23house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r23hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r23room, @seed_r23house, @seed_r23hs3);
SET @seed_r23rs3 = LAST_INSERT_ID();

-- Tin 25: https://phongtro123.com/phong-tro-day-du-noi-that-gan-fpt-plaza-pr715447.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 025 - Đà Nẵng', 'Lô 48- Vùng Trung 18 Đường Huỳnh Bá Chánh, Phường Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/phong-tro-day-du-noi-that-gan-fpt-plaza-pr715447.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r24house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r24house, 'P101', 30.0, 4500000, 4500000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r24room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r24proof.pdf', 'DEMO-r24proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r24proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r24house, @seed_owner1, 1, '{"name":"Nhà demo 025 - Đà Nẵng","address":"Lô 48- Vùng Trung 18 Đường Huỳnh Bá Chánh, Phường Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r24verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r24verification, @seed_r24proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r24verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r24verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r24house, @seed_r24room, 'PHÒNG TRỌ ĐẦY ĐỦ NỘI THẤT GẦN FPT PLAZA', 'Phòng cho thuê tại Lô 48- Vùng Trung 18 Đường Huỳnh Bá Chánh, Phường Ngũ Hành Sơn, Đà Nẵng. Diện tích 30 m²; giá tham khảo 4,500,000 đồng/tháng. Tiện ích ghi trong tin: Thang máy, Chỗ để xe. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-tro-day-du-noi-that-gan-fpt-plaza-pr715447.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r24post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r24post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/01/img-5881_1793509102.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r24post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/01/img-5897_1793509090.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r24post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/01/img-5896_1793509090.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r24post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/01/img-5892_1793509093.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r24post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/01/img-5882_1793509094.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r24post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/11/01/img-5886_1793509101.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r24post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r24post, 'Chỗ để xe');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r24house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r24hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r24room, @seed_r24house, @seed_r24hs0);
SET @seed_r24rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r24house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r24hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r24room, @seed_r24house, @seed_r24hs1);
SET @seed_r24rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r24house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r24hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r24room, @seed_r24house, @seed_r24hs2);
SET @seed_r24rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r24house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r24hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r24room, @seed_r24house, @seed_r24hs3);
SET @seed_r24rs3 = LAST_INSERT_ID();

-- Tin 26: https://phongtro123.com/phong-day-du-tro-day-du-tien-nghi-nam-trong-toa-nha-can-ho-co-thang-may-pr715408.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 026 - Đà Nẵng', '12 Đường Phước Tường 10, Phường An Khê, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/phong-day-du-tro-day-du-tien-nghi-nam-trong-toa-nha-can-ho-co-thang-may-pr715408.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r25house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r25house, 'P101', 24.0, 4200000, 4200000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r25room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r25proof.pdf', 'DEMO-r25proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r25proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r25house, @seed_owner2, 1, '{"name":"Nhà demo 026 - Đà Nẵng","address":"12 Đường Phước Tường 10, Phường An Khê, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r25verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r25verification, @seed_r25proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r25verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r25verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r25house, @seed_r25room, 'Phòng đầy đủ trọ đầy đủ tiện nghi..nằm trông tòa nhà căn hô. Có thang máy...', 'Phòng cho thuê tại 12 Đường Phước Tường 10, Phường An Khê, Đà Nẵng. Diện tích 24 m²; giá tham khảo 4,200,000 đồng/tháng. Tiện ích ghi trong tin: Thang máy, Chỗ để xe. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-day-du-tro-day-du-tien-nghi-nam-trong-toa-nha-can-ho-co-thang-may-pr715408.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r25post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r25post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/31/1793432482839-481093235249964449-5612045318695150317-2a29a28226781167b5c20b7b16c27a9d_1793432525.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r25post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/31/1793432482772-481093235249964449-5612045318695150317-700d555b064870cc4ee64e19c998e8ec_1793432525.jpg', 1);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r25post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r25post, 'Chỗ để xe');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r25house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r25hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r25room, @seed_r25house, @seed_r25hs0);
SET @seed_r25rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r25house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r25hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r25room, @seed_r25house, @seed_r25hs1);
SET @seed_r25rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r25house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r25hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r25room, @seed_r25house, @seed_r25hs2);
SET @seed_r25rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r25house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r25hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r25room, @seed_r25house, @seed_r25hs3);
SET @seed_r25rs3 = LAST_INSERT_ID();

-- Tin 27: https://phongtro123.com/cho-thue-phong-tro-gan-cau-vuot-nga-ba-hue-pr715158.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 027 - Đà Nẵng', '192, Phường An Khê, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-gan-cau-vuot-nga-ba-hue-pr715158.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r26house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r26house, 'P101', 25.0, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r26room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r26proof.pdf', 'DEMO-r26proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r26proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r26house, @seed_owner3, 1, '{"name":"Nhà demo 027 - Đà Nẵng","address":"192, Phường An Khê, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r26verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r26verification, @seed_r26proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r26verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r26verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r26house, @seed_r26room, 'Cho thuê phòng trọ gần cầu vượt ngã ba huế', 'Phòng cho thuê tại 192, Phường An Khê, Đà Nẵng. Diện tích 25 m²; giá tham khảo 2,500,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-gan-cau-vuot-nga-ba-hue-pr715158.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r26post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r26post, 'https://phongtro123.com/images/thumb_default.svg', 0);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r26house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r26hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r26room, @seed_r26house, @seed_r26hs0);
SET @seed_r26rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r26house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r26hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r26room, @seed_r26house, @seed_r26hs1);
SET @seed_r26rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r26house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r26hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r26room, @seed_r26house, @seed_r26hs2);
SET @seed_r26rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r26house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r26hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r26room, @seed_r26house, @seed_r26hs3);
SET @seed_r26rs3 = LAST_INSERT_ID();

-- Tin 28: https://phongtro123.com/phong-tro-ket-hop-kinh-doanh-khu-vuc-trung-tam-hai-chau-pr715090.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 028 - Đà Nẵng', 'Đường Hàn Thuyên, Phường Hòa Cường, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/phong-tro-ket-hop-kinh-doanh-khu-vuc-trung-tam-hai-chau-pr715090.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r27house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r27house, 'P101', 45.0, 7000000, 7000000, 4, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r27room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r27proof.pdf', 'DEMO-r27proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r27proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r27house, @seed_owner4, 1, '{"name":"Nhà demo 028 - Đà Nẵng","address":"Đường Hàn Thuyên, Phường Hòa Cường, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r27verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r27verification, @seed_r27proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r27verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r27verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r27house, @seed_r27room, 'Phòng trọ kết hợp kinh doanh khu vực trung tâm Hải Châu', 'Phòng cho thuê tại Đường Hàn Thuyên, Phường Hòa Cường, Đà Nẵng. Diện tích 45 m²; giá tham khảo 7,000,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/phong-tro-ket-hop-kinh-doanh-khu-vuc-trung-tam-hai-chau-pr715090.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r27post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r27post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/24/screenshot-20261021-142232-maps2_1792805497.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r27post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/24/screenshot-20261021-142141-maps_1792805497.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r27post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/24/screenshot-20261021-142141-maps2_1792805498.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r27post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/24/screenshot-20261021-141916-maps_1792805499.jpg', 3);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r27house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r27hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r27room, @seed_r27house, @seed_r27hs0);
SET @seed_r27rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r27house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r27hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r27room, @seed_r27house, @seed_r27hs1);
SET @seed_r27rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r27house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r27hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r27room, @seed_r27house, @seed_r27hs2);
SET @seed_r27rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r27house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r27hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r27room, @seed_r27house, @seed_r27hs3);
SET @seed_r27rs3 = LAST_INSERT_ID();

-- Tin 29: https://phongtro123.com/cho-thue-phong-mat-tien-tang-2-so-51-an-trung-dong-7-dia-chi-so-51-duong-an-trung-dong-7-pr714369.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 029 - Đà Nẵng', '51 Đường An Trung Đông 7, Phường An Hải, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/cho-thue-phong-mat-tien-tang-2-so-51-an-trung-dong-7-dia-chi-so-51-duong-an-trung-dong-7-pr714369.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r28house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r28house, 'P101', 10.0, 4000000, 4000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r28room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r28proof.pdf', 'DEMO-r28proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r28proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r28house, @seed_owner5, 1, '{"name":"Nhà demo 029 - Đà Nẵng","address":"51 Đường An Trung Đông 7, Phường An Hải, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r28verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r28verification, @seed_r28proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r28verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r28verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r28house, @seed_r28room, 'CHO THUÊ PHÒNG MẶT TIỀN TẦNG 2 — SỐ 51 AN TRUNG ĐÔNG 7 Địa chỉ: Số 51 đường An Trung Đông 7,', 'Phòng cho thuê tại 51 Đường An Trung Đông 7, Phường An Hải, Đà Nẵng. Diện tích 10 m²; giá tham khảo 4,000,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Ban công, Cửa sổ. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-mat-tien-tang-2-so-51-an-trung-dong-7-dia-chi-so-51-duong-an-trung-dong-7-pr714369.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r28post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r28post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/10/1791596879890-6576793955391885385-6576793955391885385-de2fa5bb66be4cea22b453b5cf5adf4c_1791596949.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r28post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/10/1791596879766-6576793955391885385-6576793955391885385-c1893c62a13a6bab9b423dc7fe15043d_1791596949.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r28post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/10/1791596879660-6576793955391885385-6576793955391885385-abf702dfd78648fde7e180058f1bb2db_1791596950.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r28post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/10/1791596879553-6576793955391885385-6576793955391885385-1f8ebf50f8d2e3fd852650f869bfd99c_1791596950.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r28post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/10/10/1791596879430-6576793955391885385-6576793955391885385-9f8cc5d38f3274b58ecb5efb8134ac9d_1791596951.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r28post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r28post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r28post, 'Ban công');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r28post, 'Cửa sổ');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r28house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r28hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r28room, @seed_r28house, @seed_r28hs0);
SET @seed_r28rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r28house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r28hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r28room, @seed_r28house, @seed_r28hs1);
SET @seed_r28rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r28house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r28hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r28room, @seed_r28house, @seed_r28hs2);
SET @seed_r28rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r28house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r28hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r28room, @seed_r28house, @seed_r28hs3);
SET @seed_r28rs3 = LAST_INSERT_ID();

-- Tin 30: https://phongtro123.com/cho-thue-phong-tro-ban-cong-thoang-mat-pr713729.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 030 - Đà Nẵng', '61 Đường Võ Chí Công, Phường Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://phongtro123.com/cho-thue-phong-tro-ban-cong-thoang-mat-pr713729.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r29house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r29house, 'P101', 17.0, 4000000, 4000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r29room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r29proof.pdf', 'DEMO-r29proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r29proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r29house, @seed_owner6, 1, '{"name":"Nhà demo 030 - Đà Nẵng","address":"61 Đường Võ Chí Công, Phường Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r29verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r29verification, @seed_r29proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r29verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r29verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r29house, @seed_r29room, 'Cho thuê phòng trọ ban công thoáng mát', 'Phòng cho thuê tại 61 Đường Võ Chí Công, Phường Ngũ Hành Sơn, Đà Nẵng. Diện tích 17 m²; giá tham khảo 4,000,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Gác lửng, Ban công, Máy giặt, Tủ lạnh, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://phongtro123.com/cho-thue-phong-tro-ban-cong-thoang-mat-pr713729.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r29post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r29post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/28/hinh-phong-ban-cong_1790563169.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r29post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/28/phong-tam-va-bep_1790563169.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r29post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/28/hinh-mat-tien_1790563172.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r29post, 'https://pt123.cdn.static123.com/images/thumbs/900x600/fit/2026/09/28/img-1608_1790563172.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r29post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r29post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r29post, 'Ban công');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r29post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r29post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r29post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r29house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r29hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r29room, @seed_r29house, @seed_r29hs0);
SET @seed_r29rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r29house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r29hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r29room, @seed_r29house, @seed_r29hs1);
SET @seed_r29rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r29house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r29hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r29room, @seed_r29house, @seed_r29hs2);
SET @seed_r29rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r29house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r29hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r29room, @seed_r29house, @seed_r29hs3);
SET @seed_r29rs3 = LAST_INSERT_ID();

-- Tin 31: https://thuephongtro.com/cho-thue-phong-rong-rai-dep-co-may-lanh-gia-re-ngay-khu-trung-tam-q-tan-binh-118961.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 031 - Hồ Chí Minh', 'Đường Nguyễn Thái Bình, Phường 4, Tân Bình, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/cho-thue-phong-rong-rai-dep-co-may-lanh-gia-re-ngay-khu-trung-tam-q-tan-binh-118961.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r30house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r30house, 'P101', 16.0, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r30room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r30proof.pdf', 'DEMO-r30proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r30proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r30house, @seed_owner1, 1, '{"name":"Nhà demo 031 - Hồ Chí Minh","address":"Đường Nguyễn Thái Bình, Phường 4, Tân Bình, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r30verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r30verification, @seed_r30proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r30verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r30verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r30house, @seed_r30room, 'CHO THUÊ PHÒNG RỘNG RÃI ĐẸP GIÁ RẺ NGAY KHU TRUNG TÂM Q.Tân Bình', 'Phòng cho thuê tại Đường Nguyễn Thái Bình, Phường 4, Tân Bình, Hồ Chí Minh. Diện tích 16 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Gác lửng, WC riêng, Chỗ để xe. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-rong-rai-dep-co-may-lanh-gia-re-ngay-khu-trung-tam-q-tan-binh-118961.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r30post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r30post, 'https://img.thuephongtro.com/images/large/2020/12/02/20201202154613-jv4av.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r30post, 'https://img.thuephongtro.com/images/large/2021/05/28/20210528144419-r5wts.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r30post, 'https://img.thuephongtro.com/images/large/2021/05/28/20210528144421-jond3.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r30post, 'https://img.thuephongtro.com/images/large/2021/05/28/20210528144422-c5dza.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r30post, 'https://img.thuephongtro.com/images/large/2021/05/28/20210528144424-xw25r.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r30post, 'https://img.thuephongtro.com/images/large/2021/05/28/20210528144425-gcdjd.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r30post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r30post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r30post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r30post, 'Chỗ để xe');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r30house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r30hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r30room, @seed_r30house, @seed_r30hs0);
SET @seed_r30rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r30house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r30hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r30room, @seed_r30house, @seed_r30hs1);
SET @seed_r30rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r30house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r30hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r30room, @seed_r30house, @seed_r30hs2);
SET @seed_r30rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r30house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r30hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r30room, @seed_r30house, @seed_r30hs3);
SET @seed_r30rs3 = LAST_INSERT_ID();

-- Tin 32: https://thuephongtro.com/phong-tro-cho-1-hoac-2-ban-nu-khong-nau-an-tai-quan-10-170194.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 032 - Hồ Chí Minh', 'Phố Lý Thường Kiệt, Phường 14, Quận 10, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/phong-tro-cho-1-hoac-2-ban-nu-khong-nau-an-tai-quan-10-170194.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r31house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r31house, 'P101', 28.0, 3000000, 3000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r31room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r31proof.pdf', 'DEMO-r31proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r31proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r31house, @seed_owner2, 1, '{"name":"Nhà demo 032 - Hồ Chí Minh","address":"Phố Lý Thường Kiệt, Phường 14, Quận 10, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r31verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r31verification, @seed_r31proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r31verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r31verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r31house, @seed_r31room, 'PHÒNG TRỌ QUẬN 10 CHO 01 BẠN NỮ KHÔNG NẤU ĂN. Gần ĐH Bách Khoa, Kinh Tế, Y Dược, Huflit', 'Phòng cho thuê tại Phố Lý Thường Kiệt, Phường 14, Quận 10, Hồ Chí Minh. Diện tích 28 m²; giá tham khảo 3,000,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-cho-1-hoac-2-ban-nu-khong-nau-an-tai-quan-10-170194.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r31post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r31post, 'https://img.thuephongtro.com/images/large/2025/04/02/20250402101218-xbnsw.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r31post, 'https://img.thuephongtro.com/images/large/2025/04/02/20250402101224-xaicx.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r31post, 'https://img.thuephongtro.com/images/large/2025/04/02/20250402101236-cc1mk.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r31post, 'https://img.thuephongtro.com/images/large/2025/04/02/20250402101241-hgoih.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r31post, 'https://img.thuephongtro.com/images/large/2025/04/02/20250402101327-g3p4v.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r31post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r31post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r31house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r31hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r31room, @seed_r31house, @seed_r31hs0);
SET @seed_r31rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r31house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r31hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r31room, @seed_r31house, @seed_r31hs1);
SET @seed_r31rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r31house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r31hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r31room, @seed_r31house, @seed_r31hs2);
SET @seed_r31rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r31house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r31hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r31room, @seed_r31house, @seed_r31hs3);
SET @seed_r31rs3 = LAST_INSERT_ID();

-- Tin 33: https://thuephongtro.com/cho-nu-thue-phong-1-nu-1-phong--169447.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 033 - Hồ Chí Minh', 'Đường Lê Văn Sỹ, Phường 12, Quận 3, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/cho-nu-thue-phong-1-nu-1-phong--169447.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r32house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r32house, 'P101', 18.0, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r32room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r32proof.pdf', 'DEMO-r32proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r32proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r32house, @seed_owner3, 1, '{"name":"Nhà demo 033 - Hồ Chí Minh","address":"Đường Lê Văn Sỹ, Phường 12, Quận 3, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r32verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r32verification, @seed_r32proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r32verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r32verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r32house, @seed_r32room, 'Cho nữ thuê phòng (1 bạn nữ / 1 phòng / không ở ghép)', 'Phòng cho thuê tại Đường Lê Văn Sỹ, Phường 12, Quận 3, Hồ Chí Minh. Diện tích 18 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-nu-thue-phong-1-nu-1-phong--169447.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r32post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r32post, 'https://img.thuephongtro.com/images/large/2023/09/17/20230917190603-l4agi.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r32post, 'https://img.thuephongtro.com/images/large/2023/09/17/20230917190603-ipgyu.jpg', 1);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r32post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r32house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r32hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r32room, @seed_r32house, @seed_r32hs0);
SET @seed_r32rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r32house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r32hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r32room, @seed_r32house, @seed_r32hs1);
SET @seed_r32rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r32house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r32hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r32room, @seed_r32house, @seed_r32hs2);
SET @seed_r32rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r32house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r32hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r32room, @seed_r32house, @seed_r32hs3);
SET @seed_r32rs3 = LAST_INSERT_ID();

-- Tin 34: https://thuephongtro.com/cho-thue-phong-tro-sach-dep-khu-vuc-q7-171513.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 034 - Hồ Chí Minh', 'Phường Phú Mỹ, Quận 7, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/cho-thue-phong-tro-sach-dep-khu-vuc-q7-171513.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r33house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r33house, 'P101', 22.0, 3700000, 3700000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r33room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r33proof.pdf', 'DEMO-r33proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r33proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r33house, @seed_owner4, 1, '{"name":"Nhà demo 034 - Hồ Chí Minh","address":"Phường Phú Mỹ, Quận 7, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r33verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r33verification, @seed_r33proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r33verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r33verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r33house, @seed_r33room, 'Cho Thuê phòng trọ sạch đẹp Khu vực q7', 'Phòng cho thuê tại Phường Phú Mỹ, Quận 7, Hồ Chí Minh. Diện tích 22 m²; giá tham khảo 3,700,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Gác lửng, Cửa sổ, Máy giặt, Chỗ để xe, Bếp, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-tro-sach-dep-khu-vuc-q7-171513.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r33post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r33post, 'https://img.thuephongtro.com/images/large/2026/11/08/20261108122131-raf2i.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r33post, 'https://img.thuephongtro.com/images/large/2026/11/08/20261108122131-kqdfg.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r33post, 'https://img.thuephongtro.com/images/large/2026/11/08/20261108122132-quxkz.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r33post, 'https://img.thuephongtro.com/images/large/2026/11/08/20261108122132-le1e0.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r33post, 'https://img.thuephongtro.com/images/large/2026/11/08/20261108122132-2w5sv.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r33post, 'https://img.thuephongtro.com/images/large/2026/11/08/20261108122132-y1tdy.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Bếp');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r33post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r33house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r33hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r33room, @seed_r33house, @seed_r33hs0);
SET @seed_r33rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r33house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r33hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r33room, @seed_r33house, @seed_r33hs1);
SET @seed_r33rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r33house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r33hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r33room, @seed_r33house, @seed_r33hs2);
SET @seed_r33rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r33house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r33hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r33room, @seed_r33house, @seed_r33hs3);
SET @seed_r33rs3 = LAST_INSERT_ID();

-- Tin 35: https://thuephongtro.com/phong-cho-thue-dang-chung-cu-tai-binh-thanh-151722.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 035 - Hồ Chí Minh', 'Đường Bùi Đình Túy, Phường 12, Bình Thạnh, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/phong-cho-thue-dang-chung-cu-tai-binh-thanh-151722.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r34house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r34house, 'P101', 19.0, 3500000, 3500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r34room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r34proof.pdf', 'DEMO-r34proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r34proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r34house, @seed_owner5, 1, '{"name":"Nhà demo 035 - Hồ Chí Minh","address":"Đường Bùi Đình Túy, Phường 12, Bình Thạnh, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r34verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r34verification, @seed_r34proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r34verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r34verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r34house, @seed_r34room, 'Phòng cho thuê dạng chung cư tại Bình Thạnh', 'Phòng cho thuê tại Đường Bùi Đình Túy, Phường 12, Bình Thạnh, Hồ Chí Minh. Diện tích 19 m²; giá tham khảo 3,500,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Cửa sổ, Máy giặt, Thang máy, Chỗ để xe, Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-cho-thue-dang-chung-cu-tai-binh-thanh-151722.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r34post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r34post, 'https://img.thuephongtro.com/images/large/2019/01/06/20190106111138-20180730_114651.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r34post, 'https://img.thuephongtro.com/images/large/2022/08/12/20220812150013-qdvmj.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r34post, 'https://img.thuephongtro.com/images/large/2026/04/07/20260407182101-zhjz5.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r34post, 'https://img.thuephongtro.com/images/large/2019/01/06/20190106111138-FB_IMG_1536280666175.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r34post, 'https://img.thuephongtro.com/images/large/2019/01/06/20190106111138-FB_IMG_1536280669347.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r34post, 'https://img.thuephongtro.com/images/large/2022/08/12/20220812150013-2dlny.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r34post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r34post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r34post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r34post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r34post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r34post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r34house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r34hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r34room, @seed_r34house, @seed_r34hs0);
SET @seed_r34rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r34house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r34hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r34room, @seed_r34house, @seed_r34hs1);
SET @seed_r34rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r34house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r34hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r34room, @seed_r34house, @seed_r34hs2);
SET @seed_r34rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r34house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r34hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r34room, @seed_r34house, @seed_r34hs3);
SET @seed_r34rs3 = LAST_INSERT_ID();

-- Tin 36: https://thuephongtro.com/cho-thue-phong-tro-dep-xung-quanh-quan-12-171512.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 036 - Hồ Chí Minh', 'Phường An Phú Đông, Quận 12, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/cho-thue-phong-tro-dep-xung-quanh-quan-12-171512.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r35house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r35house, 'P101', 22.0, 4000000, 4000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r35room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r35proof.pdf', 'DEMO-r35proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r35proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r35house, @seed_owner6, 1, '{"name":"Nhà demo 036 - Hồ Chí Minh","address":"Phường An Phú Đông, Quận 12, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r35verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r35verification, @seed_r35proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r35verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r35verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r35house, @seed_r35room, 'Cho thuê phòng trọ đẹp xung quanh quận 12', 'Phòng cho thuê tại Phường An Phú Đông, Quận 12, Hồ Chí Minh. Diện tích 22 m²; giá tham khảo 4,000,000 đồng/tháng. Tiện ích ghi trong tin: Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-tro-dep-xung-quanh-quan-12-171512.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r35post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r35post, 'https://img.thuephongtro.com/images/large/2026/11/04/20261104215819-vjdf0.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r35post, 'https://img.thuephongtro.com/images/large/2026/11/04/20261104215819-nnf5w.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r35post, 'https://img.thuephongtro.com/images/large/2026/11/04/20261104215819-rg1bh.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r35post, 'https://img.thuephongtro.com/images/large/2026/11/04/20261104215820-1qwca.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r35post, 'https://img.thuephongtro.com/images/large/2026/11/04/20261104215822-dxhmf.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r35post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r35house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r35hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r35room, @seed_r35house, @seed_r35hs0);
SET @seed_r35rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r35house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r35hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r35room, @seed_r35house, @seed_r35hs1);
SET @seed_r35rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r35house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r35hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r35room, @seed_r35house, @seed_r35hs2);
SET @seed_r35rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r35house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r35hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r35room, @seed_r35house, @seed_r35hs3);
SET @seed_r35rs3 = LAST_INSERT_ID();

-- Tin 37: https://thuephongtro.com/chinh-chu-cho-thue-phong-40m2-full-nt-171510.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 037 - Hồ Chí Minh', 'Phố Trần Quốc Hoàn, Phường 4, Tân Bình, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/chinh-chu-cho-thue-phong-40m2-full-nt-171510.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r36house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r36house, 'P101', 40.0, 7000000, 7000000, 4, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r36room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r36proof.pdf', 'DEMO-r36proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r36proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r36house, @seed_owner1, 1, '{"name":"Nhà demo 037 - Hồ Chí Minh","address":"Phố Trần Quốc Hoàn, Phường 4, Tân Bình, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r36verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r36verification, @seed_r36proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r36verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r36verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r36house, @seed_r36room, 'CHÍNH CHỦ CHO THUÊ PHÒNG 40m2 - FULL NT', 'Phòng cho thuê tại Phố Trần Quốc Hoàn, Phường 4, Tân Bình, Hồ Chí Minh. Diện tích 40 m²; giá tham khảo 7,000,000 đồng/tháng. Tiện ích ghi trong tin: Máy giặt, Tủ lạnh, Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/chinh-chu-cho-thue-phong-40m2-full-nt-171510.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r36post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r36post, 'https://img.thuephongtro.com/images/large/2026/10/28/20261028102720-mwsfo.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r36post, 'https://img.thuephongtro.com/images/large/2026/10/28/20261028102720-q2ze0.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r36post, 'https://img.thuephongtro.com/images/large/2026/10/28/20261028102720-4g4vl.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r36post, 'https://img.thuephongtro.com/images/large/2026/10/28/20261028102720-1itfn.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r36post, 'https://img.thuephongtro.com/images/large/2026/10/28/20261028102720-p5qbo.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r36post, 'https://img.thuephongtro.com/images/large/2026/10/28/20261028102720-sy3av.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r36post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r36post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r36post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r36house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r36hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r36room, @seed_r36house, @seed_r36hs0);
SET @seed_r36rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r36house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r36hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r36room, @seed_r36house, @seed_r36hs1);
SET @seed_r36rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r36house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r36hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r36room, @seed_r36house, @seed_r36hs2);
SET @seed_r36rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r36house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r36hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r36room, @seed_r36house, @seed_r36hs3);
SET @seed_r36rs3 = LAST_INSERT_ID();

-- Tin 38: https://thuephongtro.com/phong-sach-dep-wc-va-loi-di-rieng-gia-4-000-000-thang-153311.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 038 - Hồ Chí Minh', 'Đường Điện Biên Phủ, Phường 10, Quận 10, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/phong-sach-dep-wc-va-loi-di-rieng-gia-4-000-000-thang-153311.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r37house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r37house, 'P101', 18.0, 3000000, 3000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r37room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r37proof.pdf', 'DEMO-r37proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r37proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r37house, @seed_owner2, 1, '{"name":"Nhà demo 038 - Hồ Chí Minh","address":"Đường Điện Biên Phủ, Phường 10, Quận 10, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r37verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r37verification, @seed_r37proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r37verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r37verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r37house, @seed_r37room, 'Phòng sạch đẹp, wc và lối đi riêng, giá 2.000.000 - 3.600.000/ tháng', 'Phòng cho thuê tại Đường Điện Biên Phủ, Phường 10, Quận 10, Hồ Chí Minh. Diện tích 18 m²; giá tham khảo 3,000,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-sach-dep-wc-va-loi-di-rieng-gia-4-000-000-thang-153311.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r37post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r37post, 'https://img.thuephongtro.com/images/large/2022/05/28/20220528133822-cr5u3.jpg', 0);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r37house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r37hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r37room, @seed_r37house, @seed_r37hs0);
SET @seed_r37rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r37house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r37hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r37room, @seed_r37house, @seed_r37hs1);
SET @seed_r37rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r37house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r37hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r37room, @seed_r37house, @seed_r37hs2);
SET @seed_r37rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r37house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r37hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r37room, @seed_r37house, @seed_r37hs3);
SET @seed_r37rs3 = LAST_INSERT_ID();

-- Tin 39: https://thuephongtro.com/phong-tro-quan-thu-duc-moi-xay-165786.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 039 - Hồ Chí Minh', 'Phường Hiệp Bình Phước, Thủ Đức, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/phong-tro-quan-thu-duc-moi-xay-165786.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r38house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r38house, 'P101', 25.0, 3000000, 3000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r38room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r38proof.pdf', 'DEMO-r38proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r38proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r38house, @seed_owner3, 1, '{"name":"Nhà demo 039 - Hồ Chí Minh","address":"Phường Hiệp Bình Phước, Thủ Đức, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r38verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r38verification, @seed_r38proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r38verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r38verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r38house, @seed_r38room, 'PHÒNG TRỌ THÀNH PHỐ THỦ ĐỨC CẠNH KHU ĐÔ THỊ VẠN PHÚC, GIGAMALL', 'Phòng cho thuê tại Phường Hiệp Bình Phước, Thủ Đức, Hồ Chí Minh. Diện tích 25 m²; giá tham khảo 3,000,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Bếp. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-quan-thu-duc-moi-xay-165786.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r38post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r38post, 'https://img.thuephongtro.com/images/large/2020/11/21/20201121215514-dfwyh.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r38post, 'https://img.thuephongtro.com/images/large/2020/11/21/20201121215546-szneq.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r38post, 'https://img.thuephongtro.com/images/large/2020/11/21/20201121215602-mts2t.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r38post, 'https://img.thuephongtro.com/images/large/2020/11/21/20201121215613-nlt33.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r38post, 'https://img.thuephongtro.com/images/large/2020/11/21/20201121215627-qrxq1.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r38post, 'https://img.thuephongtro.com/images/large/2020/11/21/20201121215638-ansvf.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r38post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r38post, 'Bếp');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r38house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r38hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r38room, @seed_r38house, @seed_r38hs0);
SET @seed_r38rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r38house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r38hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r38room, @seed_r38house, @seed_r38hs1);
SET @seed_r38rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r38house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r38hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r38room, @seed_r38house, @seed_r38hs2);
SET @seed_r38rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r38house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r38hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r38room, @seed_r38house, @seed_r38hs3);
SET @seed_r38rs3 = LAST_INSERT_ID();

-- Tin 40: https://thuephongtro.com/cho-thue-phong-tro-cao-cap-gan-aeon-mall-tan-phu-xem-hinh-126575.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 040 - Hồ Chí Minh', 'Tân Phú, Hồ Chí Minh', '79', 'Hồ Chí Minh', 'Nguồn: https://thuephongtro.com/cho-thue-phong-tro-cao-cap-gan-aeon-mall-tan-phu-xem-hinh-126575.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r39house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r39house, 'P101', 28.0, 2700000, 2700000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r39room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r39proof.pdf', 'DEMO-r39proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r39proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r39house, @seed_owner4, 1, '{"name":"Nhà demo 040 - Hồ Chí Minh","address":"Tân Phú, Hồ Chí Minh","provinceCode":"79","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r39verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r39verification, @seed_r39proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r39verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r39verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r39house, @seed_r39room, 'CHO THUÊ PHÒNG TRỌ CAO CẤP, GẦN AEON Mall Tân Phú, XEM HÌNH', 'Phòng cho thuê tại Tân Phú, Hồ Chí Minh. Diện tích 28 m²; giá tham khảo 2,700,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Thang máy, Chỗ để xe, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-tro-cao-cap-gan-aeon-mall-tan-phu-xem-hinh-126575.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r39post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r39post, 'https://img.thuephongtro.com/images/large/2025/12/26/20251226201047-rfmjo.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r39post, 'https://img.thuephongtro.com/images/large/2019/02/28/20190228051552-293E2DF9-4D1E-4F0E-ABF2-861F29ABD37F.jpeg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r39post, 'https://img.thuephongtro.com/images/large/2019/02/28/20190228051553-1CC77B5F-0843-4AEE-935F-EE41C99D0480.jpeg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r39post, 'https://img.thuephongtro.com/images/large/2026/04/17/20260417210022-zsb1k.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r39post, 'https://img.thuephongtro.com/images/large/2019/02/28/20190228051555-BC0C634A-DAE6-4B75-A207-99F5B50A1C87.jpeg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r39post, 'https://img.thuephongtro.com/images/large/2026/04/17/20260417210022-3dboj.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r39post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r39post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r39post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r39post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r39house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r39hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r39room, @seed_r39house, @seed_r39hs0);
SET @seed_r39rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r39house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r39hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r39room, @seed_r39house, @seed_r39hs1);
SET @seed_r39rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r39house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r39hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r39room, @seed_r39house, @seed_r39hs2);
SET @seed_r39rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r39house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r39hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r39room, @seed_r39house, @seed_r39hs3);
SET @seed_r39rs3 = LAST_INSERT_ID();

-- Tin 41: https://thuephongtro.com/cho-thue-phong-full-do-tai-tran-khat-chan-gan-dai-hoc-bach-khoa-171511.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 041 - Hà Nội', 'Số 49, ngõ 272, Đường Trần Khát Chân, Phường Thanh Nhàn, Hai Bà Trưng, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/cho-thue-phong-full-do-tai-tran-khat-chan-gan-dai-hoc-bach-khoa-171511.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r40house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r40house, 'P101', 30.0, 4500000, 4500000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r40room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r40proof.pdf', 'DEMO-r40proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r40proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r40house, @seed_owner5, 1, '{"name":"Nhà demo 041 - Hà Nội","address":"Số 49, ngõ 272, Đường Trần Khát Chân, Phường Thanh Nhàn, Hai Bà Trưng, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r40verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r40verification, @seed_r40proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r40verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r40verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r40house, @seed_r40room, 'Cho thuê phòng Full đồ tại Trần Khát Chân, gần Đại học Bách Khoa', 'Phòng cho thuê tại Số 49, ngõ 272, Đường Trần Khát Chân, Phường Thanh Nhàn, Hai Bà Trưng, Hà Nội. Diện tích 30 m²; giá tham khảo 4,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Gác lửng, WC riêng, Máy giặt, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-full-do-tai-tran-khat-chan-gan-dai-hoc-bach-khoa-171511.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r40post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r40post, 'https://img.thuephongtro.com/images/large/2026/10/29/20261029091435-1faon.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r40post, 'https://img.thuephongtro.com/images/large/2026/10/29/20261029091435-dsn3u.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r40post, 'https://img.thuephongtro.com/images/large/2026/10/29/20261029091435-jlf0n.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r40post, 'https://i3.ytimg.com/vi/rEnmRR3wJqo/maxresdefault.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r40post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r40post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r40post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r40post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r40post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r40house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r40hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r40room, @seed_r40house, @seed_r40hs0);
SET @seed_r40rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r40house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r40hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r40room, @seed_r40house, @seed_r40hs1);
SET @seed_r40rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r40house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r40hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r40room, @seed_r40house, @seed_r40hs2);
SET @seed_r40rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r40house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r40hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r40room, @seed_r40house, @seed_r40hs3);
SET @seed_r40rs3 = LAST_INSERT_ID();

-- Tin 42: https://thuephongtro.com/chinh-chu-cho-thue-phong-tro-moi-xay-khep-kin-thiet-bi-moi-100--169038.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 042 - Hà Nội', 'Phố Láng Hạ, Phường Láng Hạ, Đống Đa, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/chinh-chu-cho-thue-phong-tro-moi-xay-khep-kin-thiet-bi-moi-100--169038.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r41house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r41house, 'P101', 22.0, 5000000, 5000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r41room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r41proof.pdf', 'DEMO-r41proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r41proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r41house, @seed_owner6, 1, '{"name":"Nhà demo 042 - Hà Nội","address":"Phố Láng Hạ, Phường Láng Hạ, Đống Đa, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r41verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r41verification, @seed_r41proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r41verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r41verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r41house, @seed_r41room, 'Chính chủ cho thuê phòng trọ mới xây khép kín, thiết bị mới 100%', 'Phòng cho thuê tại Phố Láng Hạ, Phường Láng Hạ, Đống Đa, Hà Nội. Diện tích 22 m²; giá tham khảo 5,000,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Gác lửng, WC riêng, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/chinh-chu-cho-thue-phong-tro-moi-xay-khep-kin-thiet-bi-moi-100--169038.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r41post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r41post, 'https://img.thuephongtro.com/images/large/2022/10/07/20221007153048-zvst3.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r41post, 'https://img.thuephongtro.com/images/large/2023/02/10/20230210155214-nphpo.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r41post, 'https://img.thuephongtro.com/images/large/2023/02/10/20230210155223-dmzvn.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r41post, 'https://img.thuephongtro.com/images/large/2023/02/10/20230210155230-4csfl.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r41post, 'https://img.thuephongtro.com/images/large/2023/02/10/20230210155258-sy24z.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r41post, 'https://img.thuephongtro.com/images/large/2023/02/10/20230210155319-s1nnm.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r41post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r41post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r41post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r41post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r41house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r41hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r41room, @seed_r41house, @seed_r41hs0);
SET @seed_r41rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r41house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r41hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r41room, @seed_r41house, @seed_r41hs1);
SET @seed_r41rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r41house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r41hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r41room, @seed_r41house, @seed_r41hs2);
SET @seed_r41rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r41house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r41hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r41room, @seed_r41house, @seed_r41hs3);
SET @seed_r41rs3 = LAST_INSERT_ID();

-- Tin 43: https://thuephongtro.com/phong-moi-chi-2-5-trieu-thang-cau-dien-gan-tau-dien-buyt-cho--171497.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 043 - Hà Nội', 'Đường Cầu Diễn, Phường Phú Diễn, Bắc Từ Liêm, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/phong-moi-chi-2-5-trieu-thang-cau-dien-gan-tau-dien-buyt-cho--171497.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r42house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r42house, 'P101', 18.5, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r42room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r42proof.pdf', 'DEMO-r42proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r42proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r42house, @seed_owner1, 1, '{"name":"Nhà demo 043 - Hà Nội","address":"Đường Cầu Diễn, Phường Phú Diễn, Bắc Từ Liêm, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r42verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r42verification, @seed_r42proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r42verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r42verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r42house, @seed_r42room, 'PHÒNG MỚI – CHỈ 2,5 TRIỆU/THÁNG – CẦU DIỄN (gần Tàu điện, Buýt, Chợ)', 'Phòng cho thuê tại Đường Cầu Diễn, Phường Phú Diễn, Bắc Từ Liêm, Hà Nội. Diện tích 18.5 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Gác lửng, WC riêng, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-moi-chi-2-5-trieu-thang-cau-dien-gan-tau-dien-buyt-cho--171497.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r42post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r42post, 'https://img.thuephongtro.com/images/large/2026/08/18/20260818200526-tpcah.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r42post, 'https://img.thuephongtro.com/images/large/2026/08/18/20260818200527-xanvw.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r42post, 'https://img.thuephongtro.com/images/large/2026/08/18/20260818200527-phv3m.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r42post, 'https://img.thuephongtro.com/images/large/2026/08/18/20260818200527-n2gvm.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r42post, 'https://img.thuephongtro.com/images/large/2026/08/18/20260818200528-xjgxy.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r42post, 'https://img.thuephongtro.com/images/large/2026/08/18/20260818200528-pmklj.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r42post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r42post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r42post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r42post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r42house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r42hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r42room, @seed_r42house, @seed_r42hs0);
SET @seed_r42rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r42house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r42hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r42room, @seed_r42house, @seed_r42hs1);
SET @seed_r42rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r42house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r42hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r42room, @seed_r42house, @seed_r42hs2);
SET @seed_r42rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r42house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r42hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r42room, @seed_r42house, @seed_r42hs3);
SET @seed_r42rs3 = LAST_INSERT_ID();

-- Tin 44: https://thuephongtro.com/cho-thue-phong-tro-khep-kin-moi-xay-ngo-quynh-thanh-nhan-2026-171488.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 044 - Hà Nội', 'Đường Thanh Nhàn, Phường Quỳnh Lôi, Hai Bà Trưng, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/cho-thue-phong-tro-khep-kin-moi-xay-ngo-quynh-thanh-nhan-2026-171488.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r43house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r43house, 'P101', 16.0, 3300000, 3300000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r43room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r43proof.pdf', 'DEMO-r43proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r43proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r43house, @seed_owner2, 1, '{"name":"Nhà demo 044 - Hà Nội","address":"Đường Thanh Nhàn, Phường Quỳnh Lôi, Hai Bà Trưng, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r43verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r43verification, @seed_r43proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r43verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r43verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r43house, @seed_r43room, 'CHO THUÊ PHÒNG TRỌ KHÉP KÍN MỚI XÂY – NGÕ QUỲNH, THANH NHÀN 2026', 'Phòng cho thuê tại Đường Thanh Nhàn, Phường Quỳnh Lôi, Hai Bà Trưng, Hà Nội. Diện tích 16 m²; giá tham khảo 3,300,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Gác lửng, WC riêng, Máy giặt, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-tro-khep-kin-moi-xay-ngo-quynh-thanh-nhan-2026-171488.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r43post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r43post, 'https://img.thuephongtro.com/images/large/2026/07/21/20260721120013-lvryi.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r43post, 'https://img.thuephongtro.com/images/large/2026/07/21/20260721120013-asbmr.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r43post, 'https://img.thuephongtro.com/images/large/2026/07/21/20260721120014-ami4k.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r43post, 'https://img.thuephongtro.com/images/large/2026/07/21/20260721120014-e04vl.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r43post, 'https://img.thuephongtro.com/images/large/2026/07/21/20260721120014-fyk4u.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r43post, 'https://img.thuephongtro.com/images/large/2026/07/21/20260721120014-0qrkh.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r43post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r43post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r43post, 'Gác lửng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r43post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r43post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r43post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r43house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r43hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r43room, @seed_r43house, @seed_r43hs0);
SET @seed_r43rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r43house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r43hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r43room, @seed_r43house, @seed_r43hs1);
SET @seed_r43rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r43house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r43hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r43room, @seed_r43house, @seed_r43hs2);
SET @seed_r43rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r43house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r43hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r43room, @seed_r43house, @seed_r43hs3);
SET @seed_r43rs3 = LAST_INSERT_ID();

-- Tin 45: https://thuephongtro.com/phong-co-wc-khep-kin-rong-thoang-linh-nam-thang-may-nong-lanh-dieu-hoa-169776.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 045 - Hà Nội', 'Đường Lĩnh Nam, Phường Lĩnh Nam, Hoàng Mai, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/phong-co-wc-khep-kin-rong-thoang-linh-nam-thang-may-nong-lanh-dieu-hoa-169776.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r44house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r44house, 'P101', 21.0, 2500000, 2500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r44room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r44proof.pdf', 'DEMO-r44proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r44proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r44house, @seed_owner3, 1, '{"name":"Nhà demo 045 - Hà Nội","address":"Đường Lĩnh Nam, Phường Lĩnh Nam, Hoàng Mai, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r44verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r44verification, @seed_r44proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r44verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r44verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r44house, @seed_r44room, 'Phòng có WC khép kín rộng thoáng Lĩnh Nam, thang máy, nóng lạnh, điều hòa', 'Phòng cho thuê tại Đường Lĩnh Nam, Phường Lĩnh Nam, Hoàng Mai, Hà Nội. Diện tích 21 m²; giá tham khảo 2,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Cửa sổ, WC riêng, Máy giặt, Thang máy, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-co-wc-khep-kin-rong-thoang-linh-nam-thang-may-nong-lanh-dieu-hoa-169776.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r44post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r44post, 'https://img.thuephongtro.com/images/large/2024/05/23/20240523062030-2sr5q.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r44post, 'https://img.thuephongtro.com/images/large/2024/05/23/20240523062039-vf1wy.jpg', 1);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r44post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r44post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r44post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r44post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r44post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r44post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r44house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r44hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r44room, @seed_r44house, @seed_r44hs0);
SET @seed_r44rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r44house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r44hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r44room, @seed_r44house, @seed_r44hs1);
SET @seed_r44rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r44house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r44hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r44room, @seed_r44house, @seed_r44hs2);
SET @seed_r44rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r44house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r44hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r44room, @seed_r44house, @seed_r44hs3);
SET @seed_r44rs3 = LAST_INSERT_ID();

-- Tin 46: https://thuephongtro.com/pho-tran-nhan-tong-hbt-gia-phong-3-5tr-vskk-o-to-do-cua-view-thanh-pho-171485.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 046 - Hà Nội', 'Đường Trần Nhân Tông, Phường Nguyễn Du, Hai Bà Trưng, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/pho-tran-nhan-tong-hbt-gia-phong-3-5tr-vskk-o-to-do-cua-view-thanh-pho-171485.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r45house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r45house, 'P101', 20.0, 3500000, 3500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r45room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r45proof.pdf', 'DEMO-r45proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r45proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r45house, @seed_owner4, 1, '{"name":"Nhà demo 046 - Hà Nội","address":"Đường Trần Nhân Tông, Phường Nguyễn Du, Hai Bà Trưng, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r45verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r45verification, @seed_r45proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r45verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r45verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r45house, @seed_r45room, 'Phố Trần Nhân Tông - HBT. Giá phòng 3.5Tr - VSKK - Ô TÔ ĐỖ CỬA - VIEW THÀNH PHỐ', 'Phòng cho thuê tại Đường Trần Nhân Tông, Phường Nguyễn Du, Hai Bà Trưng, Hà Nội. Diện tích 20 m²; giá tham khảo 3,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, WC riêng, Tủ lạnh, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/pho-tran-nhan-tong-hbt-gia-phong-3-5tr-vskk-o-to-do-cua-view-thanh-pho-171485.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r45post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r45post, 'https://img.thuephongtro.com/images/large/2026/07/13/20260713231928-wi3ut.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r45post, 'https://img.thuephongtro.com/images/large/2026/07/13/20260713231928-pkyl0.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r45post, 'https://img.thuephongtro.com/images/large/2026/07/13/20260713232028-qj1t0.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r45post, 'https://img.thuephongtro.com/images/large/2026/07/13/20260713232029-wfl1c.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r45post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r45post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r45post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r45post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r45house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r45hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r45room, @seed_r45house, @seed_r45hs0);
SET @seed_r45rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r45house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r45hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r45room, @seed_r45house, @seed_r45hs1);
SET @seed_r45rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r45house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r45hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r45room, @seed_r45house, @seed_r45hs2);
SET @seed_r45rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r45house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r45hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r45room, @seed_r45house, @seed_r45hs3);
SET @seed_r45rs3 = LAST_INSERT_ID();

-- Tin 47: https://thuephongtro.com/-cho-thue-phong-studio-ngo-281-tran-khat-chan-hai-ba-trung-ha-noi-171482.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 047 - Hà Nội', 'Đường Trần Khát Chân, Phường Bạch Mai, Hai Bà Trưng, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/-cho-thue-phong-studio-ngo-281-tran-khat-chan-hai-ba-trung-ha-noi-171482.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r46house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r46house, 'P101', 25.0, 4500000, 4500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r46room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r46proof.pdf', 'DEMO-r46proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r46proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r46house, @seed_owner5, 1, '{"name":"Nhà demo 047 - Hà Nội","address":"Đường Trần Khát Chân, Phường Bạch Mai, Hai Bà Trưng, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r46verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r46verification, @seed_r46proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r46verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r46verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r46house, @seed_r46room, '🏡Cho thuê phòng studio ngõ 281 Trần Khát Chân, Hai BÀ Trưng, Hà Nội', 'Phòng cho thuê tại Đường Trần Khát Chân, Phường Bạch Mai, Hai Bà Trưng, Hà Nội. Diện tích 25 m²; giá tham khảo 4,500,000 đồng/tháng. Tiện ích ghi trong tin: Wifi, Máy giặt, Thang máy. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/-cho-thue-phong-studio-ngo-281-tran-khat-chan-hai-ba-trung-ha-noi-171482.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r46post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r46post, 'https://img.thuephongtro.com/images/large/2026/07/12/20260712100725-r12by.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r46post, 'https://img.thuephongtro.com/images/large/2026/07/12/20260712100727-yeyqu.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r46post, 'https://img.thuephongtro.com/images/large/2026/07/12/20260712100728-5twfx.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r46post, 'https://img.thuephongtro.com/images/large/2026/07/12/20260712100730-dljaj.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r46post, 'https://img.thuephongtro.com/images/large/2026/07/12/20260712100732-tf40w.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r46post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r46post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r46post, 'Thang máy');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r46house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r46hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r46room, @seed_r46house, @seed_r46hs0);
SET @seed_r46rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r46house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r46hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r46room, @seed_r46house, @seed_r46hs1);
SET @seed_r46rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r46house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r46hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r46room, @seed_r46house, @seed_r46hs2);
SET @seed_r46rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r46house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r46hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r46room, @seed_r46house, @seed_r46hs3);
SET @seed_r46rs3 = LAST_INSERT_ID();

-- Tin 48: https://thuephongtro.com/cho-thue-phong-studio-ngo-195-tran-cung-cau-giay-ha-noi-171477.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 048 - Hà Nội', 'Phố Trần Cung, Phường Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/cho-thue-phong-studio-ngo-195-tran-cung-cau-giay-ha-noi-171477.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r47house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r47house, 'P101', 25.0, 4100000, 4100000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r47room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r47proof.pdf', 'DEMO-r47proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r47proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r47house, @seed_owner6, 1, '{"name":"Nhà demo 048 - Hà Nội","address":"Phố Trần Cung, Phường Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r47verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r47verification, @seed_r47proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r47verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r47verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r47house, @seed_r47room, 'Cho thuê phòng studio ngõ 195 Trần Cung, Cầu Giấy, Hà Nội', 'Phòng cho thuê tại Phố Trần Cung, Phường Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội. Diện tích 25 m²; giá tham khảo 4,100,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Cửa sổ, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-studio-ngo-195-tran-cung-cau-giay-ha-noi-171477.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r47post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r47post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711174436-4mb32.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r47post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711174433-gp141.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r47post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711174431-nu4tr.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r47post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711174438-wmnbx.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r47post, 'https://i3.ytimg.com/vi/share/maxresdefault.jpg', 4);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r47post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r47post, 'Cửa sổ');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r47post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r47house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r47hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r47room, @seed_r47house, @seed_r47hs0);
SET @seed_r47rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r47house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r47hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r47room, @seed_r47house, @seed_r47hs1);
SET @seed_r47rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r47house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r47hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r47room, @seed_r47house, @seed_r47hs2);
SET @seed_r47rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r47house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r47hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r47room, @seed_r47house, @seed_r47hs3);
SET @seed_r47rs3 = LAST_INSERT_ID();

-- Tin 49: https://thuephongtro.com/-cho-thue-phong-studio-ngo-30-le-trong-tan-ha-dong-ha-noi-171478.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 049 - Hà Nội', 'Phố Lê Trọng Tấn, Phường La Khê, Hà Đông, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/-cho-thue-phong-studio-ngo-30-le-trong-tan-ha-dong-ha-noi-171478.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r48house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r48house, 'P101', 25.0, 4100000, 4100000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r48room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r48proof.pdf', 'DEMO-r48proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r48proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r48house, @seed_owner1, 1, '{"name":"Nhà demo 049 - Hà Nội","address":"Phố Lê Trọng Tấn, Phường La Khê, Hà Đông, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r48verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r48verification, @seed_r48proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r48verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r48verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r48house, @seed_r48room, '🏡Cho thuê phòng studio Ngõ 30 Lê Trọng Tấn, Hà Đông, Hà Nội', 'Phòng cho thuê tại Phố Lê Trọng Tấn, Phường La Khê, Hà Đông, Hà Nội. Diện tích 25 m²; giá tham khảo 4,100,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Máy giặt, Tủ lạnh, Thang máy, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/-cho-thue-phong-studio-ngo-30-le-trong-tan-ha-dong-ha-noi-171478.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r48post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r48post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711181543-m4zy1.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r48post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711181545-n2hwn.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r48post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711181547-tdhy4.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r48post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711181549-rzvxi.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r48post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711181551-41avb.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r48post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711181553-fqyoh.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r48post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r48post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r48post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r48post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r48post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r48house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r48hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r48room, @seed_r48house, @seed_r48hs0);
SET @seed_r48rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r48house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r48hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r48room, @seed_r48house, @seed_r48hs1);
SET @seed_r48rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r48house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r48hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r48room, @seed_r48house, @seed_r48hs2);
SET @seed_r48rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r48house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r48hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r48room, @seed_r48house, @seed_r48hs3);
SET @seed_r48rs3 = LAST_INSERT_ID();

-- Tin 50: https://thuephongtro.com/-cho-thue-phong-studio-ngo-87-yen-xa-ha-dong-ha-noi-171479.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 050 - Hà Nội', 'Đường Yên Xá, Xã Tân Triều, Thanh Trì, Hà Nội', '01', 'Hà Nội', 'Nguồn: https://thuephongtro.com/-cho-thue-phong-studio-ngo-87-yen-xa-ha-dong-ha-noi-171479.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r49house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r49house, 'P101', 25.0, 3800000, 3800000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r49room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r49proof.pdf', 'DEMO-r49proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r49proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r49house, @seed_owner2, 1, '{"name":"Nhà demo 050 - Hà Nội","address":"Đường Yên Xá, Xã Tân Triều, Thanh Trì, Hà Nội","provinceCode":"01","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r49verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r49verification, @seed_r49proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r49verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r49verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r49house, @seed_r49room, '🏡Cho thuê phòng studio Ngõ 87 Yên Xá, Hà Đông, Hà Nội', 'Phòng cho thuê tại Đường Yên Xá, Xã Tân Triều, Thanh Trì, Hà Nội. Diện tích 25 m²; giá tham khảo 3,800,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Máy giặt, Tủ lạnh, Thang máy, Bếp, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/-cho-thue-phong-studio-ngo-87-yen-xa-ha-dong-ha-noi-171479.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r49post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r49post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711182614-3ebj1.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r49post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711182616-ylm4y.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r49post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711182618-w5l2o.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r49post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711182619-52jym.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r49post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711182621-i05ns.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r49post, 'https://img.thuephongtro.com/images/large/2026/07/11/20260711182623-2ttyl.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r49post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r49post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r49post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r49post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r49post, 'Bếp');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r49post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r49house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r49hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r49room, @seed_r49house, @seed_r49hs0);
SET @seed_r49rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r49house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r49hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r49room, @seed_r49house, @seed_r49hs1);
SET @seed_r49rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r49house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r49hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r49room, @seed_r49house, @seed_r49hs2);
SET @seed_r49rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r49house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r49hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r49room, @seed_r49house, @seed_r49hs3);
SET @seed_r49rs3 = LAST_INSERT_ID();

-- Tin 51: https://thuephongtro.com/phong-tro-gia-re-an-toan-gan-kcn-hoa-khanh-170117.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 051 - Đà Nẵng', '393 Đường Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-tro-gia-re-an-toan-gan-kcn-hoa-khanh-170117.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r50house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r50house, 'P101', 12.0, 600000, 600000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r50room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r50proof.pdf', 'DEMO-r50proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r50proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r50house, @seed_owner3, 1, '{"name":"Nhà demo 051 - Đà Nẵng","address":"393 Đường Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r50verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r50verification, @seed_r50proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r50verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r50verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r50house, @seed_r50room, 'Phòng Trọ giá rẻ, an toàn gần KCN Hòa Khánh', 'Phòng cho thuê tại 393 Đường Nguyễn Lương Bằng, Phường Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng. Diện tích 12 m²; giá tham khảo 600,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-gia-re-an-toan-gan-kcn-hoa-khanh-170117.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r50post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r50post, 'https://img.thuephongtro.com/images/large/2025/02/06/20250206113828-z4fkh.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r50post, 'https://img.thuephongtro.com/images/large/2025/02/06/20250206113828-otlhz.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r50post, 'https://img.thuephongtro.com/images/large/2025/02/06/20250206113828-rrjt0.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r50post, 'https://img.thuephongtro.com/images/large/2025/02/06/20250206113828-m44pc.jpg', 3);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r50house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r50hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r50room, @seed_r50house, @seed_r50hs0);
SET @seed_r50rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r50house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r50hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r50room, @seed_r50house, @seed_r50hs1);
SET @seed_r50rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r50house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r50hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r50room, @seed_r50house, @seed_r50hs2);
SET @seed_r50rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r50house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r50hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r50room, @seed_r50house, @seed_r50hs3);
SET @seed_r50rs3 = LAST_INSERT_ID();

-- Tin 52: https://thuephongtro.com/phong-tro-346-ngu-hanh-son-my-an-quan-ngu-hanh-son-da-nang-169521.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 052 - Đà Nẵng', 'Đường Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-tro-346-ngu-hanh-son-my-an-quan-ngu-hanh-son-da-nang-169521.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r51house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r51house, 'P101', 32.0, 2700000, 2700000, 3, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r51room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r51proof.pdf', 'DEMO-r51proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r51proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r51house, @seed_owner4, 1, '{"name":"Nhà demo 052 - Đà Nẵng","address":"Đường Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r51verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r51verification, @seed_r51proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r51verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r51verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r51house, @seed_r51room, 'Phòng trọ 346 Ngũ Hành Sơn, Mỹ An, quận Ngũ Hành Sơn, Đà Nẵng', 'Phòng cho thuê tại Đường Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng. Diện tích 32 m²; giá tham khảo 2,700,000 đồng/tháng. Tiện ích ghi trong tin: WC riêng, Thang máy, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-346-ngu-hanh-son-my-an-quan-ngu-hanh-son-da-nang-169521.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r51post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r51post, 'https://img.thuephongtro.com/images/large/2023/11/09/20231109190052-p1fkz.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r51post, 'https://img.thuephongtro.com/images/large/2023/11/09/20231109190053-ydh33.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r51post, 'https://img.thuephongtro.com/images/large/2023/11/09/20231109190053-xbjza.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r51post, 'https://img.thuephongtro.com/images/large/2023/11/09/20231109190053-rjxqu.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r51post, 'https://img.thuephongtro.com/images/large/2023/11/09/20231109190053-54bqh.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r51post, 'https://img.thuephongtro.com/images/large/2023/11/09/20231109190355-drm0d.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r51post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r51post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r51post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r51house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r51hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r51room, @seed_r51house, @seed_r51hs0);
SET @seed_r51rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r51house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r51hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r51room, @seed_r51house, @seed_r51hs1);
SET @seed_r51rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r51house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r51hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r51room, @seed_r51house, @seed_r51hs2);
SET @seed_r51rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r51house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r51hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r51room, @seed_r51house, @seed_r51hs3);
SET @seed_r51rs3 = LAST_INSERT_ID();

-- Tin 53: https://thuephongtro.com/phong-tro-346-ngu-hanh-son-my-an-quan-ngu-hanh-son-da-nang-169492.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 053 - Đà Nẵng', '346 Đường Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-tro-346-ngu-hanh-son-my-an-quan-ngu-hanh-son-da-nang-169492.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r52house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r52house, 'P101', 25.0, 3000000, 3000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r52room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r52proof.pdf', 'DEMO-r52proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r52proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r52house, @seed_owner5, 1, '{"name":"Nhà demo 053 - Đà Nẵng","address":"346 Đường Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r52verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r52verification, @seed_r52proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r52verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r52verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r52house, @seed_r52room, 'Phòng trọ 346 Ngũ Hành Sơn, Mỹ An, quận Ngũ Hành Sơn, Đà Nẵng', 'Phòng cho thuê tại 346 Đường Ngũ Hành Sơn, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng. Diện tích 25 m²; giá tham khảo 3,000,000 đồng/tháng. Tiện ích ghi trong tin: WC riêng, Thang máy, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-346-ngu-hanh-son-my-an-quan-ngu-hanh-son-da-nang-169492.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r52post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r52post, 'https://img.thuephongtro.com/images/large/2023/10/24/20231024215629-b2bv3.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r52post, 'https://img.thuephongtro.com/images/large/2023/10/24/20231024215629-fbl3u.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r52post, 'https://img.thuephongtro.com/images/large/2023/10/24/20231024215630-5z0z3.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r52post, 'https://img.thuephongtro.com/images/large/2023/10/24/20231024215630-aadww.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r52post, 'https://img.thuephongtro.com/images/large/2023/10/24/20231024215631-bpgu3.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r52post, 'https://img.thuephongtro.com/images/large/2023/10/24/20231024215631-zworl.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r52post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r52post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r52post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r52house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r52hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r52room, @seed_r52house, @seed_r52hs0);
SET @seed_r52rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r52house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r52hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r52room, @seed_r52house, @seed_r52hs1);
SET @seed_r52rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r52house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r52hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r52room, @seed_r52house, @seed_r52hs2);
SET @seed_r52rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r52house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r52hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r52room, @seed_r52house, @seed_r52hs3);
SET @seed_r52rs3 = LAST_INSERT_ID();

-- Tin 54: https://thuephongtro.com/cho-thue-phong-khach-san-sat-bien-my-khue-tp-da-nang-168778.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 054 - Đà Nẵng', '42B Đường Lâm Hoành, Phường Phước Mỹ, Sơn Trà, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/cho-thue-phong-khach-san-sat-bien-my-khue-tp-da-nang-168778.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r53house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r53house, 'P101', 25.0, 2700000, 2700000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r53room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r53proof.pdf', 'DEMO-r53proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r53proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r53house, @seed_owner6, 1, '{"name":"Nhà demo 054 - Đà Nẵng","address":"42B Đường Lâm Hoành, Phường Phước Mỹ, Sơn Trà, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r53verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r53verification, @seed_r53proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r53verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r53verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r53house, @seed_r53room, 'Cho thuê phòng khách sạn sát biển Mỹ Khuê TP Đà Nẵng', 'Phòng cho thuê tại 42B Đường Lâm Hoành, Phường Phước Mỹ, Sơn Trà, Đà Nẵng. Diện tích 25 m²; giá tham khảo 2,700,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Tủ lạnh, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-khach-san-sat-bien-my-khue-tp-da-nang-168778.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r53post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r53post, 'https://img.thuephongtro.com/images/large/2022/04/25/20220425142301-hl2p1.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r53post, 'https://img.thuephongtro.com/images/large/2022/04/25/20220425142301-bgfi0.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r53post, 'https://img.thuephongtro.com/images/large/2022/04/25/20220425142301-qzmfn.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r53post, 'https://img.thuephongtro.com/images/large/2022/04/25/20220425142301-g55vh.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r53post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r53post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r53post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r53post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r53house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r53hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r53room, @seed_r53house, @seed_r53hs0);
SET @seed_r53rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r53house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r53hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r53room, @seed_r53house, @seed_r53hs1);
SET @seed_r53rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r53house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r53hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r53room, @seed_r53house, @seed_r53hs2);
SET @seed_r53rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r53house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r53hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r53room, @seed_r53house, @seed_r53hs3);
SET @seed_r53rs3 = LAST_INSERT_ID();

-- Tin 55: https://thuephongtro.com/phong-tro-cho-thue-quan-hai-chau-da-nang-168144.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner1, 'Nhà demo 055 - Đà Nẵng', '38 Đường Hải Sơn, Phường Thanh Bình, Hải Châu, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-tro-cho-thue-quan-hai-chau-da-nang-168144.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r54house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r54house, 'P101', 20.0, 1000000, 1000000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r54room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/r54proof.pdf', 'DEMO-r54proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r54proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r54house, @seed_owner1, 1, '{"name":"Nhà demo 055 - Đà Nẵng","address":"38 Đường Hải Sơn, Phường Thanh Bình, Hải Châu, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r54verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r54verification, @seed_r54proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r54verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r54verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner1, @seed_r54house, @seed_r54room, 'Phòng trọ cho thuê quận hải Châu Đà nẵng', 'Phòng cho thuê tại 38 Đường Hải Sơn, Phường Thanh Bình, Hải Châu, Đà Nẵng. Diện tích 20 m²; giá tham khảo 1,000,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-cho-thue-quan-hai-chau-da-nang-168144.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r54post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r54post, 'https://img.thuephongtro.com/images/large/2021/11/07/20211107155259-a440o.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r54post, 'https://img.thuephongtro.com/images/large/2021/11/07/20211107155308-zrn1x.jpg', 1);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r54house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r54hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r54room, @seed_r54house, @seed_r54hs0);
SET @seed_r54rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r54house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r54hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r54room, @seed_r54house, @seed_r54hs1);
SET @seed_r54rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r54house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r54hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r54room, @seed_r54house, @seed_r54hs2);
SET @seed_r54rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r54house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r54hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r54room, @seed_r54house, @seed_r54hs3);
SET @seed_r54rs3 = LAST_INSERT_ID();

-- Tin 56: https://thuephongtro.com/cho-thue-phong-tro-gia-re-trung-tam-thanh-pho-da-nang-167969.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner2, 'Nhà demo 056 - Đà Nẵng', 'Đường Nguyễn Hoàng, Phường Vĩnh Trung, Thanh Khê, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/cho-thue-phong-tro-gia-re-trung-tam-thanh-pho-da-nang-167969.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r55house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r55house, 'P101', 25.0, 1200000, 1200000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r55room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/r55proof.pdf', 'DEMO-r55proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r55proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r55house, @seed_owner2, 1, '{"name":"Nhà demo 056 - Đà Nẵng","address":"Đường Nguyễn Hoàng, Phường Vĩnh Trung, Thanh Khê, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r55verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r55verification, @seed_r55proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r55verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r55verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner2, @seed_r55house, @seed_r55room, 'Cho thuê phòng trọ giá rẻ,trung tâm thành phố đà nẵng', 'Phòng cho thuê tại Đường Nguyễn Hoàng, Phường Vĩnh Trung, Thanh Khê, Đà Nẵng. Diện tích 25 m²; giá tham khảo 1,200,000 đồng/tháng. Tiện ích ghi trong tin: WC riêng, Giờ giấc tự do. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/cho-thue-phong-tro-gia-re-trung-tam-thanh-pho-da-nang-167969.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r55post = LAST_INSERT_ID();
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r55post, 'WC riêng');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r55post, 'Giờ giấc tự do');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r55house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r55hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r55room, @seed_r55house, @seed_r55hs0);
SET @seed_r55rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r55house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r55hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r55room, @seed_r55house, @seed_r55hs1);
SET @seed_r55rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r55house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r55hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r55room, @seed_r55house, @seed_r55hs2);
SET @seed_r55rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r55house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r55hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r55room, @seed_r55house, @seed_r55hs3);
SET @seed_r55rs3 = LAST_INSERT_ID();

-- Tin 57: https://thuephongtro.com/can-ho-co-ho-boi-bao-dien-nuoc-ngay-truong-dh-kinh-te-da-nang-chi-4-5tr-thang-167921.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner3, 'Nhà demo 057 - Đà Nẵng', 'Đường Hồ Xuân Hương, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/can-ho-co-ho-boi-bao-dien-nuoc-ngay-truong-dh-kinh-te-da-nang-chi-4-5tr-thang-167921.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r56house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r56house, 'P101', 45.0, 4500000, 4500000, 4, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r56room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/r56proof.pdf', 'DEMO-r56proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r56proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r56house, @seed_owner3, 1, '{"name":"Nhà demo 057 - Đà Nẵng","address":"Đường Hồ Xuân Hương, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r56verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r56verification, @seed_r56proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r56verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r56verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner3, @seed_r56house, @seed_r56room, 'Căn hộ Có Hồ Bơi Bao Điện Nước - Ngay Trường ĐH Kinh Tế Đà Nẵng - Chỉ 4.5tr/Tháng', 'Phòng cho thuê tại Đường Hồ Xuân Hương, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng. Diện tích 45 m²; giá tham khảo 4,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Máy giặt, Tủ lạnh, Chỗ để xe, Giờ giấc tự do, Nước nóng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/can-ho-co-ho-boi-bao-dien-nuoc-ngay-truong-dh-kinh-te-da-nang-chi-4-5tr-thang-167921.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r56post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r56post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928102641-ay3g4.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r56post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928102721-tv240.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r56post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928102722-bbtgx.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r56post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928102722-cevh3.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r56post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928102722-y32cs.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r56post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928102722-va3mw.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Tủ lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Chỗ để xe');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Giờ giấc tự do');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r56post, 'Nước nóng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r56house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r56hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r56room, @seed_r56house, @seed_r56hs0);
SET @seed_r56rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r56house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r56hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r56room, @seed_r56house, @seed_r56hs1);
SET @seed_r56rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r56house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r56hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r56room, @seed_r56house, @seed_r56hs2);
SET @seed_r56rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r56house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r56hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r56room, @seed_r56house, @seed_r56hs3);
SET @seed_r56rs3 = LAST_INSERT_ID();

-- Tin 58: https://thuephongtro.com/phong-tro-cho-thue-quan-hai-chau-da-nang-167920.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner4, 'Nhà demo 058 - Đà Nẵng', '38 Đường Hải Sơn, Phường Thanh Bình, Hải Châu, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-tro-cho-thue-quan-hai-chau-da-nang-167920.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r57house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r57house, 'P101', 20.0, 1500000, 1500000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r57room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner4, 'demo/r57proof.pdf', 'DEMO-r57proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r57proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r57house, @seed_owner4, 1, '{"name":"Nhà demo 058 - Đà Nẵng","address":"38 Đường Hải Sơn, Phường Thanh Bình, Hải Châu, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r57verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r57verification, @seed_r57proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r57verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r57verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner4, @seed_r57house, @seed_r57room, 'Phòng trọ cho thuê quận hải Châu Đà nẵng', 'Phòng cho thuê tại 38 Đường Hải Sơn, Phường Thanh Bình, Hải Châu, Đà Nẵng. Diện tích 20 m²; giá tham khảo 1,500,000 đồng/tháng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-cho-thue-quan-hai-chau-da-nang-167920.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r57post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r57post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928080112-qo5a2.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r57post, 'https://img.thuephongtro.com/images/large/2021/09/28/20210928080122-adiey.jpg', 1);
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r57house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r57hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r57room, @seed_r57house, @seed_r57hs0);
SET @seed_r57rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r57house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r57hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r57room, @seed_r57house, @seed_r57hs1);
SET @seed_r57rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r57house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r57hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r57room, @seed_r57house, @seed_r57hs2);
SET @seed_r57rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r57house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r57hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r57room, @seed_r57house, @seed_r57hs3);
SET @seed_r57rs3 = LAST_INSERT_ID();

-- Tin 59: https://thuephongtro.com/phong-can-ho-cao-cap-gia-sinh-vien-q-ngu-hanh-son-chi-4-5-trieu-thang-mien-phi-dien-nuoc-wifi-167906.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner5, 'Nhà demo 059 - Đà Nẵng', 'Đường Hồ Xuân Hương, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-can-ho-cao-cap-gia-sinh-vien-q-ngu-hanh-son-chi-4-5-trieu-thang-mien-phi-dien-nuoc-wifi-167906.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r58house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r58house, 'P101', 45.0, 4500000, 4500000, 4, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r58room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner5, 'demo/r58proof.pdf', 'DEMO-r58proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r58proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r58house, @seed_owner5, 1, '{"name":"Nhà demo 059 - Đà Nẵng","address":"Đường Hồ Xuân Hương, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r58verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r58verification, @seed_r58proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r58verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r58verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner5, @seed_r58house, @seed_r58room, 'Phòng Căn Hộ Cao Cấp Giá Sinh Viên - Q.Ngũ Hành Sơn- Chỉ 4.5 triệu/tháng- Miễn Phí Điện,Nước,Wifi', 'Phòng cho thuê tại Đường Hồ Xuân Hương, Phường Mỹ An, Ngũ Hành Sơn, Đà Nẵng. Diện tích 45 m²; giá tham khảo 4,500,000 đồng/tháng. Tiện ích ghi trong tin: Máy lạnh, Wifi, Máy giặt, Thang máy, Chỗ để xe. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-can-ho-cao-cap-gia-sinh-vien-q-ngu-hanh-son-chi-4-5-trieu-thang-mien-phi-dien-nuoc-wifi-167906.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r58post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r58post, 'https://img.thuephongtro.com/images/large/2021/09/22/20210922211502-3shb0.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r58post, 'https://img.thuephongtro.com/images/large/2021/09/22/20210922211515-3ni23.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r58post, 'https://img.thuephongtro.com/images/large/2021/09/22/20210922211515-4gkwz.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r58post, 'https://img.thuephongtro.com/images/large/2021/09/22/20210922211515-1azzy.jpg', 3);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r58post, 'https://img.thuephongtro.com/images/large/2021/09/22/20210922211516-0bumj.jpg', 4);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r58post, 'https://img.thuephongtro.com/images/large/2021/09/22/20210922211516-hx123.jpg', 5);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r58post, 'Máy lạnh');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r58post, 'Wifi');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r58post, 'Máy giặt');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r58post, 'Thang máy');
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r58post, 'Chỗ để xe');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r58house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r58hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r58room, @seed_r58house, @seed_r58hs0);
SET @seed_r58rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r58house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r58hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r58room, @seed_r58house, @seed_r58hs1);
SET @seed_r58rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r58house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r58hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r58room, @seed_r58house, @seed_r58hs2);
SET @seed_r58rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r58house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r58hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r58room, @seed_r58house, @seed_r58hs3);
SET @seed_r58rs3 = LAST_INSERT_ID();

-- Tin 60: https://thuephongtro.com/phong-tro-co-gac-tu-1-4tr-sach-se-binh-ky-dn-167813.html
INSERT INTO `rental_houses` (`landlord_id`, `name`, `address`, `province_code`, `area_label`, `notes`) VALUES
  (@seed_owner6, 'Nhà demo 060 - Đà Nẵng', 'Đường Bình Kỳ, Phường Hòa Quý, Ngũ Hành Sơn, Đà Nẵng', '48', 'Đà Nẵng', 'Nguồn: https://thuephongtro.com/phong-tro-co-gac-tu-1-4tr-sach-se-binh-ky-dn-167813.html; mỗi tin ánh xạ thành một nhà/phòng demo; không khẳng định cùng chủ nhà nguồn.');
SET @seed_r59house = LAST_INSERT_ID();
INSERT INTO `rooms` (`house_id`, `room_number`, `area`, `rent_price`, `deposit_amount`, `max_occupants`, `allow_additional_occupants`, `notes`) VALUES
  (@seed_r59house, 'P101', 24.0, 1300000, 1300000, 2, 1, 'DEMO: cọc bằng 1 tháng thuê, sức chứa 2–4 người được tự sinh; không lấy từ nguồn.');
SET @seed_r59room = LAST_INSERT_ID();
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner6, 'demo/r59proof.pdf', 'DEMO-r59proof.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'LANDLORD_PROOF', 'PRIVATE', 'ACTIVE');
SET @seed_r59proof = LAST_INSERT_ID();
INSERT INTO `rental_house_verifications` (`house_id`, `applicant_landlord_id`, `house_version`, `house_snapshot`, `right_type`, `scope_description`, `valid_from`, `status`) VALUES
  (@seed_r59house, @seed_owner6, 1, '{"name":"Nhà demo 060 - Đà Nẵng","address":"Đường Bình Kỳ, Phường Hòa Quý, Ngũ Hành Sơn, Đà Nẵng","provinceCode":"48","localityCode":null,"latitude":null,"longitude":null,"demo":true}', 'OWNER', 'DEMO: toàn bộ nhà mẫu; hồ sơ tự sinh, không xác minh chủ nhà thật.', @seed_today - INTERVAL 90 DAY, 'PENDING');
SET @seed_r59verification = LAST_INSERT_ID();
INSERT INTO `house_verification_documents` (`verification_id`, `file_id`, `document_type`) VALUES
  (@seed_r59verification, @seed_r59proof, 'OWNER_PROOF');
CALL _v5_validate_house_documents(@seed_r59verification);
UPDATE `rental_house_verifications` SET `status`='APPROVED', `reviewed_by_id`=@seed_admin, `reviewed_at`=@seed_now, `evidence_checked_at`=@seed_now WHERE id=@seed_r59verification;
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`, `availability_status`, `availability_confirmed_at`, `availability_expires_at`, `published_at`, `reviewed_at`, `reviewed_by_id`) VALUES
  (@seed_owner6, @seed_r59house, @seed_r59room, 'Phòng trọ có gác 1.3tr sạch sẽ Bình Kỳ ĐN', 'Phòng cho thuê tại Đường Bình Kỳ, Phường Hòa Quý, Ngũ Hành Sơn, Đà Nẵng. Diện tích 24 m²; giá tham khảo 1,300,000 đồng/tháng. Tiện ích ghi trong tin: Gác lửng. Thông tin lấy từ tin công khai; cần kiểm tra lại với nguồn.
Nguồn: https://thuephongtro.com/phong-tro-co-gac-tu-1-4tr-sach-se-binh-ky-dn-167813.html
Dữ liệu demo; trạng thái còn phòng được tạo mẫu.', 'APPROVED', 'OPEN', @seed_now, @seed_now + INTERVAL 30 DAY, @seed_now, @seed_now, @seed_admin);
SET @seed_r59post = LAST_INSERT_ID();
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r59post, 'https://img.thuephongtro.com/images/large/2021/07/07/20210707164615-e2mak.jpg', 0);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r59post, 'https://img.thuephongtro.com/images/large/2021/07/07/20210707164615-xeji3.jpg', 1);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r59post, 'https://img.thuephongtro.com/images/large/2021/07/07/20210707164615-lfeqo.jpg', 2);
INSERT INTO `post_images` (`post_id`, `external_url`, `position`) VALUES
  (@seed_r59post, 'https://img.thuephongtro.com/images/large/2021/07/07/20210707164615-rlcdf.jpg', 3);
INSERT INTO `post_amenities` (`post_id`, `amenity`) VALUES
  (@seed_r59post, 'Gác lửng');
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r59house, @seed_catalog0, 'Điện demo', 'kWh', 3500, 'METERED');
SET @seed_r59hs0 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r59room, @seed_r59house, @seed_r59hs0);
SET @seed_r59rs0 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r59house, @seed_catalog1, 'Nước demo', 'm³', 20000, 'METERED');
SET @seed_r59hs1 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r59room, @seed_r59house, @seed_r59hs1);
SET @seed_r59rs1 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r59house, @seed_catalog2, 'Internet demo', 'phòng/tháng', 100000, 'PER_ROOM');
SET @seed_r59hs2 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r59room, @seed_r59house, @seed_r59hs2);
SET @seed_r59rs2 = LAST_INSERT_ID();
INSERT INTO `house_services` (`house_id`, `catalog_service_id`, `name`, `unit`, `default_unit_price`, `default_calculation_method`) VALUES
  (@seed_r59house, @seed_catalog3, 'Vệ sinh demo', 'người/tháng', 30000, 'PER_PERSON');
SET @seed_r59hs3 = LAST_INSERT_ID();
INSERT INTO `room_services` (`room_id`, `house_id`, `house_service_id`) VALUES
  (@seed_r59room, @seed_r59house, @seed_r59hs3);
SET @seed_r59rs3 = LAST_INSERT_ID();

-- Du lieu nghiep vu TU SINH. Mot so phong chuyen sang FULL khi co nguoi o.
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner1, 'demo/contract0.pdf', 'DEMO-contract0.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'CONTRACT', 'PRIVATE', 'ACTIVE');
SET @seed_contract0 = LAST_INSERT_ID();
INSERT INTO `contracts` (`contract_number`, `room_id`, `house_id`, `landlord_id`, `paper_document_file_id`, `source`, `status`, `start_date`, `end_date`, `rent_amount`, `deposit_amount`) VALUES
  ('TRODAY-DEMO-001', @seed_r0room, @seed_r0house, @seed_owner1, @seed_contract0, 'PAPER_IMPORT', 'DRAFT', @seed_today - INTERVAL 60 DAY, @seed_today + INTERVAL 305 DAY, 4500000, 4500000);
SET @seed_contract0 = LAST_INSERT_ID();
INSERT INTO `room_tenants` (`contract_id`, `room_id`, `tenant_id`, `full_name`, `intake_source`, `status`, `planned_move_in_date`) VALUES
  (@seed_contract0, @seed_r0room, @seed_tenant1, 'Nguyễn Minh An', 'PAPER_IMPORT', 'PLANNED', @seed_today - INTERVAL 60 DAY);
SET @seed_member0 = LAST_INSERT_ID();
INSERT INTO `contract_revisions` (`contract_id`, `revision_number`, `template_id`, `created_by_id`, `kind`, `status`, `start_date`, `end_date`, `effective_from`, `rent_amount`, `deposit_amount`, `content`, `members_snapshot`, `representative_room_tenant_id`, `document_file_id`) VALUES
  (@seed_contract0, 1, @seed_template, @seed_owner1, 'PAPER_IMPORT', 'IMPORTED', @seed_today - INTERVAL 60 DAY, @seed_today + INTERVAL 305 DAY, @seed_today - INTERVAL 60 DAY, 4500000, 4500000, 'Hợp đồng DEMO tự sinh để kiểm thử; tài liệu mẫu không có giá trị pháp lý.', '[{"name":"Nguyễn Minh An","demo":true}]', @seed_member0, @seed_contract0);
SET @seed_revision0 = LAST_INSERT_ID();
UPDATE `contracts` SET `representative_room_tenant_id`=@seed_member0, `current_revision_id`=@seed_revision0, `status`='CONFIRMED' WHERE id=@seed_contract0;
UPDATE `room_tenants` SET `status`='ACTIVE', `move_in_date`=@seed_today - INTERVAL 60 DAY, `move_in_confirmed_by_id`=@seed_owner1, `move_in_confirmed_at`=@seed_now - INTERVAL 60 DAY WHERE id=@seed_member0;
UPDATE `contracts` SET `status`='ACTIVE', `activated_at`=@seed_now - INTERVAL 60 DAY WHERE id=@seed_contract0;
UPDATE `rooms` SET `status`='OCCUPIED' WHERE id=@seed_r0room;
UPDATE `posts` SET `availability_status`='FULL' WHERE id=@seed_r0post;
INSERT INTO `reviews` (`reviewer_id`, `room_id`, `contract_id`, `room_tenant_id`, `rating`, `content`) VALUES
  (@seed_tenant1, @seed_r0room, @seed_contract0, @seed_member0, 4, '[DEMO] Phòng sạch sẽ, đi lại thuận tiện; đánh giá tự sinh để kiểm thử.');
INSERT INTO `invoices` (`contract_id`, `room_id`, `contract_revision_id`, `payer_room_tenant_id`, `payer_snapshot`, `billing_period`, `due_date`, `occupant_count_at_billing`, `created_by_id`) VALUES
  (@seed_contract0, @seed_r0room, @seed_revision0, @seed_member0, '{"fullName":"Nguyễn Minh An","demo":true}', CAST(DATE_FORMAT(@seed_today - INTERVAL 0 MONTH, '%Y-%m-01') AS DATE), CAST(DATE_FORMAT(@seed_today - INTERVAL 0 MONTH, '%Y-%m-01') AS DATE) + INTERVAL 9 DAY, 1, @seed_owner1);
SET @seed_invoice0_0 = LAST_INSERT_ID();
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `name_snapshot`, `unit_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice0_0, @seed_r0room, 0, 'RENT', 'Tiền phòng demo', 'tháng', 1, 4500000, 4500000);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `previous_reading`, `current_reading`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice0_0, @seed_r0room, 1, 'SERVICE', @seed_r0rs0, 'Điện demo', 'kWh', 'METERED', 100, 145, 45, 3500, 157500);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice0_0, @seed_r0room, 2, 'SERVICE', @seed_r0rs2, 'Internet demo', 'phòng/tháng', 'PER_ROOM', 1, 100000, 100000);
UPDATE `invoices` SET `status`='UNPAID' WHERE id=@seed_invoice0_0;
INSERT INTO `invoices` (`contract_id`, `room_id`, `contract_revision_id`, `payer_room_tenant_id`, `payer_snapshot`, `billing_period`, `due_date`, `occupant_count_at_billing`, `created_by_id`) VALUES
  (@seed_contract0, @seed_r0room, @seed_revision0, @seed_member0, '{"fullName":"Nguyễn Minh An","demo":true}', CAST(DATE_FORMAT(@seed_today - INTERVAL 1 MONTH, '%Y-%m-01') AS DATE), CAST(DATE_FORMAT(@seed_today - INTERVAL 1 MONTH, '%Y-%m-01') AS DATE) + INTERVAL 9 DAY, 1, @seed_owner1);
SET @seed_invoice0_1 = LAST_INSERT_ID();
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `name_snapshot`, `unit_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice0_1, @seed_r0room, 0, 'RENT', 'Tiền phòng demo', 'tháng', 1, 4500000, 4500000);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `previous_reading`, `current_reading`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice0_1, @seed_r0room, 1, 'SERVICE', @seed_r0rs0, 'Điện demo', 'kWh', 'METERED', 100, 145, 45, 3500, 157500);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice0_1, @seed_r0room, 2, 'SERVICE', @seed_r0rs2, 'Internet demo', 'phòng/tháng', 'PER_ROOM', 1, 100000, 100000);
UPDATE `invoices` SET `status`='UNPAID' WHERE id=@seed_invoice0_1;
UPDATE `invoices` SET `status`='PAID', `paid_by_id`=@seed_owner1, `paid_at`=@seed_now - INTERVAL 25 DAY WHERE id=@seed_invoice0_1;
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner2, 'demo/contract1.pdf', 'DEMO-contract1.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'CONTRACT', 'PRIVATE', 'ACTIVE');
SET @seed_contract1 = LAST_INSERT_ID();
INSERT INTO `contracts` (`contract_number`, `room_id`, `house_id`, `landlord_id`, `paper_document_file_id`, `source`, `status`, `start_date`, `end_date`, `rent_amount`, `deposit_amount`) VALUES
  ('TRODAY-DEMO-002', @seed_r1room, @seed_r1house, @seed_owner2, @seed_contract1, 'PAPER_IMPORT', 'DRAFT', @seed_today - INTERVAL 60 DAY, @seed_today + INTERVAL 305 DAY, 3500000, 3500000);
SET @seed_contract1 = LAST_INSERT_ID();
INSERT INTO `room_tenants` (`contract_id`, `room_id`, `tenant_id`, `full_name`, `intake_source`, `status`, `planned_move_in_date`) VALUES
  (@seed_contract1, @seed_r1room, @seed_tenant2, 'Trần Ngọc Mai', 'PAPER_IMPORT', 'PLANNED', @seed_today - INTERVAL 60 DAY);
SET @seed_member1 = LAST_INSERT_ID();
INSERT INTO `contract_revisions` (`contract_id`, `revision_number`, `template_id`, `created_by_id`, `kind`, `status`, `start_date`, `end_date`, `effective_from`, `rent_amount`, `deposit_amount`, `content`, `members_snapshot`, `representative_room_tenant_id`, `document_file_id`) VALUES
  (@seed_contract1, 1, @seed_template, @seed_owner2, 'PAPER_IMPORT', 'IMPORTED', @seed_today - INTERVAL 60 DAY, @seed_today + INTERVAL 305 DAY, @seed_today - INTERVAL 60 DAY, 3500000, 3500000, 'Hợp đồng DEMO tự sinh để kiểm thử; tài liệu mẫu không có giá trị pháp lý.', '[{"name":"Trần Ngọc Mai","demo":true}]', @seed_member1, @seed_contract1);
SET @seed_revision1 = LAST_INSERT_ID();
UPDATE `contracts` SET `representative_room_tenant_id`=@seed_member1, `current_revision_id`=@seed_revision1, `status`='CONFIRMED' WHERE id=@seed_contract1;
UPDATE `room_tenants` SET `status`='ACTIVE', `move_in_date`=@seed_today - INTERVAL 60 DAY, `move_in_confirmed_by_id`=@seed_owner2, `move_in_confirmed_at`=@seed_now - INTERVAL 60 DAY WHERE id=@seed_member1;
UPDATE `contracts` SET `status`='ACTIVE', `activated_at`=@seed_now - INTERVAL 60 DAY WHERE id=@seed_contract1;
UPDATE `rooms` SET `status`='OCCUPIED' WHERE id=@seed_r1room;
UPDATE `posts` SET `availability_status`='FULL' WHERE id=@seed_r1post;
INSERT INTO `reviews` (`reviewer_id`, `room_id`, `contract_id`, `room_tenant_id`, `rating`, `content`) VALUES
  (@seed_tenant2, @seed_r1room, @seed_contract1, @seed_member1, 5, '[DEMO] Phòng sạch sẽ, đi lại thuận tiện; đánh giá tự sinh để kiểm thử.');
INSERT INTO `invoices` (`contract_id`, `room_id`, `contract_revision_id`, `payer_room_tenant_id`, `payer_snapshot`, `billing_period`, `due_date`, `occupant_count_at_billing`, `created_by_id`) VALUES
  (@seed_contract1, @seed_r1room, @seed_revision1, @seed_member1, '{"fullName":"Trần Ngọc Mai","demo":true}', CAST(DATE_FORMAT(@seed_today - INTERVAL 0 MONTH, '%Y-%m-01') AS DATE), CAST(DATE_FORMAT(@seed_today - INTERVAL 0 MONTH, '%Y-%m-01') AS DATE) + INTERVAL 9 DAY, 1, @seed_owner2);
SET @seed_invoice1_0 = LAST_INSERT_ID();
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `name_snapshot`, `unit_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice1_0, @seed_r1room, 0, 'RENT', 'Tiền phòng demo', 'tháng', 1, 3500000, 3500000);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `previous_reading`, `current_reading`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice1_0, @seed_r1room, 1, 'SERVICE', @seed_r1rs0, 'Điện demo', 'kWh', 'METERED', 100, 145, 45, 3500, 157500);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice1_0, @seed_r1room, 2, 'SERVICE', @seed_r1rs2, 'Internet demo', 'phòng/tháng', 'PER_ROOM', 1, 100000, 100000);
UPDATE `invoices` SET `status`='UNPAID' WHERE id=@seed_invoice1_0;
INSERT INTO `invoices` (`contract_id`, `room_id`, `contract_revision_id`, `payer_room_tenant_id`, `payer_snapshot`, `billing_period`, `due_date`, `occupant_count_at_billing`, `created_by_id`) VALUES
  (@seed_contract1, @seed_r1room, @seed_revision1, @seed_member1, '{"fullName":"Trần Ngọc Mai","demo":true}', CAST(DATE_FORMAT(@seed_today - INTERVAL 1 MONTH, '%Y-%m-01') AS DATE), CAST(DATE_FORMAT(@seed_today - INTERVAL 1 MONTH, '%Y-%m-01') AS DATE) + INTERVAL 9 DAY, 1, @seed_owner2);
SET @seed_invoice1_1 = LAST_INSERT_ID();
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `name_snapshot`, `unit_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice1_1, @seed_r1room, 0, 'RENT', 'Tiền phòng demo', 'tháng', 1, 3500000, 3500000);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `previous_reading`, `current_reading`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice1_1, @seed_r1room, 1, 'SERVICE', @seed_r1rs0, 'Điện demo', 'kWh', 'METERED', 100, 145, 45, 3500, 157500);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice1_1, @seed_r1room, 2, 'SERVICE', @seed_r1rs2, 'Internet demo', 'phòng/tháng', 'PER_ROOM', 1, 100000, 100000);
UPDATE `invoices` SET `status`='UNPAID' WHERE id=@seed_invoice1_1;
UPDATE `invoices` SET `status`='PAID', `paid_by_id`=@seed_owner2, `paid_at`=@seed_now - INTERVAL 25 DAY WHERE id=@seed_invoice1_1;
INSERT INTO `files` (`owner_user_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `sha256`, `purpose`, `visibility`, `status`) VALUES
  (@seed_owner3, 'demo/contract2.pdf', 'DEMO-contract2.pdf', 'application/pdf', 647, 'fbf2d2c659e2922c168a8019ba3def8a9d34f2f72917567dab6f166664b339fd', 'CONTRACT', 'PRIVATE', 'ACTIVE');
SET @seed_contract2 = LAST_INSERT_ID();
INSERT INTO `contracts` (`contract_number`, `room_id`, `house_id`, `landlord_id`, `paper_document_file_id`, `source`, `status`, `start_date`, `end_date`, `rent_amount`, `deposit_amount`) VALUES
  ('TRODAY-DEMO-003', @seed_r2room, @seed_r2house, @seed_owner3, @seed_contract2, 'PAPER_IMPORT', 'DRAFT', @seed_today - INTERVAL 60 DAY, @seed_today + INTERVAL 305 DAY, 3500000, 3500000);
SET @seed_contract2 = LAST_INSERT_ID();
INSERT INTO `room_tenants` (`contract_id`, `room_id`, `tenant_id`, `full_name`, `intake_source`, `status`, `planned_move_in_date`) VALUES
  (@seed_contract2, @seed_r2room, @seed_tenant3, 'Lê Hoàng Nam', 'PAPER_IMPORT', 'PLANNED', @seed_today - INTERVAL 60 DAY);
SET @seed_member2 = LAST_INSERT_ID();
INSERT INTO `contract_revisions` (`contract_id`, `revision_number`, `template_id`, `created_by_id`, `kind`, `status`, `start_date`, `end_date`, `effective_from`, `rent_amount`, `deposit_amount`, `content`, `members_snapshot`, `representative_room_tenant_id`, `document_file_id`) VALUES
  (@seed_contract2, 1, @seed_template, @seed_owner3, 'PAPER_IMPORT', 'IMPORTED', @seed_today - INTERVAL 60 DAY, @seed_today + INTERVAL 305 DAY, @seed_today - INTERVAL 60 DAY, 3500000, 3500000, 'Hợp đồng DEMO tự sinh để kiểm thử; tài liệu mẫu không có giá trị pháp lý.', '[{"name":"Lê Hoàng Nam","demo":true}]', @seed_member2, @seed_contract2);
SET @seed_revision2 = LAST_INSERT_ID();
UPDATE `contracts` SET `representative_room_tenant_id`=@seed_member2, `current_revision_id`=@seed_revision2, `status`='CONFIRMED' WHERE id=@seed_contract2;
UPDATE `room_tenants` SET `status`='ACTIVE', `move_in_date`=@seed_today - INTERVAL 60 DAY, `move_in_confirmed_by_id`=@seed_owner3, `move_in_confirmed_at`=@seed_now - INTERVAL 60 DAY WHERE id=@seed_member2;
UPDATE `contracts` SET `status`='ACTIVE', `activated_at`=@seed_now - INTERVAL 60 DAY WHERE id=@seed_contract2;
UPDATE `rooms` SET `status`='OCCUPIED' WHERE id=@seed_r2room;
UPDATE `posts` SET `availability_status`='FULL' WHERE id=@seed_r2post;
INSERT INTO `reviews` (`reviewer_id`, `room_id`, `contract_id`, `room_tenant_id`, `rating`, `content`) VALUES
  (@seed_tenant3, @seed_r2room, @seed_contract2, @seed_member2, 4, '[DEMO] Phòng sạch sẽ, đi lại thuận tiện; đánh giá tự sinh để kiểm thử.');
INSERT INTO `invoices` (`contract_id`, `room_id`, `contract_revision_id`, `payer_room_tenant_id`, `payer_snapshot`, `billing_period`, `due_date`, `occupant_count_at_billing`, `created_by_id`) VALUES
  (@seed_contract2, @seed_r2room, @seed_revision2, @seed_member2, '{"fullName":"Lê Hoàng Nam","demo":true}', CAST(DATE_FORMAT(@seed_today - INTERVAL 0 MONTH, '%Y-%m-01') AS DATE), CAST(DATE_FORMAT(@seed_today - INTERVAL 0 MONTH, '%Y-%m-01') AS DATE) + INTERVAL 9 DAY, 1, @seed_owner3);
SET @seed_invoice2_0 = LAST_INSERT_ID();
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `name_snapshot`, `unit_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice2_0, @seed_r2room, 0, 'RENT', 'Tiền phòng demo', 'tháng', 1, 3500000, 3500000);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `previous_reading`, `current_reading`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice2_0, @seed_r2room, 1, 'SERVICE', @seed_r2rs0, 'Điện demo', 'kWh', 'METERED', 100, 145, 45, 3500, 157500);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice2_0, @seed_r2room, 2, 'SERVICE', @seed_r2rs2, 'Internet demo', 'phòng/tháng', 'PER_ROOM', 1, 100000, 100000);
UPDATE `invoices` SET `status`='UNPAID' WHERE id=@seed_invoice2_0;
INSERT INTO `invoices` (`contract_id`, `room_id`, `contract_revision_id`, `payer_room_tenant_id`, `payer_snapshot`, `billing_period`, `due_date`, `occupant_count_at_billing`, `created_by_id`) VALUES
  (@seed_contract2, @seed_r2room, @seed_revision2, @seed_member2, '{"fullName":"Lê Hoàng Nam","demo":true}', CAST(DATE_FORMAT(@seed_today - INTERVAL 1 MONTH, '%Y-%m-01') AS DATE), CAST(DATE_FORMAT(@seed_today - INTERVAL 1 MONTH, '%Y-%m-01') AS DATE) + INTERVAL 9 DAY, 1, @seed_owner3);
SET @seed_invoice2_1 = LAST_INSERT_ID();
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `name_snapshot`, `unit_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice2_1, @seed_r2room, 0, 'RENT', 'Tiền phòng demo', 'tháng', 1, 3500000, 3500000);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `previous_reading`, `current_reading`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice2_1, @seed_r2room, 1, 'SERVICE', @seed_r2rs0, 'Điện demo', 'kWh', 'METERED', 100, 145, 45, 3500, 157500);
INSERT INTO `invoice_items` (`invoice_id`, `room_id`, `position`, `item_type`, `room_service_id`, `name_snapshot`, `unit_snapshot`, `calculation_method_snapshot`, `quantity`, `unit_price_snapshot`, `amount`) VALUES
  (@seed_invoice2_1, @seed_r2room, 2, 'SERVICE', @seed_r2rs2, 'Internet demo', 'phòng/tháng', 'PER_ROOM', 1, 100000, 100000);
UPDATE `invoices` SET `status`='UNPAID' WHERE id=@seed_invoice2_1;
UPDATE `invoices` SET `status`='PAID', `paid_by_id`=@seed_owner3, `paid_at`=@seed_now - INTERVAL 25 DAY WHERE id=@seed_invoice2_1;
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant1, 'IN_SYSTEM', @seed_member0, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile0 = LAST_INSERT_ID();
INSERT INTO `lifestyle_criteria` (`code`, `name`, `category`, `value_type`, `allowed_values`) VALUES
  ('DEMO_SMOKING', 'Hút thuốc (demo)', 'Sinh hoạt', 'BOOLEAN', '[true,false]');
SET @seed_criterion0 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile0, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `lifestyle_criteria` (`code`, `name`, `category`, `value_type`, `allowed_values`) VALUES
  ('DEMO_PETS', 'Nuôi thú cưng (demo)', 'Sinh hoạt', 'BOOLEAN', '[true,false]');
SET @seed_criterion1 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile0, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `lifestyle_criteria` (`code`, `name`, `category`, `value_type`, `allowed_values`) VALUES
  ('DEMO_CLEAN', 'Ưa sạch sẽ (demo)', 'Sinh hoạt', 'BOOLEAN', '[true,false]');
SET @seed_criterion2 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile0, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant1, @seed_r3post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant1, @seed_r4post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant1, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:0');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant2, 'IN_SYSTEM', @seed_member1, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile1 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile1, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile1, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile1, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant2, @seed_r4post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant2, @seed_r5post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant2, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:1');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant3, 'IN_SYSTEM', @seed_member2, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile2 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile2, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile2, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile2, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant3, @seed_r5post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant3, @seed_r6post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant3, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:2');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant4, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile3 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile3, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile3, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile3, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant4, @seed_r6post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant4, @seed_r7post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant4, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:3');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant5, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile4 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile4, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile4, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile4, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant5, @seed_r7post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant5, @seed_r8post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant5, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:4');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant6, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile5 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile5, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile5, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile5, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant6, @seed_r8post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant6, @seed_r9post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant6, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:5');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant7, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile6 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile6, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile6, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile6, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant7, @seed_r9post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant7, @seed_r10post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant7, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:6');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant8, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile7 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile7, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile7, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile7, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant8, @seed_r10post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant8, @seed_r11post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant8, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:7');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant9, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile8 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile8, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile8, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile8, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant9, @seed_r11post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant9, @seed_r12post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant9, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:8');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant10, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile9 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile9, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile9, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile9, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant10, @seed_r12post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant10, @seed_r13post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant10, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:9');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant11, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile10 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile10, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile10, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile10, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant11, @seed_r13post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant11, @seed_r14post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant11, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:10');
INSERT INTO `roommate_profiles` (`tenant_id`, `housing_status`, `current_room_tenant_id`, `available_from`, `budget_min`, `budget_max`, `preferred_location`, `preferred_gender`, `requirements_snapshot`, `active`) VALUES
  (@seed_tenant12, 'NO_ACCOMMODATION', NULL, @seed_today, 1500000, 4000000, 'Hồ Chí Minh', 'ANY', '{"demo":true,"quiet":true}', 1);
SET @seed_profile11 = LAST_INSERT_ID();
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile11, @seed_criterion0, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile11, @seed_criterion1, 'false', 'false', 4);
INSERT INTO `profile_lifestyles` (`profile_id`, `criterion_id`, `self_value`, `preferred_value`, `importance`) VALUES
  (@seed_profile11, @seed_criterion2, 'true', 'true', 4);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant12, @seed_r14post);
INSERT INTO `favorite_posts` (`user_id`, `post_id`) VALUES
  (@seed_tenant12, @seed_r15post);
INSERT INTO `notifications` (`user_id`, `type`, `title`, `content`, `event_key`) VALUES
  (@seed_tenant12, 'DEMO_WELCOME', 'Chào mừng đến Trọday demo', 'Dữ liệu mẫu đã sẵn sàng để khám phá phòng và tìm bạn ở ghép.', 'demo:welcome:11');
INSERT INTO `roommate_requests` (`sender_id`, `receiver_id`, `scenario`, `status`, `responded_at`, `message`) VALUES
  (@seed_tenant4, @seed_tenant5, 'SEARCH_TOGETHER', 'ACCEPTED', @seed_now, '[DEMO] Mình muốn tìm phòng ở ghép cùng bạn.');
SET @seed_roommateRequest = LAST_INSERT_ID();
INSERT INTO `roommate_requests` (`sender_id`, `receiver_id`, `scenario`, `message`) VALUES
  (@seed_tenant6, @seed_tenant7, 'SEARCH_TOGETHER', '[DEMO] Cùng tìm phòng gần trường nhé.');
INSERT INTO `conversations` (`type`, `roommate_request_id`) VALUES
  ('ROOMMATE', @seed_roommateRequest);
SET @seed_roommateConversation = LAST_INSERT_ID();
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_roommateConversation, @seed_tenant4, @seed_now - INTERVAL 1 DAY);
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_roommateConversation, @seed_tenant5, @seed_now - INTERVAL 1 DAY);
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_roommateConversation, @seed_tenant4, 'faf59178-2e2a-5ae6-adbd-8f3f4ac42974', 'TEXT', '[DEMO] Mình muốn tìm hiểu thêm về phòng.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_roommateConversation, @seed_tenant5, '8b35fb7c-b4c5-55c8-b8ed-8f82ca05eea2', 'TEXT', '[DEMO] Mình đã nhận tin, cùng trao đổi nhé.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
UPDATE `conversations` SET `last_message_id`=@seed_lastMessage, `last_message_at`=@seed_now WHERE id=@seed_roommateConversation;
INSERT INTO `conversations` (`type`, `room_id`, `post_id`) VALUES
  ('ROOM_INQUIRY', @seed_r3room, @seed_r3post);
SET @seed_inquiry0 = LAST_INSERT_ID();
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry0, @seed_tenant8, @seed_now - INTERVAL 1 DAY);
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry0, @seed_owner4, @seed_now - INTERVAL 1 DAY);
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry0, @seed_tenant8, 'a66796f1-fa90-526a-b8db-656b2dcddeea', 'TEXT', '[DEMO] Mình muốn tìm hiểu thêm về phòng.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry0, @seed_owner4, 'a8c9c789-a6ce-59b8-85e8-ba2cf77c423f', 'TEXT', '[DEMO] Mình đã nhận tin, cùng trao đổi nhé.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
UPDATE `conversations` SET `last_message_id`=@seed_lastMessage, `last_message_at`=@seed_now WHERE id=@seed_inquiry0;
INSERT INTO `room_viewing_requests` (`room_id`, `house_id`, `conversation_id`, `tenant_id`, `created_by_id`, `starts_at`, `ends_at`, `notes`) VALUES
  (@seed_r3room, @seed_r3house, @seed_inquiry0, @seed_tenant8, @seed_owner4, @seed_now + INTERVAL 1 DAY, @seed_now + INTERVAL 1 DAY + INTERVAL 1 HOUR, '[DEMO] Lịch xem phòng mẫu');
INSERT INTO `conversations` (`type`, `room_id`, `post_id`) VALUES
  ('ROOM_INQUIRY', @seed_r4room, @seed_r4post);
SET @seed_inquiry1 = LAST_INSERT_ID();
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry1, @seed_tenant9, @seed_now - INTERVAL 1 DAY);
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry1, @seed_owner5, @seed_now - INTERVAL 1 DAY);
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry1, @seed_tenant9, '972fee13-b9e9-5eae-9f59-007b3e2f1a17', 'TEXT', '[DEMO] Mình muốn tìm hiểu thêm về phòng.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry1, @seed_owner5, 'a8a21cfd-bc84-5d16-bce7-5b2fad36ff67', 'TEXT', '[DEMO] Mình đã nhận tin, cùng trao đổi nhé.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
UPDATE `conversations` SET `last_message_id`=@seed_lastMessage, `last_message_at`=@seed_now WHERE id=@seed_inquiry1;
INSERT INTO `room_viewing_proposals` (`room_id`, `house_id`, `conversation_id`, `tenant_id`, `landlord_id`, `client_request_key`, `starts_at`, `ends_at`, `notes`) VALUES
  (@seed_r4room, @seed_r4house, @seed_inquiry1, @seed_tenant9, @seed_owner5, '915aa436-9514-54e6-b029-0a6bdf2cd71d', @seed_now + INTERVAL 2 DAY, @seed_now + INTERVAL 2 DAY + INTERVAL 1 HOUR, '[DEMO] Đề nghị chờ chủ trọ xác nhận');
INSERT INTO `conversations` (`type`, `room_id`, `post_id`) VALUES
  ('ROOM_INQUIRY', @seed_r5room, @seed_r5post);
SET @seed_inquiry2 = LAST_INSERT_ID();
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry2, @seed_tenant10, @seed_now - INTERVAL 1 DAY);
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry2, @seed_owner6, @seed_now - INTERVAL 1 DAY);
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry2, @seed_tenant10, '802391ac-538c-5544-9d3c-2c7dd5342448', 'TEXT', '[DEMO] Mình muốn tìm hiểu thêm về phòng.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry2, @seed_owner6, '275c50e9-7727-5e1b-bb12-0fd9855d3817', 'TEXT', '[DEMO] Mình đã nhận tin, cùng trao đổi nhé.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
UPDATE `conversations` SET `last_message_id`=@seed_lastMessage, `last_message_at`=@seed_now WHERE id=@seed_inquiry2;
INSERT INTO `room_viewing_requests` (`room_id`, `house_id`, `conversation_id`, `tenant_id`, `created_by_id`, `starts_at`, `ends_at`, `notes`) VALUES
  (@seed_r5room, @seed_r5house, @seed_inquiry2, @seed_tenant10, @seed_owner6, @seed_now + INTERVAL 3 DAY, @seed_now + INTERVAL 3 DAY + INTERVAL 1 HOUR, '[DEMO] Lịch xem phòng mẫu');
INSERT INTO `conversations` (`type`, `room_id`, `post_id`) VALUES
  ('ROOM_INQUIRY', @seed_r6room, @seed_r6post);
SET @seed_inquiry3 = LAST_INSERT_ID();
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry3, @seed_tenant11, @seed_now - INTERVAL 1 DAY);
INSERT INTO `conversation_participants` (`conversation_id`, `user_id`, `joined_at`) VALUES
  (@seed_inquiry3, @seed_owner1, @seed_now - INTERVAL 1 DAY);
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry3, @seed_tenant11, 'ea260d38-6f97-572c-990b-f9c152b0b64d', 'TEXT', '[DEMO] Mình muốn tìm hiểu thêm về phòng.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
INSERT INTO `chat_messages` (`conversation_id`, `sender_id`, `client_message_key`, `message_type`, `content`, `sent_at`) VALUES
  (@seed_inquiry3, @seed_owner1, 'e2b5158d-51c6-5f64-be84-1fe68269020a', 'TEXT', '[DEMO] Mình đã nhận tin, cùng trao đổi nhé.', @seed_now);
SET @seed_lastMessage = LAST_INSERT_ID();
UPDATE `conversations` SET `last_message_id`=@seed_lastMessage, `last_message_at`=@seed_now WHERE id=@seed_inquiry3;
INSERT INTO `room_viewing_proposals` (`room_id`, `house_id`, `conversation_id`, `tenant_id`, `landlord_id`, `client_request_key`, `starts_at`, `ends_at`, `notes`) VALUES
  (@seed_r6room, @seed_r6house, @seed_inquiry3, @seed_tenant11, @seed_owner1, 'f9e0bd01-c186-5028-9a6e-15199bb6253f', @seed_now + INTERVAL 4 DAY, @seed_now + INTERVAL 4 DAY + INTERVAL 1 HOUR, '[DEMO] Đề nghị chờ chủ trọ xác nhận');
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`) VALUES
  (@seed_owner5, @seed_r58house, @seed_r58room, '[DEMO] Bản cập nhật phòng chờ kiểm duyệt', 'Nội dung tự sinh phục vụ thử giao diện quản lý tin.', 'PENDING_REVIEW');
INSERT INTO `posts` (`landlord_id`, `house_id`, `room_id`, `title`, `content`, `status`) VALUES
  (@seed_owner6, @seed_r59house, @seed_r59room, '[DEMO] Tin nháp của chủ trọ', 'Nội dung tự sinh phục vụ thử giao diện quản lý tin.', 'DRAFT');
INSERT INTO `reports` (`reporter_id`, `reported_post_id`, `type`, `reason`, `status`) VALUES
  (@seed_tenant8, @seed_r7post, 'VIOLATION', '[DEMO] Đề nghị kiểm tra lại thông tin giá và ảnh của tin mẫu.', 'PENDING');
SET @seed_report = LAST_INSERT_ID();
INSERT INTO `moderation_actions` (`actor_user_id`, `target_post_id`, `action`, `reason`, `occurred_at`) VALUES
  (@seed_admin, @seed_r7post, 'DEMO_POST_REVIEW', 'Duyệt mẫu dữ liệu demo, không xác nhận tin ngoài hệ thống.', @seed_now);
COMMIT;
SET SESSION sql_mode = @seed_old_mode;
SET time_zone = @seed_old_time_zone;
SELECT 'Troday demo imported' AS result, COUNT(*) AS demo_users FROM users WHERE email LIKE '%@troday.example';
