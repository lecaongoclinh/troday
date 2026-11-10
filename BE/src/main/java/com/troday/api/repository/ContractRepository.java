package com.troday.api.repository;
import com.troday.api.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ContractRepository extends JpaRepository<Contract, Long> { List<Contract> findByLandlordId(Long landlordId); List<Contract> findByViewingTenantId(Long tenantId); }
