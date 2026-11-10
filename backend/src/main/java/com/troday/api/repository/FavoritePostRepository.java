package com.troday.api.repository;

import com.troday.api.entity.FavoritePost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoritePostRepository extends JpaRepository<FavoritePost, Long> {
    List<FavoritePost> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<FavoritePost> findByUserIdAndPostId(Long userId, Long postId);
}
