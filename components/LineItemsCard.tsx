import { useState } from "react";
import { getCurrencySymbol } from "@/lib/currencies";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceItem } from "@/types/invoice";
import { ChevronDown, ChevronUp, GripVertical, PlusCircleIcon, ShoppingCart, SquareText, Tag, Trash } from "lucide-react";

type ItemField = "description" | "quantity" | "rate";

type LineItemsCardProps = {
    items: InvoiceItem[];
    onAdd: () => void;
    onUpdate: (id: string, key: ItemField, value: string) => void;
    onRemove: (id: string) => void;
    onMove: (id: string, direction: "up" | "down") => void;
    onReorder: (dragId: string, targetId: string) => void;
    currency?: string;
};

const rowGrid =
    "grid grid-cols-[minmax(0,1fr)_72px_110px_120px] max-md:grid-cols-[minmax(0,1fr)_56px_84px_32px] items-center gap-2 px-2.5 py-2";

const cellInput =
    "h-9 w-full min-w-0 rounded-sm border border-line bg-white px-3 py-2 text-[13px] text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50";

const configLabel = "flex min-w-0 flex-1 flex-col gap-1.5 text-xs leading-4 font-medium text-on-surface-variant";

const configInput =
    "h-9 w-full rounded-sm border border-line bg-white px-3 py-2 text-[13px] text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 disabled:cursor-not-allowed disabled:opacity-60";

