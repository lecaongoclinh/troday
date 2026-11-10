package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="files")
public class FileAsset {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="owner_user_id",nullable=false) private Long ownerUserId;
 @Column(name="storage_key",nullable=false) private String storageKey;
 @Column(name="original_name",nullable=false) private String originalName;
 @Column(name="mime_type",nullable=false) private String mimeType;
 @Column(name="size_bytes",nullable=false) private Long sizeBytes;
 @Column(nullable=false) private String sha256;
 @Column(nullable=false) private String purpose;
 @Column(nullable=false) private String visibility="PRIVATE";
 @Column(nullable=false) private String status="STAGED";
 @Column(name="report_id") private Long reportId;
 @Column(name="chat_message_id") private Long chatMessageId;
 @Column(name="landlord_verification_id") private Long landlordVerificationId;
 @Column(name="expires_at") private LocalDateTime expiresAt;
 @Column(name="deleted_at") private LocalDateTime deletedAt;
 public Long getId(){return id;} public Long getOwnerUserId(){return ownerUserId;} public void setOwnerUserId(Long v){ownerUserId=v;} public String getStorageKey(){return storageKey;} public void setStorageKey(String v){storageKey=v;} public String getOriginalName(){return originalName;} public void setOriginalName(String v){originalName=v;} public String getMimeType(){return mimeType;} public void setMimeType(String v){mimeType=v;} public Long getSizeBytes(){return sizeBytes;} public void setSizeBytes(Long v){sizeBytes=v;} public String getSha256(){return sha256;} public void setSha256(String v){sha256=v;} public String getPurpose(){return purpose;} public void setPurpose(String v){purpose=v;} public String getVisibility(){return visibility;} public void setVisibility(String v){visibility=v;} public String getStatus(){return status;} public void setStatus(String v){status=v;} public Long getReportId(){return reportId;} public void setReportId(Long v){reportId=v;} public Long getChatMessageId(){return chatMessageId;} public void setChatMessageId(Long v){chatMessageId=v;} public Long getLandlordVerificationId(){return landlordVerificationId;} public void setLandlordVerificationId(Long v){landlordVerificationId=v;} public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;} public LocalDateTime getDeletedAt(){return deletedAt;} public void setDeletedAt(LocalDateTime v){deletedAt=v;}
}
