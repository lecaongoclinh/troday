package com.troday.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "post_amenities", uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "amenity"}))
public class PostAmenity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "post_id", nullable = false) private Long postId;
    @Column(nullable = false, length = 100) private String amenity;
    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public void setPostId(Long value) { postId = value; }
    public String getAmenity() { return amenity; }
    public void setAmenity(String value) { amenity = value; }
}
