import type { ChangeEvent } from "react";
import { SAMPLE_NOTES } from "@/lib/sample-invoice";

type NotesCardProps = {
    value?: string;
    onChange?: (value: string) => void;
};

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
                className="min-h-20 w-full resize-y rounded-sm border border-line bg-surface-container-lowest p-3 text-[13px] leading-5 text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50"
                value={value ?? ""}
                placeholder={SAMPLE_NOTES}
                onChange={handleChange}
            />
        </section>
    );
}
