package com.troday.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.troday.api.dto.ApiResponseDto;
import com.troday.api.entity.*;
import com.troday.api.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.math.*; import java.time.*; import java.util.*;

@Service
public class BillingService {
 @org.springframework.beans.factory.annotation.Autowired private DomainSupport domain;
 @org.springframework.beans.factory.annotation.Autowired private PlatformTransactionManager transactions;
 private final AccountService accounts; private final RentalServiceCatalogRepository catalogs; private final HouseServiceConfigRepository houseServices; private final RoomServiceSettingRepository roomServices; private final InvoiceRepository invoices; private final InvoiceItemRepository items; private final RentalHouseRepository houses; private final RoomRepository rooms; private final ContractRepository contracts; private final RoomTenantRepository roomTenants;
 public BillingService(AccountService a,RentalServiceCatalogRepository c,HouseServiceConfigRepository h,RoomServiceSettingRepository r,InvoiceRepository i,InvoiceItemRepository it,RentalHouseRepository houses,RoomRepository rooms,ContractRepository contracts,RoomTenantRepository roomTenants){accounts=a;catalogs=c;houseServices=h;roomServices=r;invoices=i;items=it;this.houses=houses;this.rooms=rooms;this.contracts=contracts;this.roomTenants=roomTenants;}
 public ApiResponseDto<?> catalog(HttpServletRequest r){accounts.authenticatedUserId(r);return ok("GET",catalogs.findAll().stream().map(this::catalogData).toList());}
 @Transactional public ApiResponseDto<?> createCatalog(HttpServletRequest r,JsonNode b){accounts.requireAdminId(r);require(b);String name=text(b,"name");if(name.isBlank()||catalogs.findByNameIgnoreCase(name).isPresent())throw conflict("Tên dịch vụ đã tồn tại");RentalServiceCatalog x=new RentalServiceCatalog();x.setName(name);x.setUnit(text(b,"unit"));x.setDefaultCalculationMethod(method(b,"defaultCalculationMethod"));return ok("POST",catalogData(catalogs.save(x)));}
 @Transactional public ApiResponseDto<?> updateCatalog(HttpServletRequest r,Long id,JsonNode b){accounts.requireAdminId(r);RentalServiceCatalog x=catalog(id);require(b);if(b.has("name")){String n=text(b,"name");catalogs.findByNameIgnoreCase(n).filter(y->!y.getId().equals(id)).ifPresent(y->{throw conflict("Tên dịch vụ đã tồn tại");});x.setName(n);}if(b.has("unit"))x.setUnit(text(b,"unit"));if(b.has("defaultCalculationMethod"))x.setDefaultCalculationMethod(method(b,"defaultCalculationMethod"));return ok("PATCH",catalogData(catalogs.save(x)));}
 public ApiResponseDto<?> houseList(HttpServletRequest r,Long hid){ownedHouse(r,hid);return ok("GET",houseServices.findByHouseId(hid).stream().map(this::houseServiceData).toList());}
 @Transactional public ApiResponseDto<?> houseCreate(HttpServletRequest r,Long hid,JsonNode b){ownedHouse(r,hid);require(b);HouseServiceConfig x=new HouseServiceConfig();x.setHouseId(hid);Long cid=longValue(b,"serviceId",null);if(cid!=null){RentalServiceCatalog c=catalog(cid);x.setCatalogServiceId(cid);x.setName(c.getName());x.setUnit(c.getUnit());x.setDefaultCalculationMethod(c.getDefaultCalculationMethod());}else{x.setName(text(b,"name"));x.setUnit(text(b,"unit"));x.setDefaultCalculationMethod(method(b,"calculationMethod"));}x.setDefaultUnitPrice(money(b,"unitPrice",BigDecimal.ZERO));x.setActive(b.has("active")?b.get("active").asBoolean():true);return ok("POST",houseServiceData(houseServices.save(x)));}
 @Transactional public ApiResponseDto<?> houseUpdate(HttpServletRequest r,Long hid,Long id,JsonNode b){ownedHouse(r,hid);HouseServiceConfig x=houseService(hid,id);require(b);if(b.has("name"))x.setName(text(b,"name"));if(b.has("unit"))x.setUnit(text(b,"unit"));if(b.has("unitPrice"))x.setDefaultUnitPrice(money(b,"unitPrice",null));if(b.has("calculationMethod"))x.setDefaultCalculationMethod(method(b,"calculationMethod"));if(b.has("active"))x.setActive(b.get("active").asBoolean());return ok("PATCH",houseServiceData(houseServices.save(x)));}
 @Transactional public ApiResponseDto<?> roomSet(HttpServletRequest r,Long rid,Long hsid,JsonNode b){Room room=ownedRoom(r,rid);HouseServiceConfig hs=houseServices.findById(hsid).orElseThrow(()->notFound("Không tìm thấy dịch vụ nhà"));if(!hs.getHouseId().equals(room.getHouseId()))throw bad("Dịch vụ không thuộc nhà của phòng");require(b);RoomServiceSetting x=roomServices.findByRoomIdAndHouseServiceId(rid,hsid).orElseGet(RoomServiceSetting::new);x.setRoomId(rid);x.setHouseId(room.getHouseId());x.setHouseServiceId(hsid);if(b.has("unitPriceOverride"))x.setUnitPriceOverride(b.get("unitPriceOverride").isNull()?null:money(b,"unitPriceOverride",null));if(b.has("calculationMethodOverride"))x.setCalculationMethodOverride(b.get("calculationMethodOverride").isNull()?null:method(b,"calculationMethodOverride"));if(b.has("active"))x.setActive(b.get("active").asBoolean());return ok("PUT",roomServiceData(roomServices.saveAndFlush(x),hs));}
 public ApiResponseDto<?> roomList(HttpServletRequest r,Long rid){Room room=ownedRoom(r,rid);return ok("GET",roomServices.findByRoomId(rid).stream().map(x->roomServiceData(x,houseService(room.getHouseId(),x.getHouseServiceId()))).toList());}
 public ApiResponseDto<?> invoiceList(HttpServletRequest r,Long contractId, String period,String status){
Long me=accounts.authenticatedUserId(r);return ok("GET",domain.page(r,"FROM invoices i JOIN contracts c ON c.id=i.contract_id WHERE (c.landlord_id=? OR c.viewing_tenant_id=? OR EXISTS(SELECT 1 FROM room_tenants m WHERE m.id=i.payer_room_tenant_id AND m.tenant_id=?))","i.id","CONCAT_WS(' ',c.contract_number,i.id,i.billing_period)","i.id DESC",List.of(me,me,me),Map.of("status","CASE WHEN i.status='UNPAID' AND i.due_date<DATE(UTC_TIMESTAMP()+INTERVAL 7 HOUR) THEN 'OVERDUE' ELSE i.status END","contractId","i.contract_id","roomId","i.room_id","period","i.billing_period"),id->invoiceData(invoices.findById(id).orElseThrow())));
 }
 public ApiResponseDto<?> invoiceDetail(HttpServletRequest r,Long id){Invoice x=invoice(id);canViewOrThrow(x,accounts.authenticatedUserId(r));return ok("GET",invoiceData(x));}
 public ApiResponseDto<?> invoicePreview(HttpServletRequest r, Long contractId, String billingPeriod) {
     Contract contract = ownedContract(accounts.authenticatedUserId(r), contractId);
     InvoicePreview preview = preview(contract, billingPeriod(billingPeriod));
     return ok("GET", Map.of(
         "contractId", preview.contractId(), "roomId", preview.roomId(), "billingPeriod", preview.billingPeriod(),
         "rentAmount", preview.rentAmount(), "occupantCountAtBilling", preview.payers().size(),
         "defaultPayerId", preview.defaultPayerId(), "payers", preview.payers(),
         "services", preview.services(), "previewVersion", previewVersion(preview)));
 }

