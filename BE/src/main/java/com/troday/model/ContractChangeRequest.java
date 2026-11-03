package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the contract_change_requests table. Generated; expose response DTOs instead. */
public record ContractChangeRequest(
        Long id,
        Long contractId,
        Long requestedById,
        Long representativeRoomTenantId,
        Long baseRevisionId,
        Long proposedRevisionId,
        Long targetRoomId,
        Long resultContractId,
        Type type,
        Status status,
        LocalDate requestedEffectiveDate,
        JsonNode proposalSnapshot,
        String message,
        Long reviewedById,
        String rejectionReason,
        Long tenantConfirmedById,
        Long appliedById,
        Instant reviewedAt,
        Instant tenantConfirmedAt,
        Instant appliedAt,
        Instant expiresAt,
        Instant cancelledAt,
        Long cancelledById,
        String cancellationReason,
        Instant createdAt,
        Instant updatedAt,
        Long openContractId) {
    public enum Type { RENEWAL, TERMINATION, TRANSFER }
    public enum Status { PENDING, APPROVED_WAITING_CONFIRMATION, READY_TO_APPLY, COMPLETED, REJECTED, CANCELLED, EXPIRED }

    @Override
    public String toString() {
        return "ContractChangeRequest[id=" + id + "]";
    }
}
