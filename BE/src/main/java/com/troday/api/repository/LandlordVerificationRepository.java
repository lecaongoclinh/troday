package com.troday.api.repository;
import com.troday.api.entity.LandlordVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LandlordVerificationRepository extends JpaRepository<LandlordVerification, Long> {
    List<LandlordVerification> findByApplicantUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByApplicantUserIdAndStatus(Long userId, String status);
}
