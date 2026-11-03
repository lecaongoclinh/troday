package com.troday.repository.mapper;

import com.troday.model.FavoritePost;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full favorite_posts row, preserving nullable fields and UTC timestamps. */
public final class FavoritePostRowMapper implements RowMapper<FavoritePost> {
    @Override
    public FavoritePost mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new FavoritePost(
                rs.getObject("id", Long.class),
                rs.getObject("user_id", Long.class),
                rs.getObject("post_id", Long.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
