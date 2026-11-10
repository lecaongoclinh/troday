package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "verification_tokens")
public class VerificationToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(nullable = false, unique = true) private String selector;
    @Column(name = "token_hash", nullable = false) private String tokenHash;
    @Column(nullable = false) private String purpose;
    @Column(name = "target_value") private String targetValue;
    @Column(name = "target_room_tenant_id") private Long targetRoomTenantId;
    @Column(name = "expires_at", nullable = false) private LocalDateTime expiresAt;
    @Column(name = "consumed_at") private LocalDateTime consumedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long value) { userId = value; }
    public String getSelector() { return selector; }
    public void setSelector(String value) { selector = value; }
    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String value) { tokenHash = value; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String value) { purpose = value; }
    public String getTargetValue() { return targetValue; }
    public void setTargetValue(String value) { targetValue = value; }
    public void setTargetRoomTenantId(Long value) { targetRoomTenantId = value; }
    public Long getTargetRoomTenantId() { return targetRoomTenantId; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime value) { expiresAt = value; }
    public LocalDateTime getConsumedAt() { return consumedAt; }
    public void setConsumedAt(LocalDateTime value) { consumedAt = value; }
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
