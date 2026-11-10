package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.ContractChangeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class ContractChangeController {
    private final ContractChangeService service;

    public ContractChangeController(ContractChangeService service) {
        this.service = service;
    }

    @GetMapping(value = "/contracts/{contractId}/change-requests", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> list(HttpServletRequest request, @PathVariable Long contractId) {
        return service.list(request, contractId);
    }

    @PostMapping(value = "/contracts/{contractId}/change-requests", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> create(HttpServletRequest request, @PathVariable Long contractId,
                                    @RequestBody(required = false) JsonNode body) {
        return service.create(request, contractId, body);
    }

    @GetMapping(value = "/contract-change-requests/{requestId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> detail(HttpServletRequest request, @PathVariable Long requestId) {
        return service.detail(request, requestId);
    }

    @PostMapping(value = "/contract-change-requests/{requestId}/decision", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> decision(HttpServletRequest request, @PathVariable Long requestId,
                                      @RequestBody(required = false) JsonNode body) {
        return service.decision(request, requestId, body);
    }

    @PostMapping(value = "/contract-change-requests/{requestId}/confirm", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> confirm(HttpServletRequest request, @PathVariable Long requestId,
                                     @RequestBody(required = false) JsonNode body) {
        return service.confirm(request, requestId, body);
    }

    @PostMapping(value = "/contract-change-requests/{requestId}/cancel", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> cancel(HttpServletRequest request, @PathVariable Long requestId,
                                    @RequestBody(required = false) JsonNode body) {
        return service.cancel(request, requestId, body);
    }

    @PostMapping(value = "/contract-change-requests/{requestId}/apply", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> apply(HttpServletRequest request, @PathVariable Long requestId) {
        return service.apply(request, requestId);
    }

    @GetMapping(value = "/contracts/{contractId}/transfer-options", produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> transferOptions(HttpServletRequest request, @PathVariable Long contractId) {
        return service.transferOptions(request, contractId);
    }
}
