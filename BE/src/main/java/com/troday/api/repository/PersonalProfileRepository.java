package com.troday.api.repository;
import com.troday.api.entity.PersonalProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PersonalProfileRepository extends JpaRepository<PersonalProfile, Long> { Optional<PersonalProfile> findByUserId(Long userId); }
