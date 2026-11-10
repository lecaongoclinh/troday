package com.troday.api.entity;

import jakarta.persistence.*;

@Entity @Table(name = "personal_profiles")
public class PersonalProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false, unique = true) private Long userId;
    private String address;
    private String gender;
    private String occupation;
    private String university;
    @Lob private String bio;
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long value) { userId = value; }
    public String getAddress() { return address; }
    public void setAddress(String value) { address = value; }
    public String getGender() { return gender; }
    public void setGender(String value) { gender = value; }
    public String getOccupation() { return occupation; }
    public void setOccupation(String value) { occupation = value; }
    public String getUniversity() { return university; }
    public void setUniversity(String value) { university = value; }
    public String getBio() { return bio; }
    public void setBio(String value) { bio = value; }
}
