package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the rental_services table. Generated; expose response DTOs instead. */
public record RentalService(
        Long id,
        String name,
        String unit,
        DefaultCalculationMethod defaultCalculationMethod,
        Instant createdAt,
        Instant updatedAt) {
    public enum DefaultCalculationMethod { METERED, PER_PERSON, PER_ROOM }

    @Override
    public String toString() {
        return "RentalService[id=" + id + "]";
    }
}
