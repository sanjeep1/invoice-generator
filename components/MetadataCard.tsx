import Field from "@/components/Field";
import { CURRENCIES } from "@/lib/currencies";
import { SAMPLE_META } from "@/lib/sample-invoice";
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

export default function MetadataCard({ value, onChange }: InvoiceMetaProps) {
    const details = value ?? defaultValue;

    const handleChange =
        (key: keyof InvoiceMeta) =>
            (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                onChange?.({ [key]: e.target.value });
            };
    return (
        <section className="rounded-lg bg-white p-6 gap-4 shadow-[0_1px_1px_rgb(0_0_0/0.05)] max-sm:p-4">
            <div className="mb-4 flex items-center gap-2">
                <ReceiptText stroke="var(--primary)" />
                <h2 className="text-headline-sm text-on-surface">Invoice Setup &amp; Numbering</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
                <Field label="Invoice Number"
                    placeholder={SAMPLE_META.invoiceNumber}
                    value={details.invoiceNumber}
                    onChange={handleChange("invoiceNumber")}
                    autoComplete="off"
                    required
                />
                <Field label="Issue Date"
                    type="date"
                    value={details.issueDate}
                    onChange={handleChange("issueDate")}
                    required
                />
                <Field label="Payment Terms"
                    placeholder={SAMPLE_META.paymentTerms}
                    value={details.paymentTerms}
                    onChange={handleChange("paymentTerms")}
                    autoComplete="off" />
                <label className="flex flex-col gap-1.5 text-xs leading-4 font-medium text-on-surface-variant">
                    <span>
                        Currency
                        <span aria-hidden="true" className="ml-0.5 text-error">
                            *
                        </span>
                    </span>
                    <select
                        className="h-9 w-full cursor-pointer rounded-sm border border-line bg-surface-container-lowest px-3 py-2 text-[13px] font-normal text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 max-sm:h-10 max-sm:text-base"
                        value={details.currency}
                        onChange={handleChange("currency")}
                        required
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
