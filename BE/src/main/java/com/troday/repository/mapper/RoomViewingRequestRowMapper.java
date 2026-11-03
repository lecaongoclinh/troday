package com.troday.repository.mapper;

import com.troday.model.RoomViewingRequest;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full room_viewing_requests row, preserving nullable fields and UTC timestamps. */
public final class RoomViewingRequestRowMapper implements RowMapper<RoomViewingRequest> {
    @Override
    public RoomViewingRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RoomViewingRequest(
                rs.getObject("id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("conversation_id", Long.class),
                rs.getObject("tenant_id", Long.class),
                rs.getObject("created_by_id", Long.class),
                JdbcValues.instant(rs, "starts_at"),
                JdbcValues.instant(rs, "ends_at"),
                rs.getString("notes"),
                JdbcValues.enumValue(rs, "status", RoomViewingRequest.Status.class),
                rs.getObject("attendance_confirmed_by_id", Long.class),
                JdbcValues.instant(rs, "attendance_confirmed_at"),
                JdbcValues.instant(rs, "cancelled_at"),
                rs.getObject("cancelled_by_id", Long.class),
                rs.getString("cancellation_reason"),
                JdbcValues.enumValue(rs, "rental_decision", RoomViewingRequest.RentalDecision.class),
                rs.getObject("rental_decided_by_id", Long.class),
                JdbcValues.instant(rs, "rental_decided_at"),
                JdbcValues.instant(rs, "rental_withdrawn_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
