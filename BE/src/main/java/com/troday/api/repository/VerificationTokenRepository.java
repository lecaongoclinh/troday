package com.troday.api.repository;
import com.troday.api.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findBySelector(String selector);
    Optional<VerificationToken> findFirstByUserIdAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(Long userId, String purpose);
}
