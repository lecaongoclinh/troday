package com.troday.api.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="conversations") public class Conversation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String type; @Column(name="room_id") private Long roomId; @Column(name="post_id") private Long postId; @Column(name="roommate_request_id") private Long roommateRequestId; @Column(name="last_message_id") private Long lastMessageId; @Column(name="last_message_at") private LocalDateTime lastMessageAt;
 public Long getId(){return id;} public String getType(){return type;} public void setType(String v){type=v;} public Long getRoomId(){return roomId;} public void setRoomId(Long v){roomId=v;} public Long getPostId(){return postId;} public void setPostId(Long v){postId=v;} public Long getRoommateRequestId(){return roommateRequestId;} public void setRoommateRequestId(Long v){roommateRequestId=v;} public Long getLastMessageId(){return lastMessageId;} public void setLastMessageId(Long v){lastMessageId=v;} public LocalDateTime getLastMessageAt(){return lastMessageAt;} public void setLastMessageAt(LocalDateTime v){lastMessageAt=v;}
}
