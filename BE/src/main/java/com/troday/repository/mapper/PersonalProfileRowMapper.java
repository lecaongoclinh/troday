package com.troday.repository.mapper;

import com.troday.model.PersonalProfile;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full personal_profiles row, preserving nullable fields and UTC timestamps. */
public final class PersonalProfileRowMapper implements RowMapper<PersonalProfile> {
    @Override
    public PersonalProfile mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new PersonalProfile(
                rs.getObject("id", Long.class),
                rs.getObject("user_id", Long.class),
                rs.getObject("avatar_file_id", Long.class),
                rs.getString("address"),
                rs.getString("gender"),
                rs.getString("occupation"),
                rs.getString("university"),
                rs.getString("bio"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
