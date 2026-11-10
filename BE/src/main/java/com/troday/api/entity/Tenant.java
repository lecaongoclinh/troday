package com.troday.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity @Table(name = "tenants")
public class Tenant {
    @Id private Long id;
    public Tenant() { }
    public Tenant(Long id) { this.id = id; }
    public Long getId() { return id; }
}
