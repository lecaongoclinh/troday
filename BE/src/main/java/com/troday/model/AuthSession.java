package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/** JDBC snapshot of the auth_sessions table. Generated; expose response DTOs instead. */
public record AuthSession(
        Long id,
        Long userId,
        @JsonIgnore String sessionKey,
        @JsonIgnore String refreshTokenHash,
        Instant expiresAt,
        Instant lastSeenAt,
        Instant revokedAt,
        String revocationReason,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "AuthSession[id=" + id + "]";
    }
}
