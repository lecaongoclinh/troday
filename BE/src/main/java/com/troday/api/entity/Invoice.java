package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity @Table(name = "invoices")
public class Invoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "contract_id", nullable = false) private Long contractId;
    @Column(name = "room_id", nullable = false) private Long roomId;
    @Column(name = "contract_revision_id", nullable = false) private Long contractRevisionId;
    @Column(name = "payer_room_tenant_id", nullable = false) private Long payerRoomTenantId;
    @Column(name = "billing_period", nullable = false) private LocalDate billingPeriod;
    @Column(name = "due_date", nullable = false) private LocalDate dueDate;
    private String status = "DRAFT";
    public Long getId() { return id; }
    public Long getContractId() { return contractId; }
    public void setContractId(Long value) { contractId = value; }
    public String getStatus() { return status; }
    public void setStatus(String value) { status = value; }
}
