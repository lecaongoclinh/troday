package com.troday.repository.mapper;

import com.troday.model.VerificationToken;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full verification_tokens row, preserving nullable fields and UTC timestamps. */
public final class VerificationTokenRowMapper implements RowMapper<VerificationToken> {
    @Override
    public VerificationToken mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new VerificationToken(
                rs.getObject("id", Long.class),
                rs.getObject("user_id", Long.class),
                rs.getString("selector"),
                rs.getString("token_hash"),
                JdbcValues.enumValue(rs, "purpose", VerificationToken.Purpose.class),
                rs.getString("target_value"),
                rs.getObject("target_room_tenant_id", Long.class),
                rs.getObject("attempt_count", Integer.class),
                rs.getObject("max_attempts", Integer.class),
                JdbcValues.instant(rs, "expires_at"),
                JdbcValues.instant(rs, "consumed_at"),
                JdbcValues.instant(rs, "revoked_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