 private record InvoicePayer(Long id, String name) {}
 private record InvoiceService(Long roomServiceId, String name, String unit, String calculationMethod,
                               BigDecimal unitPrice, BigDecimal previousReading, LocalDate previousBillingPeriod,
                               Long previousItemId) {}
 private record InvoicePreview(Long contractId, Long roomId, Long revisionId, LocalDate billingPeriod,
                               BigDecimal rentAmount, Long defaultPayerId, List<InvoicePayer> payers, List<InvoiceService> services) {}
 private record BillableRoom(Long contractId, Long roomId, String roomCode, String contractNumber,
                             Long invoiceId, String invoiceStatus) {}

 private InvoicePreview preview(Contract contract, LocalDate period) {
     if (!"ACTIVE".equals(contract.getStatus())) throw conflict("Cần có hợp đồng đang hiệu lực");
     List<InvoicePayer> payers = domain.jdbc.query("""
         SELECT id, full_name FROM room_tenants WHERE contract_id=? AND status='ACTIVE' ORDER BY id
         """, (row, ignored) -> new InvoicePayer(row.getLong("id"), row.getString("full_name")), contract.getId());
     List<InvoiceService> services = domain.jdbc.query("""
         SELECT rs.id, hs.name, hs.unit,
                COALESCE(rs.calculation_method_override, hs.default_calculation_method) AS calculation_method,
                COALESCE(rs.unit_price_override, hs.default_unit_price) AS unit_price,
                previous_item.id AS previous_item_id, previous_item.current_reading
         FROM room_services rs
         JOIN house_services hs ON hs.id=rs.house_service_id
         LEFT JOIN invoices previous_invoice
           ON previous_invoice.contract_id=? AND previous_invoice.room_id=rs.room_id
           AND previous_invoice.billing_period=? AND previous_invoice.status IN ('UNPAID','OVERDUE','PAID')
         LEFT JOIN invoice_items previous_item
           ON previous_item.invoice_id=previous_invoice.id AND previous_item.room_service_id=rs.id
           AND previous_item.calculation_method_snapshot='METERED'
           AND COALESCE(rs.calculation_method_override, hs.default_calculation_method)='METERED'
         WHERE rs.room_id=? AND rs.is_active=TRUE AND hs.is_active=TRUE
         ORDER BY rs.id
         """, (row, ignored) -> {
         BigDecimal previous = row.getBigDecimal("current_reading");
         return new InvoiceService(row.getLong("id"), row.getString("name"), row.getString("unit"),
             row.getString("calculation_method"), row.getBigDecimal("unit_price"), previous,
             previous == null ? null : period.minusMonths(1), row.getObject("previous_item_id", Long.class));
     }, contract.getId(), period.minusMonths(1), contract.getRoomId());
     return new InvoicePreview(contract.getId(), contract.getRoomId(), contract.getCurrentRevisionId(), period,
         revisionRent(contract.getCurrentRevisionId()), contract.getRepresentativeRoomTenantId(), payers, services);
 }

