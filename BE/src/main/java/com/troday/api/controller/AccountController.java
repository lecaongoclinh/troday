package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.AccountService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AccountController {
    private final AccountService service;
    public AccountController(AccountService service){this.service=service;}

    @PostMapping("/auth/register") public ApiResponseDto<?> register(@RequestBody JsonNode b){return service.register(b);}
    @PostMapping("/auth/login") public ApiResponseDto<?> login(@RequestBody JsonNode b){return service.login(b);}
    @GetMapping("/me") public ApiResponseDto<?> me(HttpServletRequest r){return service.me(r);}
    @PatchMapping("/me/profile") public ApiResponseDto<?> profile(HttpServletRequest r,@RequestBody JsonNode b){return service.updateProfile(r,b);}
    @PatchMapping("/me/notification-settings") public ApiResponseDto<?> settings(HttpServletRequest r,@RequestBody JsonNode b){return service.updateSettings(r,b);}

    @PostMapping("/me/identity-verifications") public ApiResponseDto<?> submitIdentity(HttpServletRequest r,@RequestBody JsonNode b){return service.submitIdentity(r,b);}
    @GetMapping("/me/identity-verifications") public ApiResponseDto<?> identityHistory(HttpServletRequest r){return service.identityHistory(r);}
    @PostMapping("/me/identity-verifications/{id}/withdraw") public ApiResponseDto<?> withdrawIdentity(HttpServletRequest r,@PathVariable Long id){return service.withdrawIdentity(r,id);}
    @PostMapping("/me/landlord-verifications") public ApiResponseDto<?> submitLandlord(HttpServletRequest r,@RequestBody JsonNode b){return service.submitLandlord(r,b);}
    @GetMapping("/me/landlord-verifications") public ApiResponseDto<?> landlordHistory(HttpServletRequest r){return service.landlordHistory(r);}
    @PostMapping("/me/landlord-verifications/{id}/withdraw") public ApiResponseDto<?> withdrawLandlord(HttpServletRequest r,@PathVariable Long id){return service.withdrawLandlord(r,id);}

    @GetMapping("/admin/identity-verifications") public ApiResponseDto<?> adminIdentityList(HttpServletRequest r){return service.adminIdentityList(r);}
    @GetMapping("/admin/identity-verifications/{id}") public ApiResponseDto<?> adminIdentity(HttpServletRequest r,@PathVariable Long id){return service.adminIdentity(r,id);}
    @PostMapping("/admin/identity-verifications/{id}/decision") public ApiResponseDto<?> adminIdentityDecision(HttpServletRequest r,@PathVariable Long id,@RequestBody JsonNode b){return service.adminIdentityDecision(r,id,b);}
    @GetMapping("/admin/landlord-verifications") public ApiResponseDto<?> adminLandlordList(HttpServletRequest r){return service.adminLandlordList(r);}
    @GetMapping("/admin/landlord-verifications/{id}") public ApiResponseDto<?> adminLandlord(HttpServletRequest r,@PathVariable Long id){return service.adminLandlord(r,id);}
    @PostMapping("/admin/landlord-verifications/{id}/decision") public ApiResponseDto<?> adminLandlordDecision(HttpServletRequest r,@PathVariable Long id,@RequestBody JsonNode b){return service.adminLandlordDecision(r,id,b);}

    @PostMapping("/auth/refresh") public ApiResponseDto<?> refresh(HttpServletRequest r){return service.refresh(r);}
    @PostMapping("/auth/logout") public ApiResponseDto<?> logout(HttpServletRequest r){return service.logout(r);}
    @GetMapping("/me/sessions") public ApiResponseDto<?> sessions(HttpServletRequest r){return service.sessionList(r);}
    @DeleteMapping("/me/sessions/{id}") public ApiResponseDto<?> revokeSession(HttpServletRequest r,@PathVariable Long id){return service.revokeSession(r,id);}
    @PostMapping("/auth/phone-verifications") public ApiResponseDto<?> phoneVerification(HttpServletRequest r,@RequestBody JsonNode b){return service.phoneVerification(r,b);}
    @PostMapping("/auth/phone-verifications/confirm") public ApiResponseDto<?> confirmPhone(HttpServletRequest r,@RequestBody JsonNode b){return service.confirmPhone(r,b);}
    @PostMapping("/auth/password-resets") public ApiResponseDto<?> passwordReset(@RequestBody JsonNode b){return service.passwordReset(b);}
    @PostMapping("/auth/password-resets/verify") public ApiResponseDto<?> passwordResetVerify(@RequestBody JsonNode b){return service.passwordResetVerify(b);}
    @PostMapping("/auth/password-resets/complete") public ApiResponseDto<?> passwordResetComplete(@RequestBody JsonNode b){return service.passwordResetComplete(b);}

    @PostMapping("/contracts/{contractId}/members/{memberId}/account-invitations") public ApiResponseDto<?> accountInvitation(HttpServletRequest r,@PathVariable Long contractId,@PathVariable Long memberId){return service.accountInvitation(r,contractId,memberId);}
    @PostMapping("/me/residency-links") public ApiResponseDto<?> residencyLink(HttpServletRequest r,@RequestBody JsonNode b){return service.residencyLink(r,b);}
}
