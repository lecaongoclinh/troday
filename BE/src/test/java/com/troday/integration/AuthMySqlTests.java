package com.troday.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("mysql-test")
@EnabledIfEnvironmentVariable(named = "TRODAY_MYSQL_TEST_URL", matches = ".+")
class AuthMySqlTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder passwords;
    private static final String PASSWORD = "integration-password-2026";
    private static final String ORIGIN = "http://localhost:5173";

    private String email() { return "test-" + UUID.randomUUID() + "@example.com"; }
    private String key() { return UUID.randomUUID().toString(); }
    private MockHttpServletRequestBuilder header(MockHttpServletRequestBuilder builder, String name, String value) {
        return builder.with(request -> { request.removeHeader(name); request.addHeader(name, value); return request; });
    }
    private MockHttpServletRequestBuilder command(String path, Object body) throws Exception {
        var request = post("/api/v1" + path).header("Idempotency-Key", key()).header("Origin", ORIGIN);
        return body == null ? request : request.contentType("application/json").content(json.writeValueAsString(body));
    }
    private JsonNode data(MvcResult result) throws Exception { return json.readTree(result.getResponse().getContentAsString()).path("data"); }
    private JsonNode register(String email) throws Exception {
        return data(mvc.perform(command("/auth/register", Map.of("fullName", "Nguyễn Văn Test", "email", email, "password", PASSWORD)))
                .andExpect(status().isCreated()).andReturn());
    }
    private MvcResult login(String email) throws Exception {
        return mvc.perform(command("/auth/login", Map.of("identifier", email, "password", PASSWORD)))
                .andExpect(status().isOk()).andExpect(cookie().httpOnly("troday_refresh", true))
                .andExpect(cookie().secure("troday_refresh", true)).andReturn();
    }

    @Test
    void registrationPersistsTenantProfileAndHashWithStringIds() throws Exception {
        String email = email();
        var user = register("  " + email.toUpperCase(java.util.Locale.ROOT) + "  ");
        assertThat(user.path("id").isTextual()).isTrue();
        assertThat(user.path("email").asText()).isEqualTo(email);
        assertThat(user.path("roles").get(0).asText()).isEqualTo("TENANT");
        long id = user.path("id").asLong();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM tenants WHERE id=?", Long.class, id)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM personal_profiles WHERE user_id=?", Long.class, id)).isEqualTo(1);
        assertThat(passwords.matches(PASSWORD, jdbc.queryForObject("SELECT password_hash FROM users WHERE id=?", String.class, id))).isTrue();
        assertThat(user.has("passwordHash")).isFalse();
        mvc.perform(command("/auth/register", Map.of("fullName", "Test", "email", email, "password", PASSWORD)))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.error.code").value("STATE_CONFLICT"));
    }

    @Test
    void rejectsInvalidInputsAndPrivilegeFields() throws Exception {
        mvc.perform(command("/auth/register", Map.of("fullName", "Test", "password", PASSWORD))).andExpect(status().isUnprocessableEntity());
        mvc.perform(command("/auth/register", Map.of("fullName", "Test", "email", email(), "password", PASSWORD, "role", "ADMIN")))
                .andExpect(status().isBadRequest());
        mvc.perform(command("/auth/register", Map.of("fullName", "Test", "email", "bad", "password", PASSWORD)))
                .andExpect(status().isUnprocessableEntity());
        mvc.perform(command("/auth/register", Map.of("fullName", "Test", "email", email(), "password", "á".repeat(40))))
                .andExpect(status().isUnprocessableEntity());
        mvc.perform(post("/api/v1/auth/register").contentType("application/json")
                        .content(json.writeValueAsString(Map.of("fullName", "Test", "email", email(), "password", PASSWORD))))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.error.code").value("UNAUTHENTICATED"));
    }

    @Test
    void normalizesVietnamesePhoneAndLogsInWithInternationalFormat() throws Exception {
        String phone = "09" + String.format("%08d", java.util.concurrent.ThreadLocalRandom.current().nextInt(100_000_000));
        var result = mvc.perform(command("/auth/register", Map.of("fullName", "Test", "phoneNumber", phone, "password", PASSWORD)))
                .andExpect(status().isCreated()).andReturn();
        assertThat(data(result).path("phoneNumber").asText()).isEqualTo("+84" + phone.substring(1));
        mvc.perform(command("/auth/login", Map.of("identifier", "+84" + phone.substring(1), "password", PASSWORD))).andExpect(status().isOk());
    }

    @Test
    void passwordAndStatusAreCheckedAndRolesComeFromRoleTables() throws Exception {
        String email = email();
        long id = register(email).path("id").asLong();
        mvc.perform(command("/auth/login", Map.of("identifier", email, "password", "wrong-password"))).andExpect(status().isUnauthorized());
        mvc.perform(command("/auth/login", Map.of("identifier", email(), "password", PASSWORD))).andExpect(status().isUnauthorized());
        String access = data(login(email)).path("accessToken").asText();
        jdbc.update("UPDATE users SET role='ADMIN' WHERE id=?", id);
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.roles[0]").value("TENANT"));
        jdbc.update("INSERT INTO landlords(id) VALUES (?)", id);
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roles", org.hamcrest.Matchers.hasItem("LANDLORD")));
        jdbc.update("UPDATE users SET status='LOCKED' WHERE id=?", id);
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access)).andExpect(status().isForbidden());
        mvc.perform(command("/auth/login", Map.of("identifier", email, "password", PASSWORD))).andExpect(status().isForbidden());
        jdbc.update("UPDATE users SET status='DISABLED' WHERE id=?", id);
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access)).andExpect(status().isForbidden());
    }

    @Test
    void refreshRotatesAtomicallyAndRevocationInvalidatesAccess() throws Exception {
        String email = email(); register(email);
        var original = login(email);
        String token = data(original).path("accessToken").asText();
        Cookie oldCookie = original.getResponse().getCookie("troday_refresh");
        assertThat(oldCookie).isNotNull();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM auth_sessions WHERE refresh_token_hash=?", Long.class, oldCookie.getValue())).isZero();
        mvc.perform(post("/api/v1/auth/refresh").header("Idempotency-Key", key()).cookie(oldCookie)).andExpect(status().isForbidden());
        mvc.perform(header(command("/auth/refresh", null), "Origin", "https://evil.example").cookie(oldCookie)).andExpect(status().isForbidden());
        var refreshed = mvc.perform(command("/auth/refresh", null).cookie(oldCookie)).andExpect(status().isOk()).andReturn();
        assertThat(refreshed.getResponse().getCookie("troday_refresh").getValue()).isNotEqualTo(oldCookie.getValue());
        mvc.perform(command("/auth/refresh", null).cookie(oldCookie)).andExpect(status().isUnauthorized());
        mvc.perform(command("/auth/logout", null).header("Authorization", "Bearer " + token)).andExpect(status().isOk())
                .andExpect(cookie().maxAge("troday_refresh", 0));
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized());
        mvc.perform(command("/auth/refresh", null).cookie(refreshed.getResponse().getCookie("troday_refresh"))).andExpect(status().isUnauthorized());
    }

    @Test
    void sessionListsAreScopedPaginatedAndRevocationIsIdempotent() throws Exception {
        String email = email(); register(email);
        String access1 = data(login(email)).path("accessToken").asText();
        String access2 = data(login(email)).path("accessToken").asText();
        var result = mvc.perform(get("/api/v1/me/sessions?pageSize=1").header("Authorization", "Bearer " + access1))
                .andExpect(status().isOk()).andExpect(jsonPath("$.meta.pagination.total").value(2)).andReturn();
        String newestId = data(result).get(0).path("id").asText();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("sessionKey", "refreshTokenHash");
        for (int i = 0; i < 2; i++) mvc.perform(delete("/api/v1/me/sessions/" + newestId).header("Authorization", "Bearer " + access1)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access2)).andExpect(status().isUnauthorized());
        String other = email(); register(other);
        String otherAccess = data(login(other)).path("accessToken").asText();
        mvc.perform(delete("/api/v1/me/sessions/" + newestId).header("Authorization", "Bearer " + otherAccess)).andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/me/sessions?page=0").header("Authorization", "Bearer " + access1)).andExpect(status().isUnprocessableEntity());
        mvc.perform(get("/api/v1/me/sessions?sort=id;DROP").header("Authorization", "Bearer " + access1)).andExpect(status().isUnprocessableEntity());
    }

    @Test
    void repeatedCommandsReplayResultAndChangedPayloadConflicts() throws Exception {
        String email = email();
        String key = key();
        var body = Map.of("fullName", "Test", "email", email, "password", PASSWORD);
        var first = mvc.perform(header(command("/auth/register", body), "Idempotency-Key", key)).andExpect(status().isCreated()).andReturn();
        var replay = mvc.perform(header(command("/auth/register", body), "Idempotency-Key", key)).andExpect(status().isCreated()).andReturn();
        assertThat(replay.getResponse().getContentAsString()).isEqualTo(first.getResponse().getContentAsString());
        mvc.perform(header(command("/auth/register", Map.of("fullName", "Other", "email", email, "password", PASSWORD)), "Idempotency-Key", key))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.error.code").value("IDEMPOTENCY_KEY_REUSED"));
        assertThat(jdbc.queryForObject("SELECT response_ciphertext FROM api_idempotency WHERE request_scope='public:POST:/auth/register' AND request_key=?", String.class, key))
                .doesNotContain(email, PASSWORD, "requestId");
    }

    @Test
    void profileWhitelistsAndNotificationSupportAreEnforced() throws Exception {
        String email = email(); register(email);
        String access = data(login(email)).path("accessToken").asText();
        mvc.perform(patch("/api/v1/me/profile").header("Authorization", "Bearer " + access).contentType("application/json")
                        .content("{\"fullName\":\"Tên mới\",\"bio\":\"Xin chào\",\"address\":null}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.bio").value("Xin chào"));
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access)).andExpect(jsonPath("$.data.fullName").value("Tên mới"));
        mvc.perform(patch("/api/v1/me/profile").header("Authorization", "Bearer " + access).contentType("application/json")
                        .content("{\"fullName\":\"Test\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/v1/me/notification-settings").header("Authorization", "Bearer " + access).contentType("application/json")
                        .content("{\"inAppEnabled\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.inAppEnabled").value(false));
        mvc.perform(patch("/api/v1/me/notification-settings").header("Authorization", "Bearer " + access).contentType("application/json")
                        .content("{\"pushEnabled\":true}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void registrationRollsBackAllWritesWhenProfileWriteFails() throws Exception {
        String email = email();
        jdbc.execute("CREATE TRIGGER auth_test_fail_profile BEFORE INSERT ON personal_profiles FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='test failure'");
        try {
            mvc.perform(command("/auth/register", Map.of("fullName", "Test", "email", email, "password", PASSWORD))).andExpect(status().isServiceUnavailable());
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE email=?", Long.class, email)).isZero();
        } finally {
            jdbc.execute("DROP TRIGGER auth_test_fail_profile");
        }
    }

    @Test
    void concurrentRefreshOnlyAcceptsOldTokenOnce() throws Exception {
        String email = email(); register(email);
        Cookie original = login(email).getResponse().getCookie("troday_refresh");
        var gate = new java.util.concurrent.CountDownLatch(1);
        try (var pool = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<Integer> refresh = () -> {
                gate.await();
                return mvc.perform(command("/auth/refresh", null).cookie(original)).andReturn().getResponse().getStatus();
            };
            var first = pool.submit(refresh);
            var second = pool.submit(refresh);
            gate.countDown();
            assertThat(java.util.List.of(first.get(15, java.util.concurrent.TimeUnit.SECONDS), second.get(15, java.util.concurrent.TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(200, 401);
        }
    }

    @Test
    void expiredSessionRejectsBothAccessAndRefresh() throws Exception {
        String email = email();
        long id = register(email).path("id").asLong();
        var login = login(email);
        String access = data(login).path("accessToken").asText();
        jdbc.update("UPDATE auth_sessions SET created_at=UTC_TIMESTAMP(6)-INTERVAL 2 HOUR,expires_at=UTC_TIMESTAMP(6)-INTERVAL 1 HOUR WHERE user_id=?", id);
        mvc.perform(get("/api/v1/me").header("Authorization", "Bearer " + access)).andExpect(status().isUnauthorized());
        mvc.perform(command("/auth/refresh", null).cookie(login.getResponse().getCookie("troday_refresh"))).andExpect(status().isUnauthorized());
    }
}
