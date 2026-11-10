package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.RoommateService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class RoommateController {
    private final RoommateService service;

    public RoommateController(RoommateService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/me/roommate-profile", "/roommate-profiles/{profileId}", "/lifestyle-criteria", "/me/roommate-profile/lifestyles", "/roommate-matches", "/roommate-requests"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Roommate", "GET", request, null);
    }

    @RequestMapping(value = {"/admin/lifestyle-criteria", "/roommate-requests", "/roommate-requests/{requestId}/response", "/roommate-requests/{requestId}/cancel", "/roommate-requests/{requestId}/end"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Roommate", "POST", request, body);
    }

    @RequestMapping(value = {"/admin/lifestyle-criteria/{criterionId}"}, method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> patch(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Roommate", "PATCH", request, body);
    }

    @RequestMapping(value = {"/me/roommate-profile", "/me/roommate-profile/lifestyles"}, method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> put(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Roommate", "PUT", request, body);
    }

}

