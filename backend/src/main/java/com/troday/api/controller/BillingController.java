package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.BillingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("")
public class BillingController {
    private final BillingService service;

    public BillingController(BillingService service) {
        this.service = service;
    }

    @RequestMapping(value = {"/rental-services", "/houses/{houseId}/services", "/rooms/{roomId}/service-settings", "/invoices", "/invoices/{invoiceId}"}, method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> get(HttpServletRequest request) {
        return service.handle("Billing", "GET", request, null);
    }

    @RequestMapping(value = {"/admin/rental-services", "/houses/{houseId}/services", "/invoices", "/invoices/{invoiceId}/issue", "/invoices/{invoiceId}/payment-confirmation", "/invoices/{invoiceId}/cancel", "/invoices/{invoiceId}/replacements"}, method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> post(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Billing", "POST", request, body);
    }

    @RequestMapping(value = {"/admin/rental-services/{serviceId}", "/houses/{houseId}/services/{houseServiceId}", "/invoices/{invoiceId}"}, method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> patch(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Billing", "PATCH", request, body);
    }

    @RequestMapping(value = {"/rooms/{roomId}/service-settings/{houseServiceId}"}, method = RequestMethod.PUT, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponseDto<?> put(HttpServletRequest request, @RequestBody(required = false) JsonNode body) {
        return service.handle("Billing", "PUT", request, body);
    }

}

