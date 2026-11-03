package com.troday.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.troday.security.ApiAuthenticationFilter;
import com.troday.security.RequestContextFilter;
import com.troday.service.AuthService;
import com.troday.util.Responses;
import java.util.List;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthService auth, AuthProperties properties,
                                            ObjectMapper json, Responses responses) throws Exception {
        var cors = new CorsConfiguration();
        cors.setAllowedOrigins(properties.allowedOrigins());
        cors.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type", "Idempotency-Key"));
        cors.setExposedHeaders(List.of("X-Request-Id", "Retry-After"));
        cors.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/v1/**", cors);
        http.cors(c -> c.configurationSource(source));
        // No servlet session or ambient-cookie authentication. Cookie commands enforce Origin in the API filter.
        http.csrf(c -> c.disable()).sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.requestCache(c -> c.disable()).formLogin(c -> c.disable()).httpBasic(c -> c.disable()).logout(c -> c.disable());
        http.addFilterBefore(new RequestContextFilter(), SecurityContextHolderFilter.class);
        http.addFilterBefore(new ApiAuthenticationFilter(auth, properties, json, responses), UsernamePasswordAuthenticationFilter.class);
        http.authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/me", "/api/v1/me/sessions").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/me/sessions/*").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/v1/me/profile", "/api/v1/me/notification-settings").authenticated()
                .anyRequest().denyAll());
        http.exceptionHandling(exceptions -> exceptions.authenticationEntryPoint((request, response, ex) -> {
            response.setStatus(401);
            response.setHeader("WWW-Authenticate", "Bearer");
            response.setContentType("application/json;charset=UTF-8");
            json.writeValue(response.getOutputStream(), responses.error("UNAUTHENTICATED", "Cần đăng nhập.", List.of(), request));
        }).accessDeniedHandler((request, response, ex) -> {
            response.setStatus(403);
            response.setContentType("application/json;charset=UTF-8");
            json.writeValue(response.getOutputStream(), responses.error("FORBIDDEN", "Không có quyền truy cập.", List.of(), request));
        }));
        return http.build();
    }
}
