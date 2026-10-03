import type { ChangeEvent } from "react";
import { SAMPLE_NOTES } from "@/lib/sample-invoice";
import { TextAlignStart } from "lucide-react";

type NotesCardProps = {
    value?: string;
    onChange?: (value: string) => void;
};

export default function NotesCard({ value, onChange }: NotesCardProps) {
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <section className="flex flex-col rounded-sm bg-surface-container-low p-4 gap-2 border border-line shadow-[0_1px_1px_rgb(0_0_0/0.05)] max-sm:p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <TextAlignStart stroke="var(--primary)" />
                    <h2 className="text-headline-sm text-on-surface">Notes &amp; Payment Details</h2>
                </div>
                <span className="rounded-xs bg-primary/10 px-2 py-0.5 font-serif text-[11px] tracking-wider text-muted">
                    OPTIONAL
                </span>
            </div>
            <textarea
                className="min-h-20 w-full resize-y rounded-sm border border-line bg-surface-container-lowest p-3 text-[13px] leading-5 text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 max-sm:text-base"
                value={value ?? ""}
                placeholder={SAMPLE_NOTES}
                onChange={handleChange}
            />
        </section>
    );
}
