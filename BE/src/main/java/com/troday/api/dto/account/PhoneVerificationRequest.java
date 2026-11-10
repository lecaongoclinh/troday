package com.troday.api.dto.account;
public record PhoneVerificationRequest(String phoneNumber, String selector, String code) { }
