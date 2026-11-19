import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { URL } from 'node:url';
import { validate, validDate } from "../api/validation.ts";
import { money, dateVN } from "../api/format.ts";
import { resourceActions, resourceTarget } from "../api/workflows.ts";
const c = JSON.parse(
    readFileSync(new URL("../api/contract.json", import.meta.url), "utf8"),
);
const check = (n: number, raw: Record<string, unknown>) => {
    const e = c.endpoints[n - 1];
    return validate(
        e.input || "",
        e.inputFields,
        raw,
        c.schemas,
        e.method === "PATCH",
    );
};
test("register sends only BE fields, preserves password whitespace, requires a contact", () => {
    assert.ok(check(1, { fullName: "Lan", password: "pass" }).errors.email);
    const result = check(1, {
        fullName: " Lan ",
        email: "lan@example.test",
        password: " pass ",
        confirmPassword: " pass ",
        roles: ["ADMIN"],
    });
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.body, {
        fullName: "Lan",
        email: "lan@example.test",
        password: " pass ",
    });
});
test("money and IDs are kept exact instead of converted to floats", () => {
    const result = validate(
        "",
        [
            { name: "id", type: "id", required: true, rule: "" },
            { name: "amount", type: "money", required: true, rule: "" },
        ],
        { id: "9223372036854775807", amount: "9999999999999.99" },
        {},
    );
    assert.deepEqual(result.errors, {});
    assert.equal(result.body.amount, "9999999999999.99");
    assert.equal(result.body.id, "9223372036854775807");
    assert.equal(money("1234567.89"), "1.234.567,89 đ");
});
test("real calendar dates and Vietnam day boundaries are validated", () => {
    assert.equal(validDate("2026-02-30"), false);
    assert.equal(validDate("2028-02-29"), true);
    assert.equal(dateVN(new Date("2026-11-12T18:00:00Z")), "2026-11-13");
});
test("proposal uses the required BE clientRequestKey and timezone-qualified future datetime", () => {
    const body = {
        roomId: "1",
        conversationId: "2",
        startsAt: "2099-12-01T09:00:00+07:00",
        durationMinutes: 60,
        clientRequestKey: "c9722130-2dc4-45dc-9012-bd3ae45af501",
    };
    assert.deepEqual(check(92, body).errors, {});
    assert.ok(
        check(92, { ...body, clientRequestKey: "" }).errors.clientRequestKey,
    );
    assert.ok(
        check(92, { ...body, startsAt: "2099-12-01T09:00:00" }).errors.startsAt,
    );
});
test("phone confirmation includes BE phoneNumber field", () => {
    assert.ok(
        check(23, {
            selector: "c9722130-2dc4-45dc-9012-bd3ae45af501",
            code: "123456",
        }).errors.phoneNumber,
    );
});
test("room and house editors exclude fields BE does not save", () => {
    const result = check(44, {
        area: "20.00",
        code: "ignored",
        allowAdditionalOccupants: true,
        notes: "ignored",
    });
    assert.deepEqual(result.body, { area: "20.00" });
    assert.deepEqual(result.errors, {});
    assert.equal(
        check(4, { bio: "Hello", avatarFileId: "3" }).body.avatarFileId,
        undefined,
    );
});
test("invoice creation requires the actual payer and explicit line prices", () => {
    const result = check(147, {
        contractId: "1",
        billingPeriod: "2026-12-01",
        dueDate: "2026-12-10",
        items: [{ type: "RENT" }],
    });
    assert.ok(result.errors.payerRoomTenantId);
    assert.ok(result.errors["items.0.unitPrice"]);
    assert.ok(result.errors["items.0.quantity"]);
    const good = check(147, {
        contractId: "1",
        payerRoomTenantId: "2",
        billingPeriod: "2026-12-01",
        dueDate: "2026-12-10",
        items: [
            {
                type: "RENT",
                name: "Tiền thuê",
                unit: "tháng",
                quantity: "1",
                unitPrice: "3800000.00",
            },
        ],
    });
    assert.deepEqual(good.errors, {});
});
test("invoice editing requires items even for PATCH and guards negative meter usage", () => {
    assert.ok(check(148, { dueDate: "2026-12-10" }).errors.items);
    const result = check(147, {
        items: [
            {
                type: "SERVICE",
                name: "Điện",
                unit: "kWh",
                quantity: "1",
                unitPrice: "3500",
                roomServiceId: "1",
                previousReading: "101",
                currentReading: "100",
            },
        ],
    });
    assert.ok(result.errors["items.0.currentReading"]);
});
test("reports use exactly one concrete BE target field", () => {
    assert.ok(check(156, { reason: "Nội dung" }).errors._form);
    assert.ok(
        check(156, {
            reportedUserId: "1",
            reportedPostId: "2",
            reason: "Nội dung",
        }).errors._form,
    );
    assert.equal(
        check(156, {
            reportedPostId: "2",
            reason: "Nội dung",
            targetType: "POST",
            targetId: "2",
        }).body.targetType,
        undefined,
    );
});
test("lifestyle values support typed booleans rather than rejecting the known BE structure", () => {
    const result = check(67, {
        criteria: [
            {
                criterionId: "1",
                selfValue: "false",
                preferredValue: "true",
                importance: 5,
            },
        ],
    });
    assert.deepEqual(result.errors, {});
    assert.equal((result.body.criteria as any[])[0].selfValue, false);
});
test("private resources use BE collection reads, not nonexistent public detail access", () => {
    assert.deepEqual(resourceTarget(50, { id: "5" }), {
        endpointId: 50,
        params: {},
        kind: "listing",
        rowId: "5",
    });
    const actions = resourceActions(
        "viewing",
        { id: "1", status: "COMPLETED", rentalDecision: "AGREED" },
        { viewingId: "1" },
    );
    assert.ok(actions.some((a) => a.id === 103));
    assert.equal(
        resourceActions("notification", { id: "3", isRead: false }, {})[0].id,
        88,
    );
});
