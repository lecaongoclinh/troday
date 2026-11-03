package com.troday.repository.mapper;

import com.troday.model.RentalHouse;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full rental_houses row, preserving nullable fields and UTC timestamps. */
public final class RentalHouseRowMapper implements RowMapper<RentalHouse> {
    @Override
    public RentalHouse mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RentalHouse(
                rs.getObject("id", Long.class),
                rs.getObject("landlord_id", Long.class),
                rs.getString("address"),
                rs.getString("province_code"),
                rs.getString("locality_code"),
                rs.getString("area_label"),
                rs.getBigDecimal("latitude"),
                rs.getBigDecimal("longitude"),
                rs.getString("notes"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getString("name"),
                rs.getObject("row_version", Long.class),
                rs.getObject("verification_version", Long.class),
                rs.getString("creation_key"));
    }
}
