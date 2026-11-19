package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.entity.FileAsset;
import com.troday.api.repository.FileAssetRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;

@Service
public class IntegrationService {
    private static final Set<String> PURPOSES=Set.of("AVATAR","POST_IMAGE","IDENTITY","LANDLORD_PROOF","CONTRACT","REPORT_EVIDENCE","CHAT_IMAGE");
    private static final Set<String> TYPES=Set.of("image/jpeg","image/png","image/webp","application/pdf");
    private final AccountService accounts;
    private final FileAssetRepository files;
    private final DomainSupport domain;
    private final Path root;
    private final byte[] signingKey;
    public IntegrationService(AccountService accounts,FileAssetRepository files,DomainSupport domain,
        @Value("${troday.files.root:uploads}") String folder,@Value("${troday.files.signing-secret:}") String secret){
        this.accounts=accounts;this.files=files;this.domain=domain;this.root=Path.of(folder).toAbsolutePath().normalize();
        this.signingKey=(secret.isBlank()?UUID.randomUUID().toString():secret).getBytes(StandardCharsets.UTF_8);
    }
    @Transactional public ApiResponseDto<?> createUploadSession(HttpServletRequest r,JsonNode b){
        Long owner=accounts.authenticatedUserId(r);String purpose=text(b,"purpose"),name=text(b,"originalName"),mime=text(b,"mimeType"),sha=text(b,"sha256").toLowerCase(Locale.ROOT);
        long size=b==null?-1:b.path("sizeBytes").asLong(-1);
        if(!PURPOSES.contains(purpose)||name.isBlank()||name.length()>255||!TYPES.contains(mime)||size<1||size>20_000_000||!sha.matches("[a-f0-9]{64}"))throw bad("Tên, loại, kích thước hoặc SHA-256 của tệp không hợp lệ");
        if(Set.of("AVATAR","POST_IMAGE","CHAT_IMAGE").contains(purpose)&&!mime.startsWith("image/"))throw bad("Mục đích này yêu cầu ảnh");
        FileAsset x=new FileAsset();x.setOwnerUserId(owner);x.setStorageKey(owner+"/"+UUID.randomUUID());x.setOriginalName(name);x.setMimeType(mime);x.setSizeBytes(size);x.setSha256(sha);x.setPurpose(purpose);x.setVisibility(Set.of("AVATAR","POST_IMAGE").contains(purpose)?"PUBLIC":"PRIVATE");x.setExpiresAt(LocalDateTime.now(ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS).plusMinutes(30));x=files.save(x);
        return ok("POST",Map.of("fileId",x.getId(),"status",x.getStatus(),"uploadUrl","/api/v1/files/"+x.getId()+"/content","expiresAt",x.getExpiresAt(),"requiredHeaders",Map.of("Content-Type",mime,"X-File-SHA256",sha)));
    }
    public void upload(HttpServletRequest r,Long id) throws IOException {
        FileAsset x=owned(r,id);staged(x);
        if(r.getContentLengthLong()>20_000_000)throw bad("Tệp vượt quá 20 MB");
        byte[] bytes=r.getInputStream().readNBytes(20_000_001);
        if(bytes.length!=x.getSizeBytes()||!sha(bytes).equals(x.getSha256())||!matchesType(bytes,x.getMimeType()))throw bad("Nội dung, dung lượng hoặc SHA-256 không khớp tệp đã khai báo");
        Path target=path(x);Files.createDirectories(target.getParent());Path tmp=Files.createTempFile(target.getParent(),"upload-",".tmp");
        try{Files.write(tmp,bytes);Files.move(tmp,target,StandardCopyOption.REPLACE_EXISTING,StandardCopyOption.ATOMIC_MOVE);}finally{Files.deleteIfExists(tmp);}
    }
    @Transactional public ApiResponseDto<?> complete(HttpServletRequest r,Long id) throws IOException {
        FileAsset x=owned(r,id);if("ACTIVE".equals(x.getStatus()))return ok("POST",metadata(x));staged(x);
        Path p=path(x);if(!Files.isRegularFile(p)||Files.size(p)!=x.getSizeBytes()||!sha(Files.readAllBytes(p)).equals(x.getSha256()))throw conflict("Chưa nhận được nội dung tệp hợp lệ");
        x.setStatus("ACTIVE");x.setExpiresAt(null);return ok("POST",metadata(files.save(x)));
    }
    public ApiResponseDto<?> metadata(HttpServletRequest r,Long id){FileAsset x=find(id);reader(r,x);return ok("GET",metadata(x));}
    public ApiResponseDto<?> downloadLink(HttpServletRequest r,Long id){FileAsset x=find(id);reader(r,x);active(x);long expires=Instant.now().plusSeconds(600).getEpochSecond();String signature=sign(id,expires);return ok("POST",Map.of("downloadUrl","/api/v1/files/"+id+"/content?expires="+expires+"&token="+signature,"expiresAt",Instant.ofEpochSecond(expires)));}
    public ResponseEntity<FileSystemResource> content(HttpServletRequest r,Long id){
        FileAsset x=find(id);active(x);
        String token=r.getParameter("token"),rawExpiry=r.getParameter("expires");boolean signed=false;
        if(token!=null&&rawExpiry!=null)try{long expiry=Long.parseLong(rawExpiry);signed=expiry>Instant.now().getEpochSecond()&&MessageDigest.isEqual(token.getBytes(StandardCharsets.UTF_8),sign(id,expiry).getBytes(StandardCharsets.UTF_8));}catch(NumberFormatException ignored){}
        if(!signed)reader(r,x);Path p=path(x);if(!Files.isRegularFile(p))throw missing();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(x.getMimeType())).header("X-Content-Type-Options","nosniff").header("Cache-Control","private, no-store").header("Content-Disposition",ContentDisposition.inline().filename(x.getOriginalName(),StandardCharsets.UTF_8).build().toString()).body(new FileSystemResource(p));
    }
    @Transactional public ApiResponseDto<?> delete(HttpServletRequest r,Long id){
        FileAsset x=owned(r,id);if(referenced(id)||x.getReportId()!=null||x.getChatMessageId()!=null||x.getLandlordVerificationId()!=null)throw conflict("Tệp còn được tham chiếu hoặc giữ làm minh chứng");
        x.setStatus("DELETED");x.setDeletedAt(LocalDateTime.now(ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));return ok("DELETE",metadata(files.save(x)));
    }
    public boolean referenced(Long id){
        for(String[] ref:new String[][]{{"post_images","file_id"},{"personal_profiles","avatar_file_id"},{"tenant_identity_verifications","identity_file_id"},{"landlord_verifications","identity_file_id"},{"house_verification_documents","file_id"},{"contracts","paper_document_file_id"},{"contract_revisions","document_file_id"},{"contract_representative_history","consent_file_id"}})
            if(domain.exists("SELECT id FROM "+ref[0]+" WHERE "+ref[1]+"=?",id))return true;
        return false;
    }
    private void reader(HttpServletRequest r,FileAsset x){
        if("ACTIVE".equals(x.getStatus())&&"PUBLIC".equals(x.getVisibility())&&(
            domain.exists("SELECT id FROM personal_profiles WHERE avatar_file_id=?",x.getId())||domain.exists("SELECT i.id FROM post_images i JOIN v_public_house_posts p ON p.id=i.post_id WHERE i.file_id=? AND p.availability_status='OPEN' AND (p.availability_expires_at IS NULL OR p.availability_expires_at>UTC_TIMESTAMP(6))",x.getId())))return;
        Long uid=accounts.authenticatedUserId(r);if(uid.equals(x.getOwnerUserId()))return;
        if(domain.exists("SELECT id FROM admins WHERE id=?",uid)&&("IDENTITY".equals(x.getPurpose())&&referenced(x.getId())||"LANDLORD_PROOF".equals(x.getPurpose())&&referenced(x.getId())||x.getReportId()!=null))return;
        if(x.getChatMessageId()!=null&&domain.exists("SELECT m.id FROM chat_messages m JOIN conversation_participants p ON p.conversation_id=m.conversation_id WHERE m.id=? AND p.user_id=? AND (SELECT COUNT(*) FROM conversation_participants p2 WHERE p2.conversation_id=m.conversation_id)=2",x.getChatMessageId(),uid))return;
        if(domain.exists("SELECT c.id FROM contracts c WHERE c.paper_document_file_id=? AND (c.landlord_id=? OR EXISTS(SELECT 1 FROM room_tenants m WHERE m.contract_id=c.id AND m.tenant_id=?))",x.getId(),uid,uid))return;
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Không có quyền đọc tệp");
    }
    private FileAsset owned(HttpServletRequest r,Long id){FileAsset x=find(id);if(!x.getOwnerUserId().equals(accounts.authenticatedUserId(r)))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Không sở hữu tệp");return x;}
    private FileAsset find(Long id){return files.findById(id).orElseThrow(this::missing);}
    private void staged(FileAsset x){if(!"STAGED".equals(x.getStatus())||x.getExpiresAt()==null||x.getExpiresAt().isBefore(LocalDateTime.now(ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)))throw conflict("Phiên tải tệp đã hết hạn hoặc đã hoàn tất");}
    private void active(FileAsset x){if(!"ACTIVE".equals(x.getStatus()))throw missing();}
    private Path path(FileAsset x){Path p=root.resolve(x.getStorageKey()).normalize();if(!p.startsWith(root))throw bad("Đường dẫn tệp không hợp lệ");return p;}
    private String sign(Long id,long expiry){try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(signingKey,"HmacSHA256"));return HexFormat.of().formatHex(mac.doFinal((id+":"+expiry).getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    private String sha(byte[] bytes){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));}catch(Exception e){throw new IllegalStateException(e);}}
    private boolean matchesType(byte[] b,String type){return switch(type){case "image/jpeg"->b.length>3&&(b[0]&255)==255&&(b[1]&255)==216&&(b[2]&255)==255;case "image/png"->b.length>8&&Arrays.equals(Arrays.copyOf(b,8),new byte[]{(byte)137,80,78,71,13,10,26,10});case "image/webp"->b.length>12&&new String(b,0,4,StandardCharsets.US_ASCII).equals("RIFF")&&new String(b,8,4,StandardCharsets.US_ASCII).equals("WEBP");case "application/pdf"->b.length>5&&new String(b,0,5,StandardCharsets.US_ASCII).equals("%PDF-");default->false;};}
    private Map<String,Object> metadata(FileAsset x){Map<String,Object> m=new LinkedHashMap<>();m.put("id",x.getId());m.put("originalName",x.getOriginalName());m.put("mimeType",x.getMimeType());m.put("sizeBytes",x.getSizeBytes());m.put("sha256",x.getSha256());m.put("purpose",x.getPurpose());m.put("visibility",x.getVisibility());m.put("status",x.getStatus());return m;}
    private String text(JsonNode b,String key){return b==null?"":b.path(key).asText("");}
    private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);}
    private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}
    private ResponseStatusException missing(){return new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy nội dung tệp");}
}
