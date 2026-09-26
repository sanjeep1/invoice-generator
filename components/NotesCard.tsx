import type { ChangeEvent } from "react";

type NotesCardProps = {
    value?: string;
    onChange?: (value: string) => void;
};

const defaultNotes =
    "Thank you for the opportunity to collaborate. Payment is due within 15 days of the invoice date.";

export default function NotesCard({ value, onChange }: NotesCardProps) {
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <section className="rounded-lg bg-white p-6 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-headline-sm text-on-surface">⌁ Notes &amp; Payment Details</h2>
                <span className="rounded-xs bg-[#f2f2f5] px-2 py-0.5 font-serif text-[11px] tracking-wider text-muted">
                    OPTIONAL
                </span>
            </div>
            <textarea
                className="min-h-17 w-full resize-y rounded-sm border-0 bg-surface-container-low p-2.5 text-xs leading-4.5 text-on-surface-variant outline-none focus:outline-2 focus:outline-primary-fixed-dim"
                value={value ?? defaultNotes}
                onChange={handleChange}
            />
        </section>
    );
}
