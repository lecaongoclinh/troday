package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;

/** JDBC snapshot of the lifestyle_criteria table. Generated; expose response DTOs instead. */
public record LifestyleCriterion(
        Long id,
        String code,
        String name,
        String category,
        ValueType valueType,
        JsonNode allowedValues,
        Boolean active,
        Instant createdAt,
        Instant updatedAt) {
    public enum ValueType { BOOLEAN, NUMBER, CATEGORY, TIME, RANGE }

    @Override
    public String toString() {
        return "LifestyleCriterion[id=" + id + "]";
    }
}
