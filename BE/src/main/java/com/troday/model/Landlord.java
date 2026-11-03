package com.troday.model;

/** JDBC snapshot of the landlords table. Generated; expose response DTOs instead. */
public record Landlord(
        Long id) {
    @Override
    public String toString() {
        return "Landlord[id=" + id + "]";
    }
}
