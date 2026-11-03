package com.troday.repository.mapper;

import com.troday.model.RoomViewingProposal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full room_viewing_proposals row, preserving nullable fields and UTC timestamps. */
public final class RoomViewingProposalRowMapper implements RowMapper<RoomViewingProposal> {
    @Override
    public RoomViewingProposal mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RoomViewingProposal(
                rs.getObject("id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("conversation_id", Long.class),
                rs.getObject("tenant_id", Long.class),
                rs.getObject("landlord_id", Long.class),
                rs.getString("client_request_key"),
                JdbcValues.instant(rs, "starts_at"),
                JdbcValues.instant(rs, "ends_at"),
                rs.getString("notes"),
                JdbcValues.enumValue(rs, "status", RoomViewingProposal.Status.class),
                rs.getObject("reviewed_by_id", Long.class),
                JdbcValues.instant(rs, "reviewed_at"),
                rs.getString("rejection_reason"),
                rs.getObject("withdrawn_by_id", Long.class),
                JdbcValues.instant(rs, "withdrawn_at"),
                JdbcValues.instant(rs, "expired_at"),
                rs.getObject("scheduled_viewing_id", Long.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("pending_tenant_id", Long.class));
    }
}
