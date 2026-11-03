package com.troday.model;

import java.time.Instant;

/** JDBC snapshot of the contract_templates table. Generated; expose response DTOs instead. */
public record ContractTemplate(
        Long id,
        Long createdById,
        String name,
        Integer version,
        String content,
        Boolean active,
        Instant createdAt,
        Instant updatedAt) {
    @Override
    public String toString() {
        return "ContractTemplate[id=" + id + "]";
    }
}
