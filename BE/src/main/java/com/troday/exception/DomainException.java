package com.troday.exception;

import org.springframework.http.HttpStatus;

public class DomainException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final String field;

    public DomainException(HttpStatus status, String code, String message) {
        this(status, code, message, null);
    }

    public DomainException(HttpStatus status, String code, String message, String field) {
        super(message);
        this.status = status;
        this.code = code;
        this.field = field;
    }

    public HttpStatus status() { return status; }
    public String code() { return code; }
    public String field() { return field; }

    public static DomainException invalid(String field, String message) {
        return new DomainException(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", message, field);
    }

    public static DomainException unauthenticated() {
        return new DomainException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Thông tin xác thực không hợp lệ hoặc phiên đã hết hạn.");
    }
}
