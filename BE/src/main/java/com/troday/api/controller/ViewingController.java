package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.service.ViewingService; import jakarta.servlet.http.HttpServletRequest; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class ViewingController {
 private final ViewingService service; public ViewingController(ViewingService service){this.service=service;}
 @GetMapping("/viewing-proposals") public ApiResponseDto<?> proposalList(HttpServletRequest r){return service.proposalList(r);}
 @PostMapping("/viewing-proposals") public ApiResponseDto<?> createProposal(HttpServletRequest r,@RequestBody JsonNode b){return service.createProposal(r,b);}
 @PostMapping("/viewing-proposals/{proposalId}/decision") public ApiResponseDto<?> decision(HttpServletRequest r,@PathVariable Long proposalId,@RequestBody JsonNode b){return service.proposalDecision(r,proposalId,b);}
 @PostMapping("/viewing-proposals/{proposalId}/withdraw") public ApiResponseDto<?> withdraw(HttpServletRequest r,@PathVariable Long proposalId){return service.withdrawProposal(r,proposalId);}
 @GetMapping("/viewings") public ApiResponseDto<?> list(HttpServletRequest r){return service.viewingList(r);}
 @GetMapping("/viewings/{viewingId}") public ApiResponseDto<?> detail(HttpServletRequest r,@PathVariable Long viewingId){return service.viewingDetail(r,viewingId);}
 @PostMapping("/viewings") public ApiResponseDto<?> create(HttpServletRequest r,@RequestBody JsonNode b){return service.createViewing(r,b);}
 @PostMapping("/viewings/{viewingId}/attendance") public ApiResponseDto<?> attendance(HttpServletRequest r,@PathVariable Long viewingId,@RequestBody JsonNode b){return service.attendance(r,viewingId,b);}
 @PostMapping("/viewings/{viewingId}/cancel") public ApiResponseDto<?> cancel(HttpServletRequest r,@PathVariable Long viewingId,@RequestBody(required=false) JsonNode b){return service.cancel(r,viewingId,b);}
 @PostMapping("/viewings/{viewingId}/rental-decision") public ApiResponseDto<?> rentalDecision(HttpServletRequest r,@PathVariable Long viewingId,@RequestBody JsonNode b){return service.rentalDecision(r,viewingId,b);}
}
