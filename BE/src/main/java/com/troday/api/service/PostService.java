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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {
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

    public ApiResponseDto<?> landlordPosts(HttpServletRequest r) { Long owner = accounts.authenticatedUserId(r); return ok("GET", posts.findByLandlordId(owner).stream().map(this::postData).toList()); }

    @Transactional public ApiResponseDto<?> create(HttpServletRequest r, JsonNode b) {
        Long owner = accounts.authenticatedUserId(r); requireBody(b); Room room = room(b); RentalHouse house = ownedHouse(owner, room.getHouseId());
        Post p = new Post(); p.setLandlordId(owner); p.setHouseId(house.getId()); p.setRoomId(room.getId()); apply(p, b);
        p.setPendingReviewSlot(nextPendingSlot(room.getId(), null)); p.setStatus("PENDING_REVIEW");
        p = posts.save(p); replaceAmenities(p, b); return ok("POST", postData(p));
    }

    @Transactional public ApiResponseDto<?> update(HttpServletRequest r, Long id, JsonNode b) {
        Long owner = accounts.authenticatedUserId(r); Post p = ownedPost(owner, id); requireBody(b);
        if (b.hasNonNull("contentVersion") && p.getContentVersion() != b.get("contentVersion").asLong()) throw conflict("Phiên bản tin đã thay đổi");
        if (b.hasNonNull("roomId")) { Room room = room(b); ownedHouse(owner, room.getHouseId()); p.setRoomId(room.getId()); p.setHouseId(room.getHouseId()); }
        apply(p, b); p.setPendingReviewSlot(nextPendingSlot(p.getRoomId(), p.getId())); p.setStatus("PENDING_REVIEW");
        p.setContentVersion(Optional.ofNullable(p.getContentVersion()).orElse(1L) + 1); p = posts.save(p); replaceAmenities(p, b); return ok("PATCH", postData(p));
    }

    public ApiResponseDto<?> adminList(HttpServletRequest r) { accounts.requireAdminId(r); return ok("GET", posts.findByStatus("PENDING_REVIEW").stream().map(this::postData).toList()); }

    @Transactional public ApiResponseDto<?> decision(HttpServletRequest r, Long id, JsonNode b) {
        accounts.requireAdminId(r); Post p = findPost(id); if (!"PENDING_REVIEW".equals(p.getStatus())) throw conflict("Tin không ở trạng thái chờ duyệt");
        String d = text(b, "decision"); if (!Set.of("APPROVE", "REJECT").contains(d)) throw bad("decision phải là APPROVE hoặc REJECT");
        if ("APPROVE".equals(d) && !effectiveRight(p.getHouseId())) throw conflict("Quyền cho thuê nhà chưa hiệu lực");
        p.setStatus("APPROVE".equals(d) ? "APPROVED" : "REJECTED"); p.setPendingReviewSlot(null); return ok("POST", postData(posts.save(p)));
    }

    @Transactional public ApiResponseDto<?> hide(HttpServletRequest r, Long id, JsonNode b) {
        Long actor = accounts.authenticatedUserId(r); Post p = findPost(id); if (!p.getLandlordId().equals(actor) && !isAdmin(r)) throw forbidden("Không có quyền ẩn tin");
        if (!"APPROVED".equals(p.getStatus())) throw conflict("Chỉ được ẩn tin đang công khai"); p.setStatus("HIDDEN"); return ok("POST", postData(posts.save(p)));
    }

    @Transactional public ApiResponseDto<?> restore(HttpServletRequest r, Long id) {
        accounts.requireAdminId(r); Post p = findPost(id); if (!"HIDDEN".equals(p.getStatus())) throw conflict("Tin không ở trạng thái đã ẩn");
        if (!effectiveRight(p.getHouseId())) throw conflict("Quyền cho thuê nhà chưa hiệu lực"); p.setStatus("APPROVED"); return ok("POST", postData(posts.save(p)));
    }

    /** Public search for available rooms. */
    public ApiResponseDto<?> explore(HttpServletRequest r) {
        String q = r.getParameter("q"), province = r.getParameter("provinceCode"), sort = Optional.ofNullable(r.getParameter("sort")).orElse("newest");
        BigDecimal minArea = decimalParam(r, "minArea"), maxRent = decimalParam(r, "maxRent"), lat = decimalParam(r, "lat"), lng = decimalParam(r, "lng"), radius = decimalParam(r, "radiusKm");
        Set<String> amenities = csv(r.getParameter("amenities")); LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> result = posts.findByStatus("APPROVED").stream()
                .filter(p -> ("OPEN".equals(p.getAvailabilityStatus()) || p.getAvailabilityStatus() == null) && (p.getAvailabilityExpiresAt() == null || p.getAvailabilityExpiresAt().isAfter(now)))
                .filter(p -> matches(p, q, province, minArea, maxRent, lat, lng, radius, amenities)).map(this::postData).sorted(comparator(sort)).toList();
        return ok("GET", result);
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
        if (favorites.findByUserIdAndPostId(user, id).isEmpty()) { FavoritePost f = new FavoritePost(); f.setUserId(user); f.setPostId(id); f.setCreatedAt(LocalDateTime.now()); favorites.save(f); }
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
        Comparator<Map<String, Object>> newest = Comparator.comparing(m -> String.valueOf(m.get("id")), Comparator.reverseOrder());
        return switch (sort) { case "rentAsc" -> Comparator.comparing(m -> number(m.get("rentAmount"))); case "rentDesc" -> Comparator.comparing((Map<String, Object> m) -> number(m.get("rentAmount"))).reversed(); case "areaAsc" -> Comparator.comparing(m -> number(m.get("area"))); case "areaDesc" -> Comparator.comparing((Map<String, Object> m) -> number(m.get("area"))).reversed(); case "newest" -> newest; default -> throw bad("sort không hợp lệ"); };
    }

    private Map<String, Object> postData(Post p) {
        Map<String, Object> m = new LinkedHashMap<>(); m.put("id", p.getId()); m.put("landlordId", p.getLandlordId()); m.put("houseId", p.getHouseId()); m.put("roomId", p.getRoomId());
        m.put("title", Objects.toString(p.getTitle(), "")); m.put("content", Objects.toString(p.getContent(), "")); m.put("status", Objects.toString(p.getStatus(), ""));
        m.put("availabilityStatus", Objects.toString(p.getAvailabilityStatus(), "STALE")); m.put("contentVersion", Objects.toString(p.getContentVersion(), "1"));
        Room room = rooms.findById(p.getRoomId()).orElse(null); m.put("area", room == null ? "" : Objects.toString(room.getArea(), "")); m.put("rentAmount", room == null ? "" : Objects.toString(room.getRentPrice(), ""));
        RentalHouse house = houses.findById(p.getHouseId()).orElse(null); m.put("room", roomData(room)); m.put("house", houseData(house)); m.put("amenities", postAmenities.findByPostId(p.getId()).stream().map(PostAmenity::getAmenity).toList()); return m;
    }
    private Map<String, Object> roomData(Room r) { if (r == null) return null; return Map.of("id", r.getId(), "houseId", r.getHouseId(), "code", Objects.toString(r.getRoomNumber(), ""), "area", Objects.toString(r.getArea(), ""), "rentAmount", Objects.toString(r.getRentPrice(), ""), "depositAmount", Objects.toString(r.getDepositAmount(), ""), "capacity", Objects.toString(r.getMaxOccupants(), ""), "status", Objects.toString(r.getStatus(), "")); }
    private Map<String, Object> houseData(RentalHouse h) { if (h == null) return null; return Map.of("id", h.getId(), "name", Objects.toString(h.getName(), ""), "address", Objects.toString(h.getAddress(), ""), "provinceCode", Objects.toString(h.getProvinceCode(), ""), "localityCode", Objects.toString(h.getLocalityCode(), "")); }
    private boolean isPublic(Post p) { return "APPROVED".equals(p.getStatus()) && ("OPEN".equals(p.getAvailabilityStatus()) || p.getAvailabilityStatus() == null) && (p.getAvailabilityExpiresAt() == null || p.getAvailabilityExpiresAt().isAfter(LocalDateTime.now())); }
    private int nextPendingSlot(Long roomId, Long excluded) { Set<Integer> used = posts.findByRoomIdAndStatus(roomId, "PENDING_REVIEW").stream().filter(p -> !Objects.equals(p.getId(), excluded)).map(Post::getPendingReviewSlot).filter(Objects::nonNull).collect(Collectors.toSet()); return Arrays.stream(new int[]{1, 2, 3}).filter(i -> !used.contains(i)).findFirst().orElseThrow(() -> conflict("Phòng đã đạt giới hạn 3 tin chờ duyệt")); }
    private Room room(JsonNode b) { if (!b.hasNonNull("roomId")) throw bad("roomId là bắt buộc"); return rooms.findById(b.get("roomId").asLong()).orElseThrow(() -> notFound("Không tìm thấy phòng")); }
    private RentalHouse ownedHouse(Long owner, Long id) { RentalHouse h = houses.findById(id).orElseThrow(() -> notFound("Không tìm thấy nhà")); if (!h.getLandlordId().equals(owner)) throw forbidden("Bạn không sở hữu nhà này"); return h; }
    private Post ownedPost(Long owner, Long id) { Post p = findPost(id); if (!p.getLandlordId().equals(owner)) throw forbidden("Bạn không sở hữu tin này"); return p; }
    private Post findPost(Long id) { return posts.findById(id).orElseThrow(() -> notFound("Không tìm thấy tin đăng")); }
    private boolean effectiveRight(Long houseId) { return verifications.findByHouseIdAndStatus(houseId, "APPROVED").isPresent(); }
    private boolean isAdmin(HttpServletRequest r) { try { accounts.requireAdminId(r); return true; } catch (Exception e) { return false; } }
    private void apply(Post p, JsonNode b) { String title = text(b, "title"), content = text(b, "content"); if (title.isBlank() || content.isBlank()) throw bad("title và content là bắt buộc"); p.setTitle(title); p.setContent(content); p.setAvailabilityStatus("OPEN"); p.setAvailabilityConfirmedAt(LocalDateTime.now()); p.setAvailabilityExpiresAt(LocalDateTime.now().plusDays(7)); }
    private void replaceAmenities(Post p, JsonNode b) { if (!b.has("amenities") || !b.get("amenities").isArray()) return; postAmenities.deleteByPostId(p.getId()); for (JsonNode value : b.get("amenities")) { String amenity = value.asText().trim(); if (!amenity.isBlank()) { PostAmenity a = new PostAmenity(); a.setPostId(p.getId()); a.setAmenity(amenity); postAmenities.save(a); } } }
    private Set<String> csv(String value) { return value == null || value.isBlank() ? Set.of() : Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toSet()); }
    private BigDecimal decimalParam(HttpServletRequest r, String key) { String v = r.getParameter(key); if (v == null || v.isBlank()) return null; try { return new BigDecimal(v); } catch (NumberFormatException e) { throw bad(key + " không hợp lệ"); } }
    private double distanceKm(BigDecimal a, BigDecimal b, BigDecimal c, BigDecimal d) { double x = Math.toRadians(c.doubleValue() - a.doubleValue()), y = Math.toRadians(d.doubleValue() - b.doubleValue()), z = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(Math.toRadians(a.doubleValue())) * Math.cos(Math.toRadians(c.doubleValue())) * Math.sin(y / 2) * Math.sin(y / 2); return 6371 * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z)); }
    private double number(Object v) { try { return v == null || String.valueOf(v).isBlank() ? Double.MAX_VALUE : Double.parseDouble(String.valueOf(v)); } catch (NumberFormatException e) { return Double.MAX_VALUE; } }
    private ApiResponseDto<?> ok(String method, Object data) { return ApiResponseDto.ok("/api/v1", method, data); }
    private void requireBody(JsonNode b) { if (b == null || !b.isObject()) throw bad("JSON request là bắt buộc"); }
    private String text(JsonNode b, String k) { return b != null && b.hasNonNull(k) ? b.get(k).asText() : ""; }
    private ResponseStatusException bad(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
    private ResponseStatusException conflict(String m) { return new ResponseStatusException(HttpStatus.CONFLICT, m); }
    private ResponseStatusException forbidden(String m) { return new ResponseStatusException(HttpStatus.FORBIDDEN, m); }
    private ResponseStatusException notFound(String m) { return new ResponseStatusException(HttpStatus.NOT_FOUND, m); }
}
