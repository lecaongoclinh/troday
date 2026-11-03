package com.troday.controller;

import com.troday.dto.request.LoginRequest;
import com.troday.dto.request.RegisterRequest;
import com.troday.security.ActorContext;
import com.troday.security.AuthCookies;
import com.troday.security.AuthRateLimiter;
import com.troday.service.AuthService;
import com.troday.service.IdempotencyExecutor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth;
    private final IdempotencyExecutor commands;
    private final AuthCookies cookies;
    private final AuthRateLimiter limiter;

    public AuthController(AuthService auth, IdempotencyExecutor commands, AuthCookies cookies, AuthRateLimiter limiter) {
        this.auth = auth; this.commands = commands; this.cookies = cookies; this.limiter = limiter;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest body,
                                           @RequestHeader(value = "Idempotency-Key", required = false) String key,
                                           HttpServletRequest request) {
        limiter.check("register", request.getRemoteAddr(), null);
        return commands.execute(key, "public:POST:/auth/register", body, request,
                () -> new IdempotencyExecutor.Command(201, auth.register(body), null));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest body,
                                        @RequestHeader(value = "Idempotency-Key", required = false) String key,
                                        HttpServletRequest request) {
        String identifier;
        try { identifier = com.troday.util.Contacts.identifier(body.identifier()); }
        catch (com.troday.exception.DomainException ex) { identifier = body.identifier().strip().toLowerCase(java.util.Locale.ROOT); }
        limiter.check("login", request.getRemoteAddr(), identifier);
        return commands.execute(key, "public:POST:/auth/login", body, request, () -> {
            var credentials = auth.login(body);
            return new IdempotencyExecutor.Command(200, credentials.data(), cookies.set(credentials.refreshToken(), credentials.refreshExpiresAt()));
        });
    }

    @PostMapping("/refresh")
    public ResponseEntity<String> refresh(@CookieValue(value = AuthCookies.NAME, required = false) String token,
                                          @RequestHeader(value = "Idempotency-Key", required = false) String key,
                                          HttpServletRequest request) {
        limiter.check("refresh", request.getRemoteAddr(), null);
        return commands.execute(key, "public:POST:/auth/refresh", Map.of("cookie", token == null ? "" : token), request, () -> {
            var credentials = auth.refresh(token);
            return new IdempotencyExecutor.Command(200, credentials.data(), cookies.set(credentials.refreshToken(), credentials.refreshExpiresAt()));
        });
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader(value = "Idempotency-Key", required = false) String key,
                                         HttpServletRequest request) {
        var actor = ActorContext.current();
        return commands.execute(key, actor.userId() + ":POST:/auth/logout", Map.of("sessionId", actor.sessionId()), request, () -> {
            auth.revoke(actor, actor.sessionId());
            return new IdempotencyExecutor.Command(200, Map.of("revoked", true), cookies.clear());
        });
    }
}
