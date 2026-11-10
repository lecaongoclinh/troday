package com.troday.api.dto.account;
public record PasswordResetRequest(String identifier, String selector, String code, String resetGrant, String newPassword) { }
