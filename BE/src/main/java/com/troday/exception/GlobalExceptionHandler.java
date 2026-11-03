package com.troday.exception;

import com.troday.dto.response.ApiResponse;
import com.troday.util.Responses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.CannotAcquireLockException;
import com.troday.config.AuthProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private final Responses responses;
    private final AuthProperties auth;
    public GlobalExceptionHandler(Responses responses, AuthProperties auth) { this.responses = responses; this.auth = auth; }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiResponse<Void>> domain(DomainException ex, HttpServletRequest request) {
        var details = ex.field() == null ? List.<ApiResponse.Detail>of()
                : List.of(new ApiResponse.Detail(ex.field(), ex.code(), ex.getMessage()));
        var builder = ResponseEntity.status(ex.status());
        if (ex.status() == HttpStatus.TOO_MANY_REQUESTS) builder.header("Retry-After", Long.toString(Math.max(1, auth.rateWindow().toSeconds())));
        if (ex.status() == HttpStatus.UNAUTHORIZED) builder.header("WWW-Authenticate", "Bearer");
        return builder.body(responses.error(ex.code(), ex.getMessage(), details, request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        var details = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ApiResponse.Detail(e.getField(), "VALIDATION_ERROR", e.getDefaultMessage())).toList();
        return ResponseEntity.unprocessableEntity().body(responses.error("VALIDATION_ERROR", "Dữ liệu không hợp lệ.", details, request));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiResponse<Void>> malformed(Exception ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(responses.error("BAD_REQUEST", "Request không đúng định dạng hoặc có field không được phép.", List.of(), request));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> database(DataAccessException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(responses.error("DEPENDENCY_UNAVAILABLE", "Cơ sở dữ liệu tạm thời không sẵn sàng.", List.of(), request));
    }

    @ExceptionHandler(CannotAcquireLockException.class)
    public ResponseEntity<ApiResponse<Void>> busy(CannotAcquireLockException ex, HttpServletRequest request) {
        return ResponseEntity.status(409).header("Retry-After", "1").body(responses.error("REQUEST_IN_PROGRESS", "Request khác đang xử lý tài nguyên này.", List.of(), request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> unexpected(Exception ex, HttpServletRequest request) {
        return ResponseEntity.internalServerError().body(responses.error("INTERNAL_ERROR", "Không thể xử lý yêu cầu.", List.of(), request));
    }
}
