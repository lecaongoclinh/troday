package com.troday.security;

import com.troday.config.AuthProperties;
import com.troday.exception.DomainException;
import java.time.Clock;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class AuthRateLimiter {
    private record Window(long startsAt, int count) {}
    private final Map<String, Window> windows = new HashMap<>();
    private final Clock clock;
    private final AuthProperties properties;
    private final TokenService tokens;

    public AuthRateLimiter(Clock clock, AuthProperties properties, TokenService tokens) {
        this.clock = clock; this.properties = properties; this.tokens = tokens;
    }

    public void check(String operation, String ip, String identifier) {
        hit(operation + ":ip:" + ip, properties.ipLimit());
        if (identifier != null) hit(operation + ":account:" + tokens.hash("rate-limit", identifier), properties.loginLimit());
    }

    private synchronized void hit(String key, int limit) {
        long now = clock.millis();
        long duration = properties.rateWindow().toMillis();
        if (windows.size() >= 10_000) windows.entrySet().removeIf(e -> now - e.getValue().startsAt() >= duration);
        Window old = windows.get(key);
        if (old == null && windows.size() >= 10_000) limited();
        Window window = old == null || now - old.startsAt() >= duration ? new Window(now, 0) : old;
        if (window.count() >= limit) limited();
        windows.put(key, new Window(window.startsAt(), window.count() + 1));
    }

    private static void limited() {
        throw new DomainException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "Vui lòng thử lại sau.");
    }
}
