package com.troday.repository.mapper;

import com.troday.model.User;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full users row, preserving nullable fields and UTC timestamps. */
public final class UserRowMapper implements RowMapper<User> {
    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new User(
                rs.getObject("id", Long.class),
                rs.getString("email"),
                rs.getString("phone_number"),
                rs.getString("password_hash"),
                rs.getString("full_name"),
                JdbcValues.enumValue(rs, "role", User.Role.class),
                JdbcValues.enumValue(rs, "status", User.Status.class),
                JdbcValues.instant(rs, "phone_verified_at"),
                JdbcValues.instant(rs, "locked_at"),
                rs.getObject("in_app_enabled", Boolean.class),
                rs.getObject("email_enabled", Boolean.class),
                rs.getObject("push_enabled", Boolean.class),
                rs.getString("lock_reason"),
                rs.getObject("locked_by_id", Long.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
