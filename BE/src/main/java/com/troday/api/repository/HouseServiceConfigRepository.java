package com.troday.api.repository;
import com.troday.api.entity.HouseServiceConfig; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface HouseServiceConfigRepository extends JpaRepository<HouseServiceConfig,Long>{List<HouseServiceConfig> findByHouseId(Long houseId); Optional<HouseServiceConfig> findByIdAndHouseId(Long id,Long houseId);}
