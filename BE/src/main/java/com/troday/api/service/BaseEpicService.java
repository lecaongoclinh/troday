package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class BaseEpicService {
    public ApiResponseDto<?> handle(String epic, String method, HttpServletRequest request, JsonNode body) {
        Map<String, String> query = request.getParameterMap().entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, e -> String.join(",", e.getValue())));
        return ApiResponseDto.ok(request.getRequestURI(), method, Map.of(
                "epic", epic,
                "message", "Endpoint đã được định tuyến theo epic.",
                "request", body == null ? Collections.emptyMap() : body,
                "query", query
        ));
    }
}

