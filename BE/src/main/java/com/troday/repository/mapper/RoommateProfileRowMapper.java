package com.troday.repository.mapper;

import com.troday.model.RoommateProfile;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full roommate_profiles row, preserving nullable fields and UTC timestamps. */
public final class RoommateProfileRowMapper implements RowMapper<RoommateProfile> {
    @Override
    public RoommateProfile mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new RoommateProfile(
                rs.getObject("id", Long.class),
                rs.getObject("tenant_id", Long.class),
                JdbcValues.enumValue(rs, "housing_status", RoommateProfile.HousingStatus.class),
                rs.getObject("current_room_tenant_id", Long.class),
                rs.getString("external_context"),
                rs.getObject("available_from", LocalDate.class),
                rs.getBigDecimal("budget_min"),
                rs.getBigDecimal("budget_max"),
                rs.getString("preferred_location"),
                rs.getString("preferred_gender"),
                JdbcValues.json(rs, "requirements_snapshot"),
                rs.getObject("profile_version", Long.class),
                rs.getObject("active", Boolean.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
