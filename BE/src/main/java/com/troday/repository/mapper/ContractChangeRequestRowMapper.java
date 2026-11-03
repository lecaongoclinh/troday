package com.troday.repository.mapper;

import com.troday.model.ContractChangeRequest;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full contract_change_requests row, preserving nullable fields and UTC timestamps. */
public final class ContractChangeRequestRowMapper implements RowMapper<ContractChangeRequest> {
    @Override
    public ContractChangeRequest mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ContractChangeRequest(
                rs.getObject("id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("requested_by_id", Long.class),
                rs.getObject("representative_room_tenant_id", Long.class),
                rs.getObject("base_revision_id", Long.class),
                rs.getObject("proposed_revision_id", Long.class),
                rs.getObject("target_room_id", Long.class),
                rs.getObject("result_contract_id", Long.class),
                JdbcValues.enumValue(rs, "type", ContractChangeRequest.Type.class),
                JdbcValues.enumValue(rs, "status", ContractChangeRequest.Status.class),
                rs.getObject("requested_effective_date", LocalDate.class),
                JdbcValues.json(rs, "proposal_snapshot"),
                rs.getString("message"),
                rs.getObject("reviewed_by_id", Long.class),
                rs.getString("rejection_reason"),
                rs.getObject("tenant_confirmed_by_id", Long.class),
                rs.getObject("applied_by_id", Long.class),
                JdbcValues.instant(rs, "reviewed_at"),
                JdbcValues.instant(rs, "tenant_confirmed_at"),
                JdbcValues.instant(rs, "applied_at"),
                JdbcValues.instant(rs, "expires_at"),
                JdbcValues.instant(rs, "cancelled_at"),
                rs.getObject("cancelled_by_id", Long.class),
                rs.getString("cancellation_reason"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("open_contract_id", Long.class));
    }
}
