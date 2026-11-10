package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.service.AdminService; import jakarta.servlet.http.HttpServletRequest; import org.springframework.http.MediaType; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class AdminController { private final AdminService service; public AdminController(AdminService s){service=s;}
 @GetMapping(value="/rooms/{roomId}/reviews",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> reviews(@PathVariable Long roomId){return service.publicReviews(roomId);}
 @PostMapping(value="/reviews",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> createReview(HttpServletRequest r,@RequestBody JsonNode b){return service.createReview(r,b);}
 @PostMapping(value="/admin/reviews/{reviewId}/moderation",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> moderate(HttpServletRequest r,@PathVariable Long reviewId,@RequestBody JsonNode b){return service.moderateReview(r,reviewId,b);}
 @PostMapping(value="/reports",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> report(HttpServletRequest r,@RequestBody JsonNode b){return service.createReport(r,b);}
 @GetMapping(value="/me/reports",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> myReports(HttpServletRequest r){return service.myReports(r);}
 @GetMapping(value="/admin/reports",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> reports(HttpServletRequest r){return service.adminReports(r);}
 @GetMapping(value="/admin/reports/{reportId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> report(HttpServletRequest r,@PathVariable Long reportId){return service.adminReport(r,reportId);}
 @PostMapping(value="/admin/reports/{reportId}/decision",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> decision(HttpServletRequest r,@PathVariable Long reportId,@RequestBody JsonNode b){return service.reportDecision(r,reportId,b);}
 @GetMapping(value="/admin/users",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> users(HttpServletRequest r){return service.users(r);}
 @GetMapping(value="/admin/users/{userId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> user(HttpServletRequest r,@PathVariable Long userId){return service.user(r,userId);}
 @PostMapping(value="/admin/users/{userId}/lock",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> lock(HttpServletRequest r,@PathVariable Long userId,@RequestBody(required=false) JsonNode b){return service.lock(r,userId,b);}
 @PostMapping(value="/admin/users/{userId}/unlock",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> unlock(HttpServletRequest r,@PathVariable Long userId){return service.unlock(r,userId);}
 @GetMapping(value="/contract-templates",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> templates(HttpServletRequest r){return service.templateList(r);}
 @PostMapping(value="/admin/contract-templates",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> createTemplate(HttpServletRequest r,@RequestBody JsonNode b){return service.templateCreate(r,b);}
 @PatchMapping(value="/admin/contract-templates/{templateId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> updateTemplate(HttpServletRequest r,@PathVariable Long templateId,@RequestBody JsonNode b){return service.templateUpdate(r,templateId,b);}
 @GetMapping(value="/admin/moderation-actions",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> actions(HttpServletRequest r){return service.actionList(r);}
 @GetMapping(value="/admin/moderation-actions/{actionId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> action(HttpServletRequest r,@PathVariable Long actionId){return service.action(r,actionId);}
 @GetMapping(value="/admin/dashboard",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> dashboard(HttpServletRequest r){return service.dashboard(r);}
}
