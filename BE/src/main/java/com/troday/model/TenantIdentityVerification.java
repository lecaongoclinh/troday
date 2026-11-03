package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/** JDBC snapshot of the tenant_identity_verifications table. Generated; expose response DTOs instead. */
public record TenantIdentityVerification(
        Long id,
        Long tenantId,
        @JsonIgnore String identityNumber,
        Long identityFileId,
        Status status,
        Long reviewedById,
        String rejectionReason,
        Instant reviewedAt,
        Instant retentionUntil,
        Instant createdAt,
        Instant updatedAt,
        Long pendingTenantId) {
    public enum Status { PENDING, APPROVED, REJECTED, WITHDRAWN }

    @Override
    public String toString() {
        return "TenantIdentityVerification[id=" + id + "]";
    }
}
