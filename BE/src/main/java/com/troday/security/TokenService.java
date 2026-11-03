package com.troday.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.troday.config.AuthProperties;
import com.troday.exception.DomainException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final AuthProperties properties;
    private final Clock clock;
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final byte[] key;
    private final SecureRandom random = new SecureRandom();

    public TokenService(AuthProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        this.key = properties.secret().getBytes(StandardCharsets.UTF_8);
        encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        var jwtDecoder = NimbusJwtDecoder.withSecretKey(new SecretKeySpec(key, "HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256).build();
        var timestamp = new JwtTimestampValidator(Duration.ZERO);
        timestamp.setClock(clock);
        jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(timestamp, new JwtIssuerValidator("troday")));
        decoder = jwtDecoder;
    }

    public record Access(String token, Instant expiresAt) {
        @Override public String toString() { return "Access[REDACTED]"; }
    }

    public Access access(long userId, String sessionKey, Instant sessionExpiry) {
        Instant now = clock.instant();
        Instant expires = now.plus(properties.accessTtl());
        if (expires.isAfter(sessionExpiry)) expires = sessionExpiry;
        var claims = JwtClaimsSet.builder().issuer("troday").subject(Long.toString(userId)).issuedAt(now)
                .notBefore(now).expiresAt(expires).id(UUID.randomUUID().toString()).claim("sid", sessionKey).build();
        String token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new Access(token, expires);
    }

    public Jwt decode(String token) {
        try {
            Jwt jwt = decoder.decode(token);
            if (jwt.getExpiresAt() == null || jwt.getIssuedAt() == null || !jwt.getExpiresAt().isAfter(clock.instant())
                    || jwt.getIssuedAt().isAfter(clock.instant())) throw DomainException.unauthenticated();
            UUID.fromString(jwt.getClaimAsString("sid"));
            if (Long.parseLong(jwt.getSubject()) <= 0) throw DomainException.unauthenticated();
            return jwt;
        } catch (JwtException | IllegalArgumentException | NullPointerException ex) {
            throw DomainException.unauthenticated();
        }
    }

    public String refresh() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String purpose, String value) {
        return java.util.HexFormat.of().formatHex(mac(purpose + "\u0000" + value));
    }

    private byte[] mac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (java.security.GeneralSecurityException ex) { throw new IllegalStateException(ex); }
    }

    // Cached authentication replies contain tokens: encrypt at rest with a separate derived key.
    public String encrypt(String value) { return crypt(value, true); }
    public String decrypt(String value) { return crypt(value, false); }

    private String crypt(String value, boolean encrypt) {
        try {
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            byte[] nonce = new byte[12];
            byte[] input;
            if (encrypt) {
                random.nextBytes(nonce);
                input = value.getBytes(StandardCharsets.UTF_8);
            } else {
                byte[] bytes = Base64.getDecoder().decode(value);
                System.arraycopy(bytes, 0, nonce, 0, 12);
                input = java.util.Arrays.copyOfRange(bytes, 12, bytes.length);
            }
            cipher.init(encrypt ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE,
                    new SecretKeySpec(mac("troday-idempotency-encryption-v1"), "AES"), new GCMParameterSpec(128, nonce));
            byte[] result = cipher.doFinal(input);
            if (!encrypt) return new String(result, StandardCharsets.UTF_8);
            return Base64.getEncoder().encodeToString(java.nio.ByteBuffer.allocate(12 + result.length).put(nonce).put(result).array());
        } catch (java.security.GeneralSecurityException ex) { throw new IllegalStateException("Cannot process encrypted authentication reply", ex); }
    }
}
