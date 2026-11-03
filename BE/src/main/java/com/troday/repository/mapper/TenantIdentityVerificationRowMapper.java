package com.troday.repository.mapper;

import com.troday.model.TenantIdentityVerification;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full tenant_identity_verifications row, preserving nullable fields and UTC timestamps. */
public final class TenantIdentityVerificationRowMapper implements RowMapper<TenantIdentityVerification> {
    @Override
    public TenantIdentityVerification mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new TenantIdentityVerification(
                rs.getObject("id", Long.class),
                rs.getObject("tenant_id", Long.class),
                rs.getString("identity_number"),
                rs.getObject("identity_file_id", Long.class),
                JdbcValues.enumValue(rs, "status", TenantIdentityVerification.Status.class),
                rs.getObject("reviewed_by_id", Long.class),
                rs.getString("rejection_reason"),
                JdbcValues.instant(rs, "reviewed_at"),
                JdbcValues.instant(rs, "retention_until"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("pending_tenant_id", Long.class));
    }
}
