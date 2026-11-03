package com.troday.repository.mapper;

import com.troday.model.RoomService;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full room_services row, preserving nullable fields and UTC timestamps. */
public final class RoomServiceRowMapper implements RowMapper<RoomService> {
    @Override
    public RoomService mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RoomService(
                rs.getObject("id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("house_service_id", Long.class),
                rs.getBigDecimal("unit_price_override"),
                JdbcValues.enumValue(rs, "calculation_method_override", RoomService.CalculationMethodOverride.class),
                rs.getObject("is_active", Boolean.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
