package com.troday.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class PostController {
    private final PostService service;
    public PostController(PostService service){this.service=service;}

    @GetMapping("/landlord/posts") public ApiResponseDto<?> landlordPosts(HttpServletRequest r){return service.landlordPosts(r);}
    @PostMapping("/posts") public ApiResponseDto<?> create(HttpServletRequest r,@RequestBody JsonNode b){return service.create(r,b);}
    @PatchMapping("/posts/{postId}") public ApiResponseDto<?> update(HttpServletRequest r,@PathVariable Long postId,@RequestBody JsonNode b){return service.update(r,postId,b);}
    @GetMapping("/admin/posts") public ApiResponseDto<?> adminList(HttpServletRequest r){return service.adminList(r);}
    @PostMapping("/admin/posts/{postId}/decision") public ApiResponseDto<?> decision(HttpServletRequest r,@PathVariable Long postId,@RequestBody JsonNode b){return service.decision(r,postId,b);}
    @PostMapping("/posts/{postId}/hide") public ApiResponseDto<?> hide(HttpServletRequest r,@PathVariable Long postId,@RequestBody JsonNode b){return service.hide(r,postId,b);}
    @PostMapping("/admin/posts/{postId}/restore") public ApiResponseDto<?> restore(HttpServletRequest r,@PathVariable Long postId){return service.restore(r,postId);}
    @GetMapping("/posts") public ApiResponseDto<?> explore(HttpServletRequest r){return service.explore(r);}
    @GetMapping("/posts/{postId}") public ApiResponseDto<?> detail(@PathVariable Long postId){return service.publicDetail(postId);}
    @GetMapping("/me/favorites") public ApiResponseDto<?> favorites(HttpServletRequest r){return service.favoriteList(r);}
    @PutMapping("/me/favorites/{postId}") public ApiResponseDto<?> favoriteAdd(HttpServletRequest r,@PathVariable Long postId){return service.favoriteAdd(r,postId);}
    @DeleteMapping("/me/favorites/{postId}") public ApiResponseDto<?> favoriteRemove(HttpServletRequest r,@PathVariable Long postId){return service.favoriteRemove(r,postId);}
}

