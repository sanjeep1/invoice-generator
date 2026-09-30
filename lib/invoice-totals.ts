import type { DiscountConfig, InvoiceItem, TaxConfig } from "@/types/invoice";

export interface InvoiceTotals {
    subtotal: number;
    discountAmount: number;
    taxableBase: number;
    taxRate: number;
    taxAmount: number;
    total: number;
}

// Order of operations: discount comes off the subtotal (percentage clamped
// to 0–100, fixed clamped to the subtotal), then tax applies to the
// discounted base.
export function computeTotals(
    items: InvoiceItem[],
    discount?: DiscountConfig,
    tax?: TaxConfig,
): InvoiceTotals {
    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
    let discountAmount = 0;
    if (discount?.enabled) {
        const raw = Number.isFinite(discount.value) ? Math.max(0, discount.value) : 0;
        const amount =
            discount.type === "percentage"
                ? (subtotal * Math.min(raw, 100)) / 100
                : raw;
        discountAmount = Math.min(amount, subtotal);
    }
    const taxableBase = subtotal - discountAmount;
    const taxRate = tax?.enabled
        ? Math.min(Math.max(Number.isFinite(tax.rate) ? tax.rate : 0, 0), 100) / 100
        : 0;
    const taxAmount = taxableBase * taxRate;
    return {
        subtotal,
        discountAmount,
        taxableBase,
        taxRate,
        taxAmount,
        total: taxableBase + taxAmount,
    };
}

// Normalizes currency input to an Intl code: 3-letter codes pass through,
// bare symbols (€/₹/£/$) map to their currency, otherwise USD.
export function parseCurrencyCode(raw: string): string {
    const codeMatch = raw.match(/\b([A-Za-z]{3})\b/);
    if (codeMatch) return codeMatch[1].toUpperCase();
    if (raw.includes("€")) return "EUR";
    if (raw.includes("₹")) return "INR";
    if (raw.includes("£")) return "GBP";
    if (raw.includes("$")) return "USD";
    return "USD";
}
