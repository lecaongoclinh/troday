package com.troday.model;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.time.LocalDate;

/** JDBC snapshot of the invoices table. Generated; expose response DTOs instead. */
public record Invoice(
        Long id,
        Long contractId,
        Long roomId,
        Long contractRevisionId,
        Long payerRoomTenantId,
        JsonNode payerSnapshot,
        LocalDate billingPeriod,
        LocalDate dueDate,
        Integer occupantCountAtBilling,
        Status status,
        Long createdById,
        Long paidById,
        Long cancelledById,
        String cancellationReason,
        Long replacementOfId,
        Instant paidAt,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt,
        Integer openPeriodKey) {
    public enum Status { DRAFT, UNPAID, PAID, OVERDUE, CANCELLED }

    @Override
    public String toString() {
        return "Invoice[id=" + id + "]";
    }
}
