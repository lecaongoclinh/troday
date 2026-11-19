package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.dto.account.*;
import com.troday.api.entity.*;
import com.troday.api.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AccountService {
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
    @org.springframework.beans.factory.annotation.Autowired private VerificationDelivery delivery;
    @org.springframework.beans.factory.annotation.Autowired private TokenAttempts attempts;
    private final ObjectMapper mapper; private final UserRepository users; private final TenantRepository tenants;
    private final AdminRepository admins; private final AuthSessionRepository sessions;
    private final VerificationTokenRepository tokens; private final PersonalProfileRepository profiles;
    private final TenantIdentityVerificationRepository identityVerifications; private final LandlordVerificationRepository landlordVerifications;
    private final RoomTenantRepository roomTenants;

    public AccountService(ObjectMapper mapper, UserRepository users, TenantRepository tenants,
                          AdminRepository admins, AuthSessionRepository sessions, VerificationTokenRepository tokens,
                          PersonalProfileRepository profiles, TenantIdentityVerificationRepository identityVerifications,
                          LandlordVerificationRepository landlordVerifications, RoomTenantRepository roomTenants) {
        this.mapper=mapper; this.users=users; this.tenants=tenants; this.admins=admins;
        this.sessions=sessions; this.tokens=tokens; this.profiles=profiles; this.identityVerifications=identityVerifications;
        this.landlordVerifications=landlordVerifications;
        this.roomTenants=roomTenants;
    }

    @Transactional public ApiResponseDto<?> register(JsonNode body) {
        RegisterRequest r=read(body,RegisterRequest.class);
        if(r==null||blank(r.fullName())||blank(r.password())||(blank(r.phoneNumber())&&blank(r.email()))) throw bad("fullName, password và phoneNumber hoặc email là bắt buộc");
        if(r.password().length()<10) throw bad("Mật khẩu cần ít nhất 10 ký tự");
        if(r.email()!=null&&users.findByEmail(r.email()).isPresent()) throw conflict("Email đã được sử dụng");
        if(r.phoneNumber()!=null&&users.findByPhoneNumber(r.phoneNumber()).isPresent()) throw conflict("Số điện thoại đã được sử dụng");
        User u=new User(); u.setFullName(r.fullName()); u.setEmail(r.email()); u.setPhoneNumber(r.phoneNumber()); u.setPasswordHash(hash(r.password())); u.setRole("TENANT"); u=users.save(u); tenants.save(new Tenant(u.getId())); PersonalProfile profile=new PersonalProfile(); profile.setUserId(u.getId()); profiles.save(profile);
        return ok("POST",Map.of("id",u.getId(),"fullName",u.getFullName(),"roles",List.of("TENANT"),"status",u.getStatus()));
    }

    @Transactional public ApiResponseDto<?> login(JsonNode body) {
        LoginRequest r=read(body,LoginRequest.class); User u=findIdentifier(r==null?null:r.identifier());
        if(r==null||blank(r.password())||!hash(r.password()).equals(u.getPasswordHash())) throw unauthorized("Thông tin đăng nhập không hợp lệ");
        if(!"ACTIVE".equals(u.getStatus())) throw conflict("Tài khoản không hoạt động");
        String access=UUID.randomUUID().toString(), refresh=UUID.randomUUID().toString(); AuthSession s=new AuthSession();
        s.setUserId(u.getId()); s.setSessionKey(access); s.setRefreshTokenHash(hash(refresh)); s.setExpiresAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS).plusDays(30)); s.setLastSeenAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)); sessions.save(s);
        return ok("POST",Map.of("accessToken",access,"refreshToken",refresh,"expiresAt",s.getExpiresAt(),"user",userData(u)));
    }

    public ApiResponseDto<?> me(HttpServletRequest req){return ok("GET",userData(currentUser(req)));}
    @Transactional public ApiResponseDto<?> updateProfile(HttpServletRequest req,JsonNode body){
        User u=currentUser(req);if(body==null||!body.isObject())throw bad("Cần JSON object cho hồ sơ");Map<String,Integer> lengths=Map.of("fullName",150,"address",500,"gender",30,"occupation",150,"university",200,"bio",10000);body.fields().forEachRemaining(field->{String key=field.getKey();JsonNode value=field.getValue();if("avatarFileId".equals(key)){if(!value.isNull()&&!value.asText().matches("[1-9][0-9]{0,18}"))throw bad("avatarFileId không hợp lệ");}else if(!lengths.containsKey(key)||!value.isNull()&&(!value.isTextual()||value.asText().length()>lengths.get(key)))throw bad(key+" không hợp lệ");});if(body.has("fullName")&&(body.get("fullName").isNull()||body.get("fullName").asText().isBlank()))throw bad("Họ tên không được trống"); if(body!=null&&body.hasNonNull("fullName")&&!blank(body.get("fullName").asText())){u.setFullName(body.get("fullName").asText());users.save(u);}
        PersonalProfile p=profiles.findByUserId(u.getId()).orElseGet(PersonalProfile::new);p.setUserId(u.getId());
        if(body!=null){if(body.hasNonNull("avatarFileId")){Long fid=body.get("avatarFileId").asLong();domain.activeFile(fid,u.getId(),"AVATAR");p.setAvatarFileId(fid);}if(body.has("address"))p.setAddress(body.get("address").asText());if(body.has("gender"))p.setGender(body.get("gender").asText());if(body.has("occupation"))p.setOccupation(body.get("occupation").asText());if(body.has("university"))p.setUniversity(body.get("university").asText());if(body.has("bio"))p.setBio(body.get("bio").asText());}
        profiles.save(p);return ok("PATCH",profileData(u,p));
    }
    @Transactional public ApiResponseDto<?> updateSettings(HttpServletRequest req,JsonNode body){User u=currentUser(req);if(body!=null){for(String key:List.of("inAppEnabled","emailEnabled","pushEnabled"))if(body.has(key)&&!body.get(key).isBoolean())throw bad(key+" phải là boolean");if(body.has("inAppEnabled"))u.setInAppEnabled(body.get("inAppEnabled").asBoolean());if(body.has("emailEnabled"))u.setEmailEnabled(body.get("emailEnabled").asBoolean());if(body.has("pushEnabled"))u.setPushEnabled(body.get("pushEnabled").asBoolean());}users.save(u);return ok("PATCH",Map.of("inAppEnabled",u.isInAppEnabled(),"emailEnabled",u.isEmailEnabled(),"pushEnabled",u.isPushEnabled()));}

    @Transactional public ApiResponseDto<?> submitIdentity(HttpServletRequest req,JsonNode body){User u=currentUser(req);VerificationRequest r=read(body,VerificationRequest.class);if(!tenants.existsById(u.getId()))throw forbidden("Tài khoản không có vai trò tenant");if(r==null||blank(r.identityNumber())||r.identityFileId()==null)throw bad("identityNumber và identityFileId là bắt buộc");domain.activeFile(r.identityFileId(),u.getId(),"IDENTITY");domain.activeFile(r.identityFileId(),u.getId(),"IDENTITY");if(identityVerifications.existsByTenantIdAndStatus(u.getId(),"PENDING"))throw conflict("Đã có hồ sơ đang chờ");TenantIdentityVerification v=new TenantIdentityVerification();v.setTenantId(u.getId());v.setIdentityNumber(r.identityNumber());v.setIdentityFileId(r.identityFileId());return ok("POST",identityVerifications.save(v));}
    public ApiResponseDto<?> identityHistory(HttpServletRequest req){return ok("GET",identityVerifications.findByTenantIdOrderByCreatedAtDesc(currentUser(req).getId()).stream().map(this::verificationData).toList());}
    @Transactional public ApiResponseDto<?> withdrawIdentity(HttpServletRequest req,Long id){TenantIdentityVerification v=identityVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));if(!v.getTenantId().equals(currentUser(req).getId()))throw forbidden("Không có quyền");if(!"PENDING".equals(v.getStatus()))throw conflict("Hồ sơ không còn chờ");v.setStatus("WITHDRAWN");return ok("POST",identityVerifications.save(v));}
    @Transactional public ApiResponseDto<?> submitLandlord(HttpServletRequest req,JsonNode body){User u=currentUser(req);VerificationRequest r=read(body,VerificationRequest.class);if(r==null||blank(r.identityNumber())||r.identityFileId()==null)throw bad("identityNumber và identityFileId là bắt buộc");domain.activeFile(r.identityFileId(),u.getId(),"IDENTITY");if(landlordVerifications.existsByApplicantUserIdAndStatus(u.getId(),"PENDING"))throw conflict("Đã có hồ sơ đang chờ");LandlordVerification v=new LandlordVerification();v.setApplicantUserId(u.getId());v.setIdentityNumber(r.identityNumber());v.setIdentityFileId(r.identityFileId());return ok("POST",landlordVerifications.save(v));}
    public ApiResponseDto<?> landlordHistory(HttpServletRequest req){return ok("GET",landlordVerifications.findByApplicantUserIdOrderByCreatedAtDesc(currentUser(req).getId()).stream().map(this::verificationData).toList());}
    @Transactional public ApiResponseDto<?> withdrawLandlord(HttpServletRequest req,Long id){LandlordVerification v=landlordVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));if(!v.getApplicantUserId().equals(currentUser(req).getId()))throw forbidden("Không có quyền");if(!"PENDING".equals(v.getStatus()))throw conflict("Hồ sơ không còn chờ");v.setStatus("WITHDRAWN");return ok("POST",landlordVerifications.save(v));}

    public ApiResponseDto<?> adminIdentityList(HttpServletRequest req){requireAdmin(req);return ok("GET",identityVerifications.findAll().stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> adminIdentity(HttpServletRequest req,Long id){requireAdmin(req);return ok("GET",identityVerifications.findById(id).map(this::verificationData).orElseThrow(()->notFound("Không tìm thấy hồ sơ")));}
    @Transactional public ApiResponseDto<?> adminIdentityDecision(HttpServletRequest req,Long id,JsonNode body){Admin a=requireAdmin(req);domain.jdbc.queryForList("SELECT id FROM tenant_identity_verifications WHERE id=? FOR UPDATE",id);TenantIdentityVerification v=identityVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));DecisionRequest d=read(body,DecisionRequest.class);if("APPROVE".equals(d.decision())&&!body.path("evidenceChecked").asBoolean())throw bad("Cần xác nhận đã xem minh chứng");if("REJECT".equals(d.decision())&&body.path("reason").asText().isBlank())throw bad("Cần lý do từ chối");decide(d==null?null:d.decision(),v.getStatus());v.setStatus("APPROVE".equals(d.decision())?"APPROVED":"REJECTED");v.setRejectionReason("REJECTED".equals(v.getStatus())?body.path("reason").asText():null);v.setReviewedById(a.getId());v.setReviewedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));identityVerifications.saveAndFlush(v);domain.jdbc.update("UPDATE tenant_identity_verifications SET rejection_reason=? WHERE id=?","REJECTED".equals(v.getStatus())?body.path("reason").asText():null,id);domain.audit(a.getId(),"target_tenant_verification_id",id,"VERIFICATION_"+d.decision(),body.path("reason").asText(),Map.of("status","PENDING"),Map.of("status",v.getStatus()));domain.notifyUser(v.getTenantId(),"VERIFICATION_DECISION","VERIFICATION",id,"Hồ sơ đã được xử lý",v.getStatus(),"verification:tenant_identity_verifications:"+id);return ok("POST",verificationData(v));}
    public ApiResponseDto<?> adminLandlordList(HttpServletRequest req){requireAdmin(req);return ok("GET",landlordVerifications.findAll().stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> adminLandlord(HttpServletRequest req,Long id){requireAdmin(req);return ok("GET",landlordVerifications.findById(id).map(this::verificationData).orElseThrow(()->notFound("Không tìm thấy hồ sơ")));}
    @Transactional public ApiResponseDto<?> adminLandlordDecision(HttpServletRequest req,Long id,JsonNode body){Admin a=requireAdmin(req);domain.jdbc.queryForList("SELECT id FROM landlord_verifications WHERE id=? FOR UPDATE",id);LandlordVerification v=landlordVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));DecisionRequest d=read(body,DecisionRequest.class);if("APPROVE".equals(d.decision())&&!body.path("evidenceChecked").asBoolean())throw bad("Cần xác nhận đã xem minh chứng");if("REJECT".equals(d.decision())&&body.path("reason").asText().isBlank())throw bad("Cần lý do từ chối");decide(d==null?null:d.decision(),v.getStatus());v.setStatus("APPROVE".equals(d.decision())?"APPROVED":"REJECTED");v.setRejectionReason("REJECTED".equals(v.getStatus())?body.path("reason").asText():null);v.setReviewedById(a.getId());v.setReviewedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)); if("APPROVED".equals(v.getStatus())){domain.jdbc.update("INSERT IGNORE INTO landlords(id) VALUES (?)",v.getApplicantUserId());User applicant=users.findById(v.getApplicantUserId()).orElseThrow();applicant.setRole("LANDLORD");users.save(applicant);} landlordVerifications.saveAndFlush(v);domain.jdbc.update("UPDATE landlord_verifications SET rejection_reason=? WHERE id=?","REJECTED".equals(v.getStatus())?body.path("reason").asText():null,id);domain.audit(a.getId(),"target_landlord_verification_id",id,"VERIFICATION_"+d.decision(),body.path("reason").asText(),Map.of("status","PENDING"),Map.of("status",v.getStatus()));domain.notifyUser(v.getApplicantUserId(),"VERIFICATION_DECISION","VERIFICATION",id,"Hồ sơ đã được xử lý",v.getStatus(),"verification:landlord_verifications:"+id);return ok("POST",verificationData(v));}

    @Transactional public ApiResponseDto<?> refresh(HttpServletRequest req){String token=req.getHeader("Refresh-Token");AuthSession s=sessions.findAll().stream().filter(x->x.getRefreshTokenHash()!=null&&x.getRefreshTokenHash().equals(hash(token))).findFirst().orElseThrow(()->unauthorized("Refresh token không hợp lệ"));if(s.getRevokedAt()!=null||s.getExpiresAt().isBefore(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)))throw unauthorized("Refresh token hết hạn");s.setRevokedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));s.setRevocationReason("ROTATED");sessions.save(s);return loginForUser(users.findById(s.getUserId()).orElseThrow());}
    @Transactional public ApiResponseDto<?> logout(HttpServletRequest req){AuthSession s=currentSession(req);s.setRevokedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));s.setRevocationReason("LOGOUT");sessions.save(s);return ok("POST",Map.of("revoked",true));}
    public ApiResponseDto<?> sessionList(HttpServletRequest req){AuthSession c=currentSession(req);return ok("GET",sessions.findByUserIdOrderByCreatedAtDesc(c.getUserId()).stream().map(s->Map.of("id",s.getId(),"createdAt",s.getCreatedAt(),"expiresAt",s.getExpiresAt(),"revokedAt",Objects.toString(s.getRevokedAt(),""),"isCurrent",s.getId().equals(c.getId()))).toList());}
    @Transactional public ApiResponseDto<?> revokeSession(HttpServletRequest req,Long id){AuthSession c=currentSession(req);AuthSession s=sessions.findById(id).orElseThrow(()->notFound("Không tìm thấy phiên"));if(!s.getUserId().equals(c.getUserId()))throw forbidden("Không có quyền");s.setRevokedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));s.setRevocationReason("USER_REVOKED");sessions.save(s);return ok("DELETE",Map.of("id",id,"revoked",true));}
    @Transactional public ApiResponseDto<?> phoneVerification(HttpServletRequest req,JsonNode body){
User u=currentUser(req);PhoneVerificationRequest r=read(body,PhoneVerificationRequest.class);if(r==null||blank(r.phoneNumber())||!r.phoneNumber().matches("\\+?[0-9]{9,15}"))throw bad("Số điện thoại không hợp lệ");return createToken(u,"PHONE_VERIFICATION",r.phoneNumber());
 }
    @Transactional public ApiResponseDto<?> confirmPhone(HttpServletRequest req,JsonNode body){User u=currentUser(req);PhoneVerificationRequest r=read(body,PhoneVerificationRequest.class);VerificationToken verified=tokens.findBySelector(r.selector()).orElseThrow(()->bad("Mã không hợp lệ"));if(!Objects.equals(verified.getUserId(),u.getId())||!Objects.equals(verified.getTargetValue(),r.phoneNumber()))throw forbidden("Mã xác minh không thuộc tài khoản hoặc số điện thoại này");consume(r.selector(),r.code(),"PHONE_VERIFICATION");u.setPhoneNumber(verified.getTargetValue());u.setPhoneVerifiedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));users.save(u);return ok("POST",Map.of("phoneNumber",u.getPhoneNumber(),"phoneVerifiedAt",u.getPhoneVerifiedAt()));}
    @Transactional public ApiResponseDto<?> passwordReset(JsonNode body){PasswordResetRequest r=read(body,PasswordResetRequest.class);return createToken(findIdentifier(r.identifier()),"PASSWORD_RESET_OTP",r.identifier());}
    @Transactional public ApiResponseDto<?> passwordResetVerify(JsonNode body){PasswordResetRequest r=read(body,PasswordResetRequest.class);VerificationToken t=consume(r.selector(),r.code(),"PASSWORD_RESET_OTP");return createToken(users.findById(t.getUserId()).orElseThrow(),"PASSWORD_RESET_GRANT",null);}
    @Transactional public ApiResponseDto<?> passwordResetComplete(JsonNode body){PasswordResetRequest r=read(body,PasswordResetRequest.class);if(r==null||blank(r.resetGrant())||blank(r.newPassword())||r.newPassword().length()<10)throw bad("Cần quyền đặt lại và mật khẩu ít nhất 10 ký tự");VerificationToken t=consume(r.resetGrant().split(":",2)[0],r.resetGrant().contains(":")?r.resetGrant().split(":",2)[1]:"","PASSWORD_RESET_GRANT");User u=users.findById(t.getUserId()).orElseThrow();if(blank(r.newPassword())||r.newPassword().length()<10)throw bad("Mật khẩu mới là bắt buộc");u.setPasswordHash(hash(r.newPassword()));users.save(u);for(AuthSession session:sessions.findByUserIdOrderByCreatedAtDesc(u.getId())){session.setRevokedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));session.setRevocationReason("PASSWORD_RESET");sessions.save(session);}return ok("POST",Map.of("passwordChanged",true));}
    public ApiResponseDto<?> okPlaceholder(String method,Object data){return ok(method,data);}
    public ApiResponseDto<?> accountInvitation(HttpServletRequest req, Long contractId, Long memberId) {
        Long owner=currentUser(req).getId(); if(!domain.exists("SELECT id FROM contracts WHERE id=? AND landlord_id=?",contractId,owner))throw forbidden("Chỉ chủ hợp đồng được gửi liên kết"); RoomTenant member=roomTenants.findById(memberId).orElseThrow(()->notFound("Không tìm thấy thành viên"));
        if(!contractId.equals(member.getContractId())||member.getTenantId()!=null) throw conflict("Thành viên không đủ điều kiện liên kết");
        String raw = UUID.randomUUID().toString(); VerificationToken t = new VerificationToken();
        t.setUserId(currentUser(req).getId()); t.setSelector(UUID.randomUUID().toString()); t.setTokenHash(hash(raw));
        t.setPurpose("OCCUPANT_LINK"); t.setTargetValue(String.valueOf(contractId)); t.setTargetRoomTenantId(memberId);
        t.setExpiresAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS).plusDays(2)); tokens.save(t);
        return ok("POST", Map.of("selector", t.getSelector(), "token", raw, "expiresAt", t.getExpiresAt()));
    }

    /** Shared authentication helpers for domain services. */
    public Long authenticatedUserId(HttpServletRequest request) {
        return currentUser(request).getId();
    }

    public Long requireAdminId(HttpServletRequest request) {
        return requireAdmin(request).getId();
    }
    @Transactional public ApiResponseDto<?> residencyLink(HttpServletRequest req, JsonNode body) {
        User u = currentUser(req); ResidencyLinkRequest r = read(body, ResidencyLinkRequest.class);
        VerificationToken t = consume(r.selector(), r.token(), "OCCUPANT_LINK");
        RoomTenant member=roomTenants.findById(t.getTargetRoomTenantId()).orElseThrow(()->notFound("Không tìm thấy lượt cư trú"));
        if(!Objects.equals(u.getPhoneNumber(),domain.jdbc.queryForObject("SELECT phone_number FROM room_tenants WHERE id=?",String.class,member.getId()))||u.getPhoneVerifiedAt()==null)throw forbidden("Cần xác minh số điện thoại đúng với hồ sơ cư trú");if(member.getTenantId()!=null) throw conflict("Lượt cư trú đã được liên kết"); member.setTenantId(u.getId()); member.setAccountLinkedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)); roomTenants.save(member);
        return ok("POST", Map.of("id", member.getId(), "tenantId", u.getId(), "status", "LINKED"));
    }

    private ApiResponseDto<?> createToken(User u,String purpose,String target){
if(domain.exists("SELECT id FROM verification_tokens WHERE user_id=? AND purpose=? AND created_at>UTC_TIMESTAMP(6)-INTERVAL 60 SECOND",u.getId(),purpose))throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Vui lòng chờ 60 giây trước khi yêu cầu mã mới");
        String raw=purpose.endsWith("GRANT")?UUID.randomUUID().toString():String.format("%06d",new java.security.SecureRandom().nextInt(1000000));
        VerificationToken t=new VerificationToken();t.setUserId(u.getId());t.setSelector(UUID.randomUUID().toString());t.setTokenHash(hash(raw));t.setPurpose(purpose);t.setTargetValue(target);t.setExpiresAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS).plusMinutes(15));tokens.save(t);
        Map<String,Object> out=new LinkedHashMap<>();out.put("selector",t.getSelector());out.put("expiresAt",t.getExpiresAt());out.put("retryAfterSeconds",60);
        if(purpose.endsWith("GRANT"))out.put("resetGrant",t.getSelector()+":"+raw);
        else delivery.deliver(u.getId(),target,purpose,raw);
        return ok("POST",out);
 }
    private VerificationToken consume(String selector,String raw,String purpose){
if(blank(selector)||blank(raw))throw bad("selector và code/token là bắt buộc");VerificationToken t=tokens.findBySelector(selector).orElseThrow(()->bad("Token không hợp lệ"));
        if(!purpose.equals(t.getPurpose())||t.getConsumedAt()!=null||t.getExpiresAt().isBefore(LocalDateTime.now(java.time.ZoneOffset.UTC)))throw bad("Token không hợp lệ hoặc đã hết hạn");
        if(domain.exists("SELECT id FROM verification_tokens WHERE id=? AND attempt_count>=max_attempts",t.getId()))throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Đã vượt số lần thử mã xác minh");
        if(!hash(raw).equals(t.getTokenHash())){attempts.failed(t.getId());throw bad("Mã xác minh không hợp lệ");}
        if(domain.jdbc.update("UPDATE verification_tokens SET consumed_at=UTC_TIMESTAMP(6) WHERE id=? AND consumed_at IS NULL",t.getId())!=1)throw conflict("Mã đã được sử dụng");return t;
 }
    private ApiResponseDto<?> loginForUser(User u){
if(!"ACTIVE".equals(u.getStatus()))throw unauthorized("Tài khoản không hoạt động");String key=UUID.randomUUID().toString(),refresh=UUID.randomUUID().toString();AuthSession s=new AuthSession();s.setUserId(u.getId());s.setSessionKey(key);s.setRefreshTokenHash(hash(refresh));s.setExpiresAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS).plusDays(30));s.setLastSeenAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));sessions.save(s);return ok("POST",Map.of("accessToken",key,"refreshToken",refresh,"expiresAt",s.getExpiresAt(),"user",userData(u)));
 }
    private User currentUser(HttpServletRequest r){
User u=users.findById(currentSession(r).getUserId()).orElseThrow(()->unauthorized("Tài khoản không tồn tại"));
        if(!"ACTIVE".equals(u.getStatus()))throw unauthorized("Tài khoản đã bị khóa hoặc ngừng hoạt động"); return u;
 }
    private AuthSession currentSession(HttpServletRequest r){String h=r.getHeader("Authorization");if(h==null||!h.startsWith("Bearer "))throw unauthorized("Thiếu access token");AuthSession s=sessions.findBySessionKey(h.substring(7)).orElseThrow(()->unauthorized("Access token không hợp lệ"));if(s.getRevokedAt()!=null||s.getExpiresAt().isBefore(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)))throw unauthorized("Access token hết hạn");if(!users.findById(s.getUserId()).map(u->"ACTIVE".equals(u.getStatus())).orElse(false))throw unauthorized("Tài khoản không hoạt động");return s;}
    private Admin requireAdmin(HttpServletRequest r){User u=currentUser(r);if(!admins.existsById(u.getId()))throw forbidden("Chỉ admin mới được phép");return admins.findById(u.getId()).orElseThrow();}
    private User findIdentifier(String id){if(blank(id))throw bad("identifier là bắt buộc");return (id.contains("@")?users.findByEmail(id):users.findByPhoneNumber(id)).orElseThrow(()->unauthorized("Tài khoản không tồn tại"));}
    private Map<String,Object> userData(User u){
Map<String,Object> out=new LinkedHashMap<>();out.put("id",u.getId());out.put("fullName",u.getFullName());out.put("email",Objects.toString(u.getEmail(),""));out.put("phoneNumber",Objects.toString(u.getPhoneNumber(),""));
        List<String> roles=new ArrayList<>();if(tenants.existsById(u.getId()))roles.add("TENANT");if(domain.exists("SELECT id FROM landlords WHERE id=?",u.getId()))roles.add("LANDLORD");if(admins.existsById(u.getId()))roles.add("ADMIN");
        roles.sort(Comparator.comparingInt(x->x.equals(u.getRole())?0:1));out.put("roles",roles);out.put("status",u.getStatus());out.put("profile",profiles.findByUserId(u.getId()).map(this::profileMap).orElse(Map.of()));out.put("settings",Map.of("inAppEnabled",u.isInAppEnabled(),"emailEnabled",u.isEmailEnabled(),"pushEnabled",u.isPushEnabled()));return out;
 }
    private Map<String,Object> profileData(User u,PersonalProfile p){return Map.of("userId",u.getId(),"fullName",u.getFullName(),"address",Objects.toString(p.getAddress(),""),"gender",Objects.toString(p.getGender(),""),"occupation",Objects.toString(p.getOccupation(),""),"university",Objects.toString(p.getUniversity(),""),"bio",Objects.toString(p.getBio(),""),"avatarFileId",Objects.toString(p.getAvatarFileId(),""));}
    private Map<String,Object> profileMap(PersonalProfile p){return Map.of("id",p.getId(),"address",Objects.toString(p.getAddress(),""),"gender",Objects.toString(p.getGender(),""),"occupation",Objects.toString(p.getOccupation(),""),"university",Objects.toString(p.getUniversity(),""),"bio",Objects.toString(p.getBio(),""),"avatarFileId",Objects.toString(p.getAvatarFileId(),""));}
    private Map<String,Object> verificationData(Object v){
return mapper.convertValue(v,new com.fasterxml.jackson.core.type.TypeReference<Map<String,Object>>(){});
 }
    private void decide(String d,String status){if(!"PENDING".equals(status)||!("APPROVE".equals(d)||"REJECT".equals(d)))throw conflict("Quyết định không hợp lệ");}
    private <T>T read(JsonNode n,Class<T> c){try{return n==null?null:mapper.treeToValue(n,c);}catch(Exception e){throw bad("JSON request không hợp lệ");}}
    private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);}
    private String hash(String s){if(s==null)return "";try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    private boolean blank(String s){return s==null||s.isBlank();}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);}
    private ResponseStatusException unauthorized(String m){return new ResponseStatusException(HttpStatus.UNAUTHORIZED,m);}
    private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}
    private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}
    private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
