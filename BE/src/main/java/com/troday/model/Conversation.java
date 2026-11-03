package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the conversations table. Generated; expose response DTOs instead. */
public record Conversation(
        Long id,
        Type type,
        Long roomId,
        Long postId,
        Long roommateRequestId,
        Long lastMessageId,
        Instant lastMessageAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum Type { ROOM_INQUIRY, ROOMMATE }

    @Override
    public String toString() {
        return "Conversation[id=" + id + "]";
    }
}
