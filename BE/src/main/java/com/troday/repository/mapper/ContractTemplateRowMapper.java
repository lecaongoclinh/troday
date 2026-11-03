package com.troday.repository.mapper;

import com.troday.model.ContractTemplate;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full contract_templates row, preserving nullable fields and UTC timestamps. */
public final class ContractTemplateRowMapper implements RowMapper<ContractTemplate> {
    @Override
    public ContractTemplate mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ContractTemplate(
                rs.getObject("id", Long.class),
                rs.getObject("created_by_id", Long.class),
                rs.getString("name"),
                rs.getObject("version", Integer.class),
                rs.getString("content"),
                rs.getObject("active", Boolean.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
