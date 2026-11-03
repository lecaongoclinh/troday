package com.troday.repository;

import com.troday.model.AuthSession;
import com.troday.repository.mapper.AuthSessionRowMapper;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import static com.troday.repository.UserRepository.utc;

@Repository
public class SessionRepository {
    private final NamedParameterJdbcTemplate jdbc;
    private final AuthSessionRowMapper mapper = new AuthSessionRowMapper();
    public SessionRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }

    public AuthSession create(long userId, String key, String hash, Instant now, Instant expiresAt) {
        jdbc.update("""
                INSERT INTO auth_sessions(user_id,session_key,refresh_token_hash,expires_at,last_seen_at,created_at,updated_at)
                VALUES (:userId,:key,:hash,:expires,:now,:now,:now)
                """, Map.of("userId", userId, "key", key, "hash", hash, "now", utc(now), "expires", utc(expiresAt)));
        return byKey(key).orElseThrow();
    }

    public Optional<AuthSession> byKey(String key) {
        return jdbc.query("SELECT * FROM auth_sessions WHERE session_key=:key", Map.of("key", key), mapper).stream().findFirst();
    }

    public Optional<AuthSession> lockByRefresh(String hash) {
        return jdbc.query("SELECT * FROM auth_sessions WHERE refresh_token_hash=:hash FOR UPDATE", Map.of("hash", hash), mapper).stream().findFirst();
    }

    public void rotate(long id, String oldHash, String newHash, Instant now) {
        int changed = jdbc.update("""
                UPDATE auth_sessions SET refresh_token_hash=:hash,last_seen_at=:now,updated_at=:now
                WHERE id=:id AND refresh_token_hash=:oldHash AND revoked_at IS NULL AND expires_at>:now
                """, Map.of("id", id, "oldHash", oldHash, "hash", newHash, "now", utc(now)));
        if (changed != 1) throw com.troday.exception.DomainException.unauthenticated();
    }

    public void touch(long id, Instant now) {
        jdbc.update("""
                UPDATE auth_sessions SET last_seen_at=:now,updated_at=:now
                WHERE id=:id AND revoked_at IS NULL AND (last_seen_at IS NULL OR last_seen_at<:threshold)
                """, Map.of("id", id, "now", utc(now), "threshold", utc(now.minusSeconds(60))));
    }

    public boolean revoke(long id, long userId, Instant now) {
        var params = Map.of("id", id, "userId", userId, "now", utc(now));
        if (jdbc.queryForObject("SELECT COUNT(*) FROM auth_sessions WHERE id=:id AND user_id=:userId", params, Long.class) == 0) return false;
        jdbc.update("""
                UPDATE auth_sessions SET revoked_at=:now,refresh_token_hash=NULL,revocation_reason='USER_LOGOUT',updated_at=:now
                WHERE id=:id AND user_id=:userId AND revoked_at IS NULL
                """, params);
        return true;
    }

    public List<AuthSession> list(long userId, int offset, int size, boolean ascending) {
        String direction = ascending ? "ASC" : "DESC";
        return jdbc.query("SELECT * FROM auth_sessions WHERE user_id=:id ORDER BY created_at " + direction + ",id " + direction + " LIMIT :size OFFSET :offset",
                Map.of("id", userId, "offset", offset, "size", size), mapper);
    }

    public long count(long userId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM auth_sessions WHERE user_id=:id", Map.of("id", userId), Long.class);
    }
}
