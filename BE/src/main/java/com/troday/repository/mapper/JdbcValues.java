package com.troday.repository.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

public final class JdbcValues {
    private static final ObjectMapper JSON = new ObjectMapper();

    private JdbcValues() {}

    public static Instant instant(ResultSet rs, String column) throws SQLException {
        LocalDateTime value = rs.getObject(column, LocalDateTime.class);
        return value == null ? null : value.toInstant(ZoneOffset.UTC);
    }

    public static JsonNode json(ResultSet rs, String column) throws SQLException {
        String value = rs.getString(column);
        try {
            return value == null ? null : JSON.readTree(value);
        } catch (JsonProcessingException ex) {
            throw new SQLException("Invalid JSON in column " + column, ex);
        }
    }

    public static <E extends Enum<E>> E enumValue(ResultSet rs, String column, Class<E> type) throws SQLException {
        String value = rs.getString(column);
        try {
            return value == null ? null : Enum.valueOf(type, value);
        } catch (IllegalArgumentException ex) {
            throw new SQLException("Unexpected enum in column " + column, ex);
        }
    }
}
