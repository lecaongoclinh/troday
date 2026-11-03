package com.troday.repository.mapper;

import com.troday.model.ChatMessage;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import org.springframework.jdbc.core.RowMapper;

/** Maps a full chat_messages row, preserving nullable fields and UTC timestamps. */
public final class ChatMessageRowMapper implements RowMapper<ChatMessage> {
    @Override
    public ChatMessage mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new ChatMessage(
                rs.getObject("id", Long.class),
                rs.getObject("conversation_id", Long.class),
                rs.getObject("sender_id", Long.class),
                rs.getString("client_message_key"),
                JdbcValues.enumValue(rs, "message_type", ChatMessage.MessageType.class),
                rs.getString("content"),
                rs.getObject("shared_post_id", Long.class),
                JdbcValues.instant(rs, "sent_at"),
                JdbcValues.instant(rs, "created_at"),
                JdbcValues.instant(rs, "updated_at"));
    }
}
