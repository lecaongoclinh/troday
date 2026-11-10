package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.service.ResidentService; import jakarta.servlet.http.HttpServletRequest; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class ResidentController {
 private final ResidentService service; public ResidentController(ResidentService service){this.service=service;}
 @GetMapping("/residents") public ApiResponseDto<?> residents(HttpServletRequest r){return service.residents(r);}
 @GetMapping("/contracts/{contractId}/members") public ApiResponseDto<?> members(HttpServletRequest r,@PathVariable Long contractId){return service.contractMembers(r,contractId);}
 @GetMapping("/residents/export") public ApiResponseDto<?> export(HttpServletRequest r){return service.export(r);}
 @GetMapping("/occupant-join-requests") public ApiResponseDto<?> joins(HttpServletRequest r){return service.joinList(r);}
 @PostMapping("/occupant-join-requests") public ApiResponseDto<?> createJoin(HttpServletRequest r,@RequestBody JsonNode b){return service.createJoin(r,b);}
 @PostMapping("/occupant-join-requests/{requestId}/consents") public ApiResponseDto<?> consent(HttpServletRequest r,@PathVariable Long requestId,@RequestBody JsonNode b){return service.consent(r,requestId,b);}
 @PostMapping("/occupant-join-requests/{requestId}/cancel") public ApiResponseDto<?> cancel(HttpServletRequest r,@PathVariable Long requestId,@RequestBody(required=false) JsonNode b){return service.cancel(r,requestId,b);}
 @PostMapping("/occupant-join-requests/{requestId}/approve") public ApiResponseDto<?> approve(HttpServletRequest r,@PathVariable Long requestId){return service.approve(r,requestId);}
 @PostMapping("/occupant-join-requests/{requestId}/reject") public ApiResponseDto<?> reject(HttpServletRequest r,@PathVariable Long requestId,@RequestBody JsonNode b){return service.reject(r,requestId,b);}
 @PostMapping("/occupant-join-requests/{requestId}/cancel-hold") public ApiResponseDto<?> cancelHold(HttpServletRequest r,@PathVariable Long requestId,@RequestBody(required=false) JsonNode b){return service.cancelHold(r,requestId,b);}
 @PostMapping("/occupant-join-requests/{requestId}/complete") public ApiResponseDto<?> complete(HttpServletRequest r,@PathVariable Long requestId){return service.complete(r,requestId);}
 @PostMapping("/contracts/{contractId}/members/{memberId}/move-out") public ApiResponseDto<?> moveOut(HttpServletRequest r,@PathVariable Long contractId,@PathVariable Long memberId,@RequestBody(required=false) JsonNode b){return service.moveOut(r,contractId,memberId,b);}
 @GetMapping("/contracts/{contractId}/representative-candidates") public ApiResponseDto<?> candidates(HttpServletRequest r,@PathVariable Long contractId){return service.candidates(r,contractId);}
 @GetMapping("/contracts/{contractId}/representative-history") public ApiResponseDto<?> history(HttpServletRequest r,@PathVariable Long contractId){return service.representativeHistory(r,contractId);}
 @PostMapping("/contracts/{contractId}/representative-handovers") public ApiResponseDto<?> handover(HttpServletRequest r,@PathVariable Long contractId,@RequestBody JsonNode b){return service.handover(r,contractId,b);}
}
