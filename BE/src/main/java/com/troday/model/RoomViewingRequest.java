package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the room_viewing_requests table. Generated; expose response DTOs instead. */
public record RoomViewingRequest(
        Long id,
        Long roomId,
        Long houseId,
        Long conversationId,
        Long tenantId,
        Long createdById,
        Instant startsAt,
        Instant endsAt,
        String notes,
        Status status,
        Long attendanceConfirmedById,
        Instant attendanceConfirmedAt,
        Instant cancelledAt,
        Long cancelledById,
        String cancellationReason,
        RentalDecision rentalDecision,
        Long rentalDecidedById,
        Instant rentalDecidedAt,
        Instant rentalWithdrawnAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum Status { SCHEDULED, COMPLETED, CANCELLED, NO_SHOW }
    public enum RentalDecision { WAITING, AGREED, DECLINED, WITHDRAWN }

    @Override
    public String toString() {
        return "RoomViewingRequest[id=" + id + "]";
    }
}
