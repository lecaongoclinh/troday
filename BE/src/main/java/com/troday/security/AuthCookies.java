package com.troday.security;

import com.troday.config.AuthProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookies {
    public static final String NAME = "troday_refresh";
    private final AuthProperties properties;
    private final Clock clock;
    public AuthCookies(AuthProperties properties, Clock clock) { this.properties = properties; this.clock = clock; }

    public String set(String token, Instant expiresAt) {
        return cookie(token, Duration.between(clock.instant(), expiresAt));
    }

    public String clear() { return cookie("", Duration.ZERO); }

    private String cookie(String token, Duration duration) {
        return ResponseCookie.from(NAME, token).httpOnly(true).secure(properties.cookieSecure())
                .sameSite("Strict").path("/api/v1/auth").maxAge(duration).build().toString();
    }
}
