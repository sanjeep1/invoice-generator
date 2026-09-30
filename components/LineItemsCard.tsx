import { useState } from "react";
import { getCurrencySymbol } from "@/lib/currencies";
import { formatCurrency } from "@/lib/utils";
import type { DiscountConfig, InvoiceItem, TaxConfig, TaxType } from "@/types/invoice";
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
    discount: DiscountConfig;
    onDiscountChange: (patch: Partial<DiscountConfig>) => void;
    tax: TaxConfig;
    onTaxChange: (patch: Partial<TaxConfig>) => void;
};

const rowGrid =
    "hidden md:grid md:grid-cols-[minmax(0,1fr)_72px_110px_120px] items-center gap-2 px-2.5 py-2";

const cellInput =
    "h-9 w-full min-w-0 rounded-sm border border-line bg-white px-3 py-2 text-[13px] text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 max-sm:h-10 max-sm:px-2 max-sm:text-base";

const configLabel = "flex min-w-0 flex-1 flex-col gap-1.5 text-xs leading-4 font-medium text-on-surface-variant";

const configInput =
    "h-9 w-full rounded-sm border border-line bg-white px-3 py-2 text-[13px] text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 disabled:cursor-not-allowed disabled:opacity-60 max-sm:h-10 max-sm:text-base";

// Editable line items. Amounts format with the selected currency; numeric
// inputs arrive as strings and are coerced by the parent updater.
export default function LineItemsCard({ items, onAdd, onUpdate, onRemove, onMove, onReorder, currency = "USD", discount, onDiscountChange, tax, onTaxChange }: LineItemsCardProps) {

    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const { enabled: applyDiscount, type: discountType } = discount;
    const { enabled: applyTax } = tax;

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
        <section className="flex flex-col rounded-lg bg-white gap-2 p-6 shadow-[0_1px_1px_rgb(0_0_0/0.05)] max-sm:p-4">
            <div className="pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart stroke="var(--primary)" size={18} />
                    <h2 className="text-headline-sm text-on-surface"> Line Items</h2>
                </div>
                <span className="py-0.5 px-2 rounded-sm bg-surface-container-low text-on-surface-variant text-[11px] font-medium">{items.length} {items.length === 1 ? "item" : "items"}</span>
            </div>
            <div className={`${rowGrid} bg-surface-container rounded-sm font-mono font-medium text-[11px] tracking-[0.04em] text-muted uppercase`}>
                <span className="min-w-0 truncate">Description &amp; deliverables</span>
                <span className="text-right">Qty. / Hrs</span>
                <span className="text-right">Rate / Price</span>
                <span className="text-right">Amount</span>
            </div>
            {items.map((item, index) => (
                <div
                    className={`grid grid-cols-2 gap-2 rounded-sm border border-line bg-surface-container-low p-2.5 transition-opacity md:grid-cols-[minmax(0,1fr)_72px_110px_120px] md:items-center md:px-2.5 md:py-2 ${draggedId === item.id ? "opacity-50" : ""} ${dragOverId === item.id && draggedId !== item.id ? "outline-2 outline-primary-fixed-dim" : ""}`}
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
                    <div className="col-span-2 flex min-w-0 items-center gap-1.5 md:col-span-1">
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
                        <span className="flex shrink-0 flex-col">
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
                            className={`${cellInput} min-w-0 flex-1 text-left`}
                            value={item.description}
                            onChange={(e) => onUpdate(item.id, "description", e.target.value)}
                            placeholder="e.g. Website interface design"
                            aria-label="Item description"
                            required
                        />
                    </div>
                    <div className="min-w-0">
                        <span aria-hidden="true" className="mb-1 block text-[10px] font-medium tracking-[0.04em] text-muted uppercase md:hidden">Qty</span>
                        <input
                            className={`${cellInput} text-right tabular-nums`}
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
                            aria-label="Quantity"
                            required
                        />
                    </div>
                    <div className="min-w-0">
                        <span aria-hidden="true" className="mb-1 block text-[10px] font-medium tracking-[0.04em] text-muted uppercase md:hidden">Rate</span>
                        <input
                            className={`${cellInput} text-right tabular-nums`}
                            type="number"
                            min={0}
                            value={item.rate}
                            onChange={(e) => onUpdate(item.id, "rate", e.target.value)}
                            aria-label="Rate"
                            required
                        />
                    </div>
                    <div className="col-span-2 flex min-w-0 items-center justify-between gap-2 md:col-span-1 md:justify-end">
                        <output className="min-w-0 truncate text-xs font-semibold text-on-surface tabular-nums">
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
                                onChange={(e) => onDiscountChange({ enabled: e.target.checked })}
                            />
                            Apply Discount
                        </label>
                        <label className="flex cursor-pointer items-center gap-1 text-xs font-medium text-on-surface-variant">
                            <input
                                type="checkbox"
                                name="applyTax"
                                checked={applyTax}
                                onChange={(e) => onTaxChange({ enabled: e.target.checked })}
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
                                            value={discount.value}
                                            onChange={(e) => onDiscountChange({ value: Number(e.target.value) })}
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
                                        onChange={(e) => onDiscountChange({ type: e.target.value as DiscountConfig["type"] })}
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
                                    <input id="reason" type="text" placeholder="e.g. New Year Off" value={discount.reason} onChange={(e) => onDiscountChange({ reason: e.target.value })} className={configInput} />
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
                                    <select
                                        className={configInput}
                                        value={tax.type}
                                        onChange={(e) => onTaxChange({ type: e.target.value as TaxType })}
                                    >
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
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={tax.rate}
                                            onChange={(e) => onTaxChange({ rate: Number(e.target.value) })}
                                            className={`${configInput} pr-8 text-right tabular-nums`}
                                        />
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
