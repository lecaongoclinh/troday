package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the conversation_participants table. Generated; expose response DTOs instead. */
public record ConversationParticipant(
        Long id,
        Long conversationId,
        Long userId,
        Instant joinedAt,
        Instant lastReadAt,
        Instant leftAt,
        Boolean muted,
        Boolean archived,
        Boolean deleted,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "ConversationParticipant[id=" + id + "]";
    }
}
