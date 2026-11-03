package com.troday.security;

import com.troday.config.AuthProperties;
import com.troday.exception.DomainException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class TokenServiceTests {
    private final Instant now = Instant.parse("2026-11-03T00:00:00Z");
    private final AuthProperties properties = new AuthProperties("test-secret-which-is-longer-than-32-bytes", Duration.ofMinutes(15),
            Duration.ofDays(30), true, List.of("http://localhost:5173"), 10, 30, Duration.ofMinutes(15));
    private TokenService service(Instant time) { return new TokenService(properties, Clock.fixed(time, ZoneOffset.UTC)); }

    @Test
    void validJwtBindsSubjectAndSessionAndExpiresWithoutClockSkew() {
        String session = UUID.randomUUID().toString();
        var access = service(now).access(42, session, now.plusSeconds(60));
        assertThat(access.expiresAt()).isEqualTo(now.plusSeconds(60));
        var decoded = service(now).decode(access.token());
        assertThat(decoded.getSubject()).isEqualTo("42");
        assertThat(decoded.getClaimAsString("sid")).isEqualTo(session);
        assertThatThrownBy(() -> service(now.plusSeconds(60)).decode(access.token())).isInstanceOf(DomainException.class);
    }

    @Test
    void tamperedAndMalformedTokensAreRejected() {
        var access = service(now).access(1, UUID.randomUUID().toString(), now.plusSeconds(3600));
        String[] parts = access.token().split("\\.");
        String tampered = parts[0] + "." + java.util.Base64.getUrlEncoder().withoutPadding().encodeToString("{\"sub\":\"2\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8)) + "." + parts[2];
        assertThatThrownBy(() -> service(now).decode(tampered)).isInstanceOf(DomainException.class);
        assertThatThrownBy(() -> service(now).decode("garbage")).isInstanceOf(DomainException.class);
    }

    @Test
    void refreshTokensAreRandomAndCachedRepliesAreAuthenticatedAndEncrypted() {
        var tokens = service(now);
        assertThat(tokens.refresh()).hasSize(43).isNotEqualTo(tokens.refresh());
        assertThat(tokens.hash("refresh", "value")).hasSize(64).isNotEqualTo(tokens.hash("other-purpose", "value"));
        String encrypted = tokens.encrypt("sensitive-token");
        assertThat(encrypted).doesNotContain("sensitive-token");
        assertThat(tokens.decrypt(encrypted)).isEqualTo("sensitive-token");
        assertThat(tokens.encrypt("sensitive-token")).isNotEqualTo(encrypted);
        byte[] bytes = java.util.Base64.getDecoder().decode(encrypted);
        bytes[bytes.length - 1] ^= 1;
        assertThatThrownBy(() -> tokens.decrypt(java.util.Base64.getEncoder().encodeToString(bytes))).isInstanceOf(IllegalStateException.class);
    }
}
