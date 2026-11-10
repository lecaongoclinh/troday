package com.troday.api.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record ApiRequestDto(@NotNull JsonNode body, Map<String, String> query) {}
