package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "roommate_profiles")
public class RoommateProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "tenant_id", nullable = false, unique = true) private Long tenantId;
    @Column(name = "housing_status", nullable = false) private String housingStatus;
    @Column(name = "current_room_tenant_id") private Long currentRoomTenantId;
    @Column(name = "external_context") private String externalContext;
    @Column(name = "available_from", nullable = false) private LocalDate availableFrom;
    @Column(name = "budget_min") private java.math.BigDecimal budgetMin;
    @Column(name = "budget_max") private java.math.BigDecimal budgetMax;
    @Column(name = "preferred_location") private String preferredLocation;
    @Column(name = "preferred_gender") private String preferredGender;
    @Column(name = "profile_version", nullable = false) private Long profileVersion = 1L;
    @Column(nullable = false) private boolean active;
    public Long getId(){return id;} public Long getTenantId(){return tenantId;} public void setTenantId(Long v){tenantId=v;}
    public String getHousingStatus(){return housingStatus;} public void setHousingStatus(String v){housingStatus=v;}
    public Long getCurrentRoomTenantId(){return currentRoomTenantId;} public void setCurrentRoomTenantId(Long v){currentRoomTenantId=v;}
    public String getExternalContext(){return externalContext;} public void setExternalContext(String v){externalContext=v;}
    public LocalDate getAvailableFrom(){return availableFrom;} public void setAvailableFrom(LocalDate v){availableFrom=v;}
    public java.math.BigDecimal getBudgetMin(){return budgetMin;} public void setBudgetMin(java.math.BigDecimal v){budgetMin=v;}
    public java.math.BigDecimal getBudgetMax(){return budgetMax;} public void setBudgetMax(java.math.BigDecimal v){budgetMax=v;}
    public String getPreferredLocation(){return preferredLocation;} public void setPreferredLocation(String v){preferredLocation=v;}
    public String getPreferredGender(){return preferredGender;} public void setPreferredGender(String v){preferredGender=v;}
    public Long getProfileVersion(){return profileVersion;} public void setProfileVersion(Long v){profileVersion=v;}
    public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}
