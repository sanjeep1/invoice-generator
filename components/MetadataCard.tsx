import Field from "@/components/Field";
import { ReceiptText } from "lucide-react";
import type { ChangeEvent } from "react";
import type { InvoiceMeta } from "@/types/invoice";

type InvoiceMetaProps = {
    value?: InvoiceMeta;
    onChange?: (patch: Partial<InvoiceMeta>) => void;
};

const defaultValue: InvoiceMeta = {
    invoiceNumber: "",
    issueDate: "",
    paymentTerms: "",
    currency: "",
};

const CURRENCIES = [
    { code: "USD", label: "USD ($) — US Dollar" },
    { code: "EUR", label: "EUR (€) — Euro" },
    { code: "GBP", label: "GBP (£) — British Pound" },
    { code: "INR", label: "INR (₹) — Indian Rupee" },
    { code: "NPR", label: "NPR (₨) — Nepalese Rupee" },
    { code: "JPY", label: "JPY (¥) — Japanese Yen" },
    { code: "CNY", label: "CNY (¥) — Chinese Yuan" },
    { code: "AUD", label: "AUD ($) — Australian Dollar" },
    { code: "CAD", label: "CAD ($) — Canadian Dollar" },
    { code: "CHF", label: "CHF — Swiss Franc" },
    { code: "SGD", label: "SGD ($) — Singapore Dollar" },
    { code: "AED", label: "AED — UAE Dirham" },
];

export default function MetadataCard({ value, onChange }: InvoiceMetaProps) {
    const details = value ?? defaultValue;

    const handleChange =
        (key: keyof InvoiceMeta) =>
            (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                onChange?.({ [key]: e.target.value });
            };
    return (
        <section className="rounded-lg bg-white p-6 gap-4 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="mb-4 flex items-center gap-2">
                <ReceiptText stroke="var(--primary)" />
                <h2 className="text-headline-sm text-on-surface">Invoice Setup &amp; Numbering</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
                <Field label="Invoice Number"
                    placeholder="INV-2025-084"
                    value={details.invoiceNumber}
                    onChange={handleChange("invoiceNumber")}
                    autoComplete="off"
                />
                <Field label="Issue Date"
                    type="date"
                    value={details.issueDate}
                    onChange={handleChange("issueDate")}
                />
                <Field label="Payment Terms"
                    placeholder="Net 15 Days"
                    value={details.paymentTerms}
                    onChange={handleChange("paymentTerms")}
                    autoComplete="off" />
                <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
                    <span>Currency</span>
                    <select
                        className="h-7.5 w-full rounded-sm border-0 bg-surface-container-low px-2.5 py-1.5 text-[13px] text-on-surface outline-none focus:outline-2 focus:outline-primary-fixed-dim"
                        value={details.currency}
                        onChange={handleChange("currency")}
                    >
                        <option value="" disabled>
                            Select currency
                        </option>
                        {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </section>
    );
}
