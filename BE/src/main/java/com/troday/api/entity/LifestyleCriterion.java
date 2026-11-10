package com.troday.api.entity;
import jakarta.persistence.*;
@Entity @Table(name="lifestyle_criteria")
public class LifestyleCriterion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, unique=true) private String code; @Column(nullable=false) private String name;
    @Column(nullable=false) private String category; @Column(name="value_type", nullable=false) private String valueType;
    @Column(name="allowed_values", columnDefinition="json") private String allowedValues; @Column(nullable=false) private boolean active=true;
    public Long getId(){return id;} public String getCode(){return code;} public void setCode(String v){code=v;} public String getName(){return name;} public void setName(String v){name=v;}
    public String getCategory(){return category;} public void setCategory(String v){category=v;} public String getValueType(){return valueType;} public void setValueType(String v){valueType=v;}
    public String getAllowedValues(){return allowedValues;} public void setAllowedValues(String v){allowedValues=v;} public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}
