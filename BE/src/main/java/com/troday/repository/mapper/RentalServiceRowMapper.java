package com.troday.repository.mapper;

import com.troday.model.RentalService;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full rental_services row, preserving nullable fields and UTC timestamps. */
public final class RentalServiceRowMapper implements RowMapper<RentalService> {
    @Override
    public RentalService mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RentalService(
                rs.getObject("id", Long.class),
                rs.getString("name"),
                rs.getString("unit"),
                JdbcValues.enumValue(rs, "default_calculation_method", RentalService.DefaultCalculationMethod.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
