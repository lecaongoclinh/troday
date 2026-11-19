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
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
    private final AccountService accounts; private final RentalHouseRepository houses; private final RoomRepository rooms;
    private final LandlordRepository landlords; private final RentalHouseVerificationRepository verifications; private final PostRepository posts;

    public HouseService(AccountService accounts, RentalHouseRepository houses, RoomRepository rooms, LandlordRepository landlords,
                        RentalHouseVerificationRepository verifications, PostRepository posts) {
        this.accounts=accounts; this.houses=houses; this.rooms=rooms; this.landlords=landlords; this.verifications=verifications; this.posts=posts;
    }

    public ApiResponseDto<?> list(HttpServletRequest r){
Long me=accounts.authenticatedUserId(r);return ok("GET",domain.page(r,"FROM rental_houses h WHERE h.landlord_id=?","h.id","CONCAT_WS(' ',h.name,h.address)","h.id DESC",List.of(me),Map.of(),id->houseData(houses.findById(id).orElseThrow())));
 }
    @Transactional public ApiResponseDto<?> create(HttpServletRequest r,JsonNode b){Long owner=accounts.authenticatedUserId(r);requireBody(b);if(!landlords.existsById(owner))throw forbidden("Cần được duyệt vai trò chủ trọ trước khi tạo nhà");RentalHouse h=new RentalHouse();h.setLandlordId(owner);applyHouse(h,b);if(text(b,"name").isBlank()||text(b,"address").isBlank()||text(b,"provinceCode").isBlank())throw bad("Cần tên, địa chỉ và mã tỉnh/thành");return ok("POST",houseData(houses.save(h)));}
    public ApiResponseDto<?> detail(HttpServletRequest r,Long id){return ok("GET",houseData(owned(r,id)));}
    public ApiResponseDto<?> update(HttpServletRequest r,Long id,JsonNode b){
RentalHouse h=owned(r,id);requireBody(b);String match=r.getHeader("If-Match");if(match==null)throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED,"Cần If-Match từ rowVersion của nhà");long version;try{version=Long.parseLong(match.replace("\"",""));}catch(Exception e){throw bad("If-Match không hợp lệ");}domain.procedure("sp_update_rental_house",false,id,accounts.authenticatedUserId(r),version,b.has("name")?text(b,"name"):h.getName(),b.has("address")?text(b,"address"):h.getAddress(),b.has("provinceCode")?text(b,"provinceCode"):h.getProvinceCode(),b.has("localityCode")?text(b,"localityCode"):h.getLocalityCode(),b.has("areaLabel")?text(b,"areaLabel"):h.getAreaLabel(),b.has("latitude")?decimal(b,"latitude"):h.getLatitude(),b.has("longitude")?decimal(b,"longitude"):h.getLongitude(),b.has("notes")?text(b,"notes"):h.getNotes());return ok("PATCH",houseData(houses.findById(id).orElseThrow()));
 }

    public ApiResponseDto<?> verificationHistory(HttpServletRequest r,Long hid){owned(r,hid);return ok("GET",verifications.findByHouseIdOrderBySubmittedAtDesc(hid).stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> submitVerification(HttpServletRequest r,Long hid,JsonNode b){
owned(r,hid);requireBody(b);Long id=domain.procedure("sp_submit_house_verification",true,hid,accounts.authenticatedUserId(r),text(b,"rightType"),text(b,"scopeDescription"),date(b,"validFrom",LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"))),date(b,"validUntil",null),b.path("documents").toString());return ok("POST",verificationData(findVerification(id)));
 }
    public ApiResponseDto<?> verification(HttpServletRequest r,Long hid,Long id){owned(r,hid);return ok("GET",verificationData(findVerification(hid,id)));}
    @Transactional public ApiResponseDto<?> withdraw(HttpServletRequest r,Long hid,Long id){owned(r,hid);RentalHouseVerification v=findVerification(hid,id);if(!"PENDING".equals(v.getStatus()))throw conflict("Hồ sơ không còn chờ");v.setStatus("WITHDRAWN");return ok("POST",verificationData(verifications.save(v)));}

    public ApiResponseDto<?> adminVerificationList(HttpServletRequest r){accounts.requireAdminId(r);return ok("GET",verifications.findAll().stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> adminVerification(HttpServletRequest r,Long id){accounts.requireAdminId(r);return ok("GET",verificationData(findVerification(id)));}
    public ApiResponseDto<?> decision(HttpServletRequest r,Long id,JsonNode b){
domain.procedure("sp_review_house_verification",false,id,accounts.requireAdminId(r),text(b,"decision"),text(b,"reason"),b.path("evidenceChecked").asBoolean());return ok("POST",verificationData(findVerification(id)));
 }
    public ApiResponseDto<?> revoke(HttpServletRequest r,Long id,JsonNode b){
domain.procedure("sp_review_house_verification",false,id,accounts.requireAdminId(r),"REVOKE",text(b,"reason"),false);return ok("POST",verificationData(findVerification(id)));
 }
    public ApiResponseDto<?> rentalRight(HttpServletRequest r,Long hid){
owned(r,hid);List<Map<String,Object>> effective=domain.jdbc.queryForList("SELECT * FROM v_effective_house_verifications WHERE house_id=?",hid);return ok("GET",effective.isEmpty()?Map.of("effective",false):Map.of("effective",true,"verification",effective.get(0)));
 }

    public ApiResponseDto<?> roomList(HttpServletRequest r,Long hid){owned(r,hid);return ok("GET",rooms.findByHouseId(hid).stream().map(this::roomData).toList());}
    @Transactional public ApiResponseDto<?> roomCreate(HttpServletRequest r,Long hid,JsonNode b){owned(r,hid);requireBody(b);String number=text(b,"code",text(b,"roomNumber"));if(number.isBlank())throw bad("code là bắt buộc");if(rooms.findByHouseId(hid).stream().anyMatch(x->number.equals(x.getRoomNumber())))throw conflict("Số phòng đã tồn tại");Room x=new Room();x.setHouseId(hid);x.setRoomNumber(number);applyRoom(x,b);return ok("POST",roomData(rooms.save(x)));}
    @Transactional public ApiResponseDto<?> roomUpdate(HttpServletRequest r,Long id,JsonNode b){Room x=ownedRoom(r,id);if(b.has("capacity"))throw bad("Dùng PUT /rooms/{id}/capacity để thay sức chứa");applyRoom(x,b);return ok("PATCH",roomData(rooms.save(x)));}
    public ApiResponseDto<?> capacity(HttpServletRequest r,Long id,JsonNode b){
ownedRoom(r,id);domain.procedure("sp_set_room_capacity",false,id,integer(b,"capacity"),accounts.authenticatedUserId(r));return ok("PUT",roomData(findRoom(id)));
 }
    public ApiResponseDto<?> roomDetail(Long id){return ok("GET",roomData(findRoom(id)));}
    public ApiResponseDto<?> roomPosts(Long id){
findRoom(id);return ok("GET",posts.findByRoomId(id).stream().filter(p->domain.publicPost(p.getId())).toList());
 }
    public ApiResponseDto<?> roomResidents(HttpServletRequest r,Long id){
ownedRoom(r,id);return ok("GET",domain.jdbc.queryForList("SELECT id,contract_id AS contractId,room_id AS roomId,tenant_id AS tenantId,full_name AS fullName,status,move_in_date AS moveInDate,move_out_date AS moveOutDate FROM room_tenants WHERE room_id=?",id));
 }
    public ApiResponseDto<?> roomServices(Long id){
return ok("GET",domain.jdbc.queryForList("SELECT h.id,h.name,h.unit,COALESCE(rs.unit_price_override,h.default_unit_price) AS unitPrice,COALESCE(rs.calculation_method_override,h.default_calculation_method) AS calculationMethod FROM house_services h JOIN rooms r ON r.house_id=h.house_id LEFT JOIN room_services rs ON rs.room_id=r.id AND rs.house_service_id=h.id WHERE r.id=? AND h.is_active=TRUE AND COALESCE(rs.is_active,TRUE)=TRUE",id));
 }
    public ApiResponseDto<?> dashboard(HttpServletRequest r){Long owner=accounts.authenticatedUserId(r);List<RentalHouse> hs=houses.findByLandlordId(owner);List<Room> rs=hs.stream().flatMap(h->rooms.findByHouseId(h.getId()).stream()).toList();return ok("GET",Map.of("houseCount",hs.size(),"roomCount",rs.size(),"availableRoomCount",rs.stream().filter(x->"AVAILABLE".equals(x.getStatus())).count(),"houses",hs.stream().map(this::houseData).toList()));}

    public void requireRoomReader(HttpServletRequest r,Long id){Long uid=r.getHeader("Authorization")==null?null:accounts.authenticatedUserId(r);domain.roomReader(id,uid);}
    private RentalHouse owned(HttpServletRequest r,Long id){RentalHouse h=houses.findById(id).orElseThrow(()->notFound("Không tìm thấy nhà"));if(!h.getLandlordId().equals(accounts.authenticatedUserId(r)))throw forbidden("Bạn không sở hữu nhà này");return h;}
    private Room ownedRoom(HttpServletRequest r,Long id){Room x=findRoom(id);owned(r,x.getHouseId());return x;}
    private RentalHouseVerification findVerification(Long id){return verifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ quyền nhà"));}
    private RentalHouseVerification findVerification(Long hid,Long id){RentalHouseVerification v=findVerification(id);if(!v.getHouseId().equals(hid))throw notFound("Không tìm thấy hồ sơ quyền nhà");return v;}
    private Room findRoom(Long id){return rooms.findById(id).orElseThrow(()->notFound("Không tìm thấy phòng"));}
    private void applyHouse(RentalHouse h,JsonNode b){if(b.has("name"))h.setName(text(b,"name"));if(b.has("address"))h.setAddress(text(b,"address"));if(b.has("provinceCode"))h.setProvinceCode(text(b,"provinceCode"));if(b.has("localityCode"))h.setLocalityCode(text(b,"localityCode"));if(b.has("areaLabel"))h.setAreaLabel(text(b,"areaLabel"));if(b.has("notes"))h.setNotes(text(b,"notes"));}
    private void applyRoom(Room x,JsonNode b){if(b.has("area"))x.setArea(decimal(b,"area"));if(b.has("rentAmount"))x.setRentPrice(decimal(b,"rentAmount"));if(b.has("depositAmount"))x.setDepositAmount(decimal(b,"depositAmount"));if(b.has("capacity"))x.setMaxOccupants(integer(b,"capacity"));if(b.has("status")&&!Objects.equals(x.getStatus(),text(b,"status"))){if(!Set.of("AVAILABLE","MAINTENANCE").contains(text(b,"status"))||x.getId()!=null&&domain.exists("SELECT id FROM contracts WHERE room_id=? AND status IN ('DRAFT','PENDING_CONFIRMATION','CONFIRMED','ACTIVE')",x.getId()))throw conflict("Trạng thái phòng đang do hợp đồng quản lý");x.setStatus(text(b,"status"));}if(x.getStatus()==null)x.setStatus("AVAILABLE");if(x.getMaxOccupants()==null||x.getMaxOccupants()<1||x.getArea()!=null&&x.getArea().signum()<=0||x.getRentPrice()!=null&&x.getRentPrice().signum()<0||x.getDepositAmount()!=null&&x.getDepositAmount().signum()<0)throw bad("Sức chứa, diện tích hoặc số tiền không hợp lệ");}
    private Map<String,Object> houseData(RentalHouse h){
Map<String,Object> out=new LinkedHashMap<>();out.put("id",h.getId());out.put("landlordId",h.getLandlordId());out.put("name",h.getName());out.put("address",h.getAddress());out.put("provinceCode",h.getProvinceCode());out.put("localityCode",h.getLocalityCode());out.put("areaLabel",h.getAreaLabel());out.put("notes",h.getNotes());out.put("rowVersion",domain.jdbc.queryForObject("SELECT row_version FROM rental_houses WHERE id=?",Long.class,h.getId()));out.put("rooms",rooms.findByHouseId(h.getId()).stream().map(this::roomData).toList());return out;
 }
    private Map<String,Object> roomData(Room x){
Map<String,Object> out=new LinkedHashMap<>();out.put("id",x.getId());out.put("houseId",x.getHouseId());out.put("code",x.getRoomNumber());out.put("area",x.getArea());out.put("rentAmount",x.getRentPrice());out.put("depositAmount",x.getDepositAmount());out.put("capacity",x.getMaxOccupants());out.put("status",x.getStatus());out.put("currentLoad",domain.jdbc.queryForObject("SELECT (SELECT COUNT(*) FROM room_tenants rt JOIN contracts c ON c.id=rt.contract_id WHERE rt.room_id=? AND (rt.status='ACTIVE' OR rt.status='PLANNED' AND c.status IN ('DRAFT','PENDING_CONFIRMATION','CONFIRMED','ACTIVE')))+(SELECT COUNT(*) FROM occupant_join_requests j JOIN contracts c ON c.id=j.contract_id WHERE c.room_id=? AND j.status='APPROVED' AND j.hold_expires_at>UTC_TIMESTAMP(6))",Long.class,x.getId(),x.getId()));return out;
 }
    private Map<String,Object> verificationData(RentalHouseVerification v){Map<String,Object> m=new LinkedHashMap<>();m.put("id",v.getId());m.put("houseId",v.getHouseId());m.put("rightType",v.getRightType());m.put("scopeDescription",v.getScopeDescription());m.put("validFrom",v.getValidFrom());m.put("validUntil",v.getValidUntil());m.put("status",v.getStatus());m.put("documents",domain.jdbc.queryForList("SELECT file_id AS fileId,document_type AS documentType FROM house_verification_documents WHERE verification_id=?",v.getId()));m.put("houseSnapshot",domain.jdbc.queryForObject("SELECT house_snapshot FROM rental_house_verifications WHERE id=?",String.class,v.getId()));return m;}
    private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);}
    private void requireBody(JsonNode b){if(b==null||!b.isObject())throw bad("JSON request là bắt buộc");}
    private String text(JsonNode b,String k){return text(b,k,"");}private String text(JsonNode b,String k,String f){return b!=null&&b.hasNonNull(k)?b.get(k).asText():f;}
    private BigDecimal decimal(JsonNode b,String k){try{return new BigDecimal(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}}
    private int integer(JsonNode b,String k){try{return Integer.parseInt(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}}
    private LocalDate date(JsonNode b,String k,LocalDate f){try{return b.hasNonNull(k)?LocalDate.parse(text(b,k)):f;}catch(Exception e){throw bad(k+" không hợp lệ");}}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);}private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}

