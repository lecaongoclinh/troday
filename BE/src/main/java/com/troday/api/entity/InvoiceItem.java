package com.troday.api.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name="invoice_items")
public class InvoiceItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="invoice_id",nullable=false) private Long invoiceId; @Column(name="room_id",nullable=false) private Long roomId;
    @Column(name="room_service_id") private Long roomServiceId; private Integer position;
    @Column(name="item_type",nullable=false) private String itemType; @Column(name="name_snapshot",nullable=false) private String nameSnapshot; @Column(name="unit_snapshot",nullable=false) private String unitSnapshot;
    @Column(name="calculation_method_snapshot") private String calculationMethodSnapshot; private BigDecimal quantity; @Column(name="unit_price_snapshot") private BigDecimal unitPriceSnapshot; @Column(name="previous_reading") private BigDecimal previousReading; @Column(name="current_reading") private BigDecimal currentReading; private BigDecimal amount;
    public Long getId(){return id;} public Long getInvoiceId(){return invoiceId;} public void setInvoiceId(Long v){invoiceId=v;} public Long getRoomId(){return roomId;} public void setRoomId(Long v){roomId=v;} public Long getRoomServiceId(){return roomServiceId;} public void setRoomServiceId(Long v){roomServiceId=v;} public Integer getPosition(){return position;} public void setPosition(Integer v){position=v;} public String getItemType(){return itemType;} public void setItemType(String v){itemType=v;} public String getNameSnapshot(){return nameSnapshot;} public void setNameSnapshot(String v){nameSnapshot=v;} public String getUnitSnapshot(){return unitSnapshot;} public void setUnitSnapshot(String v){unitSnapshot=v;} public String getCalculationMethodSnapshot(){return calculationMethodSnapshot;} public void setCalculationMethodSnapshot(String v){calculationMethodSnapshot=v;} public BigDecimal getQuantity(){return quantity;} public void setQuantity(BigDecimal v){quantity=v;} public BigDecimal getUnitPriceSnapshot(){return unitPriceSnapshot;} public void setUnitPriceSnapshot(BigDecimal v){unitPriceSnapshot=v;} public BigDecimal getPreviousReading(){return previousReading;} public void setPreviousReading(BigDecimal v){previousReading=v;} public BigDecimal getCurrentReading(){return currentReading;} public void setCurrentReading(BigDecimal v){currentReading=v;} public BigDecimal getAmount(){return amount;} public void setAmount(BigDecimal v){amount=v;}
}
