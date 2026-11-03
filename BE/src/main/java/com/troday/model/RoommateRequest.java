package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the roommate_requests table. Generated; expose response DTOs instead. */
public record RoommateRequest(
        Long id,
        Long senderId,
        Long receiverId,
        Scenario scenario,
        Long targetContractId,
        Status status,
        String message,
        Instant respondedAt,
        Instant endedAt,
        String endReason,
        Instant createdAt,
        Instant updatedAt,
        Long pairLowId,
        Long pairHighId,
        Integer openPairKey) {
    public enum Scenario { SEARCH_TOGETHER, JOIN_SYSTEM_ROOM, JOIN_EXTERNAL_HOME }
    public enum Status { PENDING, ACCEPTED, REJECTED, CANCELLED }

    @Override
    public String toString() {
        return "RoommateRequest[id=" + id + "]";
    }
}
