package com.troday.repository.mapper;

import com.troday.model.ContractRevision;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full contract_revisions row, preserving nullable fields and UTC timestamps. */
public final class ContractRevisionRowMapper implements RowMapper<ContractRevision> {
    @Override
    public ContractRevision mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ContractRevision(
                rs.getObject("id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("revision_number", Integer.class),
                rs.getObject("template_id", Long.class),
                rs.getObject("created_by_id", Long.class),
                JdbcValues.enumValue(rs, "kind", ContractRevision.Kind.class),
                JdbcValues.enumValue(rs, "status", ContractRevision.Status.class),
                rs.getObject("start_date", LocalDate.class),
                rs.getObject("end_date", LocalDate.class),
                rs.getObject("effective_from", LocalDate.class),
                rs.getBigDecimal("rent_amount"),
                rs.getBigDecimal("deposit_amount"),
                rs.getString("content"),
                JdbcValues.json(rs, "members_snapshot"),
                JdbcValues.json(rs, "service_terms_snapshot"),
                rs.getObject("document_file_id", Long.class),
                rs.getObject("representative_room_tenant_id", Long.class),
                rs.getObject("landlord_confirmed_by_id", Long.class),
                rs.getObject("tenant_confirmed_by_id", Long.class),
                JdbcValues.instant(rs, "landlord_confirmed_at"),
                JdbcValues.instant(rs, "tenant_confirmed_at"),
                JdbcValues.instant(rs, "sent_at"),
                JdbcValues.instant(rs, "applied_at"),
                rs.getString("tenant_feedback"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
