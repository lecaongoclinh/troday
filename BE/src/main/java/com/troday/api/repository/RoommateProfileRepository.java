package com.troday.api.repository;
import com.troday.api.entity.RoommateProfile; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface RoommateProfileRepository extends JpaRepository<RoommateProfile,Long>{Optional<RoommateProfile> findByTenantId(Long tenantId); List<RoommateProfile> findByActiveTrue();}
