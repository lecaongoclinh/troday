package com.troday.api.repository;
import com.troday.api.entity.LifestyleCriterion; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface LifestyleCriterionRepository extends JpaRepository<LifestyleCriterion,Long>{List<LifestyleCriterion> findByActiveTrue(); Optional<LifestyleCriterion> findByCode(String code);}
