package com.troday.api.repository;
import com.troday.api.entity.ContractRevision; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ContractRevisionRepository extends JpaRepository<ContractRevision,Long>{List<ContractRevision> findByContractIdOrderByRevisionNumberDesc(Long contractId);}
