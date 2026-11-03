package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/** JDBC snapshot of the landlord_verifications table. Generated; expose response DTOs instead. */
public record LandlordVerification(
        Long id,
        Long applicantUserId,
        @JsonIgnore String identityNumber,
        Long identityFileId,
        Status status,
        String rejectionReason,
        Long reviewedById,
        Instant reviewedAt,
        Instant createdAt,
        Instant updatedAt,
        Long pendingApplicantId) {
    public enum Status { PENDING, APPROVED, REJECTED, WITHDRAWN }

    @Override
    public String toString() {
        return "LandlordVerification[id=" + id + "]";
    }
}
