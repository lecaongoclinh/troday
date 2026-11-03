package com.troday.repository.mapper;

import com.troday.model.RoommateRequest;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full roommate_requests row, preserving nullable fields and UTC timestamps. */
public final class RoommateRequestRowMapper implements RowMapper<RoommateRequest> {
    @Override
    public RoommateRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RoommateRequest(
                rs.getObject("id", Long.class),
                rs.getObject("sender_id", Long.class),
                rs.getObject("receiver_id", Long.class),
                JdbcValues.enumValue(rs, "scenario", RoommateRequest.Scenario.class),
                rs.getObject("target_contract_id", Long.class),
                JdbcValues.enumValue(rs, "status", RoommateRequest.Status.class),
                rs.getString("message"),
                JdbcValues.instant(rs, "responded_at"),
                JdbcValues.instant(rs, "ended_at"),
                rs.getString("end_reason"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("pair_low_id", Long.class),
                rs.getObject("pair_high_id", Long.class),
                rs.getObject("open_pair_key", Integer.class));
    }
}
