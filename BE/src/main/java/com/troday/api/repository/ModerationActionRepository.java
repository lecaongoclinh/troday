package com.troday.api.repository;
import com.troday.api.entity.ModerationAction; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ModerationActionRepository extends JpaRepository<ModerationAction,Long>{List<ModerationAction> findAllByOrderByOccurredAtDesc();}
