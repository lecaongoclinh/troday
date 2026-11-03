package com.troday.service;

import com.troday.config.AuthProperties;
import com.troday.dto.request.LoginRequest;
import com.troday.dto.request.RegisterRequest;
import com.troday.dto.response.SessionResponse;
import com.troday.dto.response.UserResponse;
import com.troday.exception.DomainException;
import com.troday.model.AuthSession;
import com.troday.model.User;
import com.troday.repository.SessionRepository;
import com.troday.repository.UserRepository;
import com.troday.security.ActorContext;
import com.troday.security.TokenService;
import com.troday.util.Contacts;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final SessionRepository sessions;
    private final PasswordEncoder passwords;
    private final TokenService tokens;
    private final AuthProperties properties;
    private final Clock clock;
    private final String dummyHash;

    public AuthService(UserRepository users, SessionRepository sessions, PasswordEncoder passwords,
                       TokenService tokens, AuthProperties properties, Clock clock) {
        this.users = users; this.sessions = sessions; this.passwords = passwords;
        this.tokens = tokens; this.properties = properties; this.clock = clock;
        dummyHash = passwords.encode(UUID.randomUUID().toString());
    }

    public record LoginData(String accessToken, Instant expiresAt, UserResponse user) {
        @Override public String toString() { return "LoginData[REDACTED]"; }
    }
    public record Credentials(LoginData data, String refreshToken, Instant refreshExpiresAt) {
        @Override public String toString() { return "Credentials[REDACTED]"; }
    }
    public record SessionPage(List<SessionResponse> data, long total) {}

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = Contacts.email(request.email());
        String phone = Contacts.phone(request.phoneNumber());
        if (email == null && phone == null) throw DomainException.invalid("email", "Cần ít nhất một email hoặc số điện thoại.");
        Contacts.validatePassword(request.password());
        try {
            long id = users.createTenant(request.fullName().strip(), email, phone, passwords.encode(request.password()), clock.instant());
            return me(id);
        } catch (DuplicateKeyException ex) {
            throw new DomainException(HttpStatus.CONFLICT, "STATE_CONFLICT", "Email hoặc số điện thoại đã được sử dụng.");
        }
    }

    @Transactional
    public Credentials login(LoginRequest request) {
        String identifier;
        try { identifier = Contacts.identifier(request.identifier()); }
        catch (DomainException ex) { passwords.matches(request.password(), dummyHash); throw DomainException.unauthenticated(); }
        User user = users.findByLogin(identifier).orElse(null);
        boolean matches = request.password().getBytes(StandardCharsets.UTF_8).length <= 72
                && passwords.matches(request.password(), user == null ? dummyHash : user.passwordHash());
        if (!matches || user == null) throw DomainException.unauthenticated();
        active(user);
        String refresh = tokens.refresh();
        Instant now = clock.instant();
        AuthSession session = sessions.create(user.id(), UUID.randomUUID().toString(), tokens.hash("refresh", refresh), now, now.plus(properties.refreshTtl()));
        return credentials(user, session, refresh);
    }

    @Transactional
    public Credentials refresh(String refresh) {
        if (refresh == null || !refresh.matches("[A-Za-z0-9_-]{43}")) throw DomainException.unauthenticated();
        String oldHash = tokens.hash("refresh", refresh);
        AuthSession session = sessions.lockByRefresh(oldHash).orElseThrow(DomainException::unauthenticated);
        if (session.revokedAt() != null || !session.expiresAt().isAfter(clock.instant())) throw DomainException.unauthenticated();
        User user = users.findById(session.userId()).orElseThrow(DomainException::unauthenticated);
        active(user);
        String replacement = tokens.refresh();
        sessions.rotate(session.id(), oldHash, tokens.hash("refresh", replacement), clock.instant());
        return credentials(user, session, replacement);
    }

    private Credentials credentials(User user, AuthSession session, String refresh) {
        var access = tokens.access(user.id(), session.sessionKey(), session.expiresAt());
        return new Credentials(new LoginData(access.token(), access.expiresAt(), response(user)), refresh, session.expiresAt());
    }

    public ActorContext authenticate(String bearer) {
        var jwt = tokens.decode(bearer);
        AuthSession session = sessions.byKey(jwt.getClaimAsString("sid")).orElseThrow(DomainException::unauthenticated);
        if (session.userId() != Long.parseLong(jwt.getSubject()) || session.revokedAt() != null
                || !session.expiresAt().isAfter(clock.instant())) throw DomainException.unauthenticated();
        User user = users.findById(session.userId()).orElseThrow(DomainException::unauthenticated);
        active(user);
        sessions.touch(session.id(), clock.instant());
        return new ActorContext(user.id(), session.id(), users.roles(user.id()));
    }

    @Transactional(readOnly = true)
    public UserResponse me(long userId) {
        User user = users.findById(userId).orElseThrow(DomainException::unauthenticated);
        active(user);
        return response(user);
    }

    private UserResponse response(User user) { return UserResponse.from(user, users.roles(user.id()), users.profile(user.id()).orElse(null)); }

    @Transactional
    public void revoke(ActorContext actor, long sessionId) {
        if (!sessions.revoke(sessionId, actor.userId(), clock.instant()))
            throw new DomainException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Không tìm thấy phiên.");
    }

    @Transactional(readOnly = true)
    public SessionPage sessions(ActorContext actor, int page, int pageSize, String sort) {
        if (page < 1 || pageSize < 1 || pageSize > 100 || (long)(page - 1) * pageSize > Integer.MAX_VALUE)
            throw DomainException.invalid("page", "page phải ≥1, pageSize từ 1 đến 100.");
        if (!List.of("-createdAt", "createdAt").contains(sort)) throw DomainException.invalid("sort", "Chỉ hỗ trợ createdAt hoặc -createdAt.");
        return new SessionPage(sessions.list(actor.userId(), (page - 1) * pageSize, pageSize, sort.equals("createdAt"))
                .stream().map(s -> SessionResponse.from(s, actor.sessionId())).toList(), sessions.count(actor.userId()));
    }

    private static void active(User user) {
        if (user.status() != User.Status.ACTIVE)
            throw new DomainException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Tài khoản đã bị khóa hoặc vô hiệu hóa.");
    }
}