 private LocalDate billingPeriod(String value) {
     LocalDate period;
     try { period = LocalDate.parse(value); }
     catch (DateTimeException e) { throw bad("Kỳ thu không hợp lệ"); }
     if (period.getDayOfMonth() != 1) throw bad("Kỳ thu phải là ngày đầu tháng");
     return period;
 }

 private String previewVersion(InvoicePreview preview) {
     try {
         return HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
             .digest(domain.json(preview).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
     } catch (java.security.NoSuchAlgorithmException e) {
         throw new IllegalStateException(e);
     }
 }

 @Transactional public ApiResponseDto<?> createInvoice(HttpServletRequest r, JsonNode body) {
     require(body);
     Long owner = accounts.authenticatedUserId(r);
     Long contractId = requiredLong(body, "contractId");
     Contract contract = ownedContract(owner, contractId);
     LocalDate period = billingPeriod(text(body, "billingPeriod"));
     requireAvailablePeriod(contractId, period);
     InvoicePreview preview = null;
     if (body.has("previewVersion")) {
         preview = reviewedPreview(contract, period, text(body, "previewVersion"));
         checkPreviewItems(body.path("items"), preview);
     }
     Long payer = body.hasNonNull("payerRoomTenantId")
         ? requiredLong(body, "payerRoomTenantId") : contract.getRepresentativeRoomTenantId();
     return ok("POST", createDraft(owner, contract, period, date(body, "dueDate"), payer, body, preview));
 }

 public ApiResponseDto<?> invoiceBatchPreview(HttpServletRequest r, Long houseId, String billingPeriod) {
     Long owner = accounts.authenticatedUserId(r);
     ownedHouse(r, houseId);
     LocalDate period = billingPeriod(billingPeriod);
     List<BillableRoom> candidates = domain.jdbc.query("""
         SELECT c.id AS contract_id, r.id AS room_id, r.room_number, c.contract_number,
                i.id AS invoice_id,
                CASE WHEN i.status='UNPAID' AND i.due_date<DATE(UTC_TIMESTAMP()+INTERVAL 7 HOUR)
                     THEN 'OVERDUE' ELSE i.status END AS invoice_status
         FROM contracts c JOIN rooms r ON r.id=c.room_id
         LEFT JOIN invoices i ON i.contract_id=c.id AND i.billing_period=? AND i.status<>'CANCELLED'
         WHERE c.house_id=? AND c.landlord_id=? AND c.status='ACTIVE'
           AND EXISTS (
             SELECT 1 FROM room_services rs JOIN house_services hs ON hs.id=rs.house_service_id
             WHERE rs.room_id=r.id AND rs.is_active=TRUE AND hs.is_active=TRUE
               AND COALESCE(rs.calculation_method_override, hs.default_calculation_method)='METERED'
           )
         ORDER BY r.room_number, c.id
         """, (row, ignored) -> new BillableRoom(row.getLong("contract_id"), row.getLong("room_id"),
             row.getString("room_number"), row.getString("contract_number"), row.getObject("invoice_id", Long.class),
             row.getString("invoice_status")),
         period, houseId, owner);
     List<Map<String, Object>> result = new ArrayList<>();
     for (BillableRoom room : candidates) {
         Map<String, Object> entry = new LinkedHashMap<>();
         entry.put("contractId", room.contractId());
         entry.put("roomId", room.roomId());
         entry.put("roomCode", room.roomCode());
         entry.put("contractNumber", room.contractNumber());
         if (room.invoiceId() != null) {
             entry.put("invoiceId", room.invoiceId());
             entry.put("invoiceStatus", room.invoiceStatus());
             entry.put("blockedReason", "Đã có hóa đơn trong kỳ");
         } else {
             try {
                 InvoicePreview quote = preview(houseContract(owner, houseId, room.contractId()), period);
                 List<InvoiceService> meters = quote.services().stream().filter(this::metered).toList();
                 if (meters.isEmpty()) continue;
                 entry.put("services", meters);
                 entry.put("baseTotal", quote.services().stream().filter(service -> !metered(service))
                     .map(service -> service.unitPrice().multiply(
                         BigDecimal.valueOf("PER_PERSON".equals(service.calculationMethod()) ? quote.payers().size() : 1)))
                     .reduce(quote.rentAmount(), BigDecimal::add));
                 entry.put("previewVersion", previewVersion(quote));
             } catch (ResponseStatusException e) {
                 entry.put("blockedReason", e.getReason());
             }
         }
         result.add(entry);
     }
     return ok("GET", Map.of("houseId", houseId, "billingPeriod", period, "rooms", result));
 }

 public ApiResponseDto<?> createInvoiceBatch(HttpServletRequest r, Long houseId, JsonNode body) {
     require(body);
     Long owner = accounts.authenticatedUserId(r);
     ownedHouse(r, houseId);
     LocalDate period = billingPeriod(text(body, "billingPeriod"));
     LocalDate dueDate = date(body, "dueDate");
     JsonNode submissions = body.path("rooms");
     if (!submissions.isArray() || submissions.isEmpty()) throw bad("Cần chọn phòng đã nhập đủ chỉ số");
     Map<Long, JsonNode> byContract = new LinkedHashMap<>();
     for (JsonNode submission : submissions) {
         Long contractId = requiredLong(submission, "contractId");
         if (byContract.putIfAbsent(contractId, submission) != null) throw bad("Hợp đồng bị lặp trong đợt lập hóa đơn");
     }
     TransactionTemplate perRoom = new TransactionTemplate(transactions);
     List<Map<String, Object>> created = new ArrayList<>();
     List<Map<String, Object>> skipped = new ArrayList<>();
     for (var entry : byContract.entrySet()) {
         Long contractId = entry.getKey();
         try {
             created.add(perRoom.execute(status -> createBatchDraft(owner, houseId, contractId, period, dueDate, entry.getValue())));
         } catch (ResponseStatusException e) {
             skipped.add(Map.of("contractId", contractId, "reason", e.getReason()));
         } catch (DataIntegrityViolationException e) {
             skipped.add(Map.of("contractId", contractId, "reason", "Dữ liệu phòng đã thay đổi hoặc đã có hóa đơn trong kỳ. Hãy tải lại danh sách."));
         }
     }
     return ok("POST", Map.of("created", created, "skipped", skipped));
 }

 private Map<String, Object> createBatchDraft(Long owner, Long houseId, Long contractId, LocalDate period,
                                               LocalDate dueDate, JsonNode submission) {
     Contract contract = houseContract(owner, houseId, contractId);
     requireAvailablePeriod(contractId, period);
     InvoicePreview quote = reviewedPreview(contract, period, text(submission, "previewVersion"));
     var draft = JsonNodeFactory.instance.objectNode();
     var lines = draft.putArray("items");
     lines.addObject().put("type", "RENT");
     JsonNode readings = submission.path("readings");
     if (!readings.isArray() || readings.isEmpty()) throw bad("Cần nhập chỉ số cho phòng");
     Map<Long, JsonNode> byService = new HashMap<>();
     for (JsonNode reading : readings) {
         Long serviceId = requiredLong(reading, "roomServiceId");
         if (byService.putIfAbsent(serviceId, reading) != null) throw bad("Dịch vụ bị lặp trong phòng");
     }
     for (InvoiceService service : quote.services()) {
         var line = lines.addObject().put("type", "SERVICE").put("roomServiceId", service.roomServiceId());
         if (metered(service)) {
             JsonNode reading = byService.remove(service.roomServiceId());
             if (reading == null) throw bad("Chưa nhập chỉ số cho " + service.name());
             line.set("currentReading", reading.path("currentReading"));
             if (reading.has("previousReading")) line.set("previousReading", reading.get("previousReading"));
         }
     }
     if (!byService.isEmpty()) throw bad("Chỉ số phải thuộc dịch vụ theo đồng hồ của phòng");
     Room room = rooms.findById(contract.getRoomId()).orElseThrow(() -> notFound("Không tìm thấy phòng"));
     Map<String, Object> invoice = createDraft(owner, contract, period, dueDate, quote.defaultPayerId(), draft, quote);
     return Map.of("contractId", contractId, "roomCode", room.getRoomNumber(), "invoice", invoice);
 }

 private Contract houseContract(Long owner, Long houseId, Long contractId) {
     Contract contract = ownedContract(owner, contractId);
     if (!houseId.equals(contract.getHouseId())) throw forbidden("Phòng không thuộc nhà trọ đã chọn");
     return contract;
 }

 private boolean metered(InvoiceService service) {
     return "METERED".equals(service.calculationMethod());
 }

 private void requireAvailablePeriod(Long contractId, LocalDate period) {
     if (invoices.findByContractIdAndBillingPeriodAndStatusNot(contractId, period, "CANCELLED").isPresent()) {
         throw conflict("Đã tồn tại hóa đơn trong kỳ");
     }
 }

 private InvoicePreview reviewedPreview(Contract contract, LocalDate period, String version) {
     InvoicePreview quote = preview(contract, period);
     if (!previewVersion(quote).equals(version)) {
         throw conflict("Đơn giá, số người hoặc chỉ số kỳ trước đã thay đổi. Hãy tải lại các khoản thu và kiểm tra trước khi lưu.");
     }
     return quote;
 }

 private Map<String, Object> createDraft(Long owner, Contract contract, LocalDate period, LocalDate dueDate,
                                          Long payer, JsonNode body, InvoicePreview preview) {
     Long contractId = contract.getId();
     boolean fromPreview = preview != null;
     RoomTenant member = roomTenants.findById(payer == null ? -1L : payer)
         .filter(m -> contractId.equals(m.getContractId()) && Set.of("ACTIVE", "PLANNED").contains(m.getStatus()))
         .filter(m -> !fromPreview || "ACTIVE".equals(m.getStatus()))
         .orElseThrow(() -> bad("Người trả không thuộc hợp đồng"));
     Invoice invoice = new Invoice();
     invoice.setContractId(contractId);
     invoice.setRoomId(contract.getRoomId());
     invoice.setContractRevisionId(contract.getCurrentRevisionId());
     invoice.setPayerRoomTenantId(member.getId());
     invoice.setPayerSnapshot(domain.json(Map.of("roomTenantId", member.getId(), "fullName", member.getFullName(),
         "tenantId", Objects.toString(member.getTenantId(), ""))));
     invoice.setBillingPeriod(period);
     invoice.setDueDate(dueDate);
     invoice.setCreatedById(owner);
     invoice.setOccupantCountAtBilling(preview == null ? occupantCount(contractId) : preview.payers().size());
     invoice = invoices.save(invoice);
     replaceItems(invoice, body, preview);
     return invoiceData(invoice);
 }

 private void checkPreviewItems(JsonNode lines, InvoicePreview preview) {
     Set<Long> serviceIds = new HashSet<>();
     int rentCount = 0;
     for (JsonNode line : lines) {
         switch (text(line, "type")) {
             case "RENT" -> rentCount++;
             case "SERVICE" -> {
                 if (!serviceIds.add(requiredLong(line, "roomServiceId"))) throw bad("Dịch vụ đã có trong hóa đơn");
             }
         }
     }
     if (rentCount != 1 || serviceIds.size() != preview.services().size()
             || preview.services().stream().anyMatch(service -> !serviceIds.contains(service.roomServiceId()))) {
         throw bad("Cần có tiền phòng và đủ các dịch vụ đang áp dụng cho phòng");
     }
 }
 @Transactional public ApiResponseDto<?> updateInvoice(HttpServletRequest r,Long id,JsonNode b){Invoice x=invoice(id);ownedContract(accounts.authenticatedUserId(r),x.getContractId());if(!"DRAFT".equals(x.getStatus()))throw conflict("Chỉ hóa đơn DRAFT mới được sửa");require(b);if(b.has("dueDate"))x.setDueDate(date(b,"dueDate"));x=invoices.save(x);if(b.has("items"))replaceItems(x,b);return ok("PATCH",invoiceData(x));}
 @Transactional public ApiResponseDto<?> issue(HttpServletRequest r,Long id){Invoice x=invoice(id);ownedContract(accounts.authenticatedUserId(r),x.getContractId());if(!"DRAFT".equals(x.getStatus()))throw conflict("Trạng thái hóa đơn không hợp lệ");if(items.findByInvoiceIdOrderByPosition(id).isEmpty())throw bad("Hóa đơn phải có dòng tiền");x.setStatus("UNPAID");return ok("POST",invoiceData(invoices.save(x)));}
 @Transactional public ApiResponseDto<?> pay(HttpServletRequest r,Long id){Long owner=accounts.authenticatedUserId(r);Invoice x=invoice(id);ownedContract(owner,x.getContractId());if(!"UNPAID".equals(x.getStatus())&&!"OVERDUE".equals(x.getStatus()))throw conflict("Hóa đơn chưa thể ghi nhận thanh toán");x.setStatus("PAID");x.setPaidById(owner);x.setPaidAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));return ok("POST",invoiceData(invoices.save(x)));}
 @Transactional public ApiResponseDto<?> cancel(HttpServletRequest r,Long id,JsonNode b){Long owner=accounts.authenticatedUserId(r);Invoice x=invoice(id);ownedContract(owner,x.getContractId());if(!Set.of("UNPAID","OVERDUE").contains(x.getStatus()))throw conflict("Chỉ hóa đơn chưa thu mới được hủy");String reason=text(b,"reason");if(reason.isBlank())throw bad("reason là bắt buộc");x.setStatus("CANCELLED");x.setCancelledById(owner);x.setCancelledAt(LocalDateTime.now(java.time.ZoneOffset.UTC).truncatedTo(java.time.temporal.ChronoUnit.MICROS));x.setCancellationReason(reason);return ok("POST",invoiceData(invoices.save(x)));}
 @Transactional public ApiResponseDto<?> replacement(HttpServletRequest r,Long id,JsonNode b){Long owner=accounts.authenticatedUserId(r);Invoice old=invoice(id);ownedContract(owner,old.getContractId());if(!"CANCELLED".equals(old.getStatus()))throw conflict("Chỉ hóa đơn đã hủy mới được thay thế");Invoice x=new Invoice();x.setContractId(old.getContractId());x.setRoomId(old.getRoomId());x.setContractRevisionId(old.getContractRevisionId());x.setPayerRoomTenantId(old.getPayerRoomTenantId());x.setBillingPeriod(old.getBillingPeriod());x.setDueDate(b!=null&&b.has("dueDate")?date(b,"dueDate"):old.getDueDate());x.setCreatedById(owner);x.setReplacementOfId(old.getId());x.setOccupantCountAtBilling(old.getOccupantCountAtBilling());x.setPayerSnapshot(old.getPayerSnapshot());x=invoices.save(x);replaceItems(x,b);return ok("POST",invoiceData(x));}
 private void replaceItems(Invoice invoice, JsonNode body) {
     replaceItems(invoice, body, null);
 }

 private void replaceItems(Invoice invoice, JsonNode body, InvoicePreview preview) {
     if (body == null || !body.path("items").isArray()) throw bad("items phải là danh sách");
     items.deleteByInvoiceId(invoice.getId());
     items.flush();
     Map<Long, InvoiceService> reviewedServices = new HashMap<>();
     if (preview != null) preview.services().forEach(service -> reviewedServices.put(service.roomServiceId(), service));
     int position = 0;
     for (JsonNode line : body.path("items")) {
         InvoiceItem item = new InvoiceItem();
         item.setInvoiceId(invoice.getId());
         item.setRoomId(invoice.getRoomId());
         item.setPosition(position++);
         item.setItemType(text(line, "type", "OTHER"));
         switch (item.getItemType()) {
             case "RENT" -> {
                 item.setNameSnapshot("Tiền phòng");
                 item.setUnitSnapshot("tháng");
                 item.setQuantity(BigDecimal.ONE);
                 item.setUnitPriceSnapshot(preview == null ? revisionRent(invoice.getContractRevisionId()) : preview.rentAmount());
             }
             case "SERVICE" -> {
                 Long serviceId = requiredLong(line, "roomServiceId");
                 InvoiceService service = preview == null
                     ? activeInvoiceService(invoice.getRoomId(), serviceId) : reviewedServices.get(serviceId);
                 applyServiceLine(item, line, service, invoice.getOccupantCountAtBilling());
             }
             default -> {
                 item.setNameSnapshot(text(line, "name", item.getItemType()));
                 item.setUnitSnapshot(text(line, "unit", "unit"));
                 item.setQuantity(decimal(line, "quantity", BigDecimal.ONE));
                 item.setUnitPriceSnapshot(money(line, "unitPrice", BigDecimal.ZERO));
             }
         }
         if (item.getQuantity().signum() < 0 || item.getQuantity().scale() > 3) throw bad("Số lượng hoặc chỉ số không hợp lệ");
         item.setAmount(item.getQuantity().multiply(item.getUnitPriceSnapshot()).setScale(2, RoundingMode.HALF_UP));
         items.save(item);
     }
 }

 private BigDecimal revisionRent(Long revisionId) {
     return domain.jdbc.queryForObject("SELECT rent_amount FROM contract_revisions WHERE id=?", BigDecimal.class, revisionId);
 }

 private InvoiceService activeInvoiceService(Long roomId, Long serviceId) {
     RoomServiceSetting setting = roomServices.findById(serviceId)
         .filter(r -> roomId.equals(r.getRoomId()) && Boolean.TRUE.equals(r.getActive()))
         .orElseThrow(() -> bad("Dịch vụ không được bật tại phòng"));
     HouseServiceConfig service = houseServices.findById(setting.getHouseServiceId())
         .filter(s -> Boolean.TRUE.equals(s.getActive()))
         .orElseThrow(() -> bad("Dịch vụ đã ngừng sử dụng"));
     return new InvoiceService(setting.getId(), service.getName(), service.getUnit(),
         Objects.requireNonNullElse(setting.getCalculationMethodOverride(), service.getDefaultCalculationMethod()),
         Objects.requireNonNullElse(setting.getUnitPriceOverride(), service.getDefaultUnitPrice()), null, null, null);
 }

 private void applyServiceLine(InvoiceItem item, JsonNode line, InvoiceService service, int occupants) {
     item.setRoomServiceId(service.roomServiceId());
     item.setNameSnapshot(service.name());
     item.setUnitSnapshot(service.unit());
     item.setUnitPriceSnapshot(service.unitPrice());
     item.setCalculationMethodSnapshot(service.calculationMethod());
     switch (service.calculationMethod()) {
         case "METERED" -> {
             BigDecimal previous = service.previousReading() == null
                 ? meterReading(line, "previousReading", "chỉ số đầu") : service.previousReading();
             BigDecimal current = meterReading(line, "currentReading", "chỉ số cuối");
             if (current.compareTo(previous) < 0) throw bad("Chỉ số cuối của " + service.name() + " nhỏ hơn chỉ số đầu");
             item.setPreviousReading(previous);
             item.setCurrentReading(current);
             item.setQuantity(current.subtract(previous));
         }
         case "PER_PERSON" -> item.setQuantity(BigDecimal.valueOf(occupants));
         default -> item.setQuantity(BigDecimal.ONE);
     }
 }

 private BigDecimal meterReading(JsonNode line, String key, String label) {
     BigDecimal value = decimal(line, key, null);
     if (value == null) throw bad("Cần nhập " + label);
     if (value.signum() < 0 || value.stripTrailingZeros().scale() > 3
             || value.compareTo(new BigDecimal("999999999.999")) > 0) {
         throw bad(label + " không hợp lệ");
     }
     return value.setScale(3, RoundingMode.UNNECESSARY);
 }
 private Map<String,Object> invoiceData(Invoice x){
List<InvoiceItem> list=items.findByInvoiceIdOrderByPosition(x.getId());BigDecimal total=list.stream().map(i->"DISCOUNT".equals(i.getItemType())?i.getAmount().negate():i.getAmount()).reduce(BigDecimal.ZERO,BigDecimal::add);Map<String,Object> out=new LinkedHashMap<>();out.put("id",x.getId());out.put("contractId",x.getContractId());out.put("roomId",x.getRoomId());out.put("period",x.getBillingPeriod());out.put("billingPeriod",x.getBillingPeriod());out.put("dueDate",x.getDueDate());out.put("status","UNPAID".equals(x.getStatus())&&x.getDueDate().isBefore(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")))?"OVERDUE":x.getStatus());out.put("payerId",x.getPayerRoomTenantId());out.put("payerRoomTenantId",x.getPayerRoomTenantId());out.put("payerSnapshot",x.getPayerSnapshot());out.put("contractRevisionId",x.getContractRevisionId());out.put("occupantCountAtBilling",x.getOccupantCountAtBilling());out.put("replacementOfId",x.getReplacementOfId());out.put("total",total);out.put("items",list.stream().map(this::itemData).toList());return out;
 }
 private Map<String,Object> itemData(InvoiceItem x){Map<String,Object> m=new LinkedHashMap<>();m.put("id",x.getId());m.put("type",x.getItemType());m.put("name",x.getNameSnapshot());m.put("quantity",x.getQuantity());m.put("unitPrice",x.getUnitPriceSnapshot());m.put("amount",x.getAmount());m.put("roomServiceId",x.getRoomServiceId());m.put("unit",x.getUnitSnapshot());m.put("calculationMethod",x.getCalculationMethodSnapshot());m.put("previousReading",x.getPreviousReading());m.put("currentReading",x.getCurrentReading());return m;}
 private Map<String,Object> catalogData(RentalServiceCatalog x){return Map.of("id",x.getId(),"name",x.getName(),"unit",x.getUnit(),"defaultCalculationMethod",x.getDefaultCalculationMethod());}
 private Map<String,Object> houseServiceData(HouseServiceConfig x){return Map.of("id",x.getId(),"houseId",x.getHouseId(),"serviceId",Objects.toString(x.getCatalogServiceId(),""),"name",x.getName(),"unit",x.getUnit(),"unitPrice",x.getDefaultUnitPrice(),"calculationMethod",x.getDefaultCalculationMethod(),"active",x.getActive());}
 private Map<String,Object> roomServiceData(RoomServiceSetting x,HouseServiceConfig h){return Map.of("id",x.getId(),"roomId",x.getRoomId(),"houseServiceId",x.getHouseServiceId(),"active",x.getActive(),"effectiveUnitPrice",x.getUnitPriceOverride()!=null?x.getUnitPriceOverride():h.getDefaultUnitPrice(),"unitPriceOverride",Objects.toString(x.getUnitPriceOverride(),""),"calculationMethod",x.getCalculationMethodOverride()!=null?x.getCalculationMethodOverride():h.getDefaultCalculationMethod());}
 private RentalServiceCatalog catalog(Long id){return catalogs.findById(id).orElseThrow(()->notFound("Không tìm thấy danh mục dịch vụ"));} private HouseServiceConfig houseService(Long hid,Long id){return houseServices.findByIdAndHouseId(id,hid).orElseThrow(()->notFound("Không tìm thấy dịch vụ nhà"));} private Invoice invoice(Long id){return invoices.findById(id).orElseThrow(()->notFound("Không tìm thấy hóa đơn"));}
 private RentalHouse ownedHouse(HttpServletRequest r,Long id){RentalHouse h=houses.findById(id).orElseThrow(()->notFound("Không tìm thấy nhà"));if(!Objects.equals(h.getLandlordId(),accounts.authenticatedUserId(r)))throw forbidden("Bạn không sở hữu nhà này");return h;} private Room ownedRoom(HttpServletRequest r,Long id){Room x=rooms.findById(id).orElseThrow(()->notFound("Không tìm thấy phòng"));ownedHouse(r,x.getHouseId());return x;} private Contract ownedContract(Long owner,Long id){Contract c=contracts.findById(id).orElseThrow(()->notFound("Không tìm thấy hợp đồng"));if(!Objects.equals(c.getLandlordId(),owner))throw forbidden("Bạn không sở hữu hợp đồng");return c;} private boolean canView(Invoice x,Long me){Contract c=contracts.findById(x.getContractId()).orElse(null);return c!=null&&(Objects.equals(c.getLandlordId(),me)||Objects.equals(c.getViewingTenantId(),me)||roomTenants.findAll().stream().anyMatch(t->Objects.equals(t.getId(),x.getPayerRoomTenantId())&&Objects.equals(t.getTenantId(),me)));} private void canViewOrThrow(Invoice x,Long me){if(!canView(x,me))throw forbidden("Không có quyền xem hóa đơn");} private int occupantCount(Long cid){return (int)roomTenants.findAll().stream().filter(x->Objects.equals(x.getContractId(),cid)&&"ACTIVE".equals(x.getStatus())).count();}
 private ApiResponseDto<?> ok(String method,Object data){return ApiResponseDto.ok("/api/v1",method,data);} private void require(JsonNode b){if(b==null||!b.isObject())throw bad("JSON request là bắt buộc");} private String text(JsonNode b,String k){return text(b,k,"");} private String text(JsonNode b,String k,String f){return b!=null&&b.hasNonNull(k)?b.get(k).asText():f;} private Long requiredLong(JsonNode b,String k){return longValue(b,k,null)!=null?longValue(b,k,null):throwBad(k+" là bắt buộc");} private Long longValue(JsonNode b,String k,Long f){
try{if(b==null||!b.hasNonNull(k))return f;return Long.valueOf(b.get(k).asText());}catch(Exception e){throw bad(k+" không hợp lệ");}
 } private BigDecimal decimal(JsonNode b,String k,BigDecimal f){try{return b!=null&&b.hasNonNull(k)?new BigDecimal(b.get(k).asText()):f;}catch(Exception e){throw bad(k+" không hợp lệ");}} private BigDecimal money(JsonNode b,String k,BigDecimal f){BigDecimal x=decimal(b,k,f);if(x!=null&&x.signum()<0)throw bad(k+" không được âm");if(x!=null&&(x.scale()>2||x.precision()>15))throw bad(k+" vượt quá độ chính xác tiền tệ");return x;} private LocalDate date(JsonNode b,String k){try{return LocalDate.parse(text(b,k));}catch(Exception e){throw bad(k+" không hợp lệ");}} private String method(JsonNode b,String k){String x=text(b,k);if(!Set.of("METERED","PER_PERSON","PER_ROOM").contains(x))throw bad(k+" không hợp lệ");return x;} private <T>T throwBad(String m){throw bad(m);} private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,m);} private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);} private ResponseStatusException forbidden(String m){return new ResponseStatusException(HttpStatus.FORBIDDEN,m);} private ResponseStatusException notFound(String m){return new ResponseStatusException(HttpStatus.NOT_FOUND,m);}
}
