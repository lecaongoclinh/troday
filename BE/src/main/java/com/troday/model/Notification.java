package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the notifications table. Generated; expose response DTOs instead. */
public record Notification(
        Long id,
        Long userId,
        String type,
        String title,
        String content,
        String resourceType,
        Long resourceId,
        String eventKey,
        Boolean isRead,
        Instant readAt,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "Notification[id=" + id + "]";
    }
}
