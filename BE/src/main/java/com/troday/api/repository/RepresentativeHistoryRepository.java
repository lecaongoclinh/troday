package com.troday.api.repository;
import com.troday.api.entity.RepresentativeHistory; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface RepresentativeHistoryRepository extends JpaRepository<RepresentativeHistory,Long>{List<RepresentativeHistory> findByContractIdOrderByStartedAtDesc(Long contractId);}
