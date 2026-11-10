package com.troday.api.controller;
import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.ContractChangeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ContractChangeController {
    private final ContractChangeService service;

    public ContractChangeController(ContractChangeService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/contracts/{contractId}/change-requests", "/contract-change-requests/{requestId}", "/contracts/{contractId}/transfer-options"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("ContractChange", "GET", request, null);
    }

    @RequestMapping(value = {"/contracts/{contractId}/change-requests", "/contract-change-requests/{requestId}/decision", "/contract-change-requests/{requestId}/confirm", "/contract-change-requests/{requestId}/cancel", "/contract-change-requests/{requestId}/apply"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("ContractChange", "POST", request, body);
    }



}

