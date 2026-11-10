package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String email;
    @Column(name = "phone_number") private String phoneNumber;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "full_name", nullable = false) private String fullName;
    private String role = "TENANT";
    private String status = "ACTIVE";
    @Column(name = "phone_verified_at") private LocalDateTime phoneVerifiedAt;
    @Column(name = "in_app_enabled") private boolean inAppEnabled = true;
    @Column(name = "email_enabled") private boolean emailEnabled;
    @Column(name = "push_enabled") private boolean pushEnabled;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String value) { email = value; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String value) { phoneNumber = value; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String value) { passwordHash = value; }
    public String getFullName() { return fullName; }
    public void setFullName(String value) { fullName = value; }
    public String getRole() { return role; }
    public void setRole(String value) { role = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
    public LocalDateTime getPhoneVerifiedAt() { return phoneVerifiedAt; }
    public void setPhoneVerifiedAt(LocalDateTime value) { phoneVerifiedAt = value; }
    public boolean isInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(boolean value) { inAppEnabled = value; }
    public boolean isEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(boolean value) { emailEnabled = value; }
    public boolean isPushEnabled() { return pushEnabled; }
    public void setPushEnabled(boolean value) { pushEnabled = value; }
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); if (updatedAt == null) updatedAt = createdAt; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
