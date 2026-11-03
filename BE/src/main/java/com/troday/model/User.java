package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/** JDBC snapshot of the users table. Generated; expose response DTOs instead. */
public record User(
        Long id,
        String email,
        String phoneNumber,
        @JsonIgnore String passwordHash,
        String fullName,
        Role role,
        Status status,
        Instant phoneVerifiedAt,
        Instant lockedAt,
        Boolean inAppEnabled,
        Boolean emailEnabled,
        Boolean pushEnabled,
        String lockReason,
        Long lockedById,
        Instant createdAt,
        Instant updatedAt) {
    public enum Role { TENANT, LANDLORD, ADMIN }
    public enum Status { ACTIVE, LOCKED, DISABLED }

    @Override
    public String toString() {
        return "User[id=" + id + "]";
    }
}
