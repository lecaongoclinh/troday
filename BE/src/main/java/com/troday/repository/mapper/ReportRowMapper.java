package com.troday.repository.mapper;

import com.troday.model.Report;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full reports row, preserving nullable fields and UTC timestamps. */
public final class ReportRowMapper implements RowMapper<Report> {
    @Override
    public Report mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Report(
                rs.getObject("id", Long.class),
                rs.getObject("reporter_id", Long.class),
                JdbcValues.enumValue(rs, "type", Report.Type.class),
                rs.getObject("reported_user_id", Long.class),
                rs.getObject("reported_post_id", Long.class),
                rs.getObject("contract_id", Long.class),
                rs.getObject("roommate_request_id", Long.class),
                rs.getString("reason"),
                JdbcValues.enumValue(rs, "status", Report.Status.class),
                rs.getString("resolution"),
                rs.getObject("handled_by_id", Long.class),
                JdbcValues.instant(rs, "handled_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
