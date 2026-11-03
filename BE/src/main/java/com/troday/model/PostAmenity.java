package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the post_amenities table. Generated; expose response DTOs instead. */
public record PostAmenity(
        Long id,
        Long postId,
        String amenity,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "PostAmenity[id=" + id + "]";
    }
}
