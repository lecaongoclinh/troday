package com.troday.model;

import java.math.BigDecimal;
import java.time.Instant;

/** JDBC snapshot of the rooms table. Generated; expose response DTOs instead. */
public record Room(
        Long id,
        Long houseId,
        String roomNumber,
        BigDecimal area,
        BigDecimal rentPrice,
        BigDecimal depositAmount,
        Integer maxOccupants,
        Boolean allowAdditionalOccupants,
        Status status,
        String notes,
        Instant createdAt,
        Instant updatedAt) {
    public enum Status { AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE }

    @Override
    public String toString() {
        return "Room[id=" + id + "]";
    }
}
