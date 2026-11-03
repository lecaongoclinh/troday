package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the reviews table. Generated; expose response DTOs instead. */
public record Review(
        Long id,
        Long reviewerId,
        Long roomId,
        Long contractId,
        Long roomTenantId,
        Integer rating,
        String content,
        Status status,
        Long hiddenById,
        String hiddenReason,
        Instant hiddenAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum Status { PUBLISHED, HIDDEN, DELETED }

    @Override
    public String toString() {
        return "Review[id=" + id + "]";
    }
}
