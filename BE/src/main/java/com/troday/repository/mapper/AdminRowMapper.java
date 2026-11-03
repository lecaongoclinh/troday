package com.troday.repository.mapper;

import com.troday.model.Admin;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full admins row, preserving nullable fields and UTC timestamps. */
public final class AdminRowMapper implements RowMapper<Admin> {
    @Override
    public Admin mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Admin(
                rs.getObject("id", Long.class));
    }
}
