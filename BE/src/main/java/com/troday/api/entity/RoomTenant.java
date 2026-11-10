package com.troday.api.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "room_tenants")
public class RoomTenant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "contract_id", nullable = false) private Long contractId;
    @Column(name = "tenant_id") private Long tenantId;
    @Column(name = "room_id") private Long roomId;
    @Column(name = "full_name", nullable = false) private String fullName;
    @Column(name = "planned_move_in_date") private java.time.LocalDate plannedMoveInDate;
    @Column(name = "move_in_date") private java.time.LocalDate moveInDate;
    @Column(name = "move_out_date") private java.time.LocalDate moveOutDate;
    @Column(name = "move_in_confirmed_by_id") private Long moveInConfirmedById;
    @Column(name = "move_in_confirmed_at") private LocalDateTime moveInConfirmedAt;
    @Column(name = "move_out_confirmed_by_id") private Long moveOutConfirmedById;
    @Column(name = "move_out_confirmed_at") private LocalDateTime moveOutConfirmedAt;
    @Column(name = "intake_source", nullable = false) private String intakeSource;
    @Column(name = "join_request_id") private Long joinRequestId;
    @Column(name = "cancellation_reason") private String cancellationReason;
    private String status;
    @Column(name = "account_linked_at") private LocalDateTime accountLinkedAt;
    public Long getId(){return id;} public Long getContractId(){return contractId;} public Long getTenantId(){return tenantId;}
    public void setContractId(Long value){contractId=value;} public void setTenantId(Long value){tenantId=value;} public String getStatus(){return status;} public void setStatus(String value){status=value;}
    public void setAccountLinkedAt(LocalDateTime value){accountLinkedAt=value;}
    public Long getRoomId(){return roomId;} public void setRoomId(Long v){roomId=v;} public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;} public java.time.LocalDate getPlannedMoveInDate(){return plannedMoveInDate;} public void setPlannedMoveInDate(java.time.LocalDate v){plannedMoveInDate=v;} public java.time.LocalDate getMoveInDate(){return moveInDate;} public void setMoveInDate(java.time.LocalDate v){moveInDate=v;} public java.time.LocalDate getMoveOutDate(){return moveOutDate;} public void setMoveOutDate(java.time.LocalDate v){moveOutDate=v;} public Long getMoveInConfirmedById(){return moveInConfirmedById;} public void setMoveInConfirmedById(Long v){moveInConfirmedById=v;} public LocalDateTime getMoveInConfirmedAt(){return moveInConfirmedAt;} public void setMoveInConfirmedAt(LocalDateTime v){moveInConfirmedAt=v;} public Long getMoveOutConfirmedById(){return moveOutConfirmedById;} public void setMoveOutConfirmedById(Long v){moveOutConfirmedById=v;} public LocalDateTime getMoveOutConfirmedAt(){return moveOutConfirmedAt;} public void setMoveOutConfirmedAt(LocalDateTime v){moveOutConfirmedAt=v;} public String getIntakeSource(){return intakeSource;} public void setIntakeSource(String v){intakeSource=v;} public String getCancellationReason(){return cancellationReason;} public void setCancellationReason(String v){cancellationReason=v;} public Long getJoinRequestId(){return joinRequestId;} public void setJoinRequestId(Long v){joinRequestId=v;}
}
