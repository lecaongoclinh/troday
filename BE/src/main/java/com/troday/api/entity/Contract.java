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
    @Column(name = "deposit_amount") private BigDecimal depositAmount;
    @Column(name = "viewing_id") private Long viewingId;
    @Column(name = "viewing_tenant_id") private Long viewingTenantId;
    @Column(name = "representative_room_tenant_id") private Long representativeRoomTenantId;
    @Column(name = "initial_representative_room_tenant_id") private Long initialRepresentativeRoomTenantId;
    @Column(name = "current_revision_id") private Long currentRevisionId;
    @Column(name = "previous_contract_id") private Long previousContractId;
    @Column(name = "paper_document_file_id") private Long paperDocumentFileId;
    public Long getId() { return id; }
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String value) { contractNumber = value; }
    public Long getRoomId() { return roomId; }
    public void setRoomId(Long value) { roomId = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
    public String getSource(){return source;} public void setSource(String v){source=v;}
    public Long getHouseId(){return houseId;} public void setHouseId(Long v){houseId=v;} public Long getLandlordId(){return landlordId;} public void setLandlordId(Long v){landlordId=v;}
    public BigDecimal getRentAmount(){return rentAmount;} public void setRentAmount(BigDecimal v){rentAmount=v;} public BigDecimal getDepositAmount(){return depositAmount;} public void setDepositAmount(BigDecimal v){depositAmount=v;}
    public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;} public LocalDate getEndDate(){return endDate;} public void setEndDate(LocalDate v){endDate=v;}
    public Long getViewingId(){return viewingId;} public void setViewingId(Long v){viewingId=v;} public Long getViewingTenantId(){return viewingTenantId;} public void setViewingTenantId(Long v){viewingTenantId=v;}
    public Long getRepresentativeRoomTenantId(){return representativeRoomTenantId;} public void setRepresentativeRoomTenantId(Long v){representativeRoomTenantId=v;} public Long getInitialRepresentativeRoomTenantId(){return initialRepresentativeRoomTenantId;} public void setInitialRepresentativeRoomTenantId(Long v){initialRepresentativeRoomTenantId=v;}
    public Long getCurrentRevisionId(){return currentRevisionId;} public void setCurrentRevisionId(Long v){currentRevisionId=v;} public Long getPreviousContractId(){return previousContractId;} public void setPreviousContractId(Long v){previousContractId=v;} public Long getPaperDocumentFileId(){return paperDocumentFileId;} public void setPaperDocumentFileId(Long v){paperDocumentFileId=v;}
}
