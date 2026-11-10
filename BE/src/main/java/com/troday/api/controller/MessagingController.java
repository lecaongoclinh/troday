package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.MessagingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class MessagingController {
    private final MessagingService service;

    public MessagingController(MessagingService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/conversations", "/conversations/{conversationId}", "/conversations/{conversationId}/messages", "/conversations/{conversationId}/viewing-timeline", "/me/notifications", "/me/notification-counts", "/events"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Messaging", "GET", request, null);
    }

    @RequestMapping(value = {"/conversations/room-inquiries", "/conversations/{conversationId}/messages", "/roommate-requests/{requestId}/conversation", "/conversations/{conversationId}/post-shares", "/me/notifications/read-all"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Messaging", "POST", request, body);
    }

    @RequestMapping(value = {"/conversations/{conversationId}/preferences"}, method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> patch(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Messaging", "PATCH", request, body);
    }

    @RequestMapping(value = {"/conversations/{conversationId}/read-state", "/me/notifications/{notificationId}/read-state"}, method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> put(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Messaging", "PUT", request, body);
    }

}

