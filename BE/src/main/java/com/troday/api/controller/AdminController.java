package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/rooms/{roomId}/reviews", "/me/reports", "/admin/reports", "/admin/reports/{reportId}", "/admin/users", "/admin/users/{userId}", "/contract-templates", "/admin/moderation-actions", "/admin/moderation-actions/{actionId}", "/admin/dashboard"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Admin", "GET", request, null);
    }

    @RequestMapping(value = {"/reviews", "/admin/reviews/{reviewId}/moderation", "/reports", "/admin/reports/{reportId}/decision", "/admin/users/{userId}/lock", "/admin/users/{userId}/unlock", "/admin/contract-templates"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Admin", "POST", request, body);
    }

    @RequestMapping(value = {"/admin/contract-templates/{templateId}"}, method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> patch(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Admin", "PATCH", request, body);
    }


}

