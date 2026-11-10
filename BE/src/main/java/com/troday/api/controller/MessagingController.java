package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.service.MessagingService; import jakarta.servlet.http.HttpServletRequest; import org.springframework.http.MediaType; import org.springframework.web.bind.annotation.*; import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
@RestController @RequestMapping("/api/v1") public class MessagingController {
 private final MessagingService service; public MessagingController(MessagingService service){this.service=service;}
 @PostMapping("/conversations/room-inquiries") public ApiResponseDto<?> roomInquiry(HttpServletRequest r,@RequestBody JsonNode b){return service.roomInquiry(r,b);}
 @GetMapping("/conversations") public ApiResponseDto<?> list(HttpServletRequest r){return service.list(r);}
 @GetMapping("/conversations/{conversationId}") public ApiResponseDto<?> detail(HttpServletRequest r,@PathVariable Long conversationId){return service.detail(r,conversationId);}
 @GetMapping("/conversations/{conversationId}/messages") public ApiResponseDto<?> messages(HttpServletRequest r,@PathVariable Long conversationId){return service.messageList(r,conversationId);}
 @PostMapping("/conversations/{conversationId}/messages") public ApiResponseDto<?> send(HttpServletRequest r,@PathVariable Long conversationId,@RequestBody JsonNode b){return service.sendMessage(r,conversationId,b);}
 @PutMapping("/conversations/{conversationId}/read-state") public ApiResponseDto<?> readState(HttpServletRequest r,@PathVariable Long conversationId,@RequestBody JsonNode b){return service.readState(r,conversationId,b);}
 @PatchMapping("/conversations/{conversationId}/preferences") public ApiResponseDto<?> preferences(HttpServletRequest r,@PathVariable Long conversationId,@RequestBody JsonNode b){return service.preferences(r,conversationId,b);}
 @GetMapping("/conversations/{conversationId}/viewing-timeline") public ApiResponseDto<?> timeline(HttpServletRequest r,@PathVariable Long conversationId){return service.viewingTimeline(r,conversationId);}
 @PostMapping("/roommate-requests/{requestId}/conversation") public ApiResponseDto<?> roommateConversation(HttpServletRequest r,@PathVariable Long requestId){return service.roommateConversation(r,requestId);}
 @PostMapping("/conversations/{conversationId}/post-shares") public ApiResponseDto<?> share(HttpServletRequest r,@PathVariable Long conversationId,@RequestBody JsonNode b){return service.sharePost(r,conversationId,b);}
 @GetMapping("/me/notifications") public ApiResponseDto<?> notifications(HttpServletRequest r){return service.notificationList(r);}
 @GetMapping("/me/notification-counts") public ApiResponseDto<?> notificationCounts(HttpServletRequest r){return service.notificationCounts(r);}
 @PutMapping("/me/notifications/{notificationId}/read-state") public ApiResponseDto<?> notificationRead(HttpServletRequest r,@PathVariable Long notificationId,@RequestBody(required=false) JsonNode b){return service.notificationRead(r,notificationId,b);}
 @PostMapping("/me/notifications/read-all") public ApiResponseDto<?> notificationReadAll(HttpServletRequest r,@RequestBody(required=false) JsonNode b){return service.notificationReadAll(r,b);}
 @GetMapping(value="/events",produces=MediaType.TEXT_EVENT_STREAM_VALUE) public SseEmitter events(HttpServletRequest r){return service.events(r);}
}
