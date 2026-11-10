import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import {
  validate,
  enumOptions,
  validDate,
} from "../src/features/forms/validation.ts";
import { MutationAttempt } from "../src/features/forms/attempt.ts";
import { money, dateVN } from "../src/utils/format.ts";
import type { FieldSpec, RecordValue } from "../src/api/types.ts";
const c = JSON.parse(
  readFileSync(new URL("../src/api/contract.json", import.meta.url), "utf8"),
);
const check = (schema: string, raw: RecordValue, patch = false) =>
  validate(schema, c.schemas[schema], raw, c.schemas, patch);
test("register requires contact and never accepts user-supplied roles", () => {
  assert.ok(
    check("Register", { fullName: "Lan", password: "abc" }).errors.email,
  );
  const result = check("Register", {
    fullName: " Lan ",
    email: "lan@example.test",
    password: " leading and trailing ",
    roles: ["ADMIN"],
  });
  assert.equal(result.body.fullName, "Lan");
  assert.equal(result.body.password, " leading and trailing ");
  assert.equal(result.body.roles, undefined);
  assert.deepEqual(result.errors, {});
});
test("money remains a decimal string and rejects floats, negatives and excess precision", () => {
  const field: FieldSpec = {
    name: "amount",
    type: "money",
    required: true,
    rule: "Không âm.",
  };
  const good = validate("", [field], { amount: "1234567890123.45" }, {});
  assert.equal(good.body.amount, "1234567890123.45");
  for (const amount of [
    1.2,
    "-1",
    "1.234",
    "1,000",
    "1e6",
    "NaN",
    "12345678901234",
  ])
    assert.ok(validate("", [field], { amount }, {}).errors.amount);
  assert.equal(money("1234567890123.45"), "1.234.567.890.123,45 đ");
});
test("BIGINT identifiers are never converted to numbers", () => {
  const result = validate(
    "",
    [{ name: "id", type: "id", required: true, rule: "" }],
    { id: "900719925474099312345" },
    {},
  );
  assert.equal(result.body.id, "900719925474099312345");
  assert.deepEqual(result.errors, {});
});
test("creation uses endpoint inputFields, not every field from the shared House schema", () => {
  const e = c.endpoints[29];
  const result = validate(
    "House",
    e.inputFields,
    { name: "Nhà", address: "Địa chỉ", provinceCode: "79", latitude: "10" },
    c.schemas,
  );
  assert.deepEqual(result.body, {
    name: "Nhà",
    address: "Địa chỉ",
    provinceCode: "79",
  });
});
test("coordinates are paired and bounded", () => {
  const base = { name: "Nhà", address: "Địa chỉ", provinceCode: "79" };
  assert.ok(check("House", { ...base, latitude: "10" }).errors.latitude);
  assert.ok(
    check("House", { ...base, latitude: "91", longitude: "106" }).errors
      .latitude,
  );
  assert.deepEqual(
    check("House", {
      ...base,
      latitude: "10.1234567",
      longitude: "106.1234567",
    }).errors,
    {},
  );
});
test("room statuses computed by the server cannot be submitted as creation values", () => {
  const status = c.schemas.Room.find((f: FieldSpec) => f.name === "status");
  assert.deepEqual(enumOptions("Room", status), ["AVAILABLE", "MAINTENANCE"]);
  const result = check("Room", {
    code: "P1",
    area: "20.00",
    rentAmount: "0",
    depositAmount: "0",
    capacity: "2",
    status: "OCCUPIED",
  });
  assert.ok(result.errors.status);
});
test("actual calendar dates, leap years and Vietnam date boundary are respected", () => {
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(dateVN(new Date("2026-11-02T18:00:00Z")), "2026-11-03");
});
test("appointments require future, timezone-qualified time and supported duration", () => {
  const base = {
    conversationId: "1",
    roomId: "2",
    startsAt: "2099-12-01T09:00:00+07:00",
    durationMinutes: "60",
  };
  assert.deepEqual(check("ViewingTime", base).errors, {});
  assert.ok(
    check("ViewingTime", { ...base, startsAt: "2099-12-01T09:00:00" }).errors
      .startsAt,
  );
  assert.ok(
    check("ViewingTime", { ...base, startsAt: "2000-12-01T09:00:00+07:00" })
      .errors.startsAt,
  );
  assert.ok(
    check("ViewingTime", { ...base, durationMinutes: 45 }).errors
      .durationMinutes,
  );
});
test("house approval requires evidence review and rejection requires a reason", () => {
  assert.ok(
    check("HouseDecision", { decision: "APPROVE", evidenceChecked: false })
      .errors.evidenceChecked,
  );
  assert.ok(check("HouseDecision", { decision: "REJECT" }).errors.reason);
});
test("house proof checks document types and bounded evidence count", () => {
  const base = {
    rightType: "AUTHORIZED",
    scopeDescription: "Toàn bộ nhà",
    validFrom: "2026-01-01",
    validUntil: "2099-01-01",
    documents: [
      { fileId: "1", documentType: "OWNER_PROOF" },
      { fileId: "2", documentType: "AUTHORIZATION" },
    ],
  };
  assert.deepEqual(check("HouseProof", base).errors, {});
  assert.ok(
    check("HouseProof", { ...base, documents: [base.documents[0]] }).errors
      .documents,
  );
  assert.ok(check("HouseProof", { ...base, validUntil: "" }).errors.validUntil);
});
test("roommate budget comparison is exact and IN_SYSTEM is not accepted from the client", () => {
  const base = {
    housingStatus: "NO_ACCOMMODATION",
    availableFrom: "2099-01-01",
    budgetMin: "9007199254740.12",
    budgetMax: "9007199254740.11",
    preferredLocation: "Hà Nội",
    active: true,
  };
  assert.ok(check("RoommateProfile", base).errors.budgetMax);
  assert.ok(
    check("RoommateProfile", { ...base, housingStatus: "IN_SYSTEM" }).errors
      .housingStatus,
  );
});
test("invoice rent is computed by server, while OTHER requires explicit values", () => {
  const rent = check("InvoiceInputItem", {
    type: "RENT",
    unitPrice: "99999",
    quantity: "100",
  });
  assert.deepEqual(rent.body, { type: "RENT" });
  assert.deepEqual(rent.errors, {});
  assert.ok(check("InvoiceInputItem", { type: "OTHER" }).errors.unitPrice);
  assert.ok(
    check("InvoiceInputItem", {
      type: "SERVICE",
      roomServiceId: "1",
      previousReading: "101",
      currentReading: "100",
    }).errors.currentReading,
  );
});
test("nested invoice errors preserve field paths and billing period must be first of month", () => {
  const result = check("InvoiceDraft", {
    contractId: "1",
    billingPeriod: "2026-11-02",
    dueDate: "2026-11-10",
    items: [{ type: "OTHER", name: "Phí", quantity: "1", unitPrice: "-2" }],
  });
  assert.ok(result.errors.billingPeriod);
  assert.ok(result.errors["items.0.unitPrice"]);
});
test("unknown object shapes are refused instead of guessing payload fields", () => {
  assert.ok(
    check("Lifestyles", { criteria: [{ criterionId: "1", selfValue: true }] })
      .errors.criteria,
  );
});
test("nullable room prices preserve explicit inheritance as null", () => {
  const result = check("RoomService", {
    active: true,
    unitPriceOverride: null,
    calculationMethodOverride: null,
  });
  assert.deepEqual(result.errors, {});
  assert.equal(result.body.unitPriceOverride, null);
});
test("empty PATCH is blocked and omitted optional fields stay omitted", () => {
  assert.ok(check("PersonalProfile", {}, true).errors._form);
  const result = check("PersonalProfile", { occupation: "Sinh viên" }, true);
  assert.deepEqual(result.body, { occupation: "Sinh viên" });
  assert.deepEqual(result.errors, {});
});
test("post content validates UTF-8 byte length, not only character count", () => {
  const result = check("Post", {
    roomId: "1",
    title: "Phòng",
    content: "ộ".repeat(23000),
    imageFileIds: ["2"],
  });
  assert.ok(result.errors.content);
});
test("consents require affirmative confirmation", () => {
  assert.ok(check("JoinConsent", { consent: false }).errors.consent);
  assert.ok(
    check("Handover", {
      departingMemberId: "1",
      successorMemberId: "2",
      reason: "Bàn giao",
      consentRecorded: false,
    }).errors.consentRecorded,
  );
});
test("command attempt prevents duplicate concurrent submits and retains key after uncertainty", () => {
  let i = 0;
  const attempt = new MutationAttempt(() => `key-${++i}`);
  const first = attempt.begin({ name: "Nhà" });
  assert.throws(() => attempt.begin({ name: "Nhà" }));
  attempt.finish(true);
  assert.throws(() => attempt.begin({ name: "Nhà khác" }));
  assert.equal(attempt.begin({ name: "Nhà" }), first);
  attempt.finish();
  assert.notEqual(attempt.begin({ name: "Nhà khác" }), first);
});
