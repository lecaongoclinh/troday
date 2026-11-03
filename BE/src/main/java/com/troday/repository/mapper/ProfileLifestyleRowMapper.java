package com.troday.repository.mapper;

import com.troday.model.ProfileLifestyle;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full profile_lifestyles row, preserving nullable fields and UTC timestamps. */
public final class ProfileLifestyleRowMapper implements RowMapper<ProfileLifestyle> {
    @Override
    public ProfileLifestyle mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ProfileLifestyle(
                rs.getObject("id", Long.class),
                rs.getObject("profile_id", Long.class),
                rs.getObject("criterion_id", Long.class),
                JdbcValues.json(rs, "self_value"),
                JdbcValues.json(rs, "preferred_value"),
                rs.getObject("is_mandatory", Boolean.class),
                rs.getObject("importance", Integer.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
