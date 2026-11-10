package com.troday.api.repository;
import com.troday.api.entity.ViewingProposal; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ViewingProposalRepository extends JpaRepository<ViewingProposal,Long>{Optional<ViewingProposal> findByTenantIdAndClientRequestKey(Long tenantId,String key); List<ViewingProposal> findByTenantIdOrLandlordIdOrderByStartsAtDesc(Long tenantId,Long landlordId);}
