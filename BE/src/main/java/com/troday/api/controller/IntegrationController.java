package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.IntegrationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class IntegrationController {
    private final IntegrationService service;

    public IntegrationController(IntegrationService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/files/{fileId}"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Integration", "GET", request, null);
    }

    @RequestMapping(value = {"/files/upload-sessions", "/files/{fileId}/complete", "/files/{fileId}/download-links"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Integration", "POST", request, body);
    }



    @RequestMapping(value = {"/files/{fileId}"}, method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> delete(HttpServletRequest request) {
        return service.handle("Integration", "DELETE", request, null);
    }
}

