package com.troday.model;

/** JDBC snapshot of the admins table. Generated; expose response DTOs instead. */
public record Admin(
        Long id) {
    @Override
    public String toString() {
        return "Admin[id=" + id + "]";
    }
}
