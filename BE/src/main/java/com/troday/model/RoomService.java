package com.troday.model;

import java.math.BigDecimal;
import java.time.Instant;

/** JDBC snapshot of the room_services table. Generated; expose response DTOs instead. */
public record RoomService(
        Long id,
        Long roomId,
        Long houseId,
        Long houseServiceId,
        BigDecimal unitPriceOverride,
        CalculationMethodOverride calculationMethodOverride,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt) {
    public enum CalculationMethodOverride { METERED, PER_PERSON, PER_ROOM }

    @Override
    public String toString() {
        return "RoomService[id=" + id + "]";
    }
}
