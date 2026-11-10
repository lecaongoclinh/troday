package com.troday.api.repository;
import com.troday.api.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {
    Optional<AuthSession> findBySessionKey(String sessionKey);
    List<AuthSession> findByUserIdOrderByCreatedAtDesc(Long userId);
}
