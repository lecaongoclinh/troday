package com.troday.api.service;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.entity.*; import com.troday.api.repository.*; import jakarta.servlet.http.HttpServletRequest; import jakarta.transaction.Transactional; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException; import java.time.*; import java.util.*;
@Service public class ResidentService {
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
 private final AccountService accounts; private final ContractRepository contracts; private final RoomTenantRepository members; private final OccupantJoinRequestRepository joins; private final RepresentativeHistoryRepository history;
 public ResidentService(AccountService a,ContractRepository c,RoomTenantRepository m,OccupantJoinRequestRepository j,RepresentativeHistoryRepository h){accounts=a;contracts=c;members=m;joins=j;history=h;}
 public ApiResponseDto<?> residents(HttpServletRequest r){
Long me=accounts.authenticatedUserId(r);return ok("GET",domain.page(r,"FROM room_tenants m JOIN contracts c ON c.id=m.contract_id WHERE c.landlord_id=?","m.id","CONCAT_WS(' ',m.full_name,m.phone_number,m.identity_number)","m.id DESC",List.of(me),Map.of("status","m.status","roomId","m.room_id","houseId","c.house_id","contractId","m.contract_id"),id->memberData(members.findById(id).orElseThrow())));
 }
 public ApiResponseDto<?> contractMembers(HttpServletRequest r,Long cid){access(r,cid);return ok("GET",members.findAll().stream().filter(x->cid.equals(x.getContractId())).map(this::memberData).toList());}
 public ApiResponseDto<?> export(HttpServletRequest r){return residents(r);}
 public ApiResponseDto<?> joinList(HttpServletRequest r){Long me=accounts.authenticatedUserId(r);String status=r.getParameter("status");return ok("GET",joins.findAll().stream().filter(x->status==null||status.equals(joinStatus(x))).sorted(Comparator.comparing(OccupantJoinRequest::getId).reversed()).filter(x->x.getApplicantId().equals(me)||x.getRequestedById().equals(me)||domain.representative(x.getContractId(),me)||contracts.findById(x.getContractId()).map(c->Objects.equals(c.getLandlordId(),me)).orElse(false)).map(this::joinData).toList());}
 @Transactional public ApiResponseDto<?> createJoin(HttpServletRequest r, JsonNode body) {
     Long requester = accounts.authenticatedUserId(r);
     Long contractId = requiredLong(body, "contractId");
     domain.lockContract(contractId);
     Contract contract = access(r, contractId);
     if (!"ACTIVE".equals(contract.getStatus())) throw conflict("Hợp đồng chưa sẵn sàng thêm người");
     if (!domain.representative(contractId, requester)) throw forbidden("Chỉ đại diện mới được đề nghị thêm người");

     Long applicant = findJoinApplicant(body);
     if (requester.equals(applicant)) throw bad("Hãy chọn một người khác với đại diện hợp đồng");
     LocalDate moveIn = date(body, "plannedMoveInDate");
     if (moveIn.isBefore(contract.getStartDate()) || moveIn.isAfter(contract.getEndDate())) {
         throw bad("Ngày dự kiến vào ở phải nằm trong thời hạn hợp đồng");
     }
     if (domain.exists("SELECT id FROM room_tenants WHERE tenant_id=? AND (status='ACTIVE' OR (contract_id=? AND status='PLANNED'))", applicant, contractId)) {
         throw conflict("Người được mời đang có lượt ở hoặc đã có tên trong hợp đồng");
     }
     if (joins.findByContractIdOrderByIdDesc(contractId).stream().anyMatch(x -> x.getApplicantId().equals(applicant)
             && Set.of("PENDING_CONSENT", "PENDING_LANDLORD", "APPROVED").contains(joinStatus(x)))) {
         throw conflict("Đã có yêu cầu đang mở cho người này");
     }
     domain.jdbc.update("UPDATE occupant_join_requests SET status='EXPIRED' WHERE contract_id=? AND applicant_id=? AND status='APPROVED' AND hold_expires_at<=UTC_TIMESTAMP(6)", contractId, applicant);
     OccupantJoinRequest join = new OccupantJoinRequest();
     join.setContractId(contractId);
     join.setApplicantId(applicant);
     join.setRequestedById(requester);
     join.setRepresentativeRoomTenantId(contract.getRepresentativeRoomTenantId());
     join.setPlannedMoveInDate(moveIn);
     join.setMessage(text(body, "message"));
     if (body.path("representativeConsent").isBoolean() && body.path("representativeConsent").asBoolean()) {
         join.setRepresentativeConsentedById(requester);
         join.setRepresentativeConsentedAt(now());
     }
     joins.saveAndFlush(join);
     domain.notifyUser(applicant, "OCCUPANT_JOIN_INVITED", "OCCUPANT_JOIN_REQUEST", join.getId(),
         "Lời mời vào ở", "Mở mục Hợp đồng để xem thông tin và phản hồi.", "join-invited:" + join.getId());
     return ok("POST", joinData(join));
 }

