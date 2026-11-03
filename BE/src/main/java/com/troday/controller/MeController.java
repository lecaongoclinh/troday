package com.troday.controller;

import com.troday.dto.response.ApiResponse;
import com.troday.dto.response.SessionResponse;
import com.troday.dto.response.UserResponse;
import com.troday.exception.DomainException;
import com.troday.security.ActorContext;
import com.troday.security.AuthCookies;
import com.troday.service.AuthService;
import com.troday.util.Responses;
import com.troday.service.ProfileService;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {
    private final AuthService auth;
    private final Responses responses;
    private final AuthCookies cookies;
    private final ProfileService profiles;

    public MeController(AuthService auth, Responses responses, AuthCookies cookies, ProfileService profiles) {
        this.auth = auth; this.responses = responses; this.cookies = cookies;
        this.profiles = profiles;
    }

    @GetMapping
    public ApiResponse<UserResponse> me(HttpServletRequest request) { return responses.ok(auth.me(ActorContext.current().userId()), request); }

    @PatchMapping("/profile")
    public ApiResponse<UserResponse.Profile> profile(@RequestBody ObjectNode body, HttpServletRequest request) {
        return responses.ok(profiles.update(ActorContext.current().userId(), body), request);
    }

    @PatchMapping("/notification-settings")
    public ApiResponse<UserResponse.NotificationSettings> settings(@RequestBody ObjectNode body, HttpServletRequest request) {
        return responses.ok(profiles.settings(ActorContext.current().userId(), body), request);
    }

    @GetMapping("/sessions")
    public ApiResponse<List<SessionResponse>> sessions(@RequestParam(defaultValue = "1") int page,
                                                       @RequestParam(defaultValue = "20") int pageSize,
                                                       @RequestParam(defaultValue = "-createdAt") String sort,
                                                       HttpServletRequest request) {
        var result = auth.sessions(ActorContext.current(), page, pageSize, sort);
        return responses.page(result.data(), request, new ApiResponse.Pagination(page, pageSize, result.total(), (result.total() + pageSize - 1) / pageSize));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> revoke(@PathVariable String sessionId, HttpServletRequest request) {
        long id;
        try {
            if (!sessionId.matches("[1-9][0-9]*")) throw new NumberFormatException();
            id = Long.parseLong(sessionId);
        } catch (NumberFormatException ex) { throw DomainException.invalid("sessionId", "ID phải là chuỗi số nguyên dương."); }
        var actor = ActorContext.current();
        auth.revoke(actor, id);
        var result = ResponseEntity.ok();
        if (id == actor.sessionId()) result.header(HttpHeaders.SET_COOKIE, cookies.clear());
        return result.body(responses.ok(Map.of("id", sessionId, "revoked", true), request));
    }
}
