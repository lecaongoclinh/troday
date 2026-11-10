package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "tenant_identity_verifications")
public class TenantIdentityVerification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "tenant_id", nullable = false) private Long tenantId;
    @Column(name = "identity_number", nullable = false) private String identityNumber;
    @Column(name = "identity_file_id", nullable = false) private Long identityFileId;
    private String status = "PENDING";
    @Column(name = "reviewed_by_id") private Long reviewedById;
    @Column(name = "rejection_reason") private String rejectionReason;
    @Column(name = "reviewed_at") private LocalDateTime reviewedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    public Long getId() { return id; }
    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long value) { tenantId = value; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String value) { identityNumber = value; }
    public Long getIdentityFileId() { return identityFileId; }
    public void setIdentityFileId(Long value) { identityFileId = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
    public void setReviewedById(Long value) { reviewedById = value; }
    public void setReviewedAt(LocalDateTime value) { reviewedAt = value; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
