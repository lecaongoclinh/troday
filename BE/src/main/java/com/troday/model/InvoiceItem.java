package com.troday.model;

import java.math.BigDecimal;
import java.time.Instant;

/** JDBC snapshot of the invoice_items table. Generated; expose response DTOs instead. */
public record InvoiceItem(
        Long id,
        Long invoiceId,
        Long roomId,
        Long roomServiceId,
        Integer position,
        ItemType itemType,
        String nameSnapshot,
        String unitSnapshot,
        CalculationMethodSnapshot calculationMethodSnapshot,
        BigDecimal quantity,
        BigDecimal unitPriceSnapshot,
        BigDecimal previousReading,
        BigDecimal currentReading,
        BigDecimal amount,
        Instant createdAt,
        Instant updatedAt) {
    public enum ItemType { RENT, SERVICE, OTHER, DISCOUNT }
    public enum CalculationMethodSnapshot { METERED, PER_PERSON, PER_ROOM }

    @Override
    public String toString() {
        return "InvoiceItem[id=" + id + "]";
    }
}
