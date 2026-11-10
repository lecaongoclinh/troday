package com.troday.api.entity;
import jakarta.persistence.*;
@Entity @Table(name="profile_lifestyles", uniqueConstraints=@UniqueConstraint(columnNames={"profile_id","criterion_id"}))
public class ProfileLifestyle {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="profile_id",nullable=false) private Long profileId; @Column(name="criterion_id",nullable=false) private Long criterionId;
    @Column(name="self_value",columnDefinition="json") private String selfValue; @Column(name="preferred_value",columnDefinition="json") private String preferredValue;
    @Column(name="is_mandatory",nullable=false) private boolean mandatory; @Column(nullable=false) private int importance=1;
    public Long getId(){return id;} public Long getProfileId(){return profileId;} public void setProfileId(Long v){profileId=v;} public Long getCriterionId(){return criterionId;} public void setCriterionId(Long v){criterionId=v;}
    public String getSelfValue(){return selfValue;} public void setSelfValue(String v){selfValue=v;} public String getPreferredValue(){return preferredValue;} public void setPreferredValue(String v){preferredValue=v;}
    public boolean isMandatory(){return mandatory;} public void setMandatory(boolean v){mandatory=v;} public int getImportance(){return importance;} public void setImportance(int v){importance=v;}
}
