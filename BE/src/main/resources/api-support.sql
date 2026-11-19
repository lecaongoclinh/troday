CREATE TABLE IF NOT EXISTS api_request_replays (
  scope_hash CHAR(64) NOT NULL PRIMARY KEY,
  payload_hash CHAR(64) NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  response_status INT,
  response_body MEDIUMBLOB,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  completed_at DATETIME(6),
  KEY ix_replay_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_room_inquiries (
  post_id BIGINT NOT NULL,
  tenant_id BIGINT NOT NULL,
  landlord_id BIGINT NOT NULL,
  conversation_id BIGINT NOT NULL,
  PRIMARY KEY (post_id,tenant_id,landlord_id),
  UNIQUE KEY uq_inquiry_conversation (conversation_id),
  CONSTRAINT fk_api_inquiry_post FOREIGN KEY (post_id) REFERENCES posts(id),
  CONSTRAINT fk_api_inquiry_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS api_conversation_read_cursors (
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  last_message_id BIGINT NOT NULL,
  PRIMARY KEY (conversation_id,user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
