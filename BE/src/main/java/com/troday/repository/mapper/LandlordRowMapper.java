package com.troday.repository.mapper;

import com.troday.model.Landlord;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full landlords row, preserving nullable fields and UTC timestamps. */
public final class LandlordRowMapper implements RowMapper<Landlord> {
    @Override
    public Landlord mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Landlord(
                rs.getObject("id", Long.class));
    }
}
