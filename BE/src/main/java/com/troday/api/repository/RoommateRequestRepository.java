package com.troday.api.repository;
import com.troday.api.entity.RoommateRequest; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface RoommateRequestRepository extends JpaRepository<RoommateRequest,Long>{List<RoommateRequest> findBySenderIdOrReceiverIdOrderByIdDesc(Long senderId,Long receiverId); List<RoommateRequest> findByReceiverIdAndStatus(Long receiverId,String status); List<RoommateRequest> findBySenderIdAndStatus(Long senderId,String status);}
