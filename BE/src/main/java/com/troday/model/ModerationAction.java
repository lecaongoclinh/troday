package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;

/** JDBC snapshot of the moderation_actions table. Generated; expose response DTOs instead. */
public record ModerationAction(
        Long id,
        Long actorUserId,
        Long targetUserId,
        Long targetPostId,
        Long targetReportId,
        Long targetLandlordVerificationId,
        Long targetTenantVerificationId,
        Long relatedReportId,
        String action,
        String reason,
        JsonNode beforeSnapshot,
        JsonNode afterSnapshot,
        Instant occurredAt,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "ModerationAction[id=" + id + "]";
    }
}
