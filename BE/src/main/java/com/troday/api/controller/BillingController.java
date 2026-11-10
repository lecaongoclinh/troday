package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.BillingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1")
public class BillingController {
 private final BillingService service; public BillingController(BillingService s){service=s;}
 @GetMapping(value="/rental-services",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> catalog(HttpServletRequest r){return service.catalog(r);}
 @PostMapping(value="/admin/rental-services",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> createCatalog(HttpServletRequest r,@RequestBody JsonNode b){return service.createCatalog(r,b);}
 @PatchMapping(value="/admin/rental-services/{serviceId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> updateCatalog(HttpServletRequest r,@PathVariable Long serviceId,@RequestBody JsonNode b){return service.updateCatalog(r,serviceId,b);}
 @GetMapping(value="/houses/{houseId}/services",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> houseList(HttpServletRequest r,@PathVariable Long houseId){return service.houseList(r,houseId);}
 @PostMapping(value="/houses/{houseId}/services",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> houseCreate(HttpServletRequest r,@PathVariable Long houseId,@RequestBody JsonNode b){return service.houseCreate(r,houseId,b);}
 @PatchMapping(value="/houses/{houseId}/services/{houseServiceId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> houseUpdate(HttpServletRequest r,@PathVariable Long houseId,@PathVariable Long houseServiceId,@RequestBody JsonNode b){return service.houseUpdate(r,houseId,houseServiceId,b);}
 @PutMapping(value="/rooms/{roomId}/service-settings/{houseServiceId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> roomSet(HttpServletRequest r,@PathVariable Long roomId,@PathVariable Long houseServiceId,@RequestBody JsonNode b){return service.roomSet(r,roomId,houseServiceId,b);}
 @GetMapping(value="/rooms/{roomId}/service-settings",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> roomList(HttpServletRequest r,@PathVariable Long roomId){return service.roomList(r,roomId);}
 @GetMapping(value="/invoices",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> invoiceList(HttpServletRequest r,@RequestParam(required=false) Long contractId,@RequestParam(required=false) String billingPeriod,@RequestParam(required=false) String status){return service.invoiceList(r,contractId,billingPeriod,status);}
 @GetMapping(value="/invoices/{invoiceId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> invoiceDetail(HttpServletRequest r,@PathVariable Long invoiceId){return service.invoiceDetail(r,invoiceId);}
 @PostMapping(value="/invoices",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> createInvoice(HttpServletRequest r,@RequestBody JsonNode b){return service.createInvoice(r,b);}
 @PatchMapping(value="/invoices/{invoiceId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> updateInvoice(HttpServletRequest r,@PathVariable Long invoiceId,@RequestBody JsonNode b){return service.updateInvoice(r,invoiceId,b);}
 @PostMapping(value="/invoices/{invoiceId}/issue",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> issue(HttpServletRequest r,@PathVariable Long invoiceId){return service.issue(r,invoiceId);}
 @PostMapping(value="/invoices/{invoiceId}/payment-confirmation",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> pay(HttpServletRequest r,@PathVariable Long invoiceId){return service.pay(r,invoiceId);}
 @PostMapping(value="/invoices/{invoiceId}/cancel",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> cancel(HttpServletRequest r,@PathVariable Long invoiceId,@RequestBody JsonNode b){return service.cancel(r,invoiceId,b);}
 @PostMapping(value="/invoices/{invoiceId}/replacements",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> replacement(HttpServletRequest r,@PathVariable Long invoiceId,@RequestBody JsonNode b){return service.replacement(r,invoiceId,b);}
}
