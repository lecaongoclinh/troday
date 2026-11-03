package com.troday.repository.mapper;

import com.troday.model.RentalHouseVerification;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full rental_house_verifications row, preserving nullable fields and UTC timestamps. */
public final class RentalHouseVerificationRowMapper implements RowMapper<RentalHouseVerification> {
    @Override
    public RentalHouseVerification mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RentalHouseVerification(
                rs.getObject("id", Long.class),
                rs.getObject("house_id", Long.class),
                rs.getObject("applicant_landlord_id", Long.class),
                rs.getObject("house_version", Long.class),
                JdbcValues.json(rs, "house_snapshot"),
                JdbcValues.enumValue(rs, "right_type", RentalHouseVerification.RightType.class),
                rs.getString("scope_description"),
                rs.getObject("valid_from", LocalDate.class),
                rs.getObject("valid_until", LocalDate.class),
                JdbcValues.enumValue(rs, "status", RentalHouseVerification.Status.class),
                JdbcValues.instant(rs, "submitted_at"),
                rs.getObject("reviewed_by_id", Long.class),
                JdbcValues.instant(rs, "reviewed_at"),
                JdbcValues.instant(rs, "evidence_checked_at"),
                rs.getString("rejection_reason"),
                rs.getObject("revoked_by_id", Long.class),
                JdbcValues.instant(rs, "revoked_at"),
                rs.getString("revocation_reason"),
                JdbcValues.instant(rs, "withdrawn_at"),
                rs.getString("withdrawal_reason"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"),
                rs.getObject("pending_house_id", Long.class),
                rs.getObject("approved_house_id", Long.class));
    }
}
