package com.troday.api.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="roommate_requests")
public class RoommateRequest {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(name="sender_id",nullable=false) private Long senderId; @Column(name="receiver_id",nullable=false) private Long receiverId;
    @Column(nullable=false) private String scenario; @Column(name="target_contract_id") private Long targetContractId; @Column(nullable=false) private String status="PENDING"; private String message;
    @Column(name="responded_at") private LocalDateTime respondedAt; @Column(name="ended_at") private LocalDateTime endedAt; @Column(name="end_reason") private String endReason;
    public Long getId(){return id;} public Long getSenderId(){return senderId;} public void setSenderId(Long v){senderId=v;} public Long getReceiverId(){return receiverId;} public void setReceiverId(Long v){receiverId=v;}
    public String getScenario(){return scenario;} public void setScenario(String v){scenario=v;} public Long getTargetContractId(){return targetContractId;} public void setTargetContractId(Long v){targetContractId=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;} public String getMessage(){return message;} public void setMessage(String v){message=v;} public LocalDateTime getRespondedAt(){return respondedAt;} public void setRespondedAt(LocalDateTime v){respondedAt=v;} public LocalDateTime getEndedAt(){return endedAt;} public void setEndedAt(LocalDateTime v){endedAt=v;} public String getEndReason(){return endReason;} public void setEndReason(String v){endReason=v;}
}
