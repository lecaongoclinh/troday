package com.troday.repository.mapper;

import com.troday.model.LandlordVerification;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full landlord_verifications row, preserving nullable fields and UTC timestamps. */
public final class LandlordVerificationRowMapper implements RowMapper<LandlordVerification> {
    @Override
    public LandlordVerification mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new LandlordVerification(
                rs.getObject("id", Long.class),
                rs.getObject("applicant_user_id", Long.class),
                rs.getString("identity_number"),
                rs.getObject("identity_file_id", Long.class),
                JdbcValues.enumValue(rs, "status", LandlordVerification.Status.class),
                rs.getString("rejection_reason"),
                rs.getObject("reviewed_by_id", Long.class),
                JdbcValues.instant(rs, "reviewed_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("pending_applicant_id", Long.class));
    }
}
