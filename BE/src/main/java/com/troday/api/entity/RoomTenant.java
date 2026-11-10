package com.troday.api.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name = "room_tenants")
public class RoomTenant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "contract_id", nullable = false) private Long contractId;
    @Column(name = "tenant_id") private Long tenantId;
    private String status;
    @Column(name = "account_linked_at") private LocalDateTime accountLinkedAt;
    public Long getId(){return id;} public Long getContractId(){return contractId;} public Long getTenantId(){return tenantId;}
    public void setTenantId(Long value){tenantId=value;} public String getStatus(){return status;}
    public void setAccountLinkedAt(LocalDateTime value){accountLinkedAt=value;}
}
