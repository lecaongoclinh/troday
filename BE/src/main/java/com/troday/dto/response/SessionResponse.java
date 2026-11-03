package com.troday.dto.response;

import com.troday.model.AuthSession;
import java.time.Instant;

public record SessionResponse(String id, Instant createdAt, Instant lastSeenAt, Instant expiresAt,
                              Instant revokedAt, boolean isCurrent) {
    public static SessionResponse from(AuthSession s, long currentId) {
        return new SessionResponse(s.id().toString(), s.createdAt(), s.lastSeenAt(), s.expiresAt(), s.revokedAt(), s.id() == currentId);
    }
}
