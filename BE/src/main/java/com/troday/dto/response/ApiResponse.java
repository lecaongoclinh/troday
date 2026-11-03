package com.troday.dto.response;

import java.time.Instant;
import java.util.List;

public record ApiResponse<T>(T data, Meta meta, ApiError error) {
    public record Meta(String requestId, Instant timestamp, Pagination pagination) {}
    public record Pagination(int page, int pageSize, long total, long totalPages) {}
    public record Detail(String field, String code, String message) {}
    public record ApiError(String code, String message, List<Detail> details) {}
}
