package com.troday.model;

import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the occupant_join_requests table. Generated; expose response DTOs instead. */
public record OccupantJoinRequest(
        Long id,
        Long contractId,
        Long sourceRoommateRequestId,
        Long applicantId,
        Long requestedById,
        Long representativeRoomTenantId,
        LocalDate plannedMoveInDate,
        Status status,
        Long representativeConsentedById,
        Instant representativeConsentedAt,
        Long applicantConsentedById,
        Instant applicantConsentedAt,
        Instant reviewedAt,
        Instant holdExpiresAt,
        Instant completedAt,
        Instant cancelledAt,
        Long cancelledById,
        String cancellationReason,
        Long reviewedById,
        String rejectionReason,
        Long completedRoomTenantId,
        String message,
        Instant createdAt,
        Instant updatedAt,
        Long openApplicantId) {
    public enum Status { PENDING_CONSENT, PENDING_LANDLORD, APPROVED, COMPLETED, REJECTED, CANCELLED, EXPIRED }

    @Override
    public String toString() {
        return "OccupantJoinRequest[id=" + id + "]";
    }
}
