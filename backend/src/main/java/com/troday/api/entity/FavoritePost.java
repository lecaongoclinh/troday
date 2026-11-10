package com.troday.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favorite_posts", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"}))
public class FavoritePost {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "post_id", nullable = false) private Long postId;
    @Column(name = "created_at") private LocalDateTime createdAt;
    public Long getId(){return id;}
    public Long getUserId(){return userId;} public void setUserId(Long v){userId=v;}
    public Long getPostId(){return postId;} public void setPostId(Long v){postId=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
