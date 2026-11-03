package com.troday.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.troday.exception.DomainException;
import com.troday.security.TokenService;
import com.troday.util.Responses;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdempotencyExecutor {
    private record CacheRow(String hash, String ciphertext, LocalDateTime expiresAt) {}
    public record Command(int status, Object data, String cookie) {}
    public record StoredReply(int status, String body, String cookie) {
        @Override public String toString() { return "StoredReply[REDACTED]"; }
    }
    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper json;
    private final TokenService tokens;
    private final Clock clock;
    private final Responses responses;

    public IdempotencyExecutor(NamedParameterJdbcTemplate jdbc, ObjectMapper json, TokenService tokens, Clock clock, Responses responses) {
        this.jdbc = jdbc; this.json = json; this.tokens = tokens; this.clock = clock; this.responses = responses;
    }

    // The business write and the cached result commit together. Concurrent duplicate keys serialize in MySQL.
    @Transactional(timeout = 30)
    public ResponseEntity<String> execute(String key, String scope, Object fingerprint,
                                          HttpServletRequest request, Supplier<Command> command) {
        UUID uuid;
        try {
            uuid = UUID.fromString(key);
            if (!uuid.toString().equalsIgnoreCase(key)) throw new IllegalArgumentException();
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new DomainException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Cần header Idempotency-Key là UUID hợp lệ.");
        }
        try {
            String hash = tokens.hash("idempotency", json.writeValueAsString(fingerprint));
            var now = LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
            var params = Map.of("scope", scope, "key", uuid.toString(), "hash", hash, "expires", now.plusHours(24));
            jdbc.update("""
                    INSERT INTO api_idempotency(request_scope,request_key,request_hash,expires_at)
                    VALUES (:scope,:key,:hash,:expires)
                    ON DUPLICATE KEY UPDATE request_key=request_key
                    """, params);
            var row = jdbc.queryForObject("SELECT * FROM api_idempotency WHERE request_scope=:scope AND request_key=:key FOR UPDATE", params,
                    (rs, n) -> new CacheRow(rs.getString("request_hash"), rs.getString("response_ciphertext"), rs.getObject("expires_at", LocalDateTime.class)));
            if (row.expiresAt().isAfter(now)) {
                if (!hash.equals(row.hash()))
                    throw new DomainException(HttpStatus.CONFLICT, "IDEMPOTENCY_KEY_REUSED", "Khóa đã được sử dụng cho request khác.");
                if (row.ciphertext() != null) {
                    var stored = json.readValue(tokens.decrypt(row.ciphertext()), StoredReply.class);
                    request.setAttribute("requestId", json.readTree(stored.body()).path("meta").path("requestId").asText());
                    return reply(stored);
                }
            }
            Command result = command.get();
            var stored = new StoredReply(result.status(), json.writeValueAsString(responses.ok(result.data(), request)), result.cookie());
            jdbc.update("""
                    UPDATE api_idempotency SET request_hash=:hash,response_ciphertext=:response,expires_at=:expires
                    WHERE request_scope=:scope AND request_key=:key
                    """, new org.springframework.jdbc.core.namedparam.MapSqlParameterSource(params)
                    .addValue("response", tokens.encrypt(json.writeValueAsString(stored))));
            return reply(stored);
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) {
            throw new IllegalStateException("Cannot serialize authentication reply", ex);
        }
    }

    private ResponseEntity<String> reply(StoredReply value) {
        var builder = ResponseEntity.status(value.status()).contentType(MediaType.APPLICATION_JSON);
        try {
            builder.header("X-Request-Id", json.readTree(value.body()).path("meta").path("requestId").asText());
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) { throw new IllegalStateException(ex); }
        if (value.cookie() != null) builder.header(HttpHeaders.SET_COOKIE, value.cookie());
        return builder.body(value.body());
    }
}
