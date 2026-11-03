package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the roommate_profiles table. Generated; expose response DTOs instead. */
public record RoommateProfile(
        Long id,
        Long tenantId,
        HousingStatus housingStatus,
        Long currentRoomTenantId,
        String externalContext,
        LocalDate availableFrom,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        String preferredLocation,
        String preferredGender,
        JsonNode requirementsSnapshot,
        Long profileVersion,
        Boolean active,
        Instant createdAt,
        Instant updatedAt) {
    public enum HousingStatus { NO_ACCOMMODATION, IN_SYSTEM, EXTERNAL }

    @Override
    public String toString() {
        return "RoommateProfile[id=" + id + "]";
    }
}
