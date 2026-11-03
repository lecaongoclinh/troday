package com.troday.repository.mapper;

import com.troday.model.Review;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full reviews row, preserving nullable fields and UTC timestamps. */
public final class ReviewRowMapper implements RowMapper<Review> {
    @Override
    public Review mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Review(
                rs.getObject("id", Long.class),
                rs.getObject("reviewer_id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("room_tenant_id", Long.class),
                rs.getObject("rating", Integer.class),
                rs.getString("content"),
                JdbcValues.enumValue(rs, "status", Review.Status.class),
                rs.getObject("hidden_by_id", Long.class),
                rs.getString("hidden_reason"),
                JdbcValues.instant(rs, "hidden_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
