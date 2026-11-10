package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.service.ContractService; import jakarta.servlet.http.HttpServletRequest; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1") public class ContractController {
 private final ContractService service; public ContractController(ContractService service){this.service=service;}
 @GetMapping("/contracts") public ApiResponseDto<?> list(HttpServletRequest r){return service.list(r);}
 @GetMapping("/contracts/{contractId}") public ApiResponseDto<?> detail(HttpServletRequest r,@PathVariable Long contractId){return service.detail(r,contractId);}
 @PostMapping("/contracts") public ApiResponseDto<?> create(HttpServletRequest r,@RequestBody JsonNode b){return service.create(r,b);}
 @GetMapping("/viewings/{viewingId}/contract-impact") public ApiResponseDto<?> impact(HttpServletRequest r,@PathVariable Long viewingId){return service.contractImpact(r,viewingId);}
 @GetMapping("/contracts/{contractId}/revisions") public ApiResponseDto<?> revisions(HttpServletRequest r,@PathVariable Long contractId){return service.revisionList(r,contractId);}
 @PostMapping("/contracts/{contractId}/revision-requests") public ApiResponseDto<?> revisionRequest(HttpServletRequest r,@PathVariable Long contractId,@RequestBody(required=false) JsonNode b){return service.revisionRequest(r,contractId,b);}
 @PatchMapping("/contracts/{contractId}/revisions/{revisionId}") public ApiResponseDto<?> patchRevision(HttpServletRequest r,@PathVariable Long contractId,@PathVariable Long revisionId,@RequestBody JsonNode b){return service.patchRevision(r,contractId,revisionId,b);}
 @PostMapping("/contracts/{contractId}/revisions/{revisionId}/submit") public ApiResponseDto<?> submit(HttpServletRequest r,@PathVariable Long contractId,@PathVariable Long revisionId){return service.submitRevision(r,contractId,revisionId);}
 @PostMapping("/contracts/{contractId}/confirm") public ApiResponseDto<?> confirm(HttpServletRequest r,@PathVariable Long contractId,@RequestBody(required=false) JsonNode b){return service.confirm(r,contractId,b);}
 @PostMapping("/contracts/{contractId}/move-ins") public ApiResponseDto<?> moveIn(HttpServletRequest r,@PathVariable Long contractId,@RequestBody(required=false) JsonNode b){return service.moveIn(r,contractId,b);}
 @PostMapping("/contracts/{contractId}/cancel") public ApiResponseDto<?> cancel(HttpServletRequest r,@PathVariable Long contractId,@RequestBody(required=false) JsonNode b){return service.cancel(r,contractId,b);}
 @PostMapping("/contracts/{contractId}/members/{memberId}/cancel") public ApiResponseDto<?> cancelMember(HttpServletRequest r,@PathVariable Long contractId,@PathVariable Long memberId,@RequestBody(required=false) JsonNode b){return service.cancelMember(r,contractId,memberId,b);}
 @PostMapping("/contract-imports") public ApiResponseDto<?> importPaper(HttpServletRequest r,@RequestBody JsonNode b){return service.importPaper(r,b);}
}
