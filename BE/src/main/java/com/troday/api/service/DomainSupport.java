package com.troday.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.sql.*;
import java.util.*;

/** Shared database authority checks and adapters to the existing transactional workflows. */
@Component
public class DomainSupport {
    public final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final EntityManager em;
    @org.springframework.beans.factory.annotation.Autowired private RealtimeHub hub;
    public DomainSupport(JdbcTemplate jdbc, ObjectMapper mapper, EntityManager em) {
        this.jdbc = jdbc; this.mapper = mapper; this.em = em;
    }
    public boolean exists(String sql, Object... args) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(" + sql + ")", Boolean.class, args));
    }
    public boolean publicPost(Long id) {
        return exists("SELECT p.id FROM v_public_house_posts p JOIN rooms r ON r.id=p.room_id WHERE p.id=? AND p.availability_status='OPEN' AND (p.availability_expires_at IS NULL OR p.availability_expires_at>UTC_TIMESTAMP(6)) AND r.status='AVAILABLE'", id);
    }
    public boolean contractReader(Long cid, Long uid) {
        return exists("SELECT c.id FROM contracts c WHERE c.id=? AND (c.landlord_id=? OR EXISTS(SELECT 1 FROM room_tenants m WHERE m.contract_id=c.id AND m.tenant_id=?))", cid, uid, uid);
    }
    public boolean representative(Long cid, Long uid) {
        return exists("SELECT c.id FROM contracts c JOIN room_tenants m ON m.id=c.representative_room_tenant_id WHERE c.id=? AND m.tenant_id=? AND m.status IN ('ACTIVE','PLANNED')", cid, uid);
    }
    public void roomReader(Long rid, Long uid) {
        boolean allowed = uid != null && (exists("SELECT id FROM admins WHERE id=?",uid)
            || exists("SELECT r.id FROM rooms r JOIN rental_houses h ON h.id=r.house_id WHERE r.id=? AND h.landlord_id=?",rid,uid)
            || exists("SELECT id FROM room_tenants WHERE room_id=? AND tenant_id=?",rid,uid));
        if (!allowed && !exists("SELECT p.id FROM v_public_house_posts p JOIN rooms r ON r.id=p.room_id WHERE r.status='AVAILABLE' AND p.room_id=? AND p.availability_status='OPEN' AND (p.availability_expires_at IS NULL OR p.availability_expires_at>UTC_TIMESTAMP(6))",rid))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy phòng được phép xem");
    }
    public String json(Object value) {
        try { return mapper.writeValueAsString(value); }
        catch (Exception e) { throw new IllegalArgumentException("Dữ liệu JSON không hợp lệ", e); }
    }
    /** Procedures own their transactions. Call outside a JPA transaction; discard stale entities afterwards. */
    public Long procedure(String name, boolean output, Object... args) {
        if (!name.matches("sp_[a-z_]+")) throw new IllegalArgumentException("Unknown procedure");
        Long result = jdbc.execute((ConnectionCallback<Long>) connection -> {
            int count = args.length + (output ? 1 : 0);
            try (CallableStatement stmt = connection.prepareCall("{call " + name + "(" + String.join(",", Collections.nCopies(count, "?")) + ")}")) {
                for (int i=0; i<args.length; i++) stmt.setObject(i+1,args[i]);
                if (output) stmt.registerOutParameter(count, Types.BIGINT);
                stmt.execute();
                return output ? stmt.getObject(count, Long.class) : null;
            }
        });
        em.clear();
        return result;
    }
    public void activeFile(Long id, Long owner, String... purposes) {
        List<Map<String,Object>> rows=jdbc.queryForList("SELECT owner_user_id,purpose,status FROM files WHERE id=?",id);
        if(rows.isEmpty() || !Objects.equals(((Number)rows.get(0).get("owner_user_id")).longValue(),owner)
            || !"ACTIVE".equals(rows.get(0).get("status")) || !Arrays.asList(purposes).contains(rows.get(0).get("purpose")))
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,"Tệp chưa hoàn tất hoặc không đúng chủ sở hữu/mục đích");
    }
    public void audit(Long actor,String targetColumn,Long target,String action,String reason,Object before,Object after) {
        if(!Set.of("target_user_id","target_post_id","target_report_id","target_landlord_verification_id","target_tenant_verification_id").contains(targetColumn))throw new IllegalArgumentException("Invalid audit target");
        jdbc.update("INSERT INTO moderation_actions(actor_user_id,"+targetColumn+",action,reason,before_snapshot,after_snapshot,occurred_at) VALUES (?,?,?,?,?,?,UTC_TIMESTAMP(6))",actor,target,action,reason==null||reason.isBlank()?"Đã đối chiếu hồ sơ":reason,json(before),json(after));
    }
    public void notifyUser(Long uid,String type,String resource,Long resourceId,String title,String content,String key) {
        jdbc.update("INSERT IGNORE INTO notifications(user_id,type,title,content,resource_type,resource_id,event_key) SELECT id,?,?,?,?,?,? FROM users WHERE id=? AND in_app_enabled=TRUE",type,title,content,resource,resourceId,key,uid);
        hub.publish(uid,"notification",key,Map.of("type",type,"resourceType",resource,"resourceId",resourceId));
    }
    public void expectedVersion(jakarta.servlet.http.HttpServletRequest r,com.fasterxml.jackson.databind.JsonNode b,String key,Long actual) {
        String value=r.getHeader("If-Match");if(value==null&&b!=null&&b.hasNonNull(key))value=b.get(key).asText();
        if(value==null)throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED,"Cần phiên bản hiện tại");
        try{if(!Objects.equals(Long.valueOf(value.replace("\"","")),actual))throw new ResponseStatusException(HttpStatus.CONFLICT,"Phiên bản đã thay đổi");}catch(NumberFormatException e){throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,"Phiên bản không hợp lệ");}
    }
    public void lockContract(Long id) {
        jdbc.queryForList("SELECT id FROM rooms WHERE id=(SELECT room_id FROM contracts WHERE id=?) FOR UPDATE",id);
        jdbc.queryForList("SELECT id FROM contracts WHERE id=? FOR UPDATE",id);
    }
    public <T> T current(Class<T> type,Long id) { T value=em.find(type,id,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);if(value!=null)em.refresh(value,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);return value; }
    /** Page in SQL before materializing DTOs. All SQL fragments come from service-owned constants. */
    public Map<String,Object> page(jakarta.servlet.http.HttpServletRequest request,String from,String idColumn,String searchable,String order,List<Object> scope,Map<String,String> filters,java.util.function.Function<Long,?> dto) {
        List<Object> args=new ArrayList<>(scope);StringBuilder where=new StringBuilder(from);
        String q=request.getParameter("q");if(q==null)q=request.getParameter("search");
        if(q!=null&&!q.isBlank()&&!searchable.isBlank()){where.append(" AND ").append(searchable).append(" LIKE ? ESCAPE '='");args.add("%"+q.trim().replace("=","==").replace("%","=%").replace("_","=_")+"%");}
        for(var filter:filters.entrySet()){String value=request.getParameter(filter.getKey());if(value!=null&&!value.isBlank()){where.append(" AND ").append(filter.getValue()).append("=?");args.add(value);}}
        int page=com.troday.api.web.ApiAdvice.positive(request,"page",1,Integer.MAX_VALUE),size=com.troday.api.web.ApiAdvice.positive(request,"pageSize",20,100);
        Long total=jdbc.queryForObject("SELECT COUNT(*) "+where,Long.class,args.toArray());
        args.add(size);args.add((long)(page-1)*size);
        List<Long> ids=jdbc.queryForList("SELECT "+idColumn+" "+where+" ORDER BY "+order+" LIMIT ? OFFSET ?",Long.class,args.toArray());
        return Map.of("items",ids.stream().map(dto).toList(),"page",page,"pageSize",size,"totalItems",total,"totalPages",(total+size-1)/size,"hasNext",(long)page*size<total);
    }
}
