-- Development-only accounts in the new Docker database. Never import into a
-- real database. Password hash follows the current BE AccountService contract.
SET NAMES utf8mb4;
INSERT INTO users (id, email, password_hash, full_name, role, status) VALUES
  (1, 'tenant@troday.test', SHA2('TrodayDemo@123', 256), 'Người thuê Demo', 'TENANT', 'ACTIVE'),
  (2, 'landlord@troday.test', SHA2('TrodayDemo@123', 256), 'Chủ trọ Demo', 'LANDLORD', 'ACTIVE'),
  (3, 'admin@troday.test', SHA2('TrodayDemo@123', 256), 'Quản trị Demo', 'ADMIN', 'ACTIVE');
INSERT INTO tenants (id) VALUES (1);
INSERT INTO landlords (id) VALUES (2);
INSERT INTO admins (id) VALUES (3);
