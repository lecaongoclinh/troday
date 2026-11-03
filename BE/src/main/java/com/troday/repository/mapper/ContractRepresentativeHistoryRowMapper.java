package com.troday.repository.mapper;

import com.troday.model.ContractRepresentativeHistory;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full contract_representative_history row, preserving nullable fields and UTC timestamps. */
public final class ContractRepresentativeHistoryRowMapper implements RowMapper<ContractRepresentativeHistory> {
    @Override
    public ContractRepresentativeHistory mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ContractRepresentativeHistory(
                rs.getObject("id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("room_tenant_id", Long.class),
                rs.getObject("tenant_id", Long.class),
                rs.getString("name_snapshot"),
                JdbcValues.enumValue(rs, "event_type", ContractRepresentativeHistory.EventType.class),
                rs.getObject("previous_history_id", Long.class),
                rs.getObject("previous_room_tenant_id", Long.class),
                rs.getObject("basis_revision_id", Long.class),
                JdbcValues.instant(rs, "started_at"),
                JdbcValues.instant(rs, "ended_at"),
                rs.getObject("is_current", Boolean.class),
                rs.getObject("recorded_by_id", Long.class),
                JdbcValues.instant(rs, "recorded_at"),
                rs.getString("reason"),
                rs.getString("consent_method"),
                rs.getObject("consented_by_id", Long.class),
                rs.getObject("consent_recorded_by_id", Long.class),
                JdbcValues.instant(rs, "consent_recorded_at"),
                rs.getObject("consent_file_id", Long.class),
                rs.getObject("ended_by_id", Long.class),
                rs.getString("end_reason"),
                rs.getObject("current_contract_id", Long.class));
    }
}
