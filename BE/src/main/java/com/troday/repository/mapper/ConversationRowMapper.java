package com.troday.repository.mapper;

import com.troday.model.Conversation;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full conversations row, preserving nullable fields and UTC timestamps. */
public final class ConversationRowMapper implements RowMapper<Conversation> {
    @Override
    public Conversation mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Conversation(
                rs.getObject("id", Long.class),
                JdbcValues.enumValue(rs, "type", Conversation.Type.class),
                rs.getObject("room_id", Long.class),
                rs.getObject("post_id", Long.class),
                rs.getObject("roommate_request_id", Long.class),
                rs.getObject("last_message_id", Long.class),
                JdbcValues.instant(rs, "last_message_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
