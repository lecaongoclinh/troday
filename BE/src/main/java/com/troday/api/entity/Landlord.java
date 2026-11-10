package com.troday.api.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity @Table(name = "landlords")
public class Landlord {
    @Id private Long id;
    public Landlord() { }
    public Landlord(Long id) { this.id = id; }
    public Long getId() { return id; }
}
