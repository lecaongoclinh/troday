package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the room_viewing_proposals table. Generated; expose response DTOs instead. */
public record RoomViewingProposal(
        Long id,
        Long roomId,
        Long houseId,
        Long conversationId,
        Long tenantId,
        Long landlordId,
        String clientRequestKey,
        Instant startsAt,
        Instant endsAt,
        String notes,
        Status status,
        Long reviewedById,
        Instant reviewedAt,
        String rejectionReason,
        Long withdrawnById,
        Instant withdrawnAt,
        Instant expiredAt,
        Long scheduledViewingId,
        Instant createdAt,
        Instant updatedAt,
        Long pendingTenantId) {
    public enum Status { PENDING, ACCEPTED, REJECTED, WITHDRAWN, EXPIRED }

    @Override
    public String toString() {
        return "RoomViewingProposal[id=" + id + "]";
    }
}
