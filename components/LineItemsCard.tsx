import { formatCurrency } from "@/lib/utils";
import type { InvoiceItem } from "@/types/invoice";

type ItemField = "description" | "quantity" | "rate";

type LineItemsCardProps = {
    items: InvoiceItem[];
    onAdd: () => void;
    onUpdate: (id: string, key: ItemField, value: string) => void;
    currency?: string;
};

const rowGrid =
    "grid grid-cols-[minmax(180px,1fr)_60px_98px_104px] gap-2 px-2.5 py-2 max-md:grid-cols-[minmax(120px,1fr)_45px_75px]";

export default function LineItemsCard({ items, onAdd, onUpdate, currency = "USD" }: LineItemsCardProps) {
    const money = (amount: number) => {
        try {
            return formatCurrency(amount, currency || "USD");
        } catch {
            return formatCurrency(amount);
        }
    };
    return (
        <section className="rounded-lg bg-white p-6 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-headline-sm text-on-surface">☷ Line Items</h2>
                <button
                    className="rounded-sm bg-white px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-container-low"
                    onClick={onAdd}
                >
                    + Add line item
                </button>
            </div>
            <div className={`${rowGrid} bg-surface-container-low font-mono text-[10px] tracking-[0.04em] text-muted`}>
                <span>Description</span>
                <span>Qty.</span>
                <span>Rate</span>
                <span className="max-md:hidden">Amount</span>
            </div>
            {items.map((item) => (
                <div className={`${rowGrid} items-center border-b border-line`} key={item.id}>
                    <input
                        className="w-full min-w-0 bg-transparent px-0.5 py-1.5 text-xs text-on-surface outline-none"
                        value={item.description}
                        onChange={(e) => onUpdate(item.id, "description", e.target.value)}
                    />
                    <input
                        className="w-full min-w-0 bg-transparent px-0.5 py-1.5 text-xs text-on-surface outline-none text-right"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
                    />
                    <input
                        className="w-full min-w-0 bg-transparent px-0.5 py-1.5 text-xs text-on-surface outline-none text-right"
                        type="number"
                        value={item.rate}
                        onChange={(e) => onUpdate(item.id, "rate", e.target.value)}
                    />
                    <output className="text-right text-xs font-semibold text-on-surface max-md:hidden">
                        {money(item.quantity * item.rate)}
                    </output>
                </div>
            ))}
            <div className="pt-3 text-[11px] text-muted">
                Tip: Add a short, scannable description for each service or
                deliverable.
            </div>
        </section>
    );
}
