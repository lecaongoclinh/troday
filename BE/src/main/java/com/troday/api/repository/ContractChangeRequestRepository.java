package com.troday.api.repository;
import com.troday.api.entity.ContractChangeRequest; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ContractChangeRequestRepository extends JpaRepository<ContractChangeRequest,Long>{List<ContractChangeRequest> findByContractIdOrderByIdDesc(Long contractId);}
