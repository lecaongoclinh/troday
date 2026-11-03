package com.troday.repository.mapper;

import com.troday.model.Room;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full rooms row, preserving nullable fields and UTC timestamps. */
public final class RoomRowMapper implements RowMapper<Room> {
    @Override
    public Room mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Room(
                rs.getObject("id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getString("room_number"),
                rs.getBigDecimal("area"),
                rs.getBigDecimal("rent_price"),
                rs.getBigDecimal("deposit_amount"),
                rs.getObject("max_occupants", Integer.class),
                rs.getObject("allow_additional_occupants", Boolean.class),
                JdbcValues.enumValue(rs, "status", Room.Status.class),
                rs.getString("notes"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
