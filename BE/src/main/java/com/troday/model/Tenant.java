package com.troday.model;

/** JDBC snapshot of the tenants table. Generated; expose response DTOs instead. */
public record Tenant(
        Long id) {
    @Override
    public String toString() {
        return "Tenant[id=" + id + "]";
    }
}
