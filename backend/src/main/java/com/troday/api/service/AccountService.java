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
        if(r.email()!=null&&users.findByEmail(r.email()).isPresent()) throw conflict("Email đã được sử dụng");
        if(r.phoneNumber()!=null&&users.findByPhoneNumber(r.phoneNumber()).isPresent()) throw conflict("Số điện thoại đã được sử dụng");
        User u=new User(); u.setFullName(r.fullName()); u.setEmail(r.email()); u.setPhoneNumber(r.phoneNumber()); u.setPasswordHash(hash(r.password())); u.setRole("TENANT"); u=users.save(u); tenants.save(new Tenant(u.getId()));
        return ok("POST",Map.of("id",u.getId(),"fullName",u.getFullName(),"roles",List.of("TENANT"),"status",u.getStatus()));
    }

    @Transactional public ApiResponseDto<?> login(JsonNode body) {
        LoginRequest r=read(body,LoginRequest.class); User u=findIdentifier(r==null?null:r.identifier());
        if(r==null||blank(r.password())||!hash(r.password()).equals(u.getPasswordHash())) throw unauthorized("Thông tin đăng nhập không hợp lệ");
        if(!"ACTIVE".equals(u.getStatus())) throw conflict("Tài khoản không hoạt động");
        String access=UUID.randomUUID().toString(), refresh=UUID.randomUUID().toString(); AuthSession s=new AuthSession();
        s.setUserId(u.getId()); s.setSessionKey(access); s.setRefreshTokenHash(hash(refresh)); s.setExpiresAt(LocalDateTime.now().plusDays(30)); s.setLastSeenAt(LocalDateTime.now()); sessions.save(s);
        return ok("POST",Map.of("accessToken",access,"refreshToken",refresh,"expiresAt",s.getExpiresAt(),"user",userData(u)));
    }

    public ApiResponseDto<?> me(HttpServletRequest req){return ok("GET",userData(currentUser(req)));}
    @Transactional public ApiResponseDto<?> updateProfile(HttpServletRequest req,JsonNode body){
        User u=currentUser(req); if(body!=null&&body.hasNonNull("fullName")&&!blank(body.get("fullName").asText())){u.setFullName(body.get("fullName").asText());users.save(u);}
        PersonalProfile p=profiles.findByUserId(u.getId()).orElseGet(PersonalProfile::new);p.setUserId(u.getId());
        if(body!=null){if(body.has("address"))p.setAddress(body.get("address").asText());if(body.has("gender"))p.setGender(body.get("gender").asText());if(body.has("occupation"))p.setOccupation(body.get("occupation").asText());if(body.has("university"))p.setUniversity(body.get("university").asText());if(body.has("bio"))p.setBio(body.get("bio").asText());}
        profiles.save(p);return ok("PATCH",profileData(u,p));
    }
    @Transactional public ApiResponseDto<?> updateSettings(HttpServletRequest req,JsonNode body){User u=currentUser(req);if(body!=null){if(body.has("inAppEnabled"))u.setInAppEnabled(body.get("inAppEnabled").asBoolean());if(body.has("emailEnabled"))u.setEmailEnabled(body.get("emailEnabled").asBoolean());if(body.has("pushEnabled"))u.setPushEnabled(body.get("pushEnabled").asBoolean());}users.save(u);return ok("PATCH",Map.of("inAppEnabled",u.isInAppEnabled(),"emailEnabled",u.isEmailEnabled(),"pushEnabled",u.isPushEnabled()));}

    @Transactional public ApiResponseDto<?> submitIdentity(HttpServletRequest req,JsonNode body){User u=currentUser(req);VerificationRequest r=read(body,VerificationRequest.class);if(!tenants.existsById(u.getId()))throw forbidden("Tài khoản không có vai trò tenant");if(r==null||blank(r.identityNumber())||r.identityFileId()==null)throw bad("identityNumber và identityFileId là bắt buộc");if(identityVerifications.existsByTenantIdAndStatus(u.getId(),"PENDING"))throw conflict("Đã có hồ sơ đang chờ");TenantIdentityVerification v=new TenantIdentityVerification();v.setTenantId(u.getId());v.setIdentityNumber(r.identityNumber());v.setIdentityFileId(r.identityFileId());return ok("POST",identityVerifications.save(v));}
    public ApiResponseDto<?> identityHistory(HttpServletRequest req){return ok("GET",identityVerifications.findByTenantIdOrderByCreatedAtDesc(currentUser(req).getId()).stream().map(this::verificationData).toList());}
    @Transactional public ApiResponseDto<?> withdrawIdentity(HttpServletRequest req,Long id){TenantIdentityVerification v=identityVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));if(!v.getTenantId().equals(currentUser(req).getId()))throw forbidden("Không có quyền");if(!"PENDING".equals(v.getStatus()))throw conflict("Hồ sơ không còn chờ");v.setStatus("WITHDRAWN");return ok("POST",identityVerifications.save(v));}
    @Transactional public ApiResponseDto<?> submitLandlord(HttpServletRequest req,JsonNode body){User u=currentUser(req);VerificationRequest r=read(body,VerificationRequest.class);if(r==null||blank(r.identityNumber())||r.identityFileId()==null)throw bad("identityNumber và identityFileId là bắt buộc");if(landlordVerifications.existsByApplicantUserIdAndStatus(u.getId(),"PENDING"))throw conflict("Đã có hồ sơ đang chờ");LandlordVerification v=new LandlordVerification();v.setApplicantUserId(u.getId());v.setIdentityNumber(r.identityNumber());v.setIdentityFileId(r.identityFileId());return ok("POST",landlordVerifications.save(v));}
    public ApiResponseDto<?> landlordHistory(HttpServletRequest req){return ok("GET",landlordVerifications.findByApplicantUserIdOrderByCreatedAtDesc(currentUser(req).getId()).stream().map(this::verificationData).toList());}
    @Transactional public ApiResponseDto<?> withdrawLandlord(HttpServletRequest req,Long id){LandlordVerification v=landlordVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));if(!v.getApplicantUserId().equals(currentUser(req).getId()))throw forbidden("Không có quyền");if(!"PENDING".equals(v.getStatus()))throw conflict("Hồ sơ không còn chờ");v.setStatus("WITHDRAWN");return ok("POST",landlordVerifications.save(v));}

    public ApiResponseDto<?> adminIdentityList(HttpServletRequest req){requireAdmin(req);return ok("GET",identityVerifications.findAll().stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> adminIdentity(HttpServletRequest req,Long id){requireAdmin(req);return ok("GET",identityVerifications.findById(id).map(this::verificationData).orElseThrow(()->notFound("Không tìm thấy hồ sơ")));}
    @Transactional public ApiResponseDto<?> adminIdentityDecision(HttpServletRequest req,Long id,JsonNode body){Admin a=requireAdmin(req);TenantIdentityVerification v=identityVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));DecisionRequest d=read(body,DecisionRequest.class);decide(d==null?null:d.decision(),v.getStatus());v.setStatus("APPROVE".equals(d.decision())?"APPROVED":"REJECTED");v.setReviewedById(a.getId());v.setReviewedAt(LocalDateTime.now());return ok("POST",identityVerifications.save(v));}
    public ApiResponseDto<?> adminLandlordList(HttpServletRequest req){requireAdmin(req);return ok("GET",landlordVerifications.findAll().stream().map(this::verificationData).toList());}
    public ApiResponseDto<?> adminLandlord(HttpServletRequest req,Long id){requireAdmin(req);return ok("GET",landlordVerifications.findById(id).map(this::verificationData).orElseThrow(()->notFound("Không tìm thấy hồ sơ")));}
    @Transactional public ApiResponseDto<?> adminLandlordDecision(HttpServletRequest req,Long id,JsonNode body){Admin a=requireAdmin(req);LandlordVerification v=landlordVerifications.findById(id).orElseThrow(()->notFound("Không tìm thấy hồ sơ"));DecisionRequest d=read(body,DecisionRequest.class);decide(d==null?null:d.decision(),v.getStatus());v.setStatus("APPROVE".equals(d.decision())?"APPROVED":"REJECTED");v.setReviewedById(a.getId());v.setReviewedAt(LocalDateTime.now());return ok("POST",landlordVerifications.save(v));}

    @Transactional public ApiResponseDto<?> refresh(HttpServletRequest req){String token=req.getHeader("Refresh-Token");AuthSession s=sessions.findAll().stream().filter(x->x.getRefreshTokenHash()!=null&&x.getRefreshTokenHash().equals(hash(token))).findFirst().orElseThrow(()->bad("Refresh token không hợp lệ"));if(s.getRevokedAt()!=null||s.getExpiresAt().isBefore(LocalDateTime.now()))throw bad("Refresh token hết hạn");s.setRevokedAt(LocalDateTime.now());s.setRevocationReason("ROTATED");sessions.save(s);return loginForUser(users.findById(s.getUserId()).orElseThrow());}
    @Transactional public ApiResponseDto<?> logout(HttpServletRequest req){AuthSession s=currentSession(req);s.setRevokedAt(LocalDateTime.now());s.setRevocationReason("LOGOUT");sessions.save(s);return ok("POST",Map.of("revoked",true));}
    public ApiResponseDto<?> sessionList(HttpServletRequest req){AuthSession c=currentSession(req);return ok("GET",sessions.findByUserIdOrderByCreatedAtDesc(c.getUserId()).stream().map(s->Map.of("id",s.getId(),"createdAt",s.getCreatedAt(),"expiresAt",s.getExpiresAt(),"revokedAt",Objects.toString(s.getRevokedAt(),""),"isCurrent",s.getId().equals(c.getId()))).toList());}
    @Transactional public ApiResponseDto<?> revokeSession(HttpServletRequest req,Long id){AuthSession c=currentSession(req);AuthSession s=sessions.findById(id).orElseThrow(()->notFound("Không tìm thấy phiên"));if(!s.getUserId().equals(c.getUserId()))throw forbidden("Không có quyền");s.setRevokedAt(LocalDateTime.now());s.setRevocationReason("USER_REVOKED");sessions.save(s);return ok("DELETE",Map.of("id",id,"revoked",true));}
    public ApiResponseDto<?> phoneVerification(HttpServletRequest req,JsonNode body){User u=currentUser(req);PhoneVerificationRequest r=read(body,PhoneVerificationRequest.class);return createToken(u,"PHONE_VERIFICATION",r.phoneNumber());}
    @Transactional public ApiResponseDto<?> confirmPhone(HttpServletRequest req,JsonNode body){User u=currentUser(req);PhoneVerificationRequest r=read(body,PhoneVerificationRequest.class);consume(r.selector(),r.code(),"PHONE_VERIFICATION");u.setPhoneNumber(r.phoneNumber());u.setPhoneVerifiedAt(LocalDateTime.now());users.save(u);return ok("POST",Map.of("phoneNumber",u.getPhoneNumber(),"phoneVerifiedAt",u.getPhoneVerifiedAt()));}
    public ApiResponseDto<?> passwordReset(JsonNode body){PasswordResetRequest r=read(body,PasswordResetRequest.class);return createToken(findIdentifier(r.identifier()),"PASSWORD_RESET_OTP",r.identifier());}
    @Transactional public ApiResponseDto<?> passwordResetVerify(JsonNode body){PasswordResetRequest r=read(body,PasswordResetRequest.class);VerificationToken t=consume(r.selector(),r.code(),"PASSWORD_RESET_OTP");return createToken(users.findById(t.getUserId()).orElseThrow(),"PASSWORD_RESET_GRANT",null);}
    @Transactional public ApiResponseDto<?> passwordResetComplete(JsonNode body){PasswordResetRequest r=read(body,PasswordResetRequest.class);VerificationToken t=consume(r.resetGrant(),r.resetGrant(),"PASSWORD_RESET_GRANT");User u=users.findById(t.getUserId()).orElseThrow();if(blank(r.newPassword()))throw bad("Mật khẩu mới là bắt buộc");u.setPasswordHash(hash(r.newPassword()));users.save(u);return ok("POST",Map.of("passwordChanged",true));}
    public ApiResponseDto<?> okPlaceholder(String method,Object data){return ok(method,data);}
    public ApiResponseDto<?> accountInvitation(HttpServletRequest req, Long contractId, Long memberId) {
        currentUser(req); RoomTenant member=roomTenants.findById(memberId).orElseThrow(()->notFound("Không tìm thấy thành viên"));
        if(!contractId.equals(member.getContractId())||member.getTenantId()!=null) throw conflict("Thành viên không đủ điều kiện liên kết");
        String raw = UUID.randomUUID().toString(); VerificationToken t = new VerificationToken();
        t.setUserId(currentUser(req).getId()); t.setSelector(UUID.randomUUID().toString()); t.setTokenHash(hash(raw));
        t.setPurpose("OCCUPANT_LINK"); t.setTargetValue(String.valueOf(contractId)); t.setTargetRoomTenantId(memberId);
        t.setExpiresAt(LocalDateTime.now().plusDays(2)); tokens.save(t);
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
        if(member.getTenantId()!=null) throw conflict("Lượt cư trú đã được liên kết"); member.setTenantId(u.getId()); member.setAccountLinkedAt(LocalDateTime.now()); roomTenants.save(member);
        return ok("POST", Map.of("id", member.getId(), "tenantId", u.getId(), "status", "LINKED"));
    }

    private ApiResponseDto<?> createToken(User u,String purpose,String target){String raw=purpose.equals("PHONE_VERIFICATION")?"123456":UUID.randomUUID().toString();VerificationToken t=new VerificationToken();t.setUserId(u.getId());t.setSelector(UUID.randomUUID().toString());t.setTokenHash(hash(raw));t.setPurpose(purpose);t.setTargetValue(target);t.setExpiresAt(LocalDateTime.now().plusMinutes(15));tokens.save(t);return ok("POST",Map.of("selector",t.getSelector(),"expiresAt",t.getExpiresAt(),"retryAfterSeconds",60));}
    private VerificationToken consume(String selector,String raw,String purpose){if(blank(selector)||blank(raw))throw bad("selector và code/token là bắt buộc");VerificationToken t=tokens.findBySelector(selector).orElseThrow(()->bad("Token không hợp lệ"));if(!purpose.equals(t.getPurpose())||t.getConsumedAt()!=null||t.getExpiresAt().isBefore(LocalDateTime.now())||!hash(raw).equals(t.getTokenHash()))throw bad("Token không hợp lệ hoặc đã hết hạn");t.setConsumedAt(LocalDateTime.now());return tokens.save(t);}
    private ApiResponseDto<?> loginForUser(User u){String key=UUID.randomUUID().toString();AuthSession s=new AuthSession();s.setUserId(u.getId());s.setSessionKey(key);s.setExpiresAt(LocalDateTime.now().plusDays(30));s.setLastSeenAt(LocalDateTime.now());sessions.save(s);return ok("POST",Map.of("accessToken",key,"expiresAt",s.getExpiresAt(),"user",userData(u)));}
    private User currentUser(HttpServletRequest r){return users.findById(currentSession(r).getUserId()).orElseThrow(()->notFound("Không tìm thấy tài khoản"));}
    private AuthSession currentSession(HttpServletRequest r){String h=r.getHeader("Authorization");if(h==null||!h.startsWith("Bearer "))throw unauthorized("Thiếu access token");AuthSession s=sessions.findBySessionKey(h.substring(7)).orElseThrow(()->unauthorized("Access token không hợp lệ"));if(s.getRevokedAt()!=null||s.getExpiresAt().isBefore(LocalDateTime.now()))throw unauthorized("Access token hết hạn");return s;}
    private Admin requireAdmin(HttpServletRequest r){User u=currentUser(r);if(!admins.existsById(u.getId()))throw forbidden("Chỉ admin mới được phép");return admins.findById(u.getId()).orElseThrow();}
    private User findIdentifier(String id){if(blank(id))throw bad("identifier là bắt buộc");return (id.contains("@")?users.findByEmail(id):users.findByPhoneNumber(id)).orElseThrow(()->unauthorized("Tài khoản không tồn tại"));}
    private Map<String,Object> userData(User u){return Map.of("id",u.getId(),"fullName",u.getFullName(),"email",Objects.toString(u.getEmail(),""),"phoneNumber",Objects.toString(u.getPhoneNumber(),""),"roles",List.of(u.getRole()),"status",u.getStatus(),"profile",profiles.findByUserId(u.getId()).map(this::profileMap).orElse(Map.of()));}
    private Map<String,Object> profileData(User u,PersonalProfile p){return Map.of("userId",u.getId(),"fullName",u.getFullName(),"address",Objects.toString(p.getAddress(),""),"gender",Objects.toString(p.getGender(),""),"occupation",Objects.toString(p.getOccupation(),""),"university",Objects.toString(p.getUniversity(),""),"bio",Objects.toString(p.getBio(),""));}
    private Map<String,Object> profileMap(PersonalProfile p){return Map.of("id",p.getId(),"address",Objects.toString(p.getAddress(),""),"gender",Objects.toString(p.getGender(),""),"occupation",Objects.toString(p.getOccupation(),""),"university",Objects.toString(p.getUniversity(),""),"bio",Objects.toString(p.getBio(),""));}
    private Map<String,Object> verificationData(Object v){return v instanceof TenantIdentityVerification x?Map.of("id",x.getId(),"status",x.getStatus()):Map.of("id",((LandlordVerification)v).getId(),"status",((LandlordVerification)v).getStatus());}
    private void decide(String d,String status){if(!"PENDING".equals(status)||!("APPROVE".equals(d)||"REJECT".equals(d)))throw conflict("Quyết định không hợp lệ");}
    private <T>T read(JsonNode n,Class<T> c){try{return n==null?null:mapper.treeToValue(n,c);}catch(Exception e){throw bad("JSON request không hợp lệ");}}
    private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);}
    private String hash(String s){if(s==null)return "";try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    private boolean blank(String s){return s==null||s.isBlank();}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);}
    private ResponseStatusException unauthorized(String m){return new ResponseStatusException(HttpStatus.UNAUTHORIZED,m);}
    private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);}
    private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}
    private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
