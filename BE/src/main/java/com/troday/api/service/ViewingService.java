package com.troday.api.service;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.entity.*; import com.troday.api.repository.*; import jakarta.servlet.http.HttpServletRequest; import jakarta.transaction.Transactional; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException; import java.time.*; import java.util.*;
@Service public class ViewingService {
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
 private final AccountService accounts; private final ViewingProposalRepository proposals; private final ViewingRepository viewings; private final RoomRepository rooms; private final RentalHouseRepository houses; private final ConversationParticipantRepository participants;
 public ViewingService(AccountService a,ViewingProposalRepository p,ViewingRepository v,RoomRepository r,RentalHouseRepository h,ConversationParticipantRepository cp){accounts=a;proposals=p;viewings=v;rooms=r;houses=h;participants=cp;}
 public ApiResponseDto<?> proposalList(HttpServletRequest r){Long me=accounts.authenticatedUserId(r);String status=r.getParameter("status");return ok("GET",proposals.findByTenantIdOrLandlordIdOrderByStartsAtDesc(me,me).stream().filter(p->status==null||status.equals(effectiveStatus(p))).map(this::proposalData).toList());}
 public ApiResponseDto<?> createProposal(HttpServletRequest r,JsonNode b){
Long tenant=accounts.authenticatedUserId(r);Long id=domain.procedure("sp_request_viewing",true,requiredLong(b,"conversationId"),requiredLong(b,"roomId"),tenant,parseTime(text(b,"startsAt")),duration(b),text(b,"notes"),text(b,"clientRequestKey"));return ok("POST",proposalData(proposals.findById(id).orElseThrow()));
 }
 public ApiResponseDto<?> proposalDecision(HttpServletRequest r,Long id,JsonNode b){
accounts.authenticatedUserId(r);Long viewingId=domain.procedure("sp_review_viewing_proposal",true,id,accounts.authenticatedUserId(r),text(b,"decision"),text(b,"reason"));Map<String,Object> out=new LinkedHashMap<>();out.put("proposal",proposalData(proposals.findById(id).orElseThrow()));out.put("viewing",viewingId==null?null:viewingData(viewings.findById(viewingId).orElseThrow()));return ok("POST",out);
 }
 public ApiResponseDto<?> withdrawProposal(HttpServletRequest r,Long id){
domain.procedure("sp_withdraw_viewing_proposal",false,id,accounts.authenticatedUserId(r));return ok("POST",proposalData(proposals.findById(id).orElseThrow()));
 }
 public ApiResponseDto<?> viewingList(HttpServletRequest r){Long me=accounts.authenticatedUserId(r);String status=r.getParameter("status");return ok("GET",viewings.findByTenantIdOrCreatedByIdOrderByStartsAtDesc(me,me).stream().filter(v->status==null||status.equals(v.getStatus())).map(this::viewingData).toList());}
 public ApiResponseDto<?> viewingDetail(HttpServletRequest r,Long id){return ok("GET",viewingData(memberViewing(r,id)));}
 public ApiResponseDto<?> createViewing(HttpServletRequest r,JsonNode b){
Long id=domain.procedure("sp_schedule_viewing",true,requiredLong(b,"conversationId"),requiredLong(b,"roomId"),requiredLong(b,"tenantId"),accounts.authenticatedUserId(r),parseTime(text(b,"startsAt")),duration(b),text(b,"notes"));return ok("POST",viewingData(viewings.findById(id).orElseThrow()));
 }
 public ApiResponseDto<?> attendance(HttpServletRequest r,Long id,JsonNode b){
memberViewing(r,id);domain.procedure("sp_set_viewing_outcome",false,id,accounts.authenticatedUserId(r),text(b,"outcome"),text(b,"reason"));return ok("POST",viewingData(viewings.findById(id).orElseThrow()));
 }
 public ApiResponseDto<?> cancel(HttpServletRequest r,Long id,JsonNode b){
memberViewing(r,id);domain.procedure("sp_set_viewing_outcome",false,id,accounts.authenticatedUserId(r),"CANCEL",text(b,"reason"));return ok("POST",viewingData(viewings.findById(id).orElseThrow()));
 }
 public ApiResponseDto<?> rentalDecision(HttpServletRequest r,Long id,JsonNode b){
memberViewing(r,id);String action=text(b,"decision");if("WITHDRAWN".equals(action))action="WITHDRAW";domain.procedure("sp_set_viewing_outcome",false,id,accounts.authenticatedUserId(r),action,text(b,"reason"));return ok("POST",viewingData(viewings.findById(id).orElseThrow()));
 }
 private String effectiveStatus(ViewingProposal p){return "PENDING".equals(p.getStatus())&&!p.getStartsAt().isAfter(LocalDateTime.now(ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS))?"EXPIRED":p.getStatus();}
 private Viewing toViewing(ViewingProposal p){Viewing v=new Viewing();v.setRoomId(p.getRoomId());v.setHouseId(p.getHouseId());v.setConversationId(p.getConversationId());v.setTenantId(p.getTenantId());v.setCreatedById(p.getLandlordId());v.setStartsAt(p.getStartsAt());v.setEndsAt(p.getEndsAt());v.setNotes(p.getNotes());return v;}
 private Viewing memberViewing(HttpServletRequest r,Long id){Long me=accounts.authenticatedUserId(r);Viewing v=viewings.findById(id).orElseThrow(()->notFound("Không tìm thấy lịch xem"));if(!v.getTenantId().equals(me)&&!v.getCreatedById().equals(me))throw forbidden("Không có quyền xem lịch");return v;}
 private boolean participant(Long c,Long u){return participants.findByConversationIdAndUserId(c,u).isPresent();}
 private boolean overlap(Long room,LocalDateTime start,LocalDateTime end,Long ignored){return viewings.findByRoomIdAndStatus(room,"SCHEDULED").stream().anyMatch(v->!Objects.equals(v.getId(),ignored)&&v.getStartsAt().isBefore(end)&&v.getEndsAt().isAfter(start));}
 private int duration(JsonNode b){int n=b!=null&&b.has("durationMinutes")?b.get("durationMinutes").asInt():0;if(!Set.of(30,60,90,120).contains(n))throw bad("durationMinutes phải là 30, 60, 90 hoặc 120");return n;}
 private LocalDateTime parseTime(String raw){
try{return OffsetDateTime.parse(raw).withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();}catch(Exception e){throw bad("startsAt cần múi giờ, ví dụ +07:00");}
 }
 private boolean future(LocalDateTime x){return x.isAfter(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));}
 private Map<String,Object> proposalData(ViewingProposal p){Map<String,Object> m=new LinkedHashMap<>();m.put("id",p.getId());m.put("roomId",p.getRoomId());m.put("houseId",p.getHouseId());m.put("conversationId",p.getConversationId());m.put("tenantId",p.getTenantId());m.put("landlordId",p.getLandlordId());m.put("startsAt",p.getStartsAt());m.put("endsAt",p.getEndsAt());m.put("status",effectiveStatus(p));m.put("effectiveStatus",effectiveStatus(p));m.put("scheduledViewingId",p.getScheduledViewingId());m.put("rejectionReason",p.getRejectionReason());return m;}
 private Map<String,Object> viewingData(Viewing v){Map<String,Object> m=new LinkedHashMap<>();m.put("id",v.getId());m.put("roomId",v.getRoomId());m.put("houseId",v.getHouseId());m.put("conversationId",v.getConversationId());m.put("tenantId",v.getTenantId());m.put("createdById",v.getCreatedById());m.put("startsAt",v.getStartsAt());m.put("endsAt",v.getEndsAt());m.put("status",v.getStatus());m.put("rentalDecision",v.getRentalDecision());m.put("attendanceConfirmedAt",v.getAttendanceConfirmedAt());m.put("cancelledAt",v.getCancelledAt());m.put("cancellationReason",v.getCancellationReason());return m;}
 private Long requiredLong(JsonNode b,String k){if(b==null||!b.hasNonNull(k))throw bad(k+" là bắt buộc");return b.get(k).asLong();}private String text(JsonNode b,String k){return b!=null&&b.hasNonNull(k)?b.get(k).asText():"";}private ApiResponseDto<?> ok(String m,Object d){return ApiResponseDto.ok("/api/v1",m,d);}private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);}private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
