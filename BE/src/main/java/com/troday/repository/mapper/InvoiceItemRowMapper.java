package com.troday.repository.mapper;

import com.troday.model.InvoiceItem;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full invoice_items row, preserving nullable fields and UTC timestamps. */
public final class InvoiceItemRowMapper implements RowMapper<InvoiceItem> {
    @Override
    public InvoiceItem mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new InvoiceItem(
                rs.getObject("id", Long.class),
                rs.getObject("invoice_id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("room_service_id", Long.class),
                rs.getObject("position", Integer.class),
                JdbcValues.enumValue(rs, "item_type", InvoiceItem.ItemType.class),
                rs.getString("name_snapshot"),
                rs.getString("unit_snapshot"),
                JdbcValues.enumValue(rs, "calculation_method_snapshot", InvoiceItem.CalculationMethodSnapshot.class),
                rs.getBigDecimal("quantity"),
                rs.getBigDecimal("unit_price_snapshot"),
                rs.getBigDecimal("previous_reading"),
                rs.getBigDecimal("current_reading"),
                rs.getBigDecimal("amount"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
