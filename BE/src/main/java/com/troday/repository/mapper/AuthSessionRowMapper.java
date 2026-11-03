package com.troday.repository.mapper;

import com.troday.model.AuthSession;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full auth_sessions row, preserving nullable fields and UTC timestamps. */
public final class AuthSessionRowMapper implements RowMapper<AuthSession> {
    @Override
    public AuthSession mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new AuthSession(
                rs.getObject("id", Long.class),
                rs.getObject("user_id", Long.class),
                rs.getString("session_key"),
                rs.getString("refresh_token_hash"),
                JdbcValues.instant(rs, "expires_at"),
                JdbcValues.instant(rs, "last_seen_at"),
                JdbcValues.instant(rs, "revoked_at"),
                rs.getString("revocation_reason"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
