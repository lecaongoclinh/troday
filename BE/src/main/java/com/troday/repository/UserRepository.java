package com.troday.repository;

import com.troday.model.PersonalProfile;
import com.troday.model.User;
import com.troday.repository.mapper.PersonalProfileRowMapper;
import com.troday.repository.mapper.UserRowMapper;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.EnumSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private final NamedParameterJdbcTemplate jdbc;
    private final UserRowMapper users = new UserRowMapper();
    private final PersonalProfileRowMapper profiles = new PersonalProfileRowMapper();

    public UserRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<User> findById(long id) {
        return jdbc.query("SELECT * FROM users WHERE id=:id", Map.of("id", id), users).stream().findFirst();
    }

    public Optional<User> findByLogin(String identifier) {
        String column = identifier.contains("@") ? "email" : "phone_number";
        return jdbc.query("SELECT * FROM users WHERE " + column + "=:identifier", Map.of("identifier", identifier), users).stream().findFirst();
    }

    public long createTenant(String name, String email, String phone, String passwordHash, Instant now) {
        var params = new MapSqlParameterSource().addValue("name", name).addValue("email", email)
                .addValue("phone", phone).addValue("password", passwordHash).addValue("now", utc(now));
        var key = new GeneratedKeyHolder();
        jdbc.update("""
                INSERT INTO users(full_name,email,phone_number,password_hash,role,status,created_at,updated_at)
                VALUES (:name,:email,:phone,:password,'TENANT','ACTIVE',:now,:now)
                """, params, key, new String[]{"id"});
        long id = java.util.Objects.requireNonNull(key.getKey()).longValue();
        var child = Map.of("id", id, "now", utc(now));
        jdbc.update("INSERT INTO tenants(id) VALUES (:id)", Map.of("id", id));
        jdbc.update("INSERT INTO personal_profiles(user_id,created_at,updated_at) VALUES (:id,:now,:now)", child);
        return id;
    }

    public Set<User.Role> roles(long userId) {
        var result = EnumSet.noneOf(User.Role.class);
        jdbc.query("""
                SELECT 'TENANT' AS role FROM tenants WHERE id=:id
                UNION ALL SELECT 'LANDLORD' FROM landlords WHERE id=:id
                UNION ALL SELECT 'ADMIN' FROM admins WHERE id=:id
                """, Map.of("id", userId), (rs, row) -> User.Role.valueOf(rs.getString("role"))).forEach(result::add);
        return result;
    }

    public Optional<PersonalProfile> profile(long userId) {
        return jdbc.query("SELECT * FROM personal_profiles WHERE user_id=:id", Map.of("id", userId), profiles).stream().findFirst();
    }

    public static LocalDateTime utc(Instant instant) { return LocalDateTime.ofInstant(instant, ZoneOffset.UTC); }
}
