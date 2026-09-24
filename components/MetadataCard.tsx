import Field from "@/components/Field";

export default function MetadataCard() {
    return (
        <section className="rounded-lg bg-white p-6 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-headline-sm text-on-surface">▣ Invoice Setup &amp; Numbering</h2>
                <span className="rounded-xs bg-surface-container px-2 py-0.5 font-serif text-[11px] tracking-wider text-muted">
                    METADATA #01
                </span>
            </div>
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
                <Field label="Invoice Number" defaultValue="INV-2025-084" />
                <Field label="Issue Date" defaultValue="03/01/2025" />
                <Field label="Payment Terms" defaultValue="Net 15 Days" />
                <Field label="Currency" defaultValue="USD ($)" />
            </div>
        </section>
    );
}
