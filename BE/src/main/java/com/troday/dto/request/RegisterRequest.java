package com.troday.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(@NotBlank @Size(max = 150) String fullName,
                              @Size(max = 150) String email,
                              @Size(max = 40) String phoneNumber,
                              @NotBlank @Size(min = 10, max = 72) String password) {
    @Override
    public String toString() { return "RegisterRequest[REDACTED]"; }
}
