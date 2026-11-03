package com.troday.util;

import com.troday.exception.DomainException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;

public final class Contacts {
    private Contacts() {}

    public static String email(String input) {
        if (input == null || input.isBlank()) return null;
        String value = input.strip().toLowerCase(Locale.ROOT);
        if (value.length() > 150 || !value.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"))
            throw DomainException.invalid("email", "Email không hợp lệ.");
        return value;
    }

    public static String phone(String input) {
        if (input == null || input.isBlank()) return null;
        String value = input.strip().replaceAll("[ ()-]", "");
        if (value.startsWith("00")) value = "+" + value.substring(2);
        if (value.matches("0[35789][0-9]{8}")) value = "+84" + value.substring(1);
        if (!value.matches("\\+[1-9][0-9]{7,14}"))
            throw DomainException.invalid("phoneNumber", "Số điện thoại không hợp lệ; dùng số Việt Nam hoặc định dạng quốc tế +.");
        return value;
    }

    public static String identifier(String value) {
        return value.contains("@") ? email(value) : phone(value);
    }

    public static void validatePassword(String password) {
        if (password == null || password.length() < 10 || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw DomainException.invalid("password", "Mật khẩu cần ít nhất 10 ký tự và tối đa 72 byte UTF-8.");
    }
}
