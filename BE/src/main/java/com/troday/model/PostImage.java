package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the post_images table. Generated; expose response DTOs instead. */
public record PostImage(
        Long id,
        Long postId,
        Long fileId,
        String externalUrl,
        Integer position,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "PostImage[id=" + id + "]";
    }
}
