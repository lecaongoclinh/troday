package com.troday.repository.mapper;

import com.troday.model.FileMetadata;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full files row, preserving nullable fields and UTC timestamps. */
public final class FileMetadataRowMapper implements RowMapper<FileMetadata> {
    @Override
    public FileMetadata mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new FileMetadata(
                rs.getObject("id", Long.class),
                rs.getObject("owner_user_id", Long.class),
                rs.getString("storage_key"),
                rs.getString("original_name"),
                rs.getString("mime_type"),
                rs.getObject("size_bytes", Long.class),
                rs.getString("sha256"),
                JdbcValues.enumValue(rs, "purpose", FileMetadata.Purpose.class),
                JdbcValues.enumValue(rs, "visibility", FileMetadata.Visibility.class),
                JdbcValues.enumValue(rs, "status", FileMetadata.Status.class),
                rs.getObject("report_id", Long.class),
                rs.getObject("chat_message_id", Long.class),
                rs.getObject("landlord_verification_id", Long.class),
                JdbcValues.instant(rs, "expires_at"),
                JdbcValues.instant(rs, "deleted_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
