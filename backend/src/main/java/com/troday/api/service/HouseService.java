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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HouseService {
    private final AccountService accounts; private final RentalHouseRepository houses; private final RoomRepository rooms;
    private final LandlordRepository landlords; private final RentalHouseVerificationRepository verifications; private final PostRepository posts;

    public HouseService(AccountService accounts, RentalHouseRepository houses, RoomRepository rooms, LandlordRepository landlords,
                        RentalHouseVerificationRepository verifications, PostRepository posts) {
        this.accounts=accounts; this.houses=houses; this.rooms=rooms; this.landlords=landlords; this.verifications=verifications; this.posts=posts;
    }

    public ApiResponseDto<?> list(HttpServletRequest r){Long owner=accounts.authenticatedUserId(r);return ok("GET",houses.findByLandlordId(owner).stream().map(this::houseData).toList());}
    @Transactional public ApiResponseDto<?> create(HttpServletRequest r,JsonNode b){Long owner=accounts.authenticatedUserId(r);requireBody(b);landlords.findById(owner).orElseGet(()->landlords.save(new Landlord(owner)));RentalHouse h=new RentalHouse();h.setLandlordId(owner);applyHouse(h,b);return ok("POST",houseData(houses.save(h)));}
    public ApiResponseDto<?> detail(HttpServletRequest r,Long id){return ok("GET",houseData(owned(r,id)));}
    @Transactional public ApiResponseDto<?> update(HttpServletRequest r,Long id,JsonNode b){RentalHouse h=owned(r,id);requireBody(b);applyHouse(h,b);return ok("PATCH",houseData(houses.save(h)));}

    public ApiResponseDto<?> verificationHistory(HttpServletRequest r,Long hid){owned(r,hid);return ok("GET",verifications.findByHouseIdOrderBySubmittedAtDesc(hid).stream().map(this::verificationData).toList());}
    @Transactional public ApiResponseDto<?> submitVerification(HttpServletRequest r,Long hid,JsonNode b){RentalHouse h=owned(r,hid);requireBody(b);if(verifications.findByHouseIdAndStatus(hid,"PENDING").isPresent())throw conflict("Đã có hồ sơ quyền nhà đang chờ");String type=text(b,"rightType"),scope=text(b,"scopeDescription");if(!Set.of("OWNER","AUTHORIZED","SUBLESSOR").contains(type)||scope.isBlank())throw bad("rightType và scopeDescription không hợp lệ");RentalHouseVerification v=new RentalHouseVerification();v.setHouseId(hid);v.setApplicantLandlordId(h.getLandlordId());v.setRightType(type);v.setScopeDescription(scope);v.setValidFrom(date(b,"validFrom",LocalDate.now()));if(b.hasNonNull("validUntil"))v.setValidUntil(date(b,"validUntil",null));v.setSubmittedAt(LocalDateTime.now());return ok("POST",verificationData(verifications.save(v)));}
    public ApiResponseDto<?> verification(HttpServletRequest r,Long hid,Long id){owned(r,hid);return ok("GET",verificationData(findVerification(hid,id)));}
    @Transactional public ApiResponseDto<?> withdraw(HttpServletRequest r,Long hid,Long id){owned(r,hid);RentalHouseVerification v=findVerification(hid,id);if(!"PENDING".equals(v.getStatus()))throw conflict("Hồ sơ không còn chờ");v.setStatus("WITHDRAWN");return ok("POST",verificationData(verifications.save(v)));}

    public ApiResponseDto<?> adminVerificationList(HttpServletRequest r){accounts.requireAdminId(r);return ok("GET",verifications.findAll().stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> adminVerification(HttpServletRequest r,Long id){accounts.requireAdminId(r);return ok("GET",verificationData(findVerification(id)));}
    @Transactional public ApiResponseDto<?> decision(HttpServletRequest r,Long id,JsonNode b){Long admin=accounts.requireAdminId(r);RentalHouseVerification v=findVerification(id);String d=text(b,"decision");if(!"PENDING".equals(v.getStatus())||!Set.of("APPROVE","REJECT").contains(d))throw conflict("Quyết định không hợp lệ");v.setStatus("APPROVE".equals(d)?"APPROVED":"REJECTED");v.setReviewedById(admin);v.setReviewedAt(LocalDateTime.now());if("REJECTED".equals(v.getStatus()))v.setRejectionReason(text(b,"reason"));return ok("POST",verificationData(verifications.save(v)));}
    @Transactional public ApiResponseDto<?> revoke(HttpServletRequest r,Long id,JsonNode b){Long admin=accounts.requireAdminId(r);RentalHouseVerification v=findVerification(id);if(!"APPROVED".equals(v.getStatus()))throw conflict("Chỉ được thu hồi quyền đã duyệt");v.setStatus("REVOKED");v.setRevokedById(admin);v.setRevokedAt(LocalDateTime.now());v.setRevocationReason(text(b,"reason"));return ok("POST",verificationData(verifications.save(v)));}
    public ApiResponseDto<?> rentalRight(HttpServletRequest r,Long hid){owned(r,hid);return ok("GET",verifications.findByHouseIdAndStatus(hid,"APPROVED").map(this::verificationData).orElse(Map.of("effective",false)));}

    public ApiResponseDto<?> roomList(HttpServletRequest r,Long hid){owned(r,hid);return ok("GET",rooms.findByHouseId(hid).stream().map(this::roomData).toList());}
    @Transactional public ApiResponseDto<?> roomCreate(HttpServletRequest r,Long hid,JsonNode b){owned(r,hid);requireBody(b);String number=text(b,"code",text(b,"roomNumber"));if(number.isBlank())throw bad("code là bắt buộc");if(rooms.findByHouseId(hid).stream().anyMatch(x->number.equals(x.getRoomNumber())))throw conflict("Số phòng đã tồn tại");Room x=new Room();x.setHouseId(hid);x.setRoomNumber(number);applyRoom(x,b);return ok("POST",roomData(rooms.save(x)));}
    @Transactional public ApiResponseDto<?> roomUpdate(HttpServletRequest r,Long id,JsonNode b){Room x=ownedRoom(r,id);applyRoom(x,b);return ok("PATCH",roomData(rooms.save(x)));}
    @Transactional public ApiResponseDto<?> capacity(HttpServletRequest r,Long id,JsonNode b){Room x=ownedRoom(r,id);int n=integer(b,"capacity");if(n<1)throw bad("capacity phải lớn hơn 0");x.setMaxOccupants(n);return ok("PUT",roomData(rooms.save(x)));}
    public ApiResponseDto<?> roomDetail(Long id){return ok("GET",roomData(findRoom(id)));}
    public ApiResponseDto<?> roomPosts(Long id){findRoom(id);return ok("GET",posts.findByRoomId(id));}
    public ApiResponseDto<?> roomResidents(HttpServletRequest r,Long id){ownedRoom(r,id);return ok("GET",List.of());}
    public ApiResponseDto<?> roomServices(Long id){findRoom(id);return ok("GET",List.of());}
    public ApiResponseDto<?> dashboard(HttpServletRequest r){Long owner=accounts.authenticatedUserId(r);List<RentalHouse> hs=houses.findByLandlordId(owner);List<Room> rs=hs.stream().flatMap(h->rooms.findByHouseId(h.getId()).stream()).toList();return ok("GET",Map.of("houseCount",hs.size(),"roomCount",rs.size(),"availableRoomCount",rs.stream().filter(x->"AVAILABLE".equals(x.getStatus())).count(),"houses",hs.stream().map(this::houseData).toList()));}

    private RentalHouse owned(HttpServletRequest r,Long id){RentalHouse h=houses.findById(id).orElseThrow(()->notFound("Không tìm thấy nhà"));if(!h.getLandlordId().equals(accounts.authenticatedUserId(r)))throw forbidden("Bạn không sở hữu nhà này");return h;}
    private Room ownedRoom(HttpServletRequest r,Long id){Room x=findRoom(id);owned(r,x.getHouseId());return x;}
    private RentalHouseVerification findVerification(Long id){return verifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ quyền nhà"));}
    private RentalHouseVerification findVerification(Long hid,Long id){RentalHouseVerification v=findVerification(id);if(!v.getHouseId().equals(hid))throw notFound("Không tìm thấy hồ sơ quyền nhà");return v;}
    private Room findRoom(Long id){return rooms.findById(id).orElseThrow(()->notFound("Không tìm thấy phòng"));}
    private void applyHouse(RentalHouse h,JsonNode b){if(b.has("name"))h.setName(text(b,"name"));if(b.has("address"))h.setAddress(text(b,"address"));if(b.has("provinceCode"))h.setProvinceCode(text(b,"provinceCode"));if(b.has("localityCode"))h.setLocalityCode(text(b,"localityCode"));if(b.has("areaLabel"))h.setAreaLabel(text(b,"areaLabel"));if(b.has("notes"))h.setNotes(text(b,"notes"));}
    private void applyRoom(Room x,JsonNode b){if(b.has("area"))x.setArea(decimal(b,"area"));if(b.has("rentAmount"))x.setRentPrice(decimal(b,"rentAmount"));if(b.has("depositAmount"))x.setDepositAmount(decimal(b,"depositAmount"));if(b.has("capacity"))x.setMaxOccupants(integer(b,"capacity"));if(b.has("status"))x.setStatus(text(b,"status"));if(x.getStatus()==null)x.setStatus("AVAILABLE");}
    private Map<String,Object> houseData(RentalHouse h){return Map.of("id",h.getId(),"name",Objects.toString(h.getName(),""),"address",Objects.toString(h.getAddress(),""),"provinceCode",Objects.toString(h.getProvinceCode(),""),"localityCode",Objects.toString(h.getLocalityCode(),""),"rooms",rooms.findByHouseId(h.getId()).stream().map(this::roomData).toList());}
    private Map<String,Object> roomData(Room x){return Map.of("id",x.getId(),"houseId",x.getHouseId(),"code",Objects.toString(x.getRoomNumber(),""),"area",Objects.toString(x.getArea(),""),"rentAmount",Objects.toString(x.getRentPrice(),""),"depositAmount",Objects.toString(x.getDepositAmount(),""),"capacity",Objects.toString(x.getMaxOccupants(),""),"status",Objects.toString(x.getStatus(),""),"currentLoad",0);}
    private Map<String,Object> verificationData(RentalHouseVerification v){Map<String,Object> m=new LinkedHashMap<>();m.put("id",v.getId());m.put("houseId",v.getHouseId());m.put("rightType",v.getRightType());m.put("scopeDescription",v.getScopeDescription());m.put("validFrom",v.getValidFrom());m.put("validUntil",v.getValidUntil());m.put("status",v.getStatus());return m;}
    private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);}
    private void requireBody(JsonNode b){if(b==null||!b.isObject())throw bad("JSON request là bắt buộc");}
    private String text(JsonNode b,String k){return text(b,k,"");}private String text(JsonNode b,String k,String f){return b!=null&&b.hasNonNull(k)?b.get(k).asText():f;}
    private BigDecimal decimal(JsonNode b,String k){try{return new BigDecimal(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}}
    private int integer(JsonNode b,String k){try{return Integer.parseInt(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}}
    private LocalDate date(JsonNode b,String k,LocalDate f){try{return b.hasNonNull(k)?LocalDate.parse(text(b,k)):f;}catch(Exception e){throw bad(k+" không hợp lệ");}}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);}private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}

