package com.troday.repository.mapper;

import com.troday.model.ConversationParticipant;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full conversation_participants row, preserving nullable fields and UTC timestamps. */
public final class ConversationParticipantRowMapper implements RowMapper<ConversationParticipant> {
    @Override
    public ConversationParticipant mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ConversationParticipant(
                rs.getObject("id", Long.class),
                rs.getObject("conversation_id", Long.class),
                rs.getObject("user_id", Long.class),
                JdbcValues.instant(rs, "joined_at"),
                JdbcValues.instant(rs, "last_read_at"),
                JdbcValues.instant(rs, "left_at"),
                rs.getObject("muted", Boolean.class),
                rs.getObject("archived", Boolean.class),
                rs.getObject("deleted", Boolean.class),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
