package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.entity.*;
import com.troday.api.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PostService {
    private final AccountService accounts; private final PostRepository posts; private final RoomRepository rooms;
    private final RentalHouseRepository houses; private final RentalHouseVerificationRepository verifications;
    private final FavoritePostRepository favorites;

    public PostService(AccountService accounts, PostRepository posts, RoomRepository rooms, RentalHouseRepository houses,
                       RentalHouseVerificationRepository verifications, FavoritePostRepository favorites) {
        this.accounts=accounts; this.posts=posts; this.rooms=rooms; this.houses=houses; this.verifications=verifications; this.favorites=favorites;
    }

    public ApiResponseDto<?> landlordPosts(HttpServletRequest r){Long owner=accounts.authenticatedUserId(r);return ok("GET",posts.findByLandlordId(owner).stream().map(this::postData).toList());}
    @Transactional public ApiResponseDto<?> create(HttpServletRequest r,JsonNode b){Long owner=accounts.authenticatedUserId(r);requireBody(b);Room room=room(b);RentalHouse house=ownedHouse(owner,room.getHouseId());Post p=new Post();p.setLandlordId(owner);p.setHouseId(house.getId());p.setRoomId(room.getId());apply(p,b);p.setStatus("PENDING_REVIEW");return ok("POST",postData(posts.save(p)));}
    @Transactional public ApiResponseDto<?> update(HttpServletRequest r,Long id,JsonNode b){Long owner=accounts.authenticatedUserId(r);Post p=ownedPost(owner,id);requireBody(b);if(p.getContentVersion()!=null&&b.has("contentVersion")&&p.getContentVersion()!=b.get("contentVersion").asLong())throw conflict("Phiên bản tin đã thay đổi");if(b.has("roomId")){Room room=room(b);ownedHouse(owner,room.getHouseId());p.setRoomId(room.getId());p.setHouseId(room.getHouseId());}apply(p,b);p.setStatus("PENDING_REVIEW");p.setContentVersion(Optional.ofNullable(p.getContentVersion()).orElse(1L)+1);return ok("PATCH",postData(posts.save(p)));}
    public ApiResponseDto<?> adminList(HttpServletRequest r){accounts.requireAdminId(r);return ok("GET",posts.findByStatus("PENDING_REVIEW").stream().map(this::postData).toList());}
    @Transactional public ApiResponseDto<?> decision(HttpServletRequest r,Long id,JsonNode b){accounts.requireAdminId(r);Post p=findPost(id);if(!"PENDING_REVIEW".equals(p.getStatus()))throw conflict("Tin không ở trạng thái chờ duyệt");String d=text(b,"decision");if(!Set.of("APPROVE","REJECT").contains(d))throw bad("decision phải là APPROVE hoặc REJECT");if("APPROVE".equals(d)&&!effectiveRight(p.getHouseId()))throw conflict("Quyền cho thuê nhà chưa hiệu lực");p.setStatus("APPROVE".equals(d)?"APPROVED":"REJECTED");return ok("POST",postData(posts.save(p)));}
    @Transactional public ApiResponseDto<?> hide(HttpServletRequest r,Long id,JsonNode b){Long actor=accounts.authenticatedUserId(r);Post p=findPost(id);if(!p.getLandlordId().equals(actor)&&!isAdmin(r))throw forbidden("Không có quyền ẩn tin");if(!"APPROVED".equals(p.getStatus()))throw conflict("Chỉ được ẩn tin đang công khai");p.setStatus("HIDDEN");return ok("POST",postData(posts.save(p)));}
    @Transactional public ApiResponseDto<?> restore(HttpServletRequest r,Long id){accounts.requireAdminId(r);Post p=findPost(id);if(!"HIDDEN".equals(p.getStatus()))throw conflict("Tin không ở trạng thái đã ẩn");if(!effectiveRight(p.getHouseId()))throw conflict("Quyền cho thuê nhà chưa hiệu lực");p.setStatus("APPROVED");return ok("POST",postData(posts.save(p)));}
    public ApiResponseDto<?> explore(HttpServletRequest r){String q=r.getParameter("q"),province=r.getParameter("provinceCode");List<Map<String,Object>> result=posts.findByStatus("APPROVED").stream().filter(p->"OPEN".equals(p.getAvailabilityStatus())||p.getAvailabilityStatus()==null).filter(p->q==null||p.getTitle().toLowerCase().contains(q.toLowerCase())||Optional.ofNullable(p.getContent()).orElse("").toLowerCase().contains(q.toLowerCase())).filter(p->province==null||province.equals(houses.findById(p.getHouseId()).map(RentalHouse::getProvinceCode).orElse(null))).map(this::postData).toList();return ok("GET",result);}
    public ApiResponseDto<?> publicDetail(Long id){Post p=findPost(id);if(!"APPROVED".equals(p.getStatus()))throw notFound("Không tìm thấy tin công khai");return ok("GET",postData(p));}
    public ApiResponseDto<?> favoriteList(HttpServletRequest r){Long user=accounts.authenticatedUserId(r);return ok("GET",favorites.findByUserIdOrderByCreatedAtDesc(user).stream().map(f->Map.of("postId",f.getPostId(),"savedAt",Objects.toString(f.getCreatedAt(),""),"post",posts.findById(f.getPostId()).filter(p->"APPROVED".equals(p.getStatus())).map(this::postData).orElse(null))).toList());}
    @Transactional public ApiResponseDto<?> favoriteAdd(HttpServletRequest r,Long id){Long user=accounts.authenticatedUserId(r);Post p=findPost(id);if(!"APPROVED".equals(p.getStatus())||!effectiveRight(p.getHouseId()))throw notFound("Tin không còn khả dụng");if(favorites.findByUserIdAndPostId(user,id).isEmpty()){FavoritePost f=new FavoritePost();f.setUserId(user);f.setPostId(id);f.setCreatedAt(LocalDateTime.now());favorites.save(f);}return ok("PUT",Map.of("postId",id,"saved",true));}
    @Transactional public ApiResponseDto<?> favoriteRemove(HttpServletRequest r,Long id){Long user=accounts.authenticatedUserId(r);favorites.findByUserIdAndPostId(user,id).ifPresent(favorites::delete);return ok("DELETE",Map.of("postId",id,"saved",false));}

    private void apply(Post p,JsonNode b){String title=text(b,"title"),content=text(b,"content");if(title.isBlank()||content.isBlank())throw bad("title và content là bắt buộc");p.setTitle(title);p.setContent(content);p.setAvailabilityStatus("OPEN");p.setAvailabilityConfirmedAt(LocalDateTime.now());p.setAvailabilityExpiresAt(LocalDateTime.now().plusDays(7));}
    private Room room(JsonNode b){if(!b.hasNonNull("roomId"))throw bad("roomId là bắt buộc");return rooms.findById(b.get("roomId").asLong()).orElseThrow(()->notFound("Không tìm thấy phòng"));}
    private RentalHouse ownedHouse(Long owner,Long id){RentalHouse h=houses.findById(id).orElseThrow(()->notFound("Không tìm thấy nhà"));if(!h.getLandlordId().equals(owner))throw forbidden("Bạn không sở hữu nhà này");return h;}
    private Post ownedPost(Long owner,Long id){Post p=findPost(id);if(!p.getLandlordId().equals(owner))throw forbidden("Bạn không sở hữu tin này");return p;}
    private Post findPost(Long id){return posts.findById(id).orElseThrow(()->notFound("Không tìm thấy tin đăng"));}
    private boolean effectiveRight(Long houseId){return verifications.findByHouseIdAndStatus(houseId,"APPROVED").isPresent();}
    private boolean isAdmin(HttpServletRequest r){try{accounts.requireAdminId(r);return true;}catch(Exception e){return false;}}
    private Map<String,Object> postData(Post p){return Map.of("id",p.getId(),"landlordId",p.getLandlordId(),"houseId",p.getHouseId(),"roomId",p.getRoomId(),"title",Objects.toString(p.getTitle(),""),"content",Objects.toString(p.getContent(),""),"status",Objects.toString(p.getStatus(),""),"availabilityStatus",Objects.toString(p.getAvailabilityStatus(),"STALE"),"contentVersion",Objects.toString(p.getContentVersion(),"1"));}
    private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);}
    private void requireBody(JsonNode b){if(b==null||!b.isObject())throw bad("JSON request là bắt buộc");}
    private String text(JsonNode b,String k){return b!=null&&b.hasNonNull(k)?b.get(k).asText():"";}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);}private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}

