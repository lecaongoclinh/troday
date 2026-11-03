package com.troday.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.troday.config.AuthProperties;
import com.troday.exception.DomainException;
import com.troday.service.AuthService;
import com.troday.util.Responses;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class ApiAuthenticationFilter extends OncePerRequestFilter {
    private final AuthService auth;
    private final AuthProperties properties;
    private final ObjectMapper json;
    private final Responses responses;

    public ApiAuthenticationFilter(AuthService auth, AuthProperties properties, ObjectMapper json, Responses responses) {
        this.auth = auth; this.properties = properties; this.json = json; this.responses = responses;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            // Cookie endpoints require an allowlisted Origin even if no Bearer token is supplied.
            if (request.getMethod().equals("POST") && request.getRequestURI().startsWith("/api/v1/auth/")) {
                String origin = request.getHeader("Origin");
                boolean cookieCommand = List.of("/api/v1/auth/refresh", "/api/v1/auth/logout").contains(request.getRequestURI());
                if ((cookieCommand && origin == null) || (origin != null && !properties.allowedOrigins().contains(origin)))
                    throw new DomainException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Origin không được phép.");
            }
            String header = request.getHeader("Authorization");
            boolean publicCommand = request.getMethod().equals("POST") && List.of("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh").contains(request.getRequestURI());
            if (header != null && !publicCommand) {
                if (!header.regionMatches(true, 0, "Bearer ", 0, 7) || header.length() > 4096) throw DomainException.unauthenticated();
                var actor = auth.authenticate(header.substring(7));
                var authorities = actor.roles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).toList();
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(actor, null, authorities));
            }
        } catch (DomainException ex) {
            write(response, request, ex.status().value(), ex.code(), ex.getMessage());
            return;
        } catch (DataAccessException ex) {
            write(response, request, 503, "DEPENDENCY_UNAVAILABLE", "Cơ sở dữ liệu tạm thời không sẵn sàng.");
            return;
        }
        chain.doFilter(request, response);
    }

    private void write(HttpServletResponse response, HttpServletRequest request, int status, String code, String message) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (status == 401) response.setHeader("WWW-Authenticate", "Bearer");
        json.writeValue(response.getOutputStream(), responses.error(code, message, List.of(), request));
    }
}
