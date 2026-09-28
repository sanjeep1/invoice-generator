export type Currency = {
    code: string;
    label: string;
    symbol: string;
};

// Single source of truth for supported currencies.
export const CURRENCIES: Currency[] = [
    { code: "USD", label: "USD ($) — US Dollar", symbol: "$" },
    { code: "EUR", label: "EUR (€) — Euro", symbol: "€" },
    { code: "GBP", label: "GBP (£) — British Pound", symbol: "£" },
    { code: "INR", label: "INR (₹) — Indian Rupee", symbol: "₹" },
    { code: "NPR", label: "NPR (₨) — Nepalese Rupee", symbol: "₨" },
    { code: "JPY", label: "JPY (¥) — Japanese Yen", symbol: "¥" },
    { code: "CNY", label: "CNY (¥) — Chinese Yuan", symbol: "¥" },
    { code: "AUD", label: "AUD ($) — Australian Dollar", symbol: "$" },
    { code: "CAD", label: "CAD ($) — Canadian Dollar", symbol: "$" },
    { code: "CHF", label: "CHF — Swiss Franc", symbol: "CHF" },
    { code: "SGD", label: "SGD ($) — Singapore Dollar", symbol: "$" },
    { code: "AED", label: "AED — UAE Dirham", symbol: "AED" },
];

export function getCurrencySymbol(code?: string): string {
    const upper = (code || "USD").toUpperCase();
    const mapped = CURRENCIES.find((c) => c.code === upper)?.symbol;
    if (mapped) return mapped;
    try {
        const part = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: upper,
        })
            .formatToParts(0)
            .find((p) => p.type === "currency");
        return part?.value ?? upper;
    } catch {
        return upper;
    }
}