// Editable line items. Amounts format with the selected currency; numeric
// inputs arrive as strings and are coerced by the parent updater.
export default function LineItemsCard({ items, onAdd, onUpdate, onRemove, onMove, onReorder, currency = "USD" }: LineItemsCardProps) {

    const [applyTax, setApplyTax] = useState(false);
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const discountSuffix = discountType === "percentage" ? "%" : getCurrencySymbol(currency);

    // Currency-aware formatter; unknown codes fall back to USD.
    const money = (amount: number) => {
        try {
            return formatCurrency(amount, currency || "USD");
        } catch {
            return formatCurrency(amount);
        }
    };
    return (
        <section className="flex flex-col rounded-lg bg-white gap-2 p-6 shadow-[0_1px_1px_rgb(0_0_0/0.05)]">
            <div className="pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart stroke="var(--primary)" size={18} />
                    <h2 className="text-headline-sm text-on-surface"> Line Items</h2>
                </div>
                <span className="py-0.5 px-2 rounded-sm bg-surface-container-low text-on-surface-variant text-[11px] font-medium">{items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <div className={`${rowGrid} bg-surface-container rounded-sm font-mono font-medium text-[11px] tracking-[0.04em] text-muted uppercase`}>
                <span className="min-w-0 truncate">DESCRIPTION & DELIVERABLES</span>
                <span className="text-right">Qty. / Hrs</span>
                <span className="text-right">Rate / Price</span>
                <span className="text-right max-md:hidden">Amount</span>
            </div>
            {items.map((item, index) => (
                <div
                    className={`${rowGrid} border-b border-line bg-surface-container-low rounded-sm transition-opacity ${draggedId === item.id ? "opacity-50" : ""} ${dragOverId === item.id && draggedId !== item.id ? "outline-2 outline-primary-fixed-dim" : ""}`}
                    key={item.id}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (item.id !== draggedId) setDragOverId(item.id);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        const src = draggedId ?? e.dataTransfer.getData("text/plain");
                        if (src && src !== item.id) onReorder(src, item.id);
                        setDraggedId(null);
                        setDragOverId(null);
                    }}
                    onDragLeave={() => {
                        setDragOverId((prev) => (prev === item.id ? null : prev));
                    }}
                >
                    <div className="flex min-w-0 gap-1.5 items-center">
                        <span
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", item.id);
                                setDraggedId(item.id);
                            }}
                            onDragEnd={() => {
                                setDraggedId(null);
                                setDragOverId(null);
                            }}
                            className="flex shrink-0 cursor-grab touch-none items-center rounded-sm p-0.5 select-none active:cursor-grabbing"
                            title="Drag to reorder"
                            aria-label={`Drag to reorder ${item.description || "item"}`}
                        >
                            <GripVertical stroke="var(--muted)" size={16} className="pointer-events-none shrink-0" />
                        </span>
                        <span className="flex shrink-0 flex-col -space-y-1">
                            <button
                                type="button"
                                onClick={() => onMove(item.id, "up")}
                                disabled={index === 0}
                                aria-label="Move item up"
                                className="rounded-sm p-0.5 text-muted transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
                            >
                                <ChevronUp stroke="currentColor" size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => onMove(item.id, "down")}
                                disabled={index === items.length - 1}
                                aria-label="Move item down"
                                className="rounded-sm p-0.5 text-muted transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
                            >
                                <ChevronDown stroke="currentColor" size={14} />
                            </button>
                        </span>
                        <input
                            className={`${cellInput} text-left`}
                            value={item.description}
                            onChange={(e) => onUpdate(item.id, "description", e.target.value)}
                            placeholder="e.g. Website interface design"
                            aria-label="Item description"
                        />
                    </div>
                    <input
                        className={`${cellInput} text-right tabular-nums`}
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
                        aria-label="Quantity"
                    />
                    <input
                        className={`${cellInput} text-right tabular-nums`}
                        type="number"
                        min={0}
                        value={item.rate}
                        onChange={(e) => onUpdate(item.id, "rate", e.target.value)}
                        aria-label="Rate"
                    />
                    <div className="flex min-w-0 items-center justify-end gap-2">
                        <output className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-on-surface tabular-nums max-md:hidden">
                            {money(item.quantity * item.rate)}
                        </output>
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="flex shrink-0 items-center justify-center rounded-sm p-1 text-muted transition-colors hover:bg-error-container hover:text-error"
                            aria-label="Remove item"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                </div>
            ))}
            <div className="flex flex-col pt-5 gap-4 border-t border-line">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center rounded-sm bg-surface-container gap-1 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-surface-container-low cursor-pointer"
                        onClick={onAdd}
                    >
                        <PlusCircleIcon stroke="var(--primary)" size={14} />
                        Add another item
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex cursor-pointer items-center gap-1 text-xs font-medium text-on-surface-variant">
                            <input
                                type="checkbox"
                                name="applyDiscount"
                                checked={applyDiscount}
                                onChange={(e) => setApplyDiscount(e.target.checked)}
                            />
                            Apply Discount
                        </label>
                        <label className="flex cursor-pointer items-center gap-1 text-xs font-medium text-on-surface-variant">
                            <input
                                type="checkbox"
                                name="applyTax"
                                checked={applyTax}
                                onChange={(e) => setApplyTax(e.target.checked)}
                            />
                            Apply Tax / VAT
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <fieldset
                        disabled={!applyDiscount}
                        aria-disabled={!applyDiscount}
                        className={`flex min-w-0 flex-col gap-3 rounded-sm p-4 border border-line bg-surface-container-low transition-opacity ${applyDiscount ? "" : "opacity-70"}`}
                    >
                        <div className="flex items-center gap-1.5">
                            <Tag stroke="var(--primary)" size={14} />
                            <p className="text-sm font-semibold text-on-surface">Discount Configuration</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <div className="min-w-32 flex-1">
                                <label className={configLabel}>
                                    <span>Discount Value</span>
                                    <span className="relative block">
                                        <input
                                            type="number"
                                            min={0}
                                            max={discountType === "percentage" ? 100 : undefined}
                                            className={`${configInput} pr-8 text-right tabular-nums`}
                                        />
                                        <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-muted">{discountSuffix}</span>
                                    </span>
                                </label>
                            </div>
                            <div className="min-w-28 flex-1">
                                <label className={configLabel}>
                                    <span>Type</span>
                                    <select
                                        className={configInput}
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                                    >
                                        <option value="percentage">
                                            Percentage %
                                        </option>
                                        <option value="fixed">
                                            Fixed Price
                                        </option>
                                    </select>
                                </label>
                            </div>
                            <div className="w-full">
                                <label htmlFor="reason" className={configLabel}>
                                    <span>Reason (Optional)</span>
                                    <input id="reason" type="text" placeholder="e.g. New Year Off" className={configInput} />
                                </label>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset
                        disabled={!applyTax}
                        aria-disabled={!applyTax}
                        className={`flex min-w-0 flex-col gap-3 rounded-sm p-4 border border-line bg-surface-container-low transition-opacity ${applyTax ? "" : "opacity-70"}`}
                    >
                        <div className="flex items-center gap-1.5">
                            <SquareText stroke="var(--primary)" size={14} />
                            <p className="text-sm font-semibold text-on-surface">Tax / VAT Configuration</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="min-w-28 flex-1">
                                <label className={configLabel}>
                                    <span>Tax Type</span>
                                    <select className={configInput}>
                                        <option>
                                            VAT
                                        </option>
                                        <option>
                                            Service Tax
                                        </option>
                                        <option>
                                            GST
                                        </option>
                                    </select>
                                </label>
                            </div>
                            <div className="min-w-32 flex-1">
                                <label className={configLabel}>
                                    <span>Tax Rate (%)</span>
                                    <span className="relative block">
                                        <input type="number" min={0} max={100} className={`${configInput} pr-8 text-right tabular-nums`} />
                                        <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-muted">%</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </section>
    );
}
