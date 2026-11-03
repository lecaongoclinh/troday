package com.troday.util;

import com.troday.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class Responses {
    private final Clock clock;
    public Responses(Clock clock) { this.clock = clock; }

    public <T> ApiResponse<T> ok(T data, HttpServletRequest request) {
        return page(data, request, null);
    }

    public <T> ApiResponse<T> page(T data, HttpServletRequest request, ApiResponse.Pagination pagination) {
        return new ApiResponse<>(data, new ApiResponse.Meta((String) request.getAttribute("requestId"), clock.instant(), pagination), null);
    }

    public ApiResponse<Void> error(String code, String message, List<ApiResponse.Detail> details, HttpServletRequest request) {
        return new ApiResponse<>(null, new ApiResponse.Meta((String) request.getAttribute("requestId"), clock.instant(), null),
                new ApiResponse.ApiError(code, message, details));
    }
}
