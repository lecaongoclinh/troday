package com.troday.api.repository;
import com.troday.api.entity.Review; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ReviewRepository extends JpaRepository<Review,Long>{List<Review> findByRoomIdAndStatus(Long roomId,String status); List<Review> findByStatus(String status); boolean existsByReviewerIdAndRoomIdAndContractId(Long reviewerId,Long roomId,Long contractId);}
