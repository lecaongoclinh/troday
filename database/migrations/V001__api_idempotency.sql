-- Apply explicitly AFTER source/schema.sql, against the selected local/test database.
-- Authentication responses contain secrets, so response_ciphertext is AES-GCM encrypted.
-- Purge expired rows periodically: DELETE FROM api_idempotency WHERE expires_at < UTC_TIMESTAMP(6).
CREATE TABLE api_idempotency (
    request_scope VARCHAR(200) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    request_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    response_ciphertext LONGTEXT,
    expires_at DATETIME(6) NOT NULL,
    PRIMARY KEY (request_scope, request_key),
    KEY ix_api_idempotency_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
