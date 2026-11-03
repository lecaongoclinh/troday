package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the contract_representative_history table. Generated; expose response DTOs instead. */
public record ContractRepresentativeHistory(
        Long id,
        Long contractId,
        Long roomTenantId,
        Long tenantId,
        String nameSnapshot,
        EventType eventType,
        Long previousHistoryId,
        Long previousRoomTenantId,
        Long basisRevisionId,
        Instant startedAt,
        Instant endedAt,
        Boolean isCurrent,
        Long recordedById,
        Instant recordedAt,
        String reason,
        String consentMethod,
        Long consentedById,
        Long consentRecordedById,
        Instant consentRecordedAt,
        Long consentFileId,
        Long endedById,
        String endReason,
        Long currentContractId) {
    public enum EventType { INITIAL, HANDOVER, LEGACY_BASELINE }

    @Override
    public String toString() {
        return "ContractRepresentativeHistory[id=" + id + "]";
    }
}
