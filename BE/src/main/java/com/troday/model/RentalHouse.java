package com.troday.model;

import java.math.BigDecimal;
import java.time.Instant;

/** JDBC snapshot of the rental_houses table. Generated; expose response DTOs instead. */
public record RentalHouse(
        Long id,
        Long landlordId,
        String address,
        String provinceCode,
        String localityCode,
        String areaLabel,
        BigDecimal latitude,
        BigDecimal longitude,
        String notes,
        Instant createdAt,
        Instant updatedAt,
        String name,
        Long rowVersion,
        Long verificationVersion,
        String creationKey) {
    @Override
    public String toString() {
        return "RentalHouse[id=" + id + "]";
    }
}
