package com.troday.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.troday.dto.response.UserResponse;
import com.troday.exception.DomainException;
import com.troday.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final NamedParameterJdbcTemplate jdbc;
    private final UserRepository users;
    private final AuthService auth;
    private final Clock clock;

    public ProfileService(NamedParameterJdbcTemplate jdbc, UserRepository users, AuthService auth, Clock clock) {
        this.jdbc = jdbc; this.users = users; this.auth = auth; this.clock = clock;
    }

    @Transactional
    public UserResponse.Profile update(long userId, ObjectNode body) {
        whitelist(body, Set.of("fullName", "address", "gender", "occupation", "university", "bio", "avatarFileId"));
        if (!body.hasNonNull("fullName")) throw DomainException.invalid("fullName", "Cần họ tên.");
        lock(userId);
        var profile = users.profile(userId).orElseThrow(() -> new IllegalStateException("Missing personal profile"));
        var params = new MapSqlParameterSource().addValue("id", userId).addValue("now", UserRepository.utc(clock.instant()));
        params.addValue("name", text(body.get("fullName"), "fullName", 150, false));
        params.addValue("address", body.has("address") ? text(body.get("address"), "address", 500, true) : profile.address());
        params.addValue("gender", body.has("gender") ? text(body.get("gender"), "gender", 30, true) : profile.gender());
        params.addValue("occupation", body.has("occupation") ? text(body.get("occupation"), "occupation", 150, true) : profile.occupation());
        params.addValue("university", body.has("university") ? text(body.get("university"), "university", 200, true) : profile.university());
        String bio = body.has("bio") ? text(body.get("bio"), "bio", 10_000, true) : profile.bio();
        if (bio != null && bio.getBytes(StandardCharsets.UTF_8).length > 65_535) throw DomainException.invalid("bio", "Tiểu sử quá dài.");
        params.addValue("bio", bio);
        Long avatarId = profile.avatarFileId();
        if (body.has("avatarFileId")) {
            JsonNode avatar = body.get("avatarFileId");
            avatarId = null;
            if (!avatar.isNull()) {
                try {
                    if (!avatar.isTextual() || !avatar.asText().matches("[1-9][0-9]*")) throw new NumberFormatException();
                    avatarId = Long.parseLong(avatar.asText());
                } catch (NumberFormatException ex) { throw DomainException.invalid("avatarFileId", "ID phải là chuỗi số nguyên dương."); }
                var ids = jdbc.queryForList("""
                        SELECT id FROM files WHERE id=:file AND owner_user_id=:user AND status='ACTIVE' AND purpose='AVATAR' FOR UPDATE
                        """, Map.of("file", avatarId, "user", userId), Long.class);
                if (ids.isEmpty()) throw DomainException.invalid("avatarFileId", "Ảnh đại diện không thuộc tài khoản hoặc chưa sẵn sàng.");
            }
        }
        params.addValue("avatar", avatarId);
        jdbc.update("UPDATE users SET full_name=:name,updated_at=:now WHERE id=:id", params);
        jdbc.update("""
                UPDATE personal_profiles SET address=:address,gender=:gender,occupation=:occupation,university=:university,
                bio=:bio,avatar_file_id=:avatar,updated_at=:now WHERE user_id=:id
                """, params);
        return UserResponse.Profile.from(users.profile(userId).orElseThrow());
    }

    @Transactional
    public UserResponse.NotificationSettings settings(long userId, ObjectNode body) {
        whitelist(body, Set.of("inAppEnabled", "emailEnabled", "pushEnabled"));
        body.fields().forEachRemaining(e -> {
            if (!e.getValue().isBoolean()) throw DomainException.invalid(e.getKey(), "Cần giá trị boolean.");
            if (!e.getKey().equals("inAppEnabled") && e.getValue().booleanValue())
                throw DomainException.invalid(e.getKey(), "Kênh gửi này chưa được cấu hình.");
        });
        lock(userId);
        var user = auth.me(userId).notificationSettings();
        var params = new MapSqlParameterSource().addValue("id", userId).addValue("now", UserRepository.utc(clock.instant()))
                .addValue("inApp", body.has("inAppEnabled") ? body.get("inAppEnabled").booleanValue() : user.inAppEnabled())
                .addValue("email", body.has("emailEnabled") ? body.get("emailEnabled").booleanValue() : user.emailEnabled())
                .addValue("push", body.has("pushEnabled") ? body.get("pushEnabled").booleanValue() : user.pushEnabled());
        jdbc.update("UPDATE users SET in_app_enabled=:inApp,email_enabled=:email,push_enabled=:push,updated_at=:now WHERE id=:id", params);
        return auth.me(userId).notificationSettings();
    }

    private void lock(long userId) {
        jdbc.queryForObject("SELECT id FROM users WHERE id=:id FOR UPDATE", Map.of("id", userId), Long.class);
    }

    private static String text(JsonNode node, String field, int max, boolean nullable) {
        if (node.isNull() && nullable) return null;
        if (!node.isTextual()) throw DomainException.invalid(field, "Cần chuỗi ký tự.");
        String value = node.textValue().strip();
        if ((!nullable && value.isEmpty()) || value.length() > max) throw DomainException.invalid(field, "Độ dài không hợp lệ; tối đa " + max + " ký tự.");
        return value;
    }

    private static void whitelist(ObjectNode body, Set<String> allowed) {
        if (body.isEmpty()) throw DomainException.invalid("body", "Cần ít nhất một field.");
        body.fieldNames().forEachRemaining(name -> {
            if (!allowed.contains(name)) throw new DomainException(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Field không được phép: " + name);
        });
    }
}