 private Long findJoinApplicant(JsonNode body) {
     boolean byId = body.hasNonNull("applicantId");
     String contact = text(body, "applicantContact").strip();
     boolean byContact = !contact.isEmpty();
     if (byId == byContact) throw bad("Chọn một kết nối hoặc nhập email/số điện thoại đăng nhập");
     String column = byId ? "u.id" : contact.contains("@") ? "u.email" : "u.phone_number";
     Object value = byId ? requiredLong(body, "applicantId") : contact;
     return domain.jdbc.queryForList("SELECT t.id FROM tenants t JOIN users u ON u.id=t.id WHERE u.status='ACTIVE' AND " + column + "=?", Long.class, value)
         .stream().findFirst().orElseThrow(() -> bad("Thông tin người được mời chưa khớp với tài khoản người thuê đang hoạt động"));
 }

 @Transactional public ApiResponseDto<?> consent(HttpServletRequest r, Long id, JsonNode body) {
     Long me = accounts.authenticatedUserId(r);
     OccupantJoinRequest join = lockJoin(id);
     if (body == null || !body.path("consent").isBoolean()) throw bad("Chọn đồng ý hoặc từ chối lời mời");
     if (!body.path("consent").asBoolean()) return cancelJoin(me, join, text(body, "reason"));
     if (!Set.of("PENDING_CONSENT", "PENDING_LANDLORD").contains(join.getStatus())) throw conflict("Yêu cầu không còn chờ phản hồi");
     Contract contract = contracts.findById(join.getContractId()).orElseThrow();
     if (!"ACTIVE".equals(contract.getStatus()) || !Objects.equals(contract.getRepresentativeRoomTenantId(), join.getRepresentativeRoomTenantId())) {
         throw conflict("Hợp đồng hoặc người đại diện đã thay đổi");
     }
     if (me.equals(join.getApplicantId())) {
         if (join.getApplicantConsentedAt() == null) {
             join.setApplicantConsentedById(me);
             join.setApplicantConsentedAt(now());
         }
     } else if (me.equals(join.getRequestedById()) && domain.representative(contract.getId(), me)) {
         if (join.getRepresentativeConsentedAt() == null) {
             join.setRepresentativeConsentedById(me);
             join.setRepresentativeConsentedAt(now());
         }
     } else {
         throw forbidden("Không thuộc yêu cầu này");
     }
     if ("PENDING_CONSENT".equals(join.getStatus()) && join.getRepresentativeConsentedAt() != null && join.getApplicantConsentedAt() != null) {
         join.setStatus("PENDING_LANDLORD");
         domain.notifyUser(contract.getLandlordId(), "OCCUPANT_JOIN_PENDING", "OCCUPANT_JOIN_REQUEST", id,
             "Yêu cầu thêm người ở ghép", "Mở mục Hợp đồng để duyệt yêu cầu thêm người.", "join-pending:" + id);
     }
     return ok("POST", joinData(joins.save(join)));
 }

 @Transactional public ApiResponseDto<?> cancel(HttpServletRequest r, Long id, JsonNode body) {
     return cancelJoin(accounts.authenticatedUserId(r), lockJoin(id), text(body, "reason"));
 }

 private ApiResponseDto<?> cancelJoin(Long me, OccupantJoinRequest join, String reason) {
     if (!me.equals(join.getRequestedById()) && !me.equals(join.getApplicantId())) throw forbidden("Không có quyền hủy");
     if (!Set.of("PENDING_CONSENT", "PENDING_LANDLORD").contains(join.getStatus())) throw conflict("Yêu cầu không thể hủy");
     join.setStatus("CANCELLED");
     join.setCancelledById(me);
     join.setCancelledAt(now());
     join.setCancellationReason(reason);
     return ok("POST", joinData(joins.save(join)));
 }

 private OccupantJoinRequest lockJoin(Long id) {
     Long contractId = join(id).getContractId();
     domain.lockContract(contractId);
     OccupantJoinRequest current = domain.current(OccupantJoinRequest.class, id);
     if (current == null) throw notFound("Không tìm thấy yêu cầu thêm người");
     return current;
 }

