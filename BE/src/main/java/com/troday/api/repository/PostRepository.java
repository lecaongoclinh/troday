package com.troday.api.repository;
import com.troday.api.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByRoomId(Long roomId);
    List<Post> findByLandlordId(Long landlordId);
    List<Post> findByStatus(String status);
}
