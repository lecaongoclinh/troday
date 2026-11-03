package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the reports table. Generated; expose response DTOs instead. */
public record Report(
        Long id,
        Long reporterId,
        Type type,
        Long reportedUserId,
        Long reportedPostId,
        Long contractId,
        Long roommateRequestId,
        String reason,
        Status status,
        String resolution,
        Long handledById,
        Instant handledAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum Type { VIOLATION, DISPUTE }
    public enum Status { PENDING, INVESTIGATING, RESOLVED, DISMISSED }

    @Override
    public String toString() {
        return "Report[id=" + id + "]";
    }
}
