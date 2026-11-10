package com.troday.api.dto;

import java.time.Instant;

public record ApiResponseDto<T>(boolean success, String api, String method, T data,
                                Instant timestamp) {
    public static <T> ApiResponseDto<T> ok(String api, String method, T data) {
        return new ApiResponseDto<>(true, api, method, data, Instant.now());
    }
}
