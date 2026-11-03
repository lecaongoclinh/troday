package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the personal_profiles table. Generated; expose response DTOs instead. */
public record PersonalProfile(
        Long id,
        Long userId,
        Long avatarFileId,
        String address,
        String gender,
        String occupation,
        String university,
        String bio,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "PersonalProfile[id=" + id + "]";
    }
}
