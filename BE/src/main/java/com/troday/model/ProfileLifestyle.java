package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;

/** JDBC snapshot of the profile_lifestyles table. Generated; expose response DTOs instead. */
public record ProfileLifestyle(
        Long id,
        Long profileId,
        Long criterionId,
        JsonNode selfValue,
        JsonNode preferredValue,
        Boolean isMandatory,
        Integer importance,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "ProfileLifestyle[id=" + id + "]";
    }
}
