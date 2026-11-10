package com.troday.api.repository;
import com.troday.api.entity.Notification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification,Long>{List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId); long countByUserIdAndReadFalse(Long userId); Optional<Notification> findByUserIdAndEventKey(Long userId,String eventKey);}
