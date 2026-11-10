package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.ViewingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class ViewingController {
    private final ViewingService service;

    public ViewingController(ViewingService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/viewing-proposals", "/viewings", "/viewings/{viewingId}"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Viewing", "GET", request, null);
    }

    @RequestMapping(value = {"/viewing-proposals", "/viewing-proposals/{proposalId}/decision", "/viewing-proposals/{proposalId}/withdraw", "/viewings", "/viewings/{viewingId}/attendance", "/viewings/{viewingId}/cancel", "/viewings/{viewingId}/rental-decision"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Viewing", "POST", request, body);
    }



}

