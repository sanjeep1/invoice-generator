import type {
    BankAccountDetails,
    DiscountConfig,
    InvoiceDetails,
    InvoiceItem,
    InvoiceMeta,
    TaxConfig,
} from "@/types/invoice";

export interface InvoiceSnapshot {
    items: InvoiceItem[];
    meta: InvoiceMeta;
    details: InvoiceDetails;
    notes: string;
    bankDetails: BankAccountDetails;
    discount?: DiscountConfig;
    tax?: TaxConfig;
}

export interface InvoiceHistoryEntry {
    id: string;
    savedAt: number;
    snapshot: InvoiceSnapshot;
}

const STORAGE_KEY = "invoxa:invoice-history:v1";

// Snapshots can embed logo/QR data URLs, so the list is capped to keep
// localStorage from filling up.
const MAX_ENTRIES = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isSnapshot(value: unknown): value is InvoiceSnapshot {
    if (!isRecord(value)) return false;
    return (
        Array.isArray(value.items) &&
        typeof value.notes === "string" &&
        isRecord(value.meta) &&
        isRecord(value.details) &&
        isRecord(value.bankDetails)
    );
}

function isHistoryEntry(value: unknown): value is InvoiceHistoryEntry {
    return (
        isRecord(value) &&
        typeof value.id === "string" &&
        typeof value.savedAt === "number" &&
        isSnapshot(value.snapshot)
    );
}

// Reads invoice history from localStorage. Safe to call during SSR (returns []).
export function loadInvoiceHistory(): InvoiceHistoryEntry[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isHistoryEntry);
    } catch {
        return [];
    }
}

// Returns false when storage is unavailable (blocked or full), so callers can
// surface the failure instead of silently losing the entry.
export function persistInvoiceHistory(entries: InvoiceHistoryEntry[]): boolean {
    if (typeof window === "undefined") return false;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        return true;
    } catch {
        return false;
    }
}

// Newest first. Re-saving an invoice with the same number replaces its earlier
// entry instead of piling up duplicates; unnumbered invoices always append.
export function upsertInvoiceHistory(
    entries: InvoiceHistoryEntry[],
    snapshot: InvoiceSnapshot,
): InvoiceHistoryEntry[] {
    const number = snapshot.meta.invoiceNumber.trim().toLowerCase();
    const existing = number
        ? entries.find(
              (entry) =>
                  entry.snapshot.meta.invoiceNumber.trim().toLowerCase() === number,
          )
        : undefined;
    const now = Date.now();
    const entry: InvoiceHistoryEntry = {
        id:
            existing?.id ??
            `invoice-${now}-${Math.random().toString(36).slice(2, 7)}`,
        savedAt: now,
        snapshot,
    };
    return [
        entry,
        ...entries.filter((candidate) => candidate.id !== entry.id),
    ].slice(0, MAX_ENTRIES);
}
