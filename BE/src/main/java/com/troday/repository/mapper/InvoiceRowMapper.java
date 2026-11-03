package com.troday.repository.mapper;

import com.troday.model.Invoice;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full invoices row, preserving nullable fields and UTC timestamps. */
public final class InvoiceRowMapper implements RowMapper<Invoice> {
    @Override
    public Invoice mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Invoice(
                rs.getObject("id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("contract_revision_id", Long.class),
                rs.getObject("payer_room_tenant_id", Long.class),
                JdbcValues.json(rs, "payer_snapshot"),
                rs.getObject("billing_period", LocalDate.class),
                rs.getObject("due_date", LocalDate.class),
                rs.getObject("occupant_count_at_billing", Integer.class),
                JdbcValues.enumValue(rs, "status", Invoice.Status.class),
                rs.getObject("created_by_id", Long.class),
                rs.getObject("paid_by_id", Long.class),
                rs.getObject("cancelled_by_id", Long.class),
                rs.getString("cancellation_reason"),
                rs.getObject("replacement_of_id", Long.class),
                JdbcValues.instant(rs, "paid_at"),
                JdbcValues.instant(rs, "cancelled_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("open_period_key", Integer.class));
    }
}
