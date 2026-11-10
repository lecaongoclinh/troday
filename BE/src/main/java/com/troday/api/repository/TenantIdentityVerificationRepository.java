package com.troday.api.repository;
import com.troday.api.entity.TenantIdentityVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TenantIdentityVerificationRepository extends JpaRepository<TenantIdentityVerification, Long> {
    List<TenantIdentityVerification> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    boolean existsByTenantIdAndStatus(Long tenantId, String status);
}
