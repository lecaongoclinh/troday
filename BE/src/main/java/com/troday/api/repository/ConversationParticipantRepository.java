package com.troday.api.repository;
import com.troday.api.entity.ConversationParticipant; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant,Long>{Optional<ConversationParticipant> findByConversationIdAndUserId(Long conversationId,Long userId); List<ConversationParticipant> findByUserId(Long userId); List<ConversationParticipant> findByConversationId(Long conversationId);}
