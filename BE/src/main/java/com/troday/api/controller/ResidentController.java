package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.ResidentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ResidentController {
    private final ResidentService service;

    public ResidentController(ResidentService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/residents", "/contracts/{contractId}/members", "/residents/export", "/occupant-join-requests", "/contracts/{contractId}/representative-candidates", "/contracts/{contractId}/representative-history"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Resident", "GET", request, null);
    }

    @RequestMapping(value = {"/occupant-join-requests", "/occupant-join-requests/{requestId}/consents", "/occupant-join-requests/{requestId}/cancel", "/occupant-join-requests/{requestId}/approve", "/occupant-join-requests/{requestId}/reject", "/occupant-join-requests/{requestId}/cancel-hold", "/occupant-join-requests/{requestId}/complete", "/contracts/{contractId}/members/{memberId}/move-out", "/contracts/{contractId}/representative-handovers"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Resident", "POST", request, body);
    }



}

