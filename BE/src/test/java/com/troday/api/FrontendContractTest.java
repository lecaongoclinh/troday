package com.troday.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.troday.api.config.WebConfig;
import com.troday.api.controller.*;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real Spring/Jackson/controller contract; repositories and DB are out of scope. */
@WebMvcTest({AccountController.class, PostController.class, ViewingController.class, BillingController.class})
@Import(WebConfig.class)
class FrontendContractTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean AccountService accounts;
    @MockitoBean PostService posts;
    @MockitoBean ViewingService viewings;
    @MockitoBean BillingService billing;

    @Test void loginUsesBackendEnvelopeAndNumericId() throws Exception {
        doReturn(ApiResponseDto.ok("/api/v1", "POST", Map.of(
                "accessToken", "test-access", "refreshToken", "test-refresh",
                "user", Map.of("id", 7L, "fullName", "Test tenant", "roles", List.of("TENANT"), "status", "ACTIVE"))))
                .when(accounts).login(any(JsonNode.class));
        mvc.perform(post("/api/v1/auth/login").contentType("application/json")
                .content("{\"identifier\":\"tenant@example.test\",\"password\":\"test-password\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.id").isNumber()).andExpect(jsonPath("$.data.refreshToken").value("test-refresh"))
                .andExpect(jsonPath("$.timestamp").isString()).andExpect(jsonPath("$.meta").doesNotExist());
    }

    @Test void postListHasNoServerPaginationEnvelope() throws Exception {
        doReturn(ApiResponseDto.ok("/api/v1", "GET", List.of(Map.of("id", 101L, "title", "Room"))))
                .when(posts).explore(any(HttpServletRequest.class));
        mvc.perform(get("/api/v1/posts")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(101)).andExpect(jsonPath("$.meta").doesNotExist());
    }

    @Test void proposalReceivesTheFieldsTheFrontendSends() throws Exception {
        doReturn(ApiResponseDto.ok("/api/v1", "POST", Map.of("id", 1L))).when(viewings)
                .createProposal(any(HttpServletRequest.class), any(JsonNode.class));
        String body = "{\"conversationId\":\"301\",\"roomId\":\"201\",\"startsAt\":\"2099-12-01T09:00:00+07:00\",\"durationMinutes\":60,\"clientRequestKey\":\"stable-request\"}";
        mvc.perform(post("/api/v1/viewing-proposals").header("Authorization", "Bearer test")
                .contentType("application/json").content(body)).andExpect(status().isOk());
        ArgumentCaptor<JsonNode> captured = ArgumentCaptor.forClass(JsonNode.class);
        verify(viewings).createProposal(any(), captured.capture());
        assertThat(captured.getValue().get("clientRequestKey").asText()).isEqualTo("stable-request");
        assertThat(captured.getValue().get("startsAt").asText()).endsWith("+07:00");
    }

    @Test void invoiceAcceptsExplicitPayerAndLinePrice() throws Exception {
        doReturn(ApiResponseDto.ok("/api/v1", "POST", Map.of("id", 2L))).when(billing)
                .createInvoice(any(HttpServletRequest.class), any(JsonNode.class));
        String body = "{\"contractId\":\"601\",\"payerRoomTenantId\":\"701\",\"billingPeriod\":\"2026-12-01\",\"dueDate\":\"2026-12-10\",\"items\":[{\"type\":\"RENT\",\"name\":\"Rent\",\"unit\":\"month\",\"quantity\":\"1\",\"unitPrice\":\"3800000.00\"}]}";
        mvc.perform(post("/api/v1/invoices").header("Authorization", "Bearer test")
                .contentType("application/json").content(body)).andExpect(status().isOk());
        ArgumentCaptor<JsonNode> captured = ArgumentCaptor.forClass(JsonNode.class);
        verify(billing).createInvoice(any(), captured.capture());
        assertThat(captured.getValue().get("payerRoomTenantId").asText()).isEqualTo("701");
        assertThat(captured.getValue().get("items").get(0).get("unitPrice").asText()).isEqualTo("3800000.00");
    }

    @Test void webAndExpoOriginsCanPreflightAuthHeaders() throws Exception {
        for (String origin : List.of("http://localhost:5173", "http://127.0.0.1:8082", "http://localhost:4173")) {
            mvc.perform(options("/api/v1/auth/refresh").header("Origin", origin)
                    .header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "content-type,authorization,refresh-token"))
                    .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", origin));
        }
    }

    @Test void unknownBrowserOriginsAreRejected() throws Exception {
        mvc.perform(options("/api/v1/me").header("Origin", "https://unconfigured.example.test")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}
