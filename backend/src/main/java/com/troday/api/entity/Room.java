package com.troday.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "rooms")
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "house_id", nullable = false) private Long houseId;
    @Column(name = "room_number", nullable = false) private String roomNumber;
    private BigDecimal area;
    @Column(name = "rent_price") private BigDecimal rentPrice;
    @Column(name = "deposit_amount") private BigDecimal depositAmount;
    @Column(name = "max_occupants") private Integer maxOccupants;
    private String status;
    public Long getId() { return id; }
    public Long getHouseId() { return houseId; }
    public void setHouseId(Long value) { houseId = value; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String value) { roomNumber = value; }
    public BigDecimal getRentPrice() { return rentPrice; }
    public void setRentPrice(BigDecimal value) { rentPrice = value; }
    public BigDecimal getArea() { return area; }
    public void setArea(BigDecimal value) { area = value; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal value) { depositAmount = value; }
    public Integer getMaxOccupants() { return maxOccupants; }
    public void setMaxOccupants(Integer value) { maxOccupants = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
}
