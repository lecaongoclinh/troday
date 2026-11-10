package com.troday.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity @Table(name = "admins")
public class Admin {
    @Id private Long id;
    public Admin() { }
    public Admin(Long id) { this.id = id; }
    public Long getId() { return id; }
}
