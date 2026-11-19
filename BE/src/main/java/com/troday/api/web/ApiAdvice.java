package com.troday.api.web;

import com.fasterxml.jackson.databind.*;
import com.troday.api.dto.ApiResponseDto;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataAccessException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;
import jakarta.servlet.http.HttpServletRequest;
import java.text.Normalizer;
import java.time.Instant;
import java.util.*;

@RestControllerAdvice
public class ApiAdvice implements ResponseBodyAdvice<Object> {
    private final ObjectMapper mapper;
    private final List<JsonNode> routes=new ArrayList<>();
    public ApiAdvice(ObjectMapper mapper) {
        this.mapper=mapper;
        try(var input=ApiAdvice.class.getResourceAsStream("/http-contract.json")){mapper.readTree(input).forEach(routes::add);}
        catch(java.io.IOException e){throw new IllegalStateException("Missing HTTP contract",e);}
    }
    public boolean supports(MethodParameter p,Class<? extends HttpMessageConverter<?>> c) { return true; }
    public Object beforeBodyWrite(Object body,MethodParameter p,MediaType type,Class<? extends HttpMessageConverter<?>> c,ServerHttpRequest req,ServerHttpResponse res) {
        if (!(body instanceof ApiResponseDto<?> envelope)) return body;
        HttpServletRequest request=((ServletServerHttpRequest)req).getServletRequest();
        Object data=envelope.data();
        for(JsonNode route:routes)if(route.path("method").asText().equals(req.getMethod().name()) && req.getURI().getPath().matches(route.path("path").asText().replaceAll("\\{[^}]+}","[^/]+"))){res.setStatusCode(HttpStatusCode.valueOf(route.path("status").asInt(200)));break;}
        JsonNode resource=mapper.valueToTree(data);
        for(String key:List.of("rowVersion","contentVersion","profileVersion"))if(resource.hasNonNull(key)){res.getHeaders().setETag("\""+resource.path(key).asText()+"\"");break;}
        Map<String,Object> meta=new LinkedHashMap<>();
        meta.put("requestId",Objects.toString(request.getAttribute("requestId"),UUID.randomUUID().toString()));
        meta.put("timestamp",envelope.timestamp());
        if (HttpMethod.GET.equals(req.getMethod())) {
            Map<?,?> container=data instanceof Map<?,?> m?m:null;
            Object rows=container==null?data:container.get("items");
            if(container!=null && container.get("page") instanceof Number && container.get("totalItems") instanceof Number) {
                meta.put("pagination",Map.of("page",container.get("page"),"pageSize",container.get("pageSize"),"total",container.get("totalItems"),"totalItems",container.get("totalItems"),"totalPages",container.get("totalPages")));
            } else if(rows instanceof List<?> list) {
                int page=positive(request,"page",1,Integer.MAX_VALUE),size=positive(request,"pageSize",20,100);
                String q=normalize(Objects.toString(request.getParameter("q"),request.getParameter("search")));
                List<?> filtered=list.stream().filter(row->matches(row,q,request)).toList();
                long offset=(long)(page-1)*size;
                int from=(int)Math.min(offset,filtered.size()),to=(int)Math.min(offset+size,filtered.size());
                Map<String,Object> paging=new LinkedHashMap<>();
                if(container!=null) container.forEach((k,v)->paging.put(String.valueOf(k),v));
                paging.put("items",filtered.subList(from,to)); paging.put("page",page); paging.put("pageSize",size);
                paging.put("totalItems",filtered.size()); paging.put("totalPages",(filtered.size()+size-1)/size); paging.put("hasNext",to<filtered.size());
                data=paging; meta.put("pagination",Map.of("page",page,"pageSize",size,"total",filtered.size(),"totalItems",filtered.size(),"totalPages",(filtered.size()+size-1)/size));
            }
        }
        Map<String,Object> out=new LinkedHashMap<>();
        out.put("success",true);out.put("api",req.getURI().getPath());out.put("method",req.getMethod().name());
        out.put("data",wireValues(mapper.valueToTree(data),""));out.put("meta",meta);out.put("error",null);out.put("timestamp",envelope.timestamp());
        return out;
    }
    private JsonNode wireValues(JsonNode value,String key) {
        if(value.isObject()){var out=mapper.createObjectNode();value.fields().forEachRemaining(e->out.set(e.getKey(),wireValues(e.getValue(),e.getKey())));return out;}
        if(value.isArray()){var out=mapper.createArrayNode();value.forEach(v->out.add(wireValues(v,key.endsWith("Ids")?"id":key)));return out;}
        if(value.isNumber()&&(key.equals("id")||key.endsWith("Id")))return mapper.getNodeFactory().textNode(value.asText());
        if(value.isNumber()&&Set.of("rentAmount","depositAmount","rentPrice","unitPrice","price","amount","total","quantity","previousReading","currentReading","effectiveUnitPrice","unitPriceOverride","budgetMin","budgetMax").contains(key))return mapper.getNodeFactory().textNode(value.decimalValue().toPlainString());
        return value;
    }
    private boolean matches(Object value,String q,HttpServletRequest r) {
        JsonNode n=mapper.valueToTree(value);
        for(String key:List.of("status","type","houseId","roomId","contractId","tenantId","role","action","actorUserId")) {
            String expected=r.getParameter(key);
            if(expected!=null && !expected.isBlank() && n.has(key) && !expected.equals(n.path(key).asText())) return false;
        }
        return q.isBlank() || normalize(n.toString()).contains(q);
    }
    static String normalize(String s) { return s==null?"":Normalizer.normalize(s,Normalizer.Form.NFD).replaceAll("\\p{M}","").replace('đ','d').replace('Đ','D').toLowerCase(Locale.ROOT).trim(); }
    public static int positive(HttpServletRequest r,String k,int fallback,int max) {
        try { String s=r.getParameter(k); if(s==null)return fallback; int n=Integer.parseInt(s);if(n<1||n>max)throw new NumberFormatException();return n; }
        catch(NumberFormatException e){throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,k+" phải từ 1 đến "+max);}
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> domain(ResponseStatusException e,HttpServletRequest r){return error(e.getStatusCode().value(),e.getReason(),r);}
    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,IllegalArgumentException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
    public ResponseEntity<?> invalid(Exception e,HttpServletRequest r){return error(422,"Thông tin gửi lên không hợp lệ",r);}
    @ExceptionHandler({DataAccessException.class,jakarta.persistence.PersistenceException.class})
    public ResponseEntity<?> database(Exception e,HttpServletRequest r) {
        if(e instanceof org.springframework.dao.EmptyResultDataAccessException)return error(404,"Không tìm thấy dữ liệu",r);
        Throwable cause=e;while(cause.getCause()!=null)cause=cause.getCause();
        // SQL domain SIGNAL/constraints are conflicts, never expose SQL or personal data.
        if(cause instanceof java.sql.SQLException sql && "45000".equals(sql.getSQLState()))return error(409,sql.getMessage(),r);
        if(cause instanceof java.sql.SQLException sql && ("40001".equals(sql.getSQLState()) || sql.getSQLState()!=null&&sql.getSQLState().startsWith("23")))
            return error(409,"Thao tác không đáp ứng trạng thái, sức chứa hoặc dữ liệu liên quan. Hãy tải lại dữ liệu.",r);
        org.slf4j.LoggerFactory.getLogger(ApiAdvice.class).error("Database request failed: {}",r.getAttribute("requestId"),e);
        return error(500,"Không thể xử lý dữ liệu",r);
    }
    private ResponseEntity<?> error(int status,String detail,HttpServletRequest r) {
        Map<String,Object> body=new LinkedHashMap<>();Instant now=Instant.now();body.put("success",false);body.put("detail",Objects.toString(detail,"Yêu cầu thất bại"));body.put("data",null);body.put("error",Map.of("code","HTTP_"+status,"message",Objects.toString(detail,"Yêu cầu thất bại"),"fieldErrors",List.of(),"details",List.of()));body.put("meta",Map.of("requestId",Objects.toString(r.getAttribute("requestId"),""),"timestamp",now));body.put("timestamp",now);return ResponseEntity.status(status).body(body);
    }
}
