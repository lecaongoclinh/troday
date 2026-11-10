package com.troday.api.repository;
import com.troday.api.entity.Conversation; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ConversationRepository extends JpaRepository<Conversation,Long>{Optional<Conversation> findByPostIdAndType(Long postId,String type); Optional<Conversation> findByRoommateRequestId(Long requestId);}
