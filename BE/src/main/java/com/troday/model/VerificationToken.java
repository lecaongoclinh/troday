package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/** JDBC snapshot of the verification_tokens table. Generated; expose response DTOs instead. */
public record VerificationToken(
        Long id,
        Long userId,
        @JsonIgnore String selector,
        @JsonIgnore String tokenHash,
        Purpose purpose,
        String targetValue,
        Long targetRoomTenantId,
        Integer attemptCount,
        Integer maxAttempts,
        Instant expiresAt,
        Instant consumedAt,
        Instant revokedAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum Purpose { PHONE_VERIFICATION, PASSWORD_RESET_OTP, PASSWORD_RESET_GRANT, OCCUPANT_LINK }

    @Override
    public String toString() {
        return "VerificationToken[id=" + id + "]";
    }
}
