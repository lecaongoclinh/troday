package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.IntegrationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1")
public class IntegrationController {
 private final IntegrationService service; public IntegrationController(IntegrationService s){service=s;}
 @PostMapping(value="/files/upload-sessions",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> uploadSession(HttpServletRequest r,@RequestBody JsonNode b){return service.createUploadSession(r,b);}
 @PostMapping(value="/files/{fileId}/complete",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> complete(HttpServletRequest r,@PathVariable Long fileId){return service.complete(r,fileId);}
 @GetMapping(value="/files/{fileId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> metadata(HttpServletRequest r,@PathVariable Long fileId){return service.metadata(r,fileId);}
 @PostMapping(value="/files/{fileId}/download-links",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> downloadLink(HttpServletRequest r,@PathVariable Long fileId){return service.downloadLink(r,fileId);}
 @DeleteMapping(value="/files/{fileId}",produces=MediaType.APPLICATION_JSON_VALUE) public ApiResponseDto<?> delete(HttpServletRequest r,@PathVariable Long fileId){return service.delete(r,fileId);}
}
