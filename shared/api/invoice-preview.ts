import { isRecord } from "./types.ts";

type CalculationMethod = "METERED" | "PER_PERSON" | "PER_ROOM";

export interface InvoiceService {
    roomServiceId: string;
    name: string;
    unit: string;
    calculationMethod: CalculationMethod;
    unitPrice: string;
    previousReading: string | null;
    previousBillingPeriod: string | null;
}

export interface InvoicePreview {
    contractId: string;
    billingPeriod: string;
    previewVersion: string;
    rentAmount: string;
    occupantCountAtBilling: number;
    defaultPayerId: string;
    payers: { id: string; name: string }[];
    services: InvoiceService[];
}

export interface MeterInput {
    previousReading?: string;
    currentReading?: string;
}

export interface InvoiceLine {
    type: "RENT" | "SERVICE";
    name: string;
    unit: string;
    quantity: string;
    unitPrice: string;
    roomServiceId?: string;
    calculationMethod?: CalculationMethod;
    previousReading?: string;
    currentReading?: string;
}

export function parseInvoicePreview(data: unknown): InvoicePreview | undefined {
    if (!isRecord(data) || typeof data.previewVersion !== "string"
        || !Array.isArray(data.payers) || !Array.isArray(data.services)) return undefined;
    return {
        contractId: String(data.contractId),
        billingPeriod: String(data.billingPeriod),
        previewVersion: data.previewVersion,
        rentAmount: String(data.rentAmount),
        occupantCountAtBilling: Number(data.occupantCountAtBilling),
        defaultPayerId: String(data.defaultPayerId),
        payers: data.payers.filter(isRecord).map(payer => ({ id: String(payer.id), name: String(payer.name) })),
        services: data.services.filter(isRecord).map(service => ({
            roomServiceId: String(service.roomServiceId),
            name: String(service.name),
            unit: String(service.unit),
            calculationMethod: service.calculationMethod as CalculationMethod,
            unitPrice: String(service.unitPrice),
            previousReading: service.previousReading == null ? null : String(service.previousReading),
            previousBillingPeriod: service.previousBillingPeriod == null ? null : String(service.previousBillingPeriod),
        })),
    };
}

export function roomRentLine(preview: InvoicePreview): InvoiceLine {
    return { type: "RENT", name: "Tiền phòng", unit: "tháng", quantity: "1", unitPrice: preview.rentAmount };
}

export function serviceInvoiceLine(service: InvoiceService, occupants: number, readings?: MeterInput): InvoiceLine | undefined {
    const item: InvoiceLine = {
        type: "SERVICE",
        name: service.name,
        unit: service.unit,
        quantity: String(service.calculationMethod === "PER_PERSON" ? occupants : 1),
        unitPrice: service.unitPrice,
        roomServiceId: service.roomServiceId,
        calculationMethod: service.calculationMethod,
    };
    if (service.calculationMethod !== "METERED") return item;

    const previous = meterValue(service.previousReading ?? readings?.previousReading);
    const current = meterValue(readings?.currentReading);
    if (previous == null || current == null || current < previous) return undefined;
    return { ...item, previousReading: decimal(previous, 3), currentReading: decimal(current, 3), quantity: decimal(current - previous, 3) };
}

function meterValue(value?: string): bigint | undefined {
    const text = value?.trim().replace(",", ".");
    if (!text || !/^\d{1,9}(?:\.\d{1,3})?$/.test(text)) return undefined;
    return scaled(text, 3);
}

function scaled(value: string, precision: number): bigint {
    const [whole, fraction = ""] = value.split(".");
    return BigInt(whole + fraction.padEnd(precision, "0"));
}

function decimal(value: bigint, precision: number): string {
    const digits = value.toString().padStart(precision + 1, "0");
    const fraction = digits.slice(-precision).replace(/0+$/, "");
    return digits.slice(0, -precision) + (fraction ? "." + fraction : "");
}

export function invoiceServiceTotal(lines: Pick<InvoiceLine, "quantity" | "unitPrice">[]): string {
    const cents = lines.reduce((sum, line) => {
        const amount = scaled(line.quantity, 3) * scaled(line.unitPrice, 2);
        return sum + (amount + 500n) / 1000n;
    }, 0n);
    return decimal(cents, 2);
}
