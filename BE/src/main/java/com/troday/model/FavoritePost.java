package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the favorite_posts table. Generated; expose response DTOs instead. */
public record FavoritePost(
        Long id,
        Long userId,
        Long postId,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "FavoritePost[id=" + id + "]";
    }
}
