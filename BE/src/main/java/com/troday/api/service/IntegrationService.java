package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.entity.FileAsset;
import com.troday.api.repository.FileAssetRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class IntegrationService {
 private static final Set<String> PURPOSES=Set.of("AVATAR","POST_IMAGE","IDENTITY","LANDLORD_PROOF","CONTRACT","REPORT_EVIDENCE","CHAT_IMAGE");
 private final AccountService accounts; private final FileAssetRepository files;
 public IntegrationService(AccountService accounts,FileAssetRepository files){this.accounts=accounts;this.files=files;}
 @Transactional public ApiResponseDto<?> createUploadSession(HttpServletRequest r,JsonNode b){Long owner=accounts.authenticatedUserId(r);require(b);String purpose=text(b,"purpose");String name=text(b,"originalName");String mime=text(b,"mimeType");long size=number(b,"sizeBytes");String sha=text(b,"sha256").toLowerCase(Locale.ROOT);if(!PURPOSES.contains(purpose))throw bad("purpose không hợp lệ");if(name.isBlank()||mime.isBlank()||size<0||!sha.matches("[a-f0-9]{64}"))throw bad("Thông tin tệp không hợp lệ");if(size>20_000_000L)throw bad("Tệp vượt quá dung lượng cho phép");FileAsset x=new FileAsset();x.setOwnerUserId(owner);x.setStorageKey("private/"+owner+"/"+UUID.randomUUID());x.setOriginalName(name);x.setMimeType(mime);x.setSizeBytes(size);x.setSha256(sha);x.setPurpose(purpose);x.setVisibility("POST_IMAGE".equals(purpose)||"AVATAR".equals(purpose)?"PUBLIC":"PRIVATE");x.setStatus("STAGED");x.setExpiresAt(LocalDateTime.now().plusMinutes(30));x=files.save(x);return ok("POST",Map.of("fileId",x.getId(),"status",x.getStatus(),"uploadUrl","/api/v1/files/"+x.getId()+"/content","expiresAt",x.getExpiresAt(),"requiredHeaders",Map.of("Content-Type",mime,"X-File-SHA256",sha)));}
 @Transactional public ApiResponseDto<?> complete(HttpServletRequest r,Long id){FileAsset x=owned(r,id);if(!"STAGED".equals(x.getStatus()))throw conflict("Tệp không còn ở trạng thái STAGED");if(x.getExpiresAt()!=null&&x.getExpiresAt().isBefore(LocalDateTime.now()))throw conflict("Phiên upload đã hết hạn");x.setStatus("ACTIVE");x.setExpiresAt(null);return ok("POST",metadata(files.save(x)));}
 public ApiResponseDto<?> metadata(HttpServletRequest r,Long id){return ok("GET",metadata(owned(r,id)));}
 public ApiResponseDto<?> downloadLink(HttpServletRequest r,Long id){FileAsset x=owned(r,id);if(!"ACTIVE".equals(x.getStatus()))throw conflict("Tệp chưa sẵn sàng để đọc");LocalDateTime expires=LocalDateTime.now().plusMinutes(10);return ok("POST",Map.of("downloadUrl","/api/v1/files/"+id+"/content?token="+UUID.randomUUID(),"expiresAt",expires));}
 @Transactional public ApiResponseDto<?> delete(HttpServletRequest r,Long id){FileAsset x=owned(r,id);if("DELETED".equals(x.getStatus()))throw conflict("Tệp đã bị xóa");if(x.getReportId()!=null||x.getChatMessageId()!=null||x.getLandlordVerificationId()!=null)throw conflict("Tệp đang được giữ làm bằng chứng");x.setStatus("DELETED");x.setDeletedAt(LocalDateTime.now());return ok("DELETE",metadata(files.save(x)));}
 private FileAsset owned(HttpServletRequest r,Long id){Long me=accounts.authenticatedUserId(r);FileAsset x=files.findById(id).orElseThrow(()->notFound("Không tìm thấy tệp"));if(!Objects.equals(x.getOwnerUserId(),me))throw forbidden("Bạn không có quyền với tệp này");return x;}
 private Map<String,Object> metadata(FileAsset x){Map<String,Object> m=new LinkedHashMap<>();m.put("id",x.getId());m.put("originalName",x.getOriginalName());m.put("mimeType",x.getMimeType());m.put("sizeBytes",x.getSizeBytes());m.put("sha256",x.getSha256());m.put("purpose",x.getPurpose());m.put("visibility",x.getVisibility());m.put("status",x.getStatus());m.put("expiresAt",x.getExpiresAt());m.put("deletedAt",x.getDeletedAt());return m;}
 private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);} private void require(JsonNode b){if(b==null||!b.isObject())throw bad("JSON request là bắt buộc");} private String text(JsonNode b,String k){return b!=null&&b.hasNonNull(k)?b.get(k).asText():"";} private long number(JsonNode b,String k){try{return b!=null&&b.hasNonNull(k)?b.get(k).asLong(-1):-1;}catch(Exception e){throw bad(k+" không hợp lệ");}} private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);} private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);} private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);} private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
