package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_house_verifications")
public class RentalHouseVerification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "house_id", nullable = false) private Long houseId;
    @Column(name = "applicant_landlord_id", nullable = false) private Long applicantLandlordId;
    @Column(name = "house_version", nullable = false) private Long houseVersion = 1L;
    @Column(name = "right_type", nullable = false) private String rightType;
    @Column(name = "scope_description", nullable = false) private String scopeDescription;
    @Column(name = "valid_from", nullable = false) private LocalDate validFrom;
    @Column(name = "valid_until") private LocalDate validUntil;
    private String status = "PENDING";
    @Column(name = "submitted_at") private LocalDateTime submittedAt;
    @Column(name = "reviewed_by_id") private Long reviewedById;
    @Column(name = "reviewed_at") private LocalDateTime reviewedAt;
    @Column(name = "rejection_reason") private String rejectionReason;
    @Column(name = "revoked_by_id") private Long revokedById;
    @Column(name = "revoked_at") private LocalDateTime revokedAt;
    @Column(name = "revocation_reason") private String revocationReason;

    public Long getId(){return id;} public Long getHouseId(){return houseId;} public void setHouseId(Long v){houseId=v;}
    public Long getApplicantLandlordId(){return applicantLandlordId;} public void setApplicantLandlordId(Long v){applicantLandlordId=v;}
    public Long getHouseVersion(){return houseVersion;} public void setHouseVersion(Long v){houseVersion=v;}
    public String getRightType(){return rightType;} public void setRightType(String v){rightType=v;}
    public String getScopeDescription(){return scopeDescription;} public void setScopeDescription(String v){scopeDescription=v;}
    public LocalDate getValidFrom(){return validFrom;} public void setValidFrom(LocalDate v){validFrom=v;}
    public LocalDate getValidUntil(){return validUntil;} public void setValidUntil(LocalDate v){validUntil=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public LocalDateTime getSubmittedAt(){return submittedAt;} public void setSubmittedAt(LocalDateTime v){submittedAt=v;}
    public Long getReviewedById(){return reviewedById;} public void setReviewedById(Long v){reviewedById=v;}
    public LocalDateTime getReviewedAt(){return reviewedAt;} public void setReviewedAt(LocalDateTime v){reviewedAt=v;}
    public String getRejectionReason(){return rejectionReason;} public void setRejectionReason(String v){rejectionReason=v;}
    public Long getRevokedById(){return revokedById;} public void setRevokedById(Long v){revokedById=v;}
    public LocalDateTime getRevokedAt(){return revokedAt;} public void setRevokedAt(LocalDateTime v){revokedAt=v;}
    public String getRevocationReason(){return revocationReason;} public void setRevocationReason(String v){revocationReason=v;}
}
