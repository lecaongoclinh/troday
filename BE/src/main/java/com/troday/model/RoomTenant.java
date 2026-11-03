package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the room_tenants table. Generated; expose response DTOs instead. */
public record RoomTenant(
        Long id,
        Long contractId,
        Long roomId,
        Long tenantId,
        String fullName,
        String phoneNumber,
        @JsonIgnore String identityNumber,
        LocalDate dateOfBirth,
        String gender,
        String permanentAddress,
        Status status,
        IntakeSource intakeSource,
        Long joinRequestId,
        LocalDate plannedMoveInDate,
        LocalDate moveInDate,
        LocalDate moveOutDate,
        Long moveInConfirmedById,
        Long moveOutConfirmedById,
        Instant moveInConfirmedAt,
        Instant moveOutConfirmedAt,
        Instant accountLinkedAt,
        Long accountLinkedById,
        String cancellationReason,
        Instant createdAt,
        Instant updatedAt,
        Long activeTenantId,
        Long openTenantId) {
    public enum Status { PLANNED, ACTIVE, LEFT, CANCELLED }
    public enum IntakeSource { INITIAL_CONTRACT, APPROVED_JOIN, PAPER_IMPORT, TRANSFER }

    @Override
    public String toString() {
        return "RoomTenant[id=" + id + "]";
    }
}
