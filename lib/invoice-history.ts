import { createLocalStorageListStore } from "@/lib/local-storage-store";
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

// Snapshots can embed logo/QR data URLs, so the list is capped to keep
// localStorage from filling up.
const MAX_ENTRIES = 50;

const store = createLocalStorageListStore<InvoiceHistoryEntry>("invoxa:invoice-history:v1", (value) =>
    Array.isArray(value) ? value.filter(isHistoryEntry) : [],
);

export const subscribeInvoiceHistory = store.subscribe;
export const getInvoiceHistorySnapshot = store.getSnapshot;
export const getInvoiceHistoryServerSnapshot = store.getServerSnapshot;
export const loadInvoiceHistory = store.getSnapshot;
export const persistInvoiceHistory = store.set;

// Newest first. Re-saving an invoice with the same number replaces its earlier
// entry instead of piling up duplicates; unnumbered invoices always append.
export function upsertInvoiceHistory(entries: InvoiceHistoryEntry[], snapshot: InvoiceSnapshot): InvoiceHistoryEntry[] {
    const number = snapshot.meta.invoiceNumber.trim().toLowerCase();
    const existing = number
        ? entries.find(
              (entry) => entry.snapshot.meta.invoiceNumber.trim().toLowerCase() === number,
          )
        : undefined;
    const now = Date.now();
    const entry: InvoiceHistoryEntry = {
        id: existing?.id ?? `invoice-${now}-${Math.random().toString(36).slice(2, 7)}`,
        savedAt: now,
        snapshot,
    };
    return [
        entry,
        ...entries.filter((candidate) => candidate.id !== entry.id),
    ].slice(0, MAX_ENTRIES);
}
