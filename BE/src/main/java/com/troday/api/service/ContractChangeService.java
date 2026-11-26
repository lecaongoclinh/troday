package com.troday.api.service;
import com.fasterxml.jackson.databind.JsonNode; import com.troday.api.dto.ApiResponseDto; import com.troday.api.entity.*; import com.troday.api.repository.*; import jakarta.servlet.http.HttpServletRequest; import jakarta.transaction.Transactional; import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException; import java.time.*; import java.util.*;
import java.math.BigDecimal;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
@Service public class ContractChangeService {
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
 private final ObjectMapper mapper = new ObjectMapper()
     .configure(com.fasterxml.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
 private final AccountService accounts; private final ContractRepository contracts; private final ContractChangeRequestRepository changes; private final RoomRepository rooms;
 public ContractChangeService(AccountService a,ContractRepository c,ContractChangeRequestRepository x,RoomRepository rooms){accounts=a;contracts=c;changes=x;this.rooms=rooms;}
 public ApiResponseDto<?> list(HttpServletRequest r,Long cid){access(r,cid);return ok("GET",changes.findByContractIdOrderByIdDesc(cid).stream().map(this::data).toList());}
 @Transactional public ApiResponseDto<?> create(HttpServletRequest r, Long cid, JsonNode body) {
     Long me = accounts.authenticatedUserId(r);
     domain.lockContract(cid);
     Contract contract = access(r, cid);
     if (!domain.representative(cid, me)) throw forbidden("Chỉ đại diện mới được yêu cầu điều chỉnh");
     if (!"ACTIVE".equals(contract.getStatus())) throw conflict("Chỉ hợp đồng đang hiệu lực mới được điều chỉnh");
     String type = text(body, "type");
     if (!Set.of("RENEWAL", "TERMINATION", "TRANSFER").contains(type)) throw bad("type không hợp lệ");
     Long base = requiredLong(body, "baseRevisionId");
     if (!Objects.equals(contract.getCurrentRevisionId(), base)) throw conflict("Phiên bản gốc đã thay đổi");
     if (changes.findByContractIdOrderByIdDesc(cid).stream().anyMatch(x ->
             Set.of("PENDING", "APPROVED_WAITING_CONFIRMATION", "READY_TO_APPLY").contains(x.getStatus()))) {
         throw conflict("Đã có yêu cầu điều chỉnh đang mở");
     }
     LocalDate effective = date(body, "effectiveDate");
     checkEffectiveDate(contract, effective);
     String reason = text(body, "reason");
     if (reason.isBlank() || reason.length() > 2000) throw bad("Lý do điều chỉnh phải có từ 1 đến 2.000 ký tự");
     ObjectNode proposal = mapper.createObjectNode().put("reason", reason);
     Long target = null;
     if ("RENEWAL".equals(type)) setRenewalEnd(contract, effective, date(body, "newEndDate"), proposal);
     if ("TRANSFER".equals(type)) {
         target = requiredLong(body, "targetRoomId");
         setTransferTerms(contract, target, effective, body.path("proposal"), proposal, false);
     } else if (body.hasNonNull("targetRoomId")) {
         throw bad("Phòng đích chỉ dùng cho yêu cầu chuyển phòng");
     }

     ContractChangeRequest change = new ContractChangeRequest();
     change.setContractId(cid);
     change.setRequestedById(me);
     change.setRepresentativeRoomTenantId(contract.getRepresentativeRoomTenantId());
     change.setBaseRevisionId(base);
     change.setTargetRoomId(target);
     change.setType(type);
     change.setRequestedEffectiveDate(effective);
     change.setProposalSnapshot(proposal.toString());
     change.setMessage(reason);
     return ok("POST", data(changes.save(change)));
 }

 private void checkEffectiveDate(Contract contract, LocalDate effective) {
     if (effective.isBefore(contract.getStartDate())) throw bad("Ngày hiệu lực không trước ngày bắt đầu");
 }

 private void setRenewalEnd(Contract contract, LocalDate effective, LocalDate end, ObjectNode proposal) {
     if (!end.isAfter(contract.getEndDate()) || end.isBefore(effective)) {
         throw bad("Ngày kết thúc mới phải sau ngày kết thúc cũ và không trước ngày hiệu lực");
     }
     proposal.put("newEndDate", end.toString());
 }

 private void setTransferTerms(Contract contract, Long target, LocalDate effective,
                               JsonNode terms, ObjectNode proposal, boolean sameRoom) {
     String content = terms.has("content") ? text(terms, "content") : text(proposal, "content");
     LocalDate end = terms.has("endDate") ? date(terms, "endDate") : date(proposal, "end_date");
     if (content.isBlank() || end.isBefore(effective)) throw bad("Chuyển phòng cần điều khoản và ngày kết thúc hợp lệ");
     if (target.equals(contract.getRoomId()) || !domain.exists("""
             SELECT r.id FROM rooms r JOIN rental_houses h ON h.id=r.house_id
             WHERE r.id=? AND h.landlord_id=?
             """, target, contract.getLandlordId())) {
         throw bad("Chọn phòng đích khác phòng hiện tại và cùng chủ trọ");
     }
     Room room = rooms.findById(target).orElseThrow(() -> notFound("Không tìm thấy phòng đích"));
     String rent = sameRoom && !terms.has("rentAmount") ? text(proposal, "rent_amount")
         : transferAmount(terms, "rentAmount", room.getRentPrice());
     String deposit = sameRoom && !terms.has("depositAmount") ? text(proposal, "deposit_amount")
         : transferAmount(terms, "depositAmount", room.getDepositAmount());
     proposal.put("content", content);
     proposal.put("end_date", end.toString());
     proposal.put("rent_amount", rent);
     proposal.put("deposit_amount", deposit);
 }
 private String transferAmount(JsonNode terms, String field, BigDecimal defaultAmount) {
     try {
         BigDecimal amount = terms.hasNonNull(field) ? new BigDecimal(terms.get(field).asText()) : defaultAmount;
         if (amount.signum() >= 0 && amount.scale() <= 2 && amount.compareTo(new BigDecimal("9999999999999.99")) <= 0) return amount.toPlainString();
     } catch (NumberFormatException ignored) { }
     throw bad(field + " không hợp lệ");
 }

 public ApiResponseDto<?> detail(HttpServletRequest r,Long id){ContractChangeRequest x=change(id);access(r,x.getContractId());return ok("GET",data(x));}
 @Transactional public ApiResponseDto<?> decision(HttpServletRequest r, Long id, JsonNode body) {
     Long owner = accounts.authenticatedUserId(r);
     ContractChangeRequest change = lockChange(id);
     Contract contract = access(r, change.getContractId());
     if (!Objects.equals(contract.getLandlordId(), owner)) throw forbidden("Chỉ chủ trọ được duyệt");
     if (!"PENDING".equals(change.getStatus())) throw conflict("Yêu cầu không còn chờ");
     String decision = text(body, "decision");
     if (!Set.of("APPROVE", "REJECT").contains(decision)) throw bad("decision phải là APPROVE hoặc REJECT");
     LocalDateTime reviewedAt = now();
     if ("REJECT".equals(decision)) {
         String reason = text(body, "reason");
         if (reason.isBlank()) throw bad("reason là bắt buộc");
         change.setReviewedById(owner);
         change.setReviewedAt(reviewedAt);
         change.setStatus("REJECTED");
         change.setRejectionReason(reason);
         return ok("POST", data(changes.save(change)));
     }
     if (!"ACTIVE".equals(contract.getStatus()) || !Objects.equals(contract.getCurrentRevisionId(), change.getBaseRevisionId())
             || !Objects.equals(contract.getRepresentativeRoomTenantId(), change.getRepresentativeRoomTenantId())) {
         throw conflict("Hợp đồng, phiên bản hoặc đại diện đã thay đổi");
     }
     String reviewedHash = text(body, "proposalHash");
     if (!reviewedHash.isEmpty() && !reviewedHash.equals(proposalHash(change))) {
         throw conflict("Phương án đã thay đổi. Hãy mở lại yêu cầu trước khi duyệt");
     }
     if (body.has("amendment")) {
         JsonNode amendment = body.get("amendment");
         if (!amendment.isObject()) throw bad("Phương án chỉnh sửa phải là một đối tượng");
         if (reviewedHash.isEmpty()) throw bad("Cần mở đúng đề nghị trước khi chỉnh phương án");
         amendProposal(contract, change, amendment);
     }
     if ("RENEWAL".equals(change.getType())) {
         Long version = domain.jdbc.queryForObject("SELECT COALESCE(MAX(revision_number),0)+1 FROM contract_revisions WHERE contract_id=?", Long.class, contract.getId());
         LocalDate end = date(snapshot(change), "newEndDate");
         var keys = new org.springframework.jdbc.support.GeneratedKeyHolder();
         domain.jdbc.update(connection -> {
             var statement = connection.prepareStatement("""
                 INSERT INTO contract_revisions(contract_id,revision_number,template_id,created_by_id,kind,status,start_date,end_date,
                     effective_from,rent_amount,deposit_amount,content,members_snapshot,representative_room_tenant_id,
                     landlord_confirmed_by_id,landlord_confirmed_at,sent_at)
                 SELECT contract_id,?,template_id,?,'RENEWAL','PENDING_CONFIRMATION',start_date,?,?,rent_amount,deposit_amount,content,members_snapshot,
                     ?,?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6) FROM contract_revisions WHERE id=?
                 """, java.sql.Statement.RETURN_GENERATED_KEYS);
             statement.setObject(1, version);
             statement.setObject(2, owner);
             statement.setObject(3, end);
             statement.setObject(4, change.getRequestedEffectiveDate());
             statement.setObject(5, change.getRepresentativeRoomTenantId());
             statement.setObject(6, owner);
             statement.setObject(7, contract.getCurrentRevisionId());
             return statement;
         }, keys);
         change.setProposedRevisionId(keys.getKey().longValue());
     }
     change.setReviewedById(owner);
     change.setReviewedAt(reviewedAt);
     change.setTenantConfirmedById(null);
     change.setTenantConfirmedAt(null);
     change.setStatus("APPROVED_WAITING_CONFIRMATION");
     change.setExpiresAt(reviewedAt.plusDays(2));
     return ok("POST", data(changes.save(change)));
 }

 private void amendProposal(Contract contract, ContractChangeRequest change, JsonNode amendment) {
     LocalDate effective = amendment.has("effectiveDate") ? date(amendment, "effectiveDate") : change.getRequestedEffectiveDate();
     checkEffectiveDate(contract, effective);
     ObjectNode original = snapshot(change);
     ObjectNode edited = original.deepCopy();
     Long target = change.getTargetRoomId();
     switch (change.getType()) {
         case "RENEWAL" -> setRenewalEnd(contract, effective, amendment.has("newEndDate")
             ? date(amendment, "newEndDate") : date(original, "newEndDate"), edited);
         case "TRANSFER" -> {
             if (amendment.has("targetRoomId")) target = requiredLong(amendment, "targetRoomId");
             JsonNode terms = amendment.path("proposal");
             if (amendment.has("proposal") && !terms.isObject()) throw bad("Điều khoản chuyển phòng không hợp lệ");
             setTransferTerms(contract, target, effective, terms, edited, Objects.equals(target, change.getTargetRoomId()));
         }
     }
     if (!effective.equals(change.getRequestedEffectiveDate()) || !Objects.equals(target, change.getTargetRoomId())
             || !edited.equals(original)) {
         original.put("effectiveDate", change.getRequestedEffectiveDate().toString());
         if (change.getTargetRoomId() != null) original.put("targetRoomId", change.getTargetRoomId());
         edited.set("originalRequest", original);
         change.setRequestedEffectiveDate(effective);
         change.setTargetRoomId(target);
         change.setProposalSnapshot(edited.toString());
     }
 }

 private ContractChangeRequest lockChange(Long id) {
     Long contractId = change(id).getContractId();
     domain.lockContract(contractId);
     ContractChangeRequest current = domain.current(ContractChangeRequest.class, id);
     if (current == null) throw notFound("Không tìm thấy yêu cầu điều chỉnh");
     return current;
 }

 private LocalDateTime now() {
     return LocalDateTime.now(ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS);
 }
 @Transactional public ApiResponseDto<?> confirm(HttpServletRequest r, Long id, JsonNode body) {
     Long me = accounts.authenticatedUserId(r);
     ContractChangeRequest change = lockChange(id);
     Contract contract = access(r, change.getContractId());
     if (!domain.representative(contract.getId(), me)) throw forbidden("Chỉ đại diện mới được xác nhận");
     boolean earlyConsent = hasEarlyConsent(change);
     if (!"APPROVED_WAITING_CONFIRMATION".equals(change.getStatus()) && !earlyConsent) {
         throw conflict("Yêu cầu không ở trạng thái chờ xác nhận phương án");
     }
     LocalDateTime confirmedAt = now();
     if (change.getExpiresAt() != null && !change.getExpiresAt().isAfter(confirmedAt)) {
         throw conflict("Phương án đã hết hạn");
     }
     if (!"ACTIVE".equals(contract.getStatus()) || !Objects.equals(contract.getCurrentRevisionId(), change.getBaseRevisionId())
             || !Objects.equals(contract.getRepresentativeRoomTenantId(), change.getRepresentativeRoomTenantId())) {
         throw conflict("Hợp đồng, phiên bản hoặc đại diện đã thay đổi");
     }
     if (!text(body, "proposalHash").equals(proposalHash(change))) {
         throw conflict("Phương án đã thay đổi. Hãy mở lại trước khi xác nhận");
     }
     if ("RENEWAL".equals(change.getType())) {
         if (!requiredLong(body, "proposedRevisionId").equals(change.getProposedRevisionId())) {
             throw conflict("Phiên bản đề xuất đã thay đổi");
         }
         int updated = domain.jdbc.update("""
             UPDATE contract_revisions SET status='CONFIRMED',tenant_confirmed_by_id=?,tenant_confirmed_at=?
             WHERE id=? AND contract_id=? AND status=?
             """, me, confirmedAt, change.getProposedRevisionId(), contract.getId(),
             earlyConsent ? "CONFIRMED" : "PENDING_CONFIRMATION");
         if (updated != 1) throw conflict("Phiên bản đề xuất không còn khả dụng");
     }
     change.setStatus("READY_TO_APPLY");
     change.setTenantConfirmedById(me);
     change.setTenantConfirmedAt(confirmedAt);
     return ok("POST", data(changes.save(change)));
 }
 @Transactional public ApiResponseDto<?> cancel(HttpServletRequest r,Long id,JsonNode b){Long me=accounts.authenticatedUserId(r);ContractChangeRequest x=lockChange(id);if(!Objects.equals(x.getRequestedById(),me))throw forbidden("Chỉ người yêu cầu mới được hủy");if(!Set.of("PENDING","APPROVED_WAITING_CONFIRMATION","READY_TO_APPLY").contains(x.getStatus()))throw conflict("Yêu cầu không thể hủy");x.setStatus("CANCELLED");x.setCancelledById(me);x.setCancelledAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));x.setCancellationReason(text(b,"reason"));return ok("POST",data(changes.save(x)));}
 public ApiResponseDto<?> apply(HttpServletRequest r, Long id) {
     ContractChangeRequest change = change(id);
     Contract contract = access(r, change.getContractId());
     Long owner = accounts.authenticatedUserId(r);
     if (!Objects.equals(contract.getLandlordId(), owner)) throw forbidden("Chỉ chủ trọ được áp dụng");
     if (hasEarlyConsent(change)) throw conflict("Người thuê cần xác nhận lại phương án trước khi áp dụng");
     domain.procedure("sp_apply_contract_change", true, id, owner);
     return ok("POST", data(change(id)));
 }
 public ApiResponseDto<?> transferOptions(HttpServletRequest r,Long cid){
Contract c=access(r,cid);return ok("GET",domain.jdbc.queryForList("SELECT r.id AS roomId,r.house_id AS houseId,r.room_number AS code,r.area,r.rent_price AS rentAmount,r.deposit_amount AS depositAmount,r.max_occupants AS capacity,(SELECT COUNT(*) FROM room_tenants WHERE contract_id=? AND status IN ('ACTIVE','PLANNED')) AS openMemberCount FROM rooms r JOIN rental_houses h ON h.id=r.house_id JOIN v_effective_house_verifications v ON v.house_id=h.id WHERE h.landlord_id=? AND r.id<>? AND r.status='AVAILABLE' AND r.max_occupants>=(SELECT COUNT(*) FROM room_tenants WHERE contract_id=? AND status IN ('ACTIVE','PLANNED')) AND NOT EXISTS(SELECT 1 FROM contracts c2 WHERE c2.room_id=r.id AND c2.status IN ('DRAFT','PENDING_CONFIRMATION','CONFIRMED','ACTIVE'))",cid,c.getLandlordId(),c.getRoomId(),cid));
 }
 private boolean hasEarlyConsent(ContractChangeRequest change) {
     return "READY_TO_APPLY".equals(change.getStatus()) && change.getTenantConfirmedAt() != null
         && change.getReviewedAt() != null && change.getTenantConfirmedAt().isBefore(change.getReviewedAt());
 }

 private ObjectNode snapshot(ContractChangeRequest change) {
     try {
         if (mapper.readTree(change.getProposalSnapshot()) instanceof ObjectNode object) return object;
     } catch (com.fasterxml.jackson.core.JsonProcessingException ignored) { }
     throw bad("Phương án không hợp lệ");
 }

 private String proposalHash(ContractChangeRequest change) {
     try {
         var terms = mapper.convertValue(snapshot(change), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
         String value = mapper.writeValueAsString(terms) + ":" + change.getBaseRevisionId() + ":"
             + change.getRepresentativeRoomTenantId() + ":" + change.getRequestedEffectiveDate() + ":"
             + change.getTargetRoomId() + ":" + change.getProposedRevisionId() + ":" + change.getReviewedAt();
         return HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
             .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
     } catch (com.fasterxml.jackson.core.JsonProcessingException | java.security.NoSuchAlgorithmException ex) {
         throw new IllegalStateException(ex);
     }
 }
 private Contract access(HttpServletRequest r,Long id){Long me=accounts.authenticatedUserId(r);Contract c=contracts.findById(id).orElseThrow(()->notFound("Không tìm thấy hợp đồng"));if(!domain.contractReader(id,me))throw forbidden("Không có quyền với hợp đồng");return c;}private ContractChangeRequest change(Long id){return changes.findById(id).orElseThrow(()->notFound("Không tìm thấy yêu cầu điều chỉnh"));}private LocalDate date(JsonNode b,String k){try{return LocalDate.parse(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}}private String text(JsonNode b,String k){return b!=null&&b.hasNonNull(k)?b.get(k).asText():"";}
 private Long requiredLong(JsonNode body, String field) {
     if (body == null || !body.hasNonNull(field)) throw bad(field + " là bắt buộc");
     try {
         long value = Long.parseLong(text(body, field));
         if (value > 0) return value;
     } catch (NumberFormatException ignored) { }
     throw bad(field + " không hợp lệ");
 }

 private Map<String,Object> data(ContractChangeRequest change) {
     boolean earlyConsent = hasEarlyConsent(change);
     Map<String,Object> result = new LinkedHashMap<>();
     result.put("id", change.getId());
     result.put("contractId", change.getContractId());
     result.put("type", change.getType());
     result.put("status", earlyConsent ? "APPROVED_WAITING_CONFIRMATION" : change.getStatus());
     result.put("requestedById", change.getRequestedById());
     result.put("baseRevisionId", change.getBaseRevisionId());
     result.put("targetRoomId", change.getTargetRoomId());
     result.put("resultContractId", change.getResultContractId());
     result.put("requestedEffectiveDate", change.getRequestedEffectiveDate());
     result.put("expiresAt", change.getExpiresAt());
     result.put("tenantConfirmedAt", earlyConsent ? null : change.getTenantConfirmedAt());
     result.put("proposalSnapshot", change.getProposalSnapshot());
     result.put("proposalHash", proposalHash(change));
     result.put("proposedRevisionId", change.getProposedRevisionId());
     result.put("rejectionReason", change.getRejectionReason());
     return result;
 }
 private ApiResponseDto<?> ok(String m,Object d){return ApiResponseDto.ok("/api/v1",m,d);}private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);}private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
