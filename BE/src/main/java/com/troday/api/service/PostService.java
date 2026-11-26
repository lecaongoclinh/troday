package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.entity.*;
import com.troday.api.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
    private final AccountService accounts;
    private final PostRepository posts;
    private final RoomRepository rooms;
    private final RentalHouseRepository houses;
    private final RentalHouseVerificationRepository verifications;
    private final FavoritePostRepository favorites;
    private final PostAmenityRepository postAmenities;

    public PostService(AccountService accounts, PostRepository posts, RoomRepository rooms, RentalHouseRepository houses,
                       RentalHouseVerificationRepository verifications, FavoritePostRepository favorites,
                       PostAmenityRepository postAmenities) {
        this.accounts = accounts; this.posts = posts; this.rooms = rooms; this.houses = houses;
        this.verifications = verifications; this.favorites = favorites; this.postAmenities = postAmenities;
    }

    public ApiResponseDto<?> landlordPosts(HttpServletRequest r) {
        Long me = accounts.authenticatedUserId(r);
        LocalDate from = filterDate(r, "createdFrom"), to = filterDate(r, "createdTo");
        if (from != null && to != null && from.isAfter(to)) throw bad("Ngày tạo từ phải trước hoặc bằng ngày tạo đến");
        StringBuilder scope = new StringBuilder("FROM posts p JOIN rooms r ON r.id=p.room_id WHERE p.landlord_id=?");
        List<Object> args = new ArrayList<>();
        args.add(me);
        if (from != null) {
            scope.append(" AND p.created_at>=?");
            args.add(vietnamDayStart(from));
        }
        if (to != null) {
            scope.append(" AND p.created_at<?");
            args.add(vietnamDayStart(to.plusDays(1)));
        }
        return ok("GET", domain.page(r, scope.toString(), "p.id", "CONCAT_WS(' ',p.title,p.content,r.room_number)",
            "p.id DESC", args, Map.of("status", "p.status", "roomId", "p.room_id", "houseId", "p.house_id"),
            id -> postData(posts.findById(id).orElseThrow())));
 }

    private LocalDate filterDate(HttpServletRequest request, String name) {
        String value = request.getParameter(name);
        if (value == null || value.isBlank()) return null;
        try {
            LocalDate date = LocalDate.parse(value);
            if (date.getYear() >= 1000 && date.getYear() < 9999) return date;
        } catch (DateTimeParseException ignored) { }
        throw bad("Ngày tạo phải có định dạng YYYY-MM-DD và nằm trong khoảng năm 1000–9998");
    }

    private LocalDateTime vietnamDayStart(LocalDate date) {
        return date.atStartOfDay(ZoneId.of("Asia/Ho_Chi_Minh")).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
    }

    @Transactional public ApiResponseDto<?> create(HttpServletRequest r, JsonNode b) {
        Long owner = accounts.authenticatedUserId(r); requireBody(b); Room room = room(b); RentalHouse house = ownedHouse(owner, room.getHouseId());
        Post p = new Post(); p.setLandlordId(owner); p.setHouseId(house.getId()); p.setRoomId(room.getId()); apply(p, b);
        p.setPendingReviewSlot(nextPendingSlot(room.getId(), null)); p.setStatus("PENDING_REVIEW");
        p = posts.save(p); replaceAmenities(p, b); replaceImages(p,b); return ok("POST", postData(p));
    }

    @Transactional public ApiResponseDto<?> update(HttpServletRequest r, Long id, JsonNode b) {
        Long owner = accounts.authenticatedUserId(r); domain.jdbc.queryForList("SELECT id FROM posts WHERE id=? FOR UPDATE",id); Post p = ownedPost(owner, id); requireBody(b);
        domain.jdbc.queryForList("SELECT id FROM posts WHERE id=? FOR UPDATE",id); domain.expectedVersion(r,b,"contentVersion",p.getContentVersion());
        if(b.hasNonNull("roomId")&&!Objects.equals(b.get("roomId").asLong(),p.getRoomId()))throw bad("Không được đổi phòng của tin đã tồn tại");
        apply(p, b); p.setPendingReviewSlot(nextPendingSlot(p.getRoomId(), p.getId())); p.setStatus("PENDING_REVIEW");
        p.setContentVersion(Optional.ofNullable(p.getContentVersion()).orElse(1L) + 1); p = posts.saveAndFlush(p);domain.jdbc.update("UPDATE posts SET reviewed_by_id=NULL,reviewed_at=NULL,rejection_reason=NULL WHERE id=?",p.getId()); replaceAmenities(p, b); replaceImages(p,b); return ok("PATCH", postData(p));
    }

    public ApiResponseDto<?> adminList(HttpServletRequest r) {
 accounts.requireAdminId(r);return ok("GET",domain.page(r,"FROM posts p JOIN rooms r ON r.id=p.room_id WHERE 1=1","p.id","CONCAT_WS(' ',p.title,p.content,r.room_number)","p.id DESC",List.of(),Map.of("status","p.status","roomId","p.room_id","houseId","p.house_id"),id->postData(posts.findById(id).orElseThrow())));
 }

    @Transactional public ApiResponseDto<?> decision(HttpServletRequest r, Long id, JsonNode b) {
        Long reviewer=accounts.requireAdminId(r);domain.jdbc.queryForList("SELECT id FROM posts WHERE id=? FOR UPDATE",id); Post p = findPost(id);domain.expectedVersion(r,b,"contentVersion",p.getContentVersion()); if (!"PENDING_REVIEW".equals(p.getStatus())) throw conflict("Tin không ở trạng thái chờ duyệt");
        String d = text(b, "decision"); if (!Set.of("APPROVE", "REJECT").contains(d)) throw bad("decision phải là APPROVE hoặc REJECT");
        if ("APPROVE".equals(d) && !effectiveRight(p.getHouseId())) throw conflict("Quyền cho thuê nhà chưa hiệu lực");
        if("REJECT".equals(d)&&text(b,"reason").isBlank())throw bad("Cần lý do từ chối");p.setStatus("APPROVE".equals(d) ? "APPROVED" : "REJECTED"); p.setPendingReviewSlot(null);posts.saveAndFlush(p);domain.jdbc.update("UPDATE posts SET reviewed_by_id=?,reviewed_at=UTC_TIMESTAMP(6),rejection_reason=?,published_at=CASE WHEN status='APPROVED' THEN COALESCE(published_at,UTC_TIMESTAMP(6)) ELSE published_at END WHERE id=?",reviewer,"REJECTED".equals(p.getStatus())?text(b,"reason"):null,id);domain.audit(reviewer,"target_post_id",id,"POST_"+d,text(b,"reason"),Map.of("status","PENDING_REVIEW","contentVersion",p.getContentVersion()),Map.of("status",p.getStatus()));domain.notifyUser(p.getLandlordId(),"POST_MODERATION","POST",id,"Tin đăng đã được xử lý",p.getStatus(),"post:"+id+":"+p.getContentVersion()+":"+d);return ok("POST",postData(p));
    }

    @Transactional public ApiResponseDto<?> hide(HttpServletRequest r, Long id, JsonNode b) {
        Long actor = accounts.authenticatedUserId(r); Post p = findPost(id); if (!p.getLandlordId().equals(actor) && !isAdmin(r)) throw forbidden("Không có quyền ẩn tin");
        if (!"APPROVED".equals(p.getStatus())) throw conflict("Chỉ được ẩn tin đang công khai"); if(text(b,"reason").isBlank())throw bad("Cần lý do ẩn tin");p.setStatus("HIDDEN");posts.saveAndFlush(p);domain.jdbc.update("UPDATE posts SET hidden_by_id=?,hidden_at=UTC_TIMESTAMP(6),hidden_reason=? WHERE id=?",actor,text(b,"reason"),id);domain.audit(actor,"target_post_id",id,"POST_HIDE",text(b,"reason"),Map.of("status","APPROVED"),Map.of("status","HIDDEN"));return ok("POST",postData(p));
    }

    @Transactional public ApiResponseDto<?> restore(HttpServletRequest r, Long id) {
        accounts.requireAdminId(r); Post p = findPost(id); if (!"HIDDEN".equals(p.getStatus())) throw conflict("Tin không ở trạng thái đã ẩn");
        if (!effectiveRight(p.getHouseId())) throw conflict("Quyền cho thuê nhà chưa hiệu lực"); p.setStatus("APPROVED");posts.saveAndFlush(p);domain.audit(accounts.requireAdminId(r),"target_post_id",id,"POST_RESTORE","Khôi phục tin",Map.of("status","HIDDEN"),Map.of("status","APPROVED"));return ok("POST",postData(p));
    }

    /** Public search for available rooms. */
    public ApiResponseDto<?> explore(HttpServletRequest r) {
String sort=Optional.ofNullable(r.getParameter("sort")).orElse("newest");
        BigDecimal minArea=decimalParam(r,"minArea"),maxArea=decimalParam(r,"maxArea"),minRent=decimalParam(r,"minRent"),maxRent=decimalParam(r,"maxRent"),lat=decimalParam(r,"lat"),lng=decimalParam(r,"lng"),radius=decimalParam(r,"radiusKm");
        for(BigDecimal value:Arrays.asList(minArea,maxArea,minRent,maxRent,radius))if(value!=null&&value.signum()<0)throw bad("Giá, diện tích và bán kính không được âm");
        if((lat==null)!=(lng==null)||radius!=null&&(lat==null||radius.signum()<=0)||lat!=null&&(lat.abs().compareTo(BigDecimal.valueOf(90))>0||lng.abs().compareTo(BigDecimal.valueOf(180))>0))throw bad("Tọa độ hoặc bán kính không hợp lệ");
        StringBuilder from=new StringBuilder("FROM posts p JOIN rooms r ON r.id=p.room_id JOIN rental_houses h ON h.id=r.house_id WHERE p.status='APPROVED' AND p.availability_status='OPEN' AND (p.availability_expires_at IS NULL OR p.availability_expires_at>UTC_TIMESTAMP(6)) AND r.status='AVAILABLE' AND EXISTS(SELECT id FROM v_effective_house_verifications v WHERE v.house_id=h.id)");List<Object> args=new ArrayList<>();
        if(minArea!=null){from.append(" AND r.area>=?");args.add(minArea);}if(maxArea!=null){from.append(" AND r.area<=?");args.add(maxArea);}if(minRent!=null){from.append(" AND r.rent_price>=?");args.add(minRent);}if(maxRent!=null){from.append(" AND r.rent_price<=?");args.add(maxRent);}
        for(String amenity:csv(r.getParameter("amenities"))){from.append(" AND EXISTS(SELECT id FROM post_amenities a WHERE a.post_id=p.id AND a.amenity=?)");args.add(amenity);}
        String distance=lat==null?null:"(6371*2*ASIN(SQRT(LEAST(1,POWER(SIN(RADIANS(h.latitude-"+lat.toPlainString()+")/2),2)+COS(RADIANS("+lat.toPlainString()+"))*COS(RADIANS(h.latitude))*POWER(SIN(RADIANS(h.longitude-"+lng.toPlainString()+")/2),2)))))";
        if(radius!=null){from.append(" AND ").append(distance).append("<=?");args.add(radius);}
        String order=switch(sort){case "newest"->"COALESCE(p.published_at,p.created_at) DESC,p.id DESC";case "rentAsc"->"r.rent_price ASC,p.id DESC";case "rentDesc"->"r.rent_price DESC,p.id DESC";case "areaAsc"->"r.area ASC,p.id DESC";case "areaDesc"->"r.area DESC,p.id DESC";case "distance"->{if(distance==null)throw bad("Sắp xếp khoảng cách cần vị trí");yield distance+" ASC,p.id DESC";}default->throw bad("sort không hợp lệ");};
        return ok("GET",domain.page(r,from.toString(),"p.id","CONCAT_WS(' ',p.title,p.content,h.address,r.room_number)",order,args,Map.of("provinceCode","h.province_code","houseId","h.id","roomId","r.id"),id->{Post p=posts.findById(id).orElseThrow();Map<String,Object> dto=postData(p);if(lat!=null){RentalHouse h=houses.findById(p.getHouseId()).orElseThrow();dto.put("distanceKm",h.getLatitude()==null||h.getLongitude()==null?null:distanceKm(lat,lng,h.getLatitude(),h.getLongitude()));}return dto;}));
 }

    public ApiResponseDto<?> publicDetail(Long id) { Post p = findPost(id); if (!isPublic(p)) throw notFound("Không tìm thấy tin công khai"); return ok("GET", postData(p)); }

    public ApiResponseDto<?> favoriteList(HttpServletRequest r) {
        Long user = accounts.authenticatedUserId(r); List<Map<String, Object>> result = favorites.findByUserIdOrderByCreatedAtDesc(user).stream().map(f -> {
            Map<String, Object> item = new LinkedHashMap<>(); item.put("postId", f.getPostId()); item.put("savedAt", Objects.toString(f.getCreatedAt(), ""));
            item.put("post", posts.findById(f.getPostId()).filter(this::isPublic).map(this::postData).orElse(null)); return item;
        }).toList(); return ok("GET", result);
    }

    @Transactional public ApiResponseDto<?> favoriteAdd(HttpServletRequest r, Long id) {
        Long user = accounts.authenticatedUserId(r); Post p = findPost(id); if (!isPublic(p) || !effectiveRight(p.getHouseId())) throw notFound("Tin không còn khả dụng");
        if (favorites.findByUserIdAndPostId(user, id).isEmpty()) { FavoritePost f = new FavoritePost(); f.setUserId(user); f.setPostId(id); f.setCreatedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)); favorites.save(f); }
        return ok("PUT", Map.of("postId", id, "saved", true));
    }

    @Transactional public ApiResponseDto<?> favoriteRemove(HttpServletRequest r, Long id) { Long user = accounts.authenticatedUserId(r); favorites.findByUserIdAndPostId(user, id).ifPresent(favorites::delete); return ok("DELETE", Map.of("postId", id, "saved", false)); }

    private boolean matches(Post p, String q, String province, BigDecimal minArea, BigDecimal maxRent, BigDecimal lat, BigDecimal lng, BigDecimal radius, Set<String> amenities) {
        Room room = rooms.findById(p.getRoomId()).orElse(null); RentalHouse house = houses.findById(p.getHouseId()).orElse(null); if (room == null || house == null) return false;
        String haystack = (Objects.toString(p.getTitle(), "") + " " + Objects.toString(p.getContent(), "")).toLowerCase();
        if (q != null && !haystack.contains(q.toLowerCase())) return false; if (province != null && !province.equals(house.getProvinceCode())) return false;
        if (minArea != null && (room.getArea() == null || room.getArea().compareTo(minArea) < 0)) return false; if (maxRent != null && (room.getRentPrice() == null || room.getRentPrice().compareTo(maxRent) > 0)) return false;
        if (!amenities.isEmpty() && !new HashSet<>(postAmenities.findByPostId(p.getId()).stream().map(PostAmenity::getAmenity).toList()).containsAll(amenities)) return false;
        if (lat != null && lng != null && radius != null && (house.getLatitude() == null || house.getLongitude() == null || distanceKm(lat, lng, house.getLatitude(), house.getLongitude()) > radius.doubleValue())) return false;
        return true;
    }

    private Comparator<Map<String, Object>> comparator(String sort) {
        Comparator<Map<String, Object>> newest = Comparator.comparing(m -> ((Number)m.get("id")).longValue(), Comparator.reverseOrder());
        return switch (sort) { case "rentAsc" -> Comparator.comparing(m -> number(m.get("rentAmount"))); case "rentDesc" -> Comparator.comparing((Map<String, Object> m) -> number(m.get("rentAmount"))).reversed(); case "areaAsc" -> Comparator.comparing(m -> number(m.get("area"))); case "areaDesc" -> Comparator.comparing((Map<String, Object> m) -> number(m.get("area"))).reversed(); case "newest" -> newest; default -> throw bad("sort không hợp lệ"); };
    }

    private Map<String, Object> postData(Post p) {
        Map<String, Object> m = new LinkedHashMap<>(); m.put("id", p.getId()); m.put("landlordId", p.getLandlordId()); m.put("houseId", p.getHouseId()); m.put("roomId", p.getRoomId());
        m.put("title", Objects.toString(p.getTitle(), "")); m.put("content", Objects.toString(p.getContent(), "")); m.put("status", Objects.toString(p.getStatus(), ""));
        m.put("availabilityStatus", Objects.toString(p.getAvailabilityStatus(), "STALE")); m.put("contentVersion", Objects.toString(p.getContentVersion(), "1"));
        m.put("createdAt", p.getCreatedAt() == null ? null : p.getCreatedAt().atOffset(ZoneOffset.UTC));
        Room room = rooms.findById(p.getRoomId()).orElse(null); m.put("area", room == null ? "" : Objects.toString(room.getArea(), "")); m.put("rentAmount", room == null ? "" : Objects.toString(room.getRentPrice(), ""));
        RentalHouse house = houses.findById(p.getHouseId()).orElse(null); m.put("room", roomData(room)); m.put("house", houseData(house)); m.put("amenities", postAmenities.findByPostId(p.getId()).stream().map(PostAmenity::getAmenity).toList()); List<String> photos=domain.jdbc.query("SELECT COALESCE(pi.external_url,CONCAT('/api/v1/files/',pi.file_id,'/content')) AS url FROM post_images pi LEFT JOIN files f ON f.id=pi.file_id WHERE pi.post_id=? AND (pi.external_url IS NOT NULL OR f.status='ACTIVE') ORDER BY pi.position",(rs,n)->rs.getString(1),p.getId());m.put("imageFileIds",domain.jdbc.queryForList("SELECT file_id FROM post_images WHERE post_id=? AND file_id IS NOT NULL ORDER BY position",Long.class,p.getId()));m.put("images",photos);m.put("photoUrl",photos.isEmpty()?"":photos.get(0));return m;
    }
    private Map<String, Object> roomData(Room r) { if (r == null) return null; return Map.of("id", r.getId(), "houseId", r.getHouseId(), "code", Objects.toString(r.getRoomNumber(), ""), "area", Objects.toString(r.getArea(), ""), "rentAmount", Objects.toString(r.getRentPrice(), ""), "depositAmount", Objects.toString(r.getDepositAmount(), ""), "capacity", Objects.toString(r.getMaxOccupants(), ""), "status", Objects.toString(r.getStatus(), "")); }
    private Map<String, Object> houseData(RentalHouse h) { if (h == null) return null; return Map.of("id", h.getId(), "name", Objects.toString(h.getName(), ""), "address", Objects.toString(h.getAddress(), ""), "provinceCode", Objects.toString(h.getProvinceCode(), ""), "localityCode", Objects.toString(h.getLocalityCode(), "")); }
    private boolean isPublic(Post p) {
return domain.publicPost(p.getId());
 }
    private int nextPendingSlot(Long roomId, Long excluded) { Set<Integer> used = posts.findByRoomIdAndStatus(roomId, "PENDING_REVIEW").stream().filter(p -> !Objects.equals(p.getId(), excluded)).map(Post::getPendingReviewSlot).filter(Objects::nonNull).collect(Collectors.toSet()); return Arrays.stream(new int[]{1, 2, 3}).filter(i -> !used.contains(i)).findFirst().orElseThrow(() -> conflict("Phòng đã đạt giới hạn 3 tin chờ duyệt")); }
    private Room room(JsonNode b) { if (!b.hasNonNull("roomId")) throw bad("roomId là bắt buộc"); return rooms.findById(b.get("roomId").asLong()).orElseThrow(() -> notFound("Không tìm thấy phòng")); }
    private RentalHouse ownedHouse(Long owner, Long id) { RentalHouse h = houses.findById(id).orElseThrow(() -> notFound("Không tìm thấy nhà")); if (!h.getLandlordId().equals(owner)) throw forbidden("Bạn không sở hữu nhà này"); return h; }
    private Post ownedPost(Long owner, Long id) { Post p = findPost(id); if (!p.getLandlordId().equals(owner)) throw forbidden("Bạn không sở hữu tin này"); return p; }
    private Post findPost(Long id) { return posts.findById(id).orElseThrow(() -> notFound("Không tìm thấy tin đăng")); }
    private boolean effectiveRight(Long houseId) {
return domain.exists("SELECT id FROM v_effective_house_verifications WHERE house_id=?",houseId);
 }
    private boolean isAdmin(HttpServletRequest r) { try { accounts.requireAdminId(r); return true; } catch (Exception e) { return false; } }
    private void apply(Post p, JsonNode b) { String title = text(b, "title"), content = text(b, "content"); if (title.isBlank() || content.isBlank()) throw bad("title và content là bắt buộc"); p.setTitle(title); p.setContent(content); p.setAvailabilityStatus("OPEN"); p.setAvailabilityConfirmedAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS)); p.setAvailabilityExpiresAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS).plusDays(7)); }
    private void replaceImages(Post p,JsonNode b){if(!b.has("imageFileIds"))return;if(!b.get("imageFileIds").isArray()||b.get("imageFileIds").size()>12)throw bad("Chỉ chọn tối đa 12 ảnh");Set<Long> seen=new HashSet<>();for(JsonNode id:b.get("imageFileIds")){if(!seen.add(id.asLong()))throw bad("Ảnh bị trùng");domain.activeFile(id.asLong(),p.getLandlordId(),"POST_IMAGE");}domain.jdbc.update("DELETE FROM post_images WHERE post_id=?",p.getId());int position=0;for(Long id:seen)domain.jdbc.update("INSERT INTO post_images(post_id,file_id,position) VALUES (?,?,?)",p.getId(),id,position++);}
    private void replaceAmenities(Post p, JsonNode b) { if (!b.has("amenities") || !b.get("amenities").isArray()) return; postAmenities.deleteByPostId(p.getId());postAmenities.flush(); for (JsonNode value : b.get("amenities")) { String amenity = value.asText().trim(); if (!amenity.isBlank()) { PostAmenity a = new PostAmenity(); a.setPostId(p.getId()); a.setAmenity(amenity); postAmenities.save(a); } } }
    private Set<String> csv(String value) { return value == null || value.isBlank() ? Set.of() : Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toSet()); }
    private BigDecimal decimalParam(HttpServletRequest r, String key) { String v = r.getParameter(key); if (v == null || v.isBlank()) return null; try { return new BigDecimal(v); } catch (NumberFormatException e) { throw bad(key + " không hợp lệ"); } }
    private double distanceKm(BigDecimal a, BigDecimal b, BigDecimal c, BigDecimal d) { double x = Math.toRadians(c.doubleValue() - a.doubleValue()), y = Math.toRadians(d.doubleValue() - b.doubleValue()), z = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(Math.toRadians(a.doubleValue())) * Math.cos(Math.toRadians(c.doubleValue())) * Math.sin(y / 2) * Math.sin(y / 2); return 6371 * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z)); }
    private double number(Object v) { try { return v == null || String.valueOf(v).isBlank() ? Double.MAX_VALUE : Double.parseDouble(String.valueOf(v)); } catch (NumberFormatException e) { return Double.MAX_VALUE; } }
    private ApiResponseDto<?> ok(String method, Object data) { return ApiResponseDto.ok("/api/v1", method, data); }
    private void requireBody(JsonNode b) { if (b == null || !b.isObject()) throw bad("JSON request là bắt buộc"); }
    private String text(JsonNode b, String k) { return b != null && b.hasNonNull(k) ? b.get(k).asText() : ""; }
    private ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, m); }
    private ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
    private ResponseStatusException forbidden(String m) { return new ResponseStatusException(HttpStatus.FORBIDDEN, m); }
    private ResponseStatusException notFound(String m) { return new ResponseStatusException(HttpStatus.NOT_FOUND, m); }
}
