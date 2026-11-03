package com.troday.repository.mapper;

import com.troday.model.LifestyleCriterion;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full lifestyle_criteria row, preserving nullable fields and UTC timestamps. */
public final class LifestyleCriterionRowMapper implements RowMapper<LifestyleCriterion> {
    @Override
    public LifestyleCriterion mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new LifestyleCriterion(
                rs.getObject("id", Long.class),
                rs.getString("code"),
                rs.getString("name"),
                rs.getString("category"),
                JdbcValues.enumValue(rs, "value_type", LifestyleCriterion.ValueType.class),
                JdbcValues.json(rs, "allowed_values"),
                rs.getObject("active", Boolean.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
