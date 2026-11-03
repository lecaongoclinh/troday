package com.troday.repository.mapper;

import com.troday.model.RoomTenant;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full room_tenants row, preserving nullable fields and UTC timestamps. */
public final class RoomTenantRowMapper implements RowMapper<RoomTenant> {
    @Override
    public RoomTenant mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RoomTenant(
                rs.getObject("id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("tenant_id", Long.class),
                rs.getString("full_name"),
                rs.getString("phone_number"),
                rs.getString("identity_number"),
                rs.getObject("date_of_birth", LocalDate.class),
                rs.getString("gender"),
                rs.getString("permanent_address"),
                JdbcValues.enumValue(rs, "status", RoomTenant.Status.class),
                JdbcValues.enumValue(rs, "intake_source", RoomTenant.IntakeSource.class),
                rs.getObject("join_request_id", Long.class),
                rs.getObject("planned_move_in_date", LocalDate.class),
                rs.getObject("move_in_date", LocalDate.class),
                rs.getObject("move_out_date", LocalDate.class),
                rs.getObject("move_in_confirmed_by_id", Long.class),
                rs.getObject("move_out_confirmed_by_id", Long.class),
                JdbcValues.instant(rs, "move_in_confirmed_at"),
                JdbcValues.instant(rs, "move_out_confirmed_at"),
                JdbcValues.instant(rs, "account_linked_at"),
                rs.getObject("account_linked_by_id", Long.class),
                rs.getString("cancellation_reason"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("active_tenant_id", Long.class),
                rs.getObject("open_tenant_id", Long.class));
    }
}
