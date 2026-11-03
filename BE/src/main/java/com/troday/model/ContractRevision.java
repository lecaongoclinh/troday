package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the contract_revisions table. Generated; expose response DTOs instead. */
public record ContractRevision(
        Long id,
        Long contractId,
        Integer revisionNumber,
        Long templateId,
        Long createdById,
        Kind kind,
        Status status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate effectiveFrom,
        BigDecimal rentAmount,
        BigDecimal depositAmount,
        String content,
        JsonNode membersSnapshot,
        JsonNode serviceTermsSnapshot,
        Long documentFileId,
        Long representativeRoomTenantId,
        Long landlordConfirmedById,
        Long tenantConfirmedById,
        Instant landlordConfirmedAt,
        Instant tenantConfirmedAt,
        Instant sentAt,
        Instant appliedAt,
        String tenantFeedback,
        Instant createdAt,
        Instant updatedAt) {
    public enum Kind { INITIAL, RENEWAL, TERMINATION, TRANSFER, REPLACEMENT, PAPER_IMPORT }
    public enum Status { DRAFT, PENDING_CONFIRMATION, CONFIRMED, IMPORTED, SUPERSEDED, CANCELLED }

    @Override
    public String toString() {
        return "ContractRevision[id=" + id + "]";
    }
}
