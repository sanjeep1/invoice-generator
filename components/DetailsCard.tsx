import type { ReactNode } from "react";
import type { ChangeEvent } from "react";
import Field from "@/components/Field";
import type { InvoiceDetails } from "@/types/invoice";

export type DetailField = {
    label: string;
    fieldKey: keyof InvoiceDetails;
    type?: string;
    placeholder?: string;
};

type DetailsCardProps = {
    title: string;
    side: string;
    fields: DetailField[];
    media?: ReactNode;
    value?: InvoiceDetails;
    onChange?: (patch: Partial<InvoiceDetails>) => void;
};

export default function DetailsCard({ title, side, fields, media, value, onChange }: DetailsCardProps) {
    const handleChange =
        (key: keyof InvoiceDetails) => (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.({ [key]: e.target.value });
        };

    return (
        <section className="rounded-lg bg-white p-6 pb-7.25 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-headline-sm text-on-surface">{title}</h3>
                <small className="font-mono text-[11px] text-tertiary">{side}</small>
            </div>
            {media}
            {fields.map((field) => (
                <Field
                    key={field.fieldKey}
                    label={field.label}
                    value={value?.[field.fieldKey] ?? ""}
                    onChange={handleChange(field.fieldKey)}
                    type={field.type}
                    placeholder={field.placeholder}
                />
            ))}
        </section>
    );
}
