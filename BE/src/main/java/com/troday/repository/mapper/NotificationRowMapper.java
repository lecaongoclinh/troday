package com.troday.repository.mapper;

import com.troday.model.Notification;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full notifications row, preserving nullable fields and UTC timestamps. */
public final class NotificationRowMapper implements RowMapper<Notification> {
    @Override
    public Notification mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Notification(
                rs.getObject("id", Long.class),
                rs.getObject("user_id", Long.class),
                rs.getString("type"),
                rs.getString("title"),
                rs.getString("content"),
                rs.getString("resource_type"),
                rs.getObject("resource_id", Long.class),
                rs.getString("event_key"),
                rs.getObject("is_read", Boolean.class),
                JdbcValues.instant(rs, "read_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
