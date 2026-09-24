import type { ReactNode } from "react";
import Field from "@/components/Field";

export type DetailField = {
    label: string;
    defaultValue?: string;
    type?: string;
    placeholder?: string;
};

type DetailsCardProps = {
    title: string;
    side: string;
    fields: DetailField[];
    media?: ReactNode;
};

export default function DetailsCard({ title, side, fields, media }: DetailsCardProps) {
    return (
        <section className="rounded-lg bg-white p-6 pb-7.25 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-headline-sm text-on-surface">{title}</h3>
                <small className="font-mono text-[11px] text-tertiary">{side}</small>
            </div>
            {media}
            {fields.map((field) => (
                <Field
                    key={field.label}
                    label={field.label}
                    defaultValue={field.defaultValue}
                    type={field.type}
                    placeholder={field.placeholder}
                />
            ))}
        </section>
    );
}
