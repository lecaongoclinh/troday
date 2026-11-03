package com.troday.model;

import java.math.BigDecimal;
import java.time.Instant;

/** JDBC snapshot of the house_services table. Generated; expose response DTOs instead. */
public record HouseService(
        Long id,
        Long houseId,
        Long catalogServiceId,
        String name,
        String unit,
        BigDecimal defaultUnitPrice,
        DefaultCalculationMethod defaultCalculationMethod,
        Boolean isActive,
        Instant createdAt,
        Instant updatedAt) {
    public enum DefaultCalculationMethod { METERED, PER_PERSON, PER_ROOM }

    @Override
    public String toString() {
        return "HouseService[id=" + id + "]";
    }
}
