package com.troday.api.entity;

import jakarta.persistence.*;

@Entity @Table(name = "rental_services")
public class RentalServiceCatalog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String unit;
    @Column(name = "default_calculation_method", nullable = false) private String defaultCalculationMethod;
    public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;}
    public String getUnit(){return unit;} public void setUnit(String v){unit=v;} public String getDefaultCalculationMethod(){return defaultCalculationMethod;} public void setDefaultCalculationMethod(String v){defaultCalculationMethod=v;}
}
