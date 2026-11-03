package com.troday.repository.mapper;

import com.troday.model.ModerationAction;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full moderation_actions row, preserving nullable fields and UTC timestamps. */
public final class ModerationActionRowMapper implements RowMapper<ModerationAction> {
    @Override
    public ModerationAction mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ModerationAction(
                rs.getObject("id", Long.class),
                rs.getObject("actor_user_id", Long.class),
                rs.getObject("target_user_id", Long.class),
                rs.getObject("target_post_id", Long.class),
                rs.getObject("target_report_id", Long.class),
                rs.getObject("target_landlord_verification_id", Long.class),
                rs.getObject("target_tenant_verification_id", Long.class),
                rs.getObject("related_report_id", Long.class),
                rs.getString("action"),
                rs.getString("reason"),
                JdbcValues.json(rs, "before_snapshot"),
                JdbcValues.json(rs, "after_snapshot"),
                JdbcValues.instant(rs, "occurred_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
