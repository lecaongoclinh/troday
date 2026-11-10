package com.troday.api.repository;
import com.troday.api.entity.OccupantJoinRequest; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface OccupantJoinRequestRepository extends JpaRepository<OccupantJoinRequest,Long>{List<OccupantJoinRequest> findByContractIdOrderByIdDesc(Long contractId);}
