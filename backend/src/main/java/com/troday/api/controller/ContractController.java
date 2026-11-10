package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.ContractService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ContractController {
    private final ContractService service;

    public ContractController(ContractService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/contracts", "/contracts/{contractId}", "/viewings/{viewingId}/contract-impact", "/contracts/{contractId}/revisions"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Contract", "GET", request, null);
    }

    @RequestMapping(value = {"/contracts", "/contracts/{contractId}/revision-requests", "/contracts/{contractId}/revisions/{revisionId}/submit", "/contracts/{contractId}/confirm", "/contracts/{contractId}/move-ins", "/contracts/{contractId}/cancel", "/contracts/{contractId}/members/{memberId}/cancel", "/contract-imports"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Contract", "POST", request, body);
    }

    @RequestMapping(value = {"/contracts/{contractId}/revisions/{revisionId}"}, method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> patch(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Contract", "PATCH", request, body);
    }


}

