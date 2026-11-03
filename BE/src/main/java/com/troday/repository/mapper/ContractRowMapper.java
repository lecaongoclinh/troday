package com.troday.repository.mapper;

import com.troday.model.Contract;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full contracts row, preserving nullable fields and UTC timestamps. */
public final class ContractRowMapper implements RowMapper<Contract> {
    @Override
    public Contract mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Contract(
                rs.getObject("id", Long.class),
                rs.getString("contract_number"),
                rs.getObject("room_id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("landlord_id", Long.class),
                rs.getObject("representative_room_tenant_id", Long.class),
                rs.getObject("initial_representative_room_tenant_id", Long.class),
                rs.getObject("current_revision_id", Long.class),
                rs.getObject("viewing_id", Long.class),
                rs.getObject("viewing_tenant_id", Long.class),
                rs.getObject("previous_contract_id", Long.class),
                rs.getObject("paper_document_file_id", Long.class),
                JdbcValues.enumValue(rs, "source", Contract.Source.class),
                JdbcValues.enumValue(rs, "status", Contract.Status.class),
                rs.getObject("start_date", LocalDate.class),
                rs.getObject("end_date", LocalDate.class),
                rs.getBigDecimal("rent_amount"),
                rs.getBigDecimal("deposit_amount"),
                JdbcValues.instant(rs, "activated_at"),
                JdbcValues.instant(rs, "closed_at"),
                rs.getString("closure_reason"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("live_room_id", Long.class),
                rs.getObject("live_viewing_id", Long.class));
    }
}
