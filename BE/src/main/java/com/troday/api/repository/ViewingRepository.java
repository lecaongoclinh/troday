package com.troday.api.repository;
import com.troday.api.entity.Viewing; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ViewingRepository extends JpaRepository<Viewing,Long>{List<Viewing> findByTenantIdOrCreatedByIdOrderByStartsAtDesc(Long tenantId,Long ownerId); List<Viewing> findByRoomIdAndStatus(Long roomId,String status);}
