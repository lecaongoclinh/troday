package com.troday.api.repository;

import com.troday.api.entity.PostAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostAmenityRepository extends JpaRepository<PostAmenity, Long> {
    List<PostAmenity> findByPostId(Long postId);
    void deleteByPostId(Long postId);
}
