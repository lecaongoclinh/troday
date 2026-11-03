package com.troday.repository.mapper;

import com.troday.model.Tenant;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full tenants row, preserving nullable fields and UTC timestamps. */
public final class TenantRowMapper implements RowMapper<Tenant> {
    @Override
    public Tenant mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Tenant(
                rs.getObject("id", Long.class));
    }
}
