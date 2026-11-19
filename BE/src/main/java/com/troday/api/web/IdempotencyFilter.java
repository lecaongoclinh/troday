package com.troday.api.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.troday.api.service.AccountService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/** Durable reservation prevents a retry from re-executing an uncertain committed operation. */
@Component
public class IdempotencyFilter extends OncePerRequestFilter {
    private final JdbcTemplate jdbc;
    private final AccountService accounts;
    private final ObjectMapper mapper;
    public IdempotencyFilter(JdbcTemplate jdbc,AccountService accounts,ObjectMapper mapper){this.jdbc=jdbc;this.accounts=accounts;this.mapper=mapper;}
    @Override protected boolean shouldNotFilter(HttpServletRequest r){return !r.getRequestURI().startsWith("/api/v1/")||!Set.of("POST","PATCH","PUT","DELETE").contains(r.getMethod())||r.getHeader("Idempotency-Key")==null||r.getRequestURI().endsWith("/content");}
    @Override protected void doFilterInternal(HttpServletRequest r,HttpServletResponse response,FilterChain chain) throws ServletException,IOException {
        String key=r.getHeader("Idempotency-Key");
        if(key.isBlank()||key.length()>100){error(response,422,"Idempotency-Key không hợp lệ");return;}
        Long actor=0L;
        if(r.getHeader("Authorization")!=null)try{actor=accounts.authenticatedUserId(r);}catch(org.springframework.web.server.ResponseStatusException e){error(response,e.getStatusCode().value(),e.getReason());return;}
        byte[] body=r.getInputStream().readNBytes(1_048_577);if(body.length>1_048_576){error(response,413,"Nội dung yêu cầu quá lớn");return;}
        byte[] canonical=body;
        if(body.length>0)try{canonical=mapper.writer().with(com.fasterxml.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS).writeValueAsBytes(mapper.readValue(body,Object.class));}catch(com.fasterxml.jackson.core.JsonProcessingException ignored){}
        String hash=sha((sha(canonical)+":"+Objects.toString(r.getHeader("If-Match"),"")+":"+Objects.toString(r.getHeader("Refresh-Token"),"")).getBytes(StandardCharsets.UTF_8)),scope=sha((actor+":"+r.getMethod()+":"+r.getRequestURI()+":"+Objects.toString(r.getQueryString(),"")+":"+key).getBytes(StandardCharsets.UTF_8));
        try{jdbc.update("INSERT INTO api_request_replays(scope_hash,payload_hash) VALUES (?,?)",scope,hash);}
        catch(DuplicateKeyException e){
            Map<String,Object> row=jdbc.queryForMap("SELECT * FROM api_request_replays WHERE scope_hash=?",scope);
            if(!hash.equals(row.get("payload_hash"))){error(response,409,"Idempotency-Key đã dùng với nội dung khác","IDEMPOTENCY_KEY_REUSED");return;}
            if(!"COMPLETED".equals(row.get("state"))){error(response,409,"Yêu cầu cùng khóa đang xử lý hoặc cần đối soát kết quả; không gửi lại bằng khóa mới","REQUEST_IN_PROGRESS");return;}
            byte[] replay=(byte[])row.get("response_body");
            try{var json=mapper.readTree(replay);for(String field:List.of("rowVersion","contentVersion","profileVersion"))if(json.path("data").hasNonNull(field)){response.setHeader("ETag","\""+json.path("data").path(field).asText()+"\"");break;}if(json.path("meta").hasNonNull("requestId"))response.setHeader("X-Request-Id",json.path("meta").path("requestId").asText());}catch(Exception ignored){}
            response.setStatus(((Number)row.get("response_status")).intValue());response.setContentType("application/json;charset=UTF-8");response.setHeader("Idempotency-Replayed","true");response.getOutputStream().write(replay);return;
        }
        HttpServletRequest wrapped=new HttpServletRequestWrapper(r){
            @Override public ServletInputStream getInputStream(){ByteArrayInputStream input=new ByteArrayInputStream(body);return new ServletInputStream(){public int read(){return input.read();}public boolean isFinished(){return input.available()==0;}public boolean isReady(){return true;}public void setReadListener(ReadListener l){throw new UnsupportedOperationException();}};}
            @Override public BufferedReader getReader(){return new BufferedReader(new InputStreamReader(getInputStream(),StandardCharsets.UTF_8));}
        };
        ContentCachingResponseWrapper cached=new ContentCachingResponseWrapper(response);
        try {
            chain.doFilter(wrapped,cached);
            if(cached.getStatus()<500)jdbc.update("UPDATE api_request_replays SET state='COMPLETED',response_status=?,response_body=?,completed_at=UTC_TIMESTAMP(6) WHERE scope_hash=?",cached.getStatus(),cached.getContentAsByteArray(),scope);
        } finally{cached.copyBodyToResponse();}
    }
    private String sha(byte[] b){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(b));}catch(Exception e){throw new IllegalStateException(e);}}
    private void error(HttpServletResponse r,int status,String message)throws IOException{error(r,status,message,"HTTP_"+status);}
    private void error(HttpServletResponse r,int status,String message,String code)throws IOException{r.setStatus(status);r.setContentType("application/json;charset=UTF-8");mapper.writeValue(r.getOutputStream(),Map.of("success",false,"detail",message,"error",Map.of("code",code,"message",message)));}
}
