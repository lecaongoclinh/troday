import type { MeterInput } from "./invoice-preview.ts";

export interface BatchDraftScope {
    houseId: string;
    billingPeriod: string;
}

export interface BatchDraft {
    readings: Record<string, Record<string, MeterInput>>;
    excluded: Record<string, boolean>;
    dueDate: string;
}

interface DraftStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export const browserDraftStorage: DraftStorage = {
    getItem: key => globalThis.localStorage.getItem(key),
    setItem: (key, value) => globalThis.localStorage.setItem(key, value),
};

function validScope(scope?: BatchDraftScope): scope is BatchDraftScope {
    return !!scope && /^[1-9]\d*$/.test(scope.houseId) && /^\d{4}-(0[1-9]|1[0-2])-01$/.test(scope.billingPeriod);
}

export function batchDrafts(storage: DraftStorage, account: string) {
    const prefix = `troday:invoice-batch:${encodeURIComponent(account)}`;
    const selectionKey = `${prefix}:selection`;
    const draftKey = (scope: BatchDraftScope) => `${prefix}:${scope.houseId}:${scope.billingPeriod}`;
    const read = <T>(key: string): T | undefined => {
        try {
            const value = storage.getItem(key);
            return value ? JSON.parse(value) : undefined;
        } catch {
            return undefined;
        }
    };
    return {
        lastScope() {
            const scope = read<BatchDraftScope>(selectionKey);
            return validScope(scope) ? scope : undefined;
        },
        read(scope: BatchDraftScope, dueDate: string): BatchDraft {
            const draft = validScope(scope) ? read<BatchDraft>(draftKey(scope)) : undefined;
            return {
                readings: draft?.readings ?? {},
                excluded: draft?.excluded ?? {},
                dueDate: draft?.dueDate ?? dueDate,
            };
        },
        remember(scope: BatchDraftScope) {
            if (!validScope(scope)) return;
            try { storage.setItem(selectionKey, JSON.stringify(scope)); } catch { /* The form remains usable. */ }
        },
        save(scope: BatchDraftScope, draft: BatchDraft): boolean {
            if (!validScope(scope)) return false;
            try {
                storage.setItem(draftKey(scope), JSON.stringify(draft));
                return true;
            } catch {
                return false;
            }
        },
    };
}
