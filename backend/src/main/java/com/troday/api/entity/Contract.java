package com.troday.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity @Table(name = "contracts")
public class Contract {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "contract_number", nullable = false, unique = true) private String contractNumber;
    @Column(name = "room_id", nullable = false) private Long roomId;
    @Column(name = "house_id", nullable = false) private Long houseId;
    @Column(name = "landlord_id", nullable = false) private Long landlordId;
    @Column(nullable = false) private String source;
    private String status = "DRAFT";
    @Column(name = "start_date") private LocalDate startDate;
    @Column(name = "end_date") private LocalDate endDate;
    @Column(name = "rent_amount") private BigDecimal rentAmount;
    public Long getId() { return id; }
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String value) { contractNumber = value; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long value) { roomId = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
}
