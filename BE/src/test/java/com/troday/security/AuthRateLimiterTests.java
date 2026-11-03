package com.troday.security;

import com.troday.config.AuthProperties;
import com.troday.exception.DomainException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class AuthRateLimiterTests {
    @Test
    void limitsAccountAcrossIpsAndResetsAfterWindow() {
        var clock = new MutableClock();
        var properties = new AuthProperties("rate-test-secret-longer-than-32-bytes", Duration.ofMinutes(15), Duration.ofDays(30),
                true, List.of("http://localhost:5173"), 2, 10, Duration.ofMinutes(15));
        var limiter = new AuthRateLimiter(clock, properties, new TokenService(properties, clock));
        limiter.check("login", "ip1", "test@example.com");
        limiter.check("login", "ip2", "test@example.com");
        assertThatThrownBy(() -> limiter.check("login", "ip3", "test@example.com")).isInstanceOf(DomainException.class);
        clock.now = clock.now.plus(Duration.ofMinutes(15));
        assertThatCode(() -> limiter.check("login", "ip3", "test@example.com")).doesNotThrowAnyException();
    }
    private static class MutableClock extends Clock {
        Instant now = Instant.parse("2026-11-03T00:00:00Z");
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
    }
}
