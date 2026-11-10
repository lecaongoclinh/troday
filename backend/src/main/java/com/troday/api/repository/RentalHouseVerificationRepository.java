package com.troday.api.repository;

import com.troday.api.entity.RentalHouseVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RentalHouseVerificationRepository extends JpaRepository<RentalHouseVerification, Long> {
    List<RentalHouseVerification> findByHouseIdOrderBySubmittedAtDesc(Long houseId);
    List<RentalHouseVerification> findByApplicantLandlordIdOrderBySubmittedAtDesc(Long landlordId);
    Optional<RentalHouseVerification> findByHouseIdAndStatus(Long houseId, String status);
}
