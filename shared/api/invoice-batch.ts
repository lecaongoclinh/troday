import type { InvoiceService, MeterInput } from "./invoice-preview.ts";
import { invoiceServiceTotal, parseInvoiceService, serviceInvoiceLine } from "./invoice-preview.ts";
import { isRecord, type RecordValue } from "./types.ts";

export interface BatchRoom {
    contractId: string;
    roomCode: string;
    contractNumber: string;
    invoiceId?: string;
    invoiceStatus?: string;
    blockedReason?: string;
    previewVersion: string;
    baseTotal: string;
    services: InvoiceService[];
}

export interface BatchRoomSubmission {
    contractId: string;
    previewVersion: string;
    readings: { roomServiceId: string; previousReading?: string; currentReading?: string }[];
}

export interface BatchSubmission {
    billingPeriod: string;
    dueDate: string;
    rooms: BatchRoomSubmission[];
}

export interface BatchResult {
    created: { contractId: string; roomCode: string; invoice: RecordValue }[];
    skipped: { contractId: string; reason: string }[];
}

export function parseBatchPreview(data: unknown) {
    if (!isRecord(data) || !Array.isArray(data.rooms)) return undefined;
    const rooms: BatchRoom[] = data.rooms.filter(isRecord).map(room => ({
        contractId: String(room.contractId),
        roomCode: String(room.roomCode),
        contractNumber: String(room.contractNumber),
        invoiceId: room.invoiceId == null ? undefined : String(room.invoiceId),
        invoiceStatus: typeof room.invoiceStatus === "string" ? room.invoiceStatus : undefined,
        blockedReason: typeof room.blockedReason === "string" ? room.blockedReason : undefined,
        previewVersion: String(room.previewVersion ?? ""),
        baseTotal: String(room.baseTotal ?? "0"),
        services: Array.isArray(room.services) ? room.services.filter(isRecord).map(parseInvoiceService) : [],
    }));
    return { houseId: String(data.houseId), billingPeriod: String(data.billingPeriod), rooms };
}

export function prepareBatchRoom(room: BatchRoom, readings: Record<string, MeterInput> = {}) {
    const lines = room.services.flatMap(service => {
        const line = serviceInvoiceLine(service, 0, readings[service.roomServiceId]);
        return line ? [line] : [];
    });
    const total = invoiceServiceTotal([{ quantity: "1", unitPrice: room.baseTotal }, ...lines]);
    const complete = !room.invoiceId && !room.blockedReason && !!room.previewVersion && room.services.length > 0
        && room.services.length === lines.length;
    const submission: BatchRoomSubmission | undefined = complete ? {
        contractId: room.contractId,
        previewVersion: room.previewVersion,
        readings: lines.map((line, index) => ({
            roomServiceId: room.services[index].roomServiceId,
            currentReading: line.currentReading,
            ...(room.services[index].previousReading === null ? { previousReading: line.previousReading } : {}),
        })),
    } : undefined;
    return { total, submission };
}

export function markBatchCreated(rooms: BatchRoom[], created: BatchResult["created"]): BatchRoom[] {
    const invoices = new Map(created.map(row => [row.contractId, row.invoice]));
    return rooms.map(room => {
        const invoice = invoices.get(room.contractId);
        return invoice ? { ...room, invoiceId: String(invoice.id), invoiceStatus: String(invoice.status ?? "DRAFT") } : room;
    });
}

export function parseBatchResult(data: unknown): BatchResult {
    if (!isRecord(data) || !Array.isArray(data.created) || !Array.isArray(data.skipped)) {
        throw new Error("Máy chủ chưa trả được kết quả lập hóa đơn.");
    }
    return {
        created: data.created.filter(isRecord).flatMap(row => isRecord(row.invoice)
            ? [{ contractId: String(row.contractId), roomCode: String(row.roomCode), invoice: row.invoice }] : []),
        skipped: data.skipped.filter(isRecord).map(row => ({ contractId: String(row.contractId), reason: String(row.reason) })),
    };
}