 private LocalDateTime now() {
     return LocalDateTime.now(ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS);
 }
 public ApiResponseDto<?> approve(HttpServletRequest r,Long id){
join(id);domain.procedure("sp_approve_occupant_join",false,id,accounts.authenticatedUserId(r));return ok("POST",joinData(join(id)));
 }
 @Transactional public ApiResponseDto<?> reject(HttpServletRequest r,Long id,JsonNode b){Long owner=accounts.authenticatedUserId(r);OccupantJoinRequest x=lockJoin(id);Contract c=access(r,x.getContractId());if(!Objects.equals(c.getLandlordId(),owner))throw forbidden("Chỉ chủ trọ được từ chối");if(!"PENDING_LANDLORD".equals(x.getStatus()))throw conflict("Yêu cầu chưa đủ consent");x.setStatus("REJECTED");x.setReviewedById(owner);x.setReviewedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));x.setRejectionReason(text(b,"reason"));if(x.getRejectionReason().isBlank())throw bad("reason là bắt buộc");return ok("POST",joinData(joins.save(x)));}
 public ApiResponseDto<?> cancelHold(HttpServletRequest r,Long id,JsonNode b){
join(id);domain.procedure("sp_cancel_join_hold",false,id,accounts.authenticatedUserId(r),text(b,"reason"));return ok("POST",joinData(join(id)));
 }
 public ApiResponseDto<?> complete(HttpServletRequest r,Long id){
join(id);domain.procedure("sp_complete_occupant_join",false,id,accounts.authenticatedUserId(r));OccupantJoinRequest x=join(id);return ok("POST",Map.of("request",joinData(x),"member",memberData(members.findById(x.getCompletedRoomTenantId()).orElseThrow())));
 }
 public ApiResponseDto<?> moveOut(HttpServletRequest r,Long cid,Long mid,JsonNode b){
access(r,cid);LocalDate d=b!=null&&b.hasNonNull("moveOutDate")?date(b,"moveOutDate"):LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));domain.procedure("sp_move_out",false,cid,mid,d,accounts.authenticatedUserId(r));Contract c=contracts.findById(cid).orElseThrow();return ok("POST",Map.of("member",memberData(members.findById(mid).orElseThrow()),"contractStatus",c.getStatus(),"roomStatus",domain.jdbc.queryForObject("SELECT status FROM rooms WHERE id=?",String.class,c.getRoomId())));
 }
 public ApiResponseDto<?> candidates(HttpServletRequest r,Long cid){Contract c=access(r,cid);if(!Objects.equals(c.getLandlordId(),accounts.authenticatedUserId(r)))throw forbidden("Chỉ chủ trọ được xem");return ok("GET",members.findAll().stream().filter(x->cid.equals(x.getContractId())&&"ACTIVE".equals(x.getStatus())&&x.getTenantId()!=null&&domain.exists("SELECT id FROM users WHERE id=? AND status='ACTIVE'",x.getTenantId())&&!x.getId().equals(c.getRepresentativeRoomTenantId())).map(this::memberData).toList());}
 public ApiResponseDto<?> representativeHistory(HttpServletRequest r,Long cid){access(r,cid);return ok("GET",history.findByContractIdOrderByStartedAtDesc(cid).stream().map(this::historyData).toList());}
 public ApiResponseDto<?> handover(HttpServletRequest r,Long cid,JsonNode b){
access(r,cid);domain.procedure("sp_handover_representative",false,cid,requiredLong(b,"departingMemberId"),requiredLong(b,"successorMemberId"),accounts.authenticatedUserId(r),text(b,"reason"),b.path("consentRecorded").asBoolean());return ok("POST",Map.of("contractId",cid,"representativeMemberId",requiredLong(b,"successorMemberId")));
 }
 public org.springframework.http.ResponseEntity<byte[]> exportCsv(HttpServletRequest r){Long owner=accounts.authenticatedUserId(r);StringBuilder csv=new StringBuilder("\uFEFFMã,Hợp đồng,Phòng,Họ tên,Ngày vào ở\r\n");for(RoomTenant m:members.findAll()){Contract c=contracts.findById(m.getContractId()).orElse(null);if(c==null||!Objects.equals(c.getLandlordId(),owner)||!"ACTIVE".equals(m.getStatus()))continue;if(r.getParameter("houseId")!=null&&!r.getParameter("houseId").equals(String.valueOf(c.getHouseId())))continue;if(r.getParameter("roomId")!=null&&!r.getParameter("roomId").equals(String.valueOf(m.getRoomId())))continue;String q=Objects.toString(r.getParameter("q"),"").toLowerCase(Locale.ROOT);if(!m.getFullName().toLowerCase(Locale.ROOT).contains(q))continue;csv.append(csvCell(m.getId())).append(',').append(csvCell(m.getContractId())).append(',').append(csvCell(m.getRoomId())).append(',').append(csvCell(m.getFullName())).append(',').append(csvCell(m.getMoveInDate())).append("\r\n");}return org.springframework.http.ResponseEntity.ok().header("Content-Type","text/csv; charset=UTF-8").header("Content-Disposition","attachment; filename=residents.csv").body(csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));}
 private String csvCell(Object value){String s=Objects.toString(value,"");if(!s.stripLeading().isEmpty()&&"=+@-".indexOf(s.stripLeading().charAt(0))>=0)s="'"+s;return "\""+s.replace("\"","\"\"")+"\"";}
 private Contract access(HttpServletRequest r,Long cid){Long me=accounts.authenticatedUserId(r);Contract c=contracts.findById(cid).orElseThrow(()->notFound("Không tìm thấy hợp đồng"));if(!domain.contractReader(cid,me))throw forbidden("Không có quyền");return c;}private OccupantJoinRequest join(Long id){return joins.findById(id).orElseThrow(()->notFound("Không tìm thấy yêu cầu"));}private LocalDate date(JsonNode b,String k){try{return LocalDate.parse(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}}private Long requiredLong(JsonNode b,String k){if(b==null||!b.hasNonNull(k))throw bad(k+" là bắt buộc");return b.get(k).asLong();}private String text(JsonNode b,String k){return b!=null&&b.hasNonNull(k)?b.get(k).asText():"";}
 private Map<String,Object> memberData(RoomTenant m){Map<String,Object>x=new LinkedHashMap<>();x.put("id",m.getId());x.put("contractId",m.getContractId());x.put("roomId",m.getRoomId());x.put("tenantId",m.getTenantId());x.put("fullName",m.getFullName());x.put("status",m.getStatus());x.put("plannedMoveInDate",m.getPlannedMoveInDate());x.put("moveInDate",m.getMoveInDate());x.put("moveOutDate",m.getMoveOutDate());x.put("identityNumber",domain.jdbc.queryForObject("SELECT identity_number FROM room_tenants WHERE id=?",String.class,m.getId()));x.put("representative",domain.exists("SELECT id FROM contracts WHERE id=? AND representative_room_tenant_id=?",m.getContractId(),m.getId()));return x;}private String joinStatus(OccupantJoinRequest join) {
     if ("APPROVED".equals(join.getStatus()) && join.getHoldExpiresAt() != null && !join.getHoldExpiresAt().isAfter(now())) return "EXPIRED";
     return join.getStatus();
 }
 private Map<String,Object> joinData(OccupantJoinRequest join) {
     Map<String,Object> data = new LinkedHashMap<>();
     data.put("id", join.getId());
     data.put("contractId", join.getContractId());
     data.put("applicantId", join.getApplicantId());
     data.put("requestedById", join.getRequestedById());
     data.put("status", joinStatus(join));
     data.put("plannedMoveInDate", join.getPlannedMoveInDate());
     data.put("holdExpiresAt", join.getHoldExpiresAt());
     data.put("completedRoomTenantId", join.getCompletedRoomTenantId());
     data.put("representativeConsented", join.getRepresentativeConsentedAt() != null);
     data.put("applicantConsented", join.getApplicantConsentedAt() != null);
     data.put("message", join.getMessage());
     data.put("rejectionReason", join.getRejectionReason());
     data.putAll(domain.jdbc.queryForMap("""
         SELECT c.landlord_id AS landlordId, r.room_number AS roomCode, h.name AS houseName,
                c.contract_number AS contractNumber, u.full_name AS applicantName
         FROM contracts c JOIN rooms r ON r.id=c.room_id JOIN rental_houses h ON h.id=c.house_id
         JOIN users u ON u.id=? WHERE c.id=?
         """, join.getApplicantId(), join.getContractId()));
     return data;
 }
 private Map<String,Object> historyData(RepresentativeHistory x){
Map<String,Object> m=new LinkedHashMap<>();m.put("id",x.getId());m.put("roomTenantId",x.getRoomTenantId());m.put("nameSnapshot",x.getNameSnapshot());m.put("eventType",x.getEventType());m.put("startedAt",x.getStartedAt());m.put("endedAt",x.getEndedAt());m.put("reason",x.getReason());return m;
 }private ApiResponseDto<?> ok(String m,Object d){return ApiResponseDto.ok("/api/v1",m,d);}private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);}private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
