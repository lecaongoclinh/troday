package com.troday.repository.mapper;

import com.troday.model.Post;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full posts row, preserving nullable fields and UTC timestamps. */
public final class PostRowMapper implements RowMapper<Post> {
    @Override
    public Post mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Post(
                rs.getObject("id", Long.class),
                rs.getObject("landlord_id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getString("title"),
                rs.getString("content"),
                JdbcValues.enumValue(rs, "status", Post.Status.class),
                rs.getObject("pending_review_slot", Integer.class),
                JdbcValues.enumValue(rs, "availability_status", Post.AvailabilityStatus.class),
                JdbcValues.instant(rs, "availability_confirmed_at"),
                JdbcValues.instant(rs, "availability_expires_at"),
                JdbcValues.instant(rs, "published_at"),
                JdbcValues.instant(rs, "reviewed_at"),
                JdbcValues.instant(rs, "hidden_at"),
                rs.getObject("reviewed_by_id", Long.class),
                rs.getString("rejection_reason"),
                rs.getObject("hidden_by_id", Long.class),
                rs.getString("hidden_reason"),
                rs.getObject("content_version", Long.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
