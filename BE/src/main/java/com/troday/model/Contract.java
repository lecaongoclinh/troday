package com.troday.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the contracts table. Generated; expose response DTOs instead. */
public record Contract(
        Long id,
        String contractNumber,
        Long roomId,
        Long houseId,
        Long landlordId,
        Long representativeRoomTenantId,
        Long initialRepresentativeRoomTenantId,
        Long currentRevisionId,
        Long viewingId,
        Long viewingTenantId,
        Long previousContractId,
        Long paperDocumentFileId,
        Source source,
        Status status,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal rentAmount,
        BigDecimal depositAmount,
        Instant activatedAt,
        Instant closedAt,
        String closureReason,
        Instant createdAt,
        Instant updatedAt,
        Long liveRoomId,
        Long liveViewingId) {
    public enum Source { NEW_RENTAL, PAPER_IMPORT, TRANSFER, REPLACEMENT }
    public enum Status { DRAFT, PENDING_CONFIRMATION, CONFIRMED, ACTIVE, EXPIRED, TERMINATED, CANCELLED }

    @Override
    public String toString() {
        return "Contract[id=" + id + "]";
    }
}
