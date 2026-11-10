package com.troday.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name = "room_services")
public class RoomServiceSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name="room_id", nullable=false) private Long roomId;
    @Column(name="house_id", nullable=false) private Long houseId;
    @Column(name="house_service_id", nullable=false) private Long houseServiceId;
    @Column(name="unit_price_override") private BigDecimal unitPriceOverride;
    @Column(name="calculation_method_override") private String calculationMethodOverride;
    @Column(name="is_active", nullable=false) private Boolean active=true;
    public Long getId(){return id;} public Long getRoomId(){return roomId;} public void setRoomId(Long v){roomId=v;} public Long getHouseId(){return houseId;} public void setHouseId(Long v){houseId=v;} public Long getHouseServiceId(){return houseServiceId;} public void setHouseServiceId(Long v){houseServiceId=v;} public BigDecimal getUnitPriceOverride(){return unitPriceOverride;} public void setUnitPriceOverride(BigDecimal v){unitPriceOverride=v;} public String getCalculationMethodOverride(){return calculationMethodOverride;} public void setCalculationMethodOverride(String v){calculationMethodOverride=v;} public Boolean getActive(){return active;} public void setActive(Boolean v){active=v;}
}
