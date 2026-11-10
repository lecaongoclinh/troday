package com.troday.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "house_services")
public class HouseServiceConfig {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name="house_id", nullable=false) private Long houseId;
    @Column(name="catalog_service_id") private Long catalogServiceId;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String unit;
    @Column(name="default_unit_price", nullable=false) private BigDecimal defaultUnitPrice=BigDecimal.ZERO;
    @Column(name="default_calculation_method", nullable=false) private String defaultCalculationMethod;
    @Column(name="is_active", nullable=false) private Boolean active=true;
    public Long getId(){return id;} public Long getHouseId(){return houseId;} public void setHouseId(Long v){houseId=v;} public Long getCatalogServiceId(){return catalogServiceId;} public void setCatalogServiceId(Long v){catalogServiceId=v;}
    public String getName(){return name;} public void setName(String v){name=v;} public String getUnit(){return unit;} public void setUnit(String v){unit=v;} public BigDecimal getDefaultUnitPrice(){return defaultUnitPrice;} public void setDefaultUnitPrice(BigDecimal v){defaultUnitPrice=v;} public String getDefaultCalculationMethod(){return defaultCalculationMethod;} public void setDefaultCalculationMethod(String v){defaultCalculationMethod=v;} public Boolean getActive(){return active;} public void setActive(Boolean v){active=v;}
}
