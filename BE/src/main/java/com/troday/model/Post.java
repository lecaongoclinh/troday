package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the posts table. Generated; expose response DTOs instead. */
public record Post(
        Long id,
        Long landlordId,
        Long houseId,
        Long roomId,
        String title,
        String content,
        Status status,
        Integer pendingReviewSlot,
        AvailabilityStatus availabilityStatus,
        Instant availabilityConfirmedAt,
        Instant availabilityExpiresAt,
        Instant publishedAt,
        Instant reviewedAt,
        Instant hiddenAt,
        Long reviewedById,
        String rejectionReason,
        Long hiddenById,
        String hiddenReason,
        Long contentVersion,
        Instant createdAt,
        Instant updatedAt) {
    public enum Status { DRAFT, PENDING_REVIEW, APPROVED, REJECTED, HIDDEN }
    public enum AvailabilityStatus { OPEN, FULL, STALE }

    @Override
    public String toString() {
        return "Post[id=" + id + "]";
    }
}
