package com.troday.api.repository;
import com.troday.api.entity.ChatMessage; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ChatMessageRepository extends JpaRepository<ChatMessage,Long>{Optional<ChatMessage> findBySenderIdAndClientMessageKey(Long senderId,String key); List<ChatMessage> findByConversationIdOrderBySentAtAscIdAsc(Long conversationId); long countByConversationIdAndSenderIdNot(Long conversationId,Long senderId);}
