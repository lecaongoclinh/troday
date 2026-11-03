package com.troday.repository.mapper;

import com.troday.model.OccupantJoinRequest;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full occupant_join_requests row, preserving nullable fields and UTC timestamps. */
public final class OccupantJoinRequestRowMapper implements RowMapper<OccupantJoinRequest> {
    @Override
    public OccupantJoinRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new OccupantJoinRequest(
                rs.getObject("id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("source_roommate_request_id", Long.class),
                rs.getObject("applicant_id", Long.class),
                rs.getObject("requested_by_id", Long.class),
                rs.getObject("representative_room_tenant_id", Long.class),
                rs.getObject("planned_move_in_date", LocalDate.class),
                JdbcValues.enumValue(rs, "status", OccupantJoinRequest.Status.class),
                rs.getObject("representative_consented_by_id", Long.class),
                JdbcValues.instant(rs, "representative_consented_at"),
                rs.getObject("applicant_consented_by_id", Long.class),
                JdbcValues.instant(rs, "applicant_consented_at"),
                JdbcValues.instant(rs, "reviewed_at"),
                JdbcValues.instant(rs, "hold_expires_at"),
                JdbcValues.instant(rs, "completed_at"),
                JdbcValues.instant(rs, "cancelled_at"),
                rs.getObject("cancelled_by_id", Long.class),
                rs.getString("cancellation_reason"),
                rs.getObject("reviewed_by_id", Long.class),
                rs.getString("rejection_reason"),
                rs.getObject("completed_room_tenant_id", Long.class),
                rs.getString("message"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("open_applicant_id", Long.class));
    }
}
