package com.troday.api.web;

import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.*;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {
    @org.springframework.beans.factory.annotation.Value("${troday.cors.origins:http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:8082,http://localhost:8082}") private String origins;
    @Override public void addCorsMappings(CorsRegistry registry){registry.addMapping("/api/v1/**").allowedOrigins(origins.split(",")).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowedHeaders("Authorization","Content-Type","Idempotency-Key","If-Match","If-None-Match","Refresh-Token","X-File-SHA256","Last-Event-ID").exposedHeaders("ETag","X-Request-Id","Idempotency-Replayed","Content-Disposition").allowCredentials(false).maxAge(3600);}
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            public boolean preHandle(HttpServletRequest r,HttpServletResponse s,Object handler) {
                String id=UUID.randomUUID().toString();r.setAttribute("requestId",id);s.setHeader("X-Request-Id",id);
                if("GET".equals(r.getMethod())){ApiAdvice.positive(r,"page",1,Integer.MAX_VALUE);ApiAdvice.positive(r,"pageSize",20,100);}
                return true;
            }
        }).addPathPatterns("/api/v1/**");
    }
    @Bean Jackson2ObjectMapperBuilderCustomizer utcDateTimes() {
        return builder->builder.serializers(new LocalDateTimeSerializer(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss.SSSSSS'Z'")));
    }
}
