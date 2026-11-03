package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the chat_messages table. Generated; expose response DTOs instead. */
public record ChatMessage(
        Long id,
        Long conversationId,
        Long senderId,
        String clientMessageKey,
        MessageType messageType,
        String content,
        Long sharedPostId,
        Instant sentAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum MessageType { TEXT, IMAGE, SYSTEM, POST_SHARE }

    @Override
    public String toString() {
        return "ChatMessage[id=" + id + "]";
    }
}
