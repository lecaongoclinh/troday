package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the house_verification_documents table. Generated; expose response DTOs instead. */
public record HouseVerificationDocument(
        Long id,
        Long verificationId,
        Long fileId,
        DocumentType documentType,
        Instant createdAt) {
    public enum DocumentType { OWNER_PROOF, AUTHORIZATION, LEASE_AGREEMENT, SUBLET_CONSENT, OTHER }

    @Override
    public String toString() {
        return "HouseVerificationDocument[id=" + id + "]";
    }
}
