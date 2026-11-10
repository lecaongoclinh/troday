package com.troday.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "rental_houses")
public class RentalHouse {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "landlord_id", nullable = false) private Long landlordId;
    @Column(nullable = false, length = 500) private String address;
    @Column(name = "province_code", nullable = false) private String provinceCode;
    @Column(name = "locality_code") private String localityCode;
    private String name;
    private String areaLabel;
    private String notes;
    private BigDecimal latitude;
    private BigDecimal longitude;
    public Long getId() { return id; }
    public Long getLandlordId() { return landlordId; }
    public void setLandlordId(Long value) { landlordId = value; }
    public String getAddress() { return address; }
    public void setAddress(String value) { address = value; }
    public String getProvinceCode() { return provinceCode; }
    public void setProvinceCode(String value) { provinceCode = value; }
    public String getLocalityCode() { return localityCode; }
    public void setLocalityCode(String value) { localityCode = value; }
    public String getName() { return name; }
    public void setName(String value) { name = value; }
    public String getAreaLabel() { return areaLabel; }
    public void setAreaLabel(String value) { areaLabel = value; }
    public String getNotes() { return notes; }
    public void setNotes(String value) { notes = value; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal value) { latitude = value; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal value) { longitude = value; }
}
