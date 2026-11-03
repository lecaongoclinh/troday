package com.troday.repository.mapper;

import com.troday.model.HouseVerificationDocument;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full house_verification_documents row, preserving nullable fields and UTC timestamps. */
public final class HouseVerificationDocumentRowMapper implements RowMapper<HouseVerificationDocument> {
    @Override
    public HouseVerificationDocument mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new HouseVerificationDocument(
                rs.getObject("id", Long.class),
                rs.getObject("verification_id", Long.class),
                rs.getObject("file_id", Long.class),
                JdbcValues.enumValue(rs, "document_type", HouseVerificationDocument.DocumentType.class),
                JdbcValues.instant(rs, "created_at"));
    }
}
