package com.troday.repository.mapper;

import com.troday.model.PostImage;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full post_images row, preserving nullable fields and UTC timestamps. */
public final class PostImageRowMapper implements RowMapper<PostImage> {
    @Override
    public PostImage mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new PostImage(
                rs.getObject("id", Long.class),
                rs.getObject("post_id", Long.class),
                rs.getObject("file_id", Long.class),
                rs.getString("external_url"),
                rs.getObject("position", Integer.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
