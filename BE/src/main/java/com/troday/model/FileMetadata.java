package com.troday.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;

/** JDBC snapshot of the files table. Generated; expose response DTOs instead. */
public record FileMetadata(
        Long id,
        Long ownerUserId,
        @JsonIgnore String storageKey,
        String originalName,
        String mimeType,
        Long sizeBytes,
        String sha256,
        Purpose purpose,
        Visibility visibility,
        Status status,
        Long reportId,
        Long chatMessageId,
        Long landlordVerificationId,
        Instant expiresAt,
        Instant deletedAt,
        Instant createdAt,
        Instant updatedAt) {
    public enum Purpose { AVATAR, POST_IMAGE, IDENTITY, LANDLORD_PROOF, CONTRACT, REPORT_EVIDENCE, CHAT_IMAGE }
    public enum Visibility { PUBLIC, PRIVATE }
    public enum Status { STAGED, ACTIVE, ARCHIVED, DELETED }

    @Override
    public String toString() {
        return "FileMetadata[id=" + id + "]";
    }
}
