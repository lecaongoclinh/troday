package com.troday.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.auth")
public record AuthProperties(String secret, Duration accessTtl, Duration refreshTtl,
                             boolean cookieSecure, List<String> allowedOrigins,
                             int loginLimit, int ipLimit, Duration rateWindow) {
    public AuthProperties {
        if (secret == null || secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("AUTH_SECRET must contain at least 32 UTF-8 bytes");
        }
        if (accessTtl == null || accessTtl.isNegative() || accessTtl.isZero()
                || refreshTtl == null || refreshTtl.compareTo(accessTtl) <= 0
                || rateWindow == null || rateWindow.isNegative() || rateWindow.isZero()
                || loginLimit < 1 || ipLimit < 1 || allowedOrigins == null || allowedOrigins.isEmpty()) {
            throw new IllegalArgumentException("Invalid authentication configuration");
        }
        allowedOrigins = List.copyOf(allowedOrigins);
    }

    @Override
    public String toString() { return "AuthProperties[secret=REDACTED]"; }
}
