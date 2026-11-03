package com.troday.repository.mapper;

import com.troday.model.HouseService;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full house_services row, preserving nullable fields and UTC timestamps. */
public final class HouseServiceRowMapper implements RowMapper<HouseService> {
    @Override
    public HouseService mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new HouseService(
                rs.getObject("id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("catalog_service_id", Long.class),
                rs.getString("name"),
                rs.getString("unit"),
                rs.getBigDecimal("default_unit_price"),
                JdbcValues.enumValue(rs, "default_calculation_method", HouseService.DefaultCalculationMethod.class),
                rs.getObject("is_active", Boolean.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
