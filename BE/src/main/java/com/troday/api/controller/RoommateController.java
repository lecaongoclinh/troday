package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.service.RoommateService; import jakarta.servlet.http.HttpServletRequest; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class RoommateController {
 private final RoommateService service; public RoommateController(RoommateService service){this.service=service;}
 @GetMapping("/me/roommate-profile") public ApiResponseDto<?> myProfile(HttpServletRequest r){return service.myProfile(r);}
 @PutMapping("/me/roommate-profile") public ApiResponseDto<?> saveProfile(HttpServletRequest r,@RequestBody JsonNode b){return service.saveProfile(r,b);}
 @GetMapping("/roommate-profiles/{profileId}") public ApiResponseDto<?> profile(HttpServletRequest r,@PathVariable Long profileId){return service.publicProfile(r,profileId);}
 @GetMapping("/lifestyle-criteria") public ApiResponseDto<?> criteria(HttpServletRequest r){return service.criterionList(r);}
 @GetMapping("/me/roommate-profile/lifestyles") public ApiResponseDto<?> lifestyles(HttpServletRequest r){return service.myLifestyles(r);}
 @PutMapping("/me/roommate-profile/lifestyles") public ApiResponseDto<?> saveLifestyles(HttpServletRequest r,@RequestBody JsonNode b){return service.saveLifestyles(r,b);}
 @GetMapping("/roommate-matches") public ApiResponseDto<?> matches(HttpServletRequest r){return service.matches(r);}
 @PostMapping("/admin/lifestyle-criteria") public ApiResponseDto<?> createCriterion(HttpServletRequest r,@RequestBody JsonNode b){return service.adminCreateCriterion(r,b);}
 @PatchMapping("/admin/lifestyle-criteria/{criterionId}") public ApiResponseDto<?> updateCriterion(HttpServletRequest r,@PathVariable Long criterionId,@RequestBody JsonNode b){return service.adminUpdateCriterion(r,criterionId,b);}
 @GetMapping("/roommate-requests") public ApiResponseDto<?> requests(HttpServletRequest r){return service.requestList(r);}
 @PostMapping("/roommate-requests") public ApiResponseDto<?> send(HttpServletRequest r,@RequestBody JsonNode b){return service.sendRequest(r,b);}
 @PostMapping("/roommate-requests/{requestId}/response") public ApiResponseDto<?> response(HttpServletRequest r,@PathVariable Long requestId,@RequestBody JsonNode b){return service.respond(r,requestId,b);}
 @PostMapping("/roommate-requests/{requestId}/cancel") public ApiResponseDto<?> cancel(HttpServletRequest r,@PathVariable Long requestId,@RequestBody(required=false) JsonNode b){return service.cancel(r,requestId,b);}
 @PostMapping("/roommate-requests/{requestId}/end") public ApiResponseDto<?> end(HttpServletRequest r,@PathVariable Long requestId,@RequestBody(required=false) JsonNode b){return service.end(r,requestId,b);}
}
