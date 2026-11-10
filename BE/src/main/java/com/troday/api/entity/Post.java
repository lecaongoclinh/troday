package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "posts")
public class Post {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "landlord_id", nullable = false) private Long landlordId;
    @Column(name = "house_id", nullable = false) private Long houseId;
    @Column(name = "room_id", nullable = false) private Long roomId;
    @Column(nullable = false) private String title;
    @Lob private String content;
    private String status = "DRAFT";
    @Column(name = "availability_status") private String availabilityStatus = "STALE";
    @Column(name = "availability_confirmed_at") private LocalDateTime availabilityConfirmedAt;
    @Column(name = "availability_expires_at") private LocalDateTime availabilityExpiresAt;
    @Column(name = "content_version") private Long contentVersion = 1L;
    @Column(name = "pending_review_slot") private Integer pendingReviewSlot;
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String value) { title = value; }
    public String getContent() { return content; }
    public void setContent(String value) { content = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
    public Long getLandlordId() { return landlordId; }
    public void setLandlordId(Long value) { landlordId = value; }
    public Long getHouseId() { return houseId; }
    public void setHouseId(Long value) { houseId = value; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long value) { roomId = value; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String value) { availabilityStatus = value; }
    public LocalDateTime getAvailabilityConfirmedAt() { return availabilityConfirmedAt; }
    public void setAvailabilityConfirmedAt(LocalDateTime value) { availabilityConfirmedAt = value; }
    public LocalDateTime getAvailabilityExpiresAt() { return availabilityExpiresAt; }
    public void setAvailabilityExpiresAt(LocalDateTime value) { availabilityExpiresAt = value; }
    public Long getContentVersion() { return contentVersion; }
    public void setContentVersion(Long value) { contentVersion = value; }
    public Integer getPendingReviewSlot() { return pendingReviewSlot; }
    public void setPendingReviewSlot(Integer value) { pendingReviewSlot = value; }
}
