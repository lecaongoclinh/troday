package com.troday.api.repository;
import com.troday.api.entity.ProfileLifestyle; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ProfileLifestyleRepository extends JpaRepository<ProfileLifestyle,Long>{List<ProfileLifestyle> findByProfileId(Long profileId); void deleteByProfileId(Long profileId);}
