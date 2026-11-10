package com.troday.api.repository;
import com.troday.api.entity.RentalHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RentalHouseRepository extends JpaRepository<RentalHouse, Long> { List<RentalHouse> findByLandlordId(Long landlordId); }
