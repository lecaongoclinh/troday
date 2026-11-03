package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the rental_house_verifications table. Generated; expose response DTOs instead. */
public record RentalHouseVerification(
        Long id,
        Long houseId,
        Long applicantLandlordId,
        Long houseVersion,
        JsonNode houseSnapshot,
        RightType rightType,
        String scopeDescription,
        LocalDate validFrom,
        LocalDate validUntil,
        Status status,
        Instant submittedAt,
        Long reviewedById,
        Instant reviewedAt,
        Instant evidenceCheckedAt,
        String rejectionReason,
        Long revokedById,
        Instant revokedAt,
        String revocationReason,
        Instant withdrawnAt,
        String withdrawalReason,
        Instant createdAt,
        Instant updatedAt,
        Long pendingHouseId,
        Long approvedHouseId) {
    public enum RightType { OWNER, AUTHORIZED, SUBLESSOR }
    public enum Status { PENDING, APPROVED, REJECTED, WITHDRAWN, REVOKED, EXPIRED, SUPERSEDED }

    @Override
    public String toString() {
        return "RentalHouseVerification[id=" + id + "]";
    }
}
