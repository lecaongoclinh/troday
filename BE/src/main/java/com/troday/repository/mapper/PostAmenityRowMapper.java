package com.troday.repository.mapper;

import com.troday.model.PostAmenity;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full post_amenities row, preserving nullable fields and UTC timestamps. */
public final class PostAmenityRowMapper implements RowMapper<PostAmenity> {
    @Override
    public PostAmenity mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new PostAmenity(
                rs.getObject("id", Long.class),
                rs.getObject("post_id", Long.class),
                rs.getString("amenity"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
