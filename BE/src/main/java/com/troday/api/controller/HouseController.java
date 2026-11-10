package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.HouseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class HouseController {
    private final HouseService service;
    public HouseController(HouseService service){this.service=service;}

    @GetMapping("/houses") public ApiResponseDto<?> list(HttpServletRequest r){return service.list(r);}
    @PostMapping("/houses") public ApiResponseDto<?> create(HttpServletRequest r,@RequestBody JsonNode b){return service.create(r,b);}
    @GetMapping("/houses/{houseId}") public ApiResponseDto<?> detail(HttpServletRequest r,@PathVariable Long houseId){return service.detail(r,houseId);}
    @PatchMapping("/houses/{houseId}") public ApiResponseDto<?> update(HttpServletRequest r,@PathVariable Long houseId,@RequestBody JsonNode b){return service.update(r,houseId,b);}
    @GetMapping("/houses/{houseId}/verifications") public ApiResponseDto<?> verificationHistory(HttpServletRequest r,@PathVariable Long houseId){return service.verificationHistory(r,houseId);}
    @PostMapping("/houses/{houseId}/verifications") public ApiResponseDto<?> submitVerification(HttpServletRequest r,@PathVariable Long houseId,@RequestBody JsonNode b){return service.submitVerification(r,houseId,b);}
    @GetMapping("/houses/{houseId}/verifications/{verificationId}") public ApiResponseDto<?> verification(HttpServletRequest r,@PathVariable Long houseId,@PathVariable Long verificationId){return service.verification(r,houseId,verificationId);}
    @PostMapping("/houses/{houseId}/verifications/{verificationId}/withdraw") public ApiResponseDto<?> withdraw(HttpServletRequest r,@PathVariable Long houseId,@PathVariable Long verificationId){return service.withdraw(r,houseId,verificationId);}
    @GetMapping("/admin/house-verifications") public ApiResponseDto<?> adminList(HttpServletRequest r){return service.adminVerificationList(r);}
    @GetMapping("/admin/house-verifications/{verificationId}") public ApiResponseDto<?> adminDetail(HttpServletRequest r,@PathVariable Long verificationId){return service.adminVerification(r,verificationId);}
    @PostMapping("/admin/house-verifications/{verificationId}/decision") public ApiResponseDto<?> decision(HttpServletRequest r,@PathVariable Long verificationId,@RequestBody JsonNode b){return service.decision(r,verificationId,b);}
    @PostMapping("/admin/house-verifications/{verificationId}/revoke") public ApiResponseDto<?> revoke(HttpServletRequest r,@PathVariable Long verificationId,@RequestBody JsonNode b){return service.revoke(r,verificationId,b);}
    @GetMapping("/houses/{houseId}/rental-right") public ApiResponseDto<?> rentalRight(HttpServletRequest r,@PathVariable Long houseId){return service.rentalRight(r,houseId);}
    @GetMapping("/houses/{houseId}/rooms") public ApiResponseDto<?> rooms(HttpServletRequest r,@PathVariable Long houseId){return service.roomList(r,houseId);}
    @PostMapping("/houses/{houseId}/rooms") public ApiResponseDto<?> roomCreate(HttpServletRequest r,@PathVariable Long houseId,@RequestBody JsonNode b){return service.roomCreate(r,houseId,b);}
    @PatchMapping("/rooms/{roomId}") public ApiResponseDto<?> roomUpdate(HttpServletRequest r,@PathVariable Long roomId,@RequestBody JsonNode b){return service.roomUpdate(r,roomId,b);}
    @PutMapping("/rooms/{roomId}/capacity") public ApiResponseDto<?> capacity(HttpServletRequest r,@PathVariable Long roomId,@RequestBody JsonNode b){return service.capacity(r,roomId,b);}
    @GetMapping("/rooms/{roomId}") public ApiResponseDto<?> roomDetail(@PathVariable Long roomId){return service.roomDetail(roomId);}
    @GetMapping("/rooms/{roomId}/posts") public ApiResponseDto<?> roomPosts(@PathVariable Long roomId){return service.roomPosts(roomId);}
    @GetMapping("/rooms/{roomId}/residents") public ApiResponseDto<?> roomResidents(HttpServletRequest r,@PathVariable Long roomId){return service.roomResidents(r,roomId);}
    @GetMapping("/rooms/{roomId}/services") public ApiResponseDto<?> roomServices(@PathVariable Long roomId){return service.roomServices(roomId);}
    @GetMapping("/landlord/dashboard") public ApiResponseDto<?> dashboard(HttpServletRequest r){return service.dashboard(r);}
}

