import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceItem } from "@/types/invoice";

type InvoicePreviewProps = {
    items: InvoiceItem[];
    taxRate?: number;
};

const paperLabel = "font-mono text-[9px] tracking-wider text-muted";
const paperValue = "text-[11px] text-on-surface";

export default function InvoicePreview({ items, taxRate = 0.19 }: InvoicePreviewProps) {
    const subtotal = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity * i.rate, 0),
        [items],
    );
    const tax = subtotal * taxRate;

    return (
        <aside className="min-h-337.5 rounded-lg bg-[#eef0f7] p-4 max-lg:min-h-0 max-md:p-2">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] tracking-wider text-muted">
                <span>▣ LIVE INVOICE PREVIEW</span>
                <div className="flex items-center gap-2.25">
                    <button className="bg-transparent text-[15px] leading-none text-on-surface-variant transition-colors hover:text-on-surface">
                        −
                    </button>
                    <b className="text-on-surface">100%</b>
                    <button className="bg-transparent text-[15px] leading-none text-on-surface-variant transition-colors hover:text-on-surface">
                        +
                    </button>
                </div>
            </div>
            <article className="mx-auto min-h-262.5 bg-white px-9.5 py-10.5 shadow-sheet max-lg:max-w-150 max-md:px-5 max-md:py-7">
                <div className="flex items-center gap-1.5 text-primary">
                    <span className="text-[23px] leading-none">▰</span>
                    <b className="text-lg tracking-[2px]">VANCE</b>
                    <small className="ml-1 border-l border-divider pl-2 text-[8px] tracking-[1px] text-on-surface-variant">
                        INTERACTIVE STUDIO
                    </small>
                </div>
                <div className="mt-14.5 flex justify-between">
                    <div>
                        <h1 className="text-[34px] leading-none font-semibold tracking-[-1.5px] text-on-surface">
                            INVOICE
                        </h1>
                        <p className="mt-1.75 font-mono text-xs text-primary">INV-2025-084</p>
                    </div>
                    <div className="grid grid-cols-[42px_90px] gap-0.75">
                        <span className={paperLabel}>ISSUED</span>
                        <b className={paperValue}>March 01, 2025</b>
                        <span className={paperLabel}>DUE</span>
                        <b className={paperValue}>March 16, 2025</b>
                    </div>
                </div>
                <div className="mt-8.75 grid grid-cols-2 border-t border-line py-6.25">
                    <div className="flex flex-col gap-1">
                        <span className={paperLabel}>FROM</span>
                        <b className="mt-0.75 text-xs text-on-surface">Julian Vance</b>
                        <p className="text-[11px] leading-4.25 text-on-surface-variant">
                            Vance Interactive Studio Ltd.
                            <br />
                            Berlin, Germany
                            <br />
                            billing@vancestudio.design
                        </p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={paperLabel}>BILL TO</span>
                        <b className="mt-0.75 text-xs text-on-surface">Aster &amp; Co.</b>
                        <p className="text-[11px] leading-4.25 text-on-surface-variant">
                            Attn. Marina Ellis
                            <br />
                            New York, USA
                            <br />
                            hello@asterandco.com
                        </p>
                    </div>
                </div>
                <div>
                    <div className="grid grid-cols-[minmax(80px,1fr)_34px_62px_73px] gap-1.25 bg-surface-container-low p-2 font-mono text-[9px] tracking-wider text-muted">
                        <span>DESCRIPTION</span>
                        <span className="text-right">QTY</span>
                        <span className="text-right">RATE</span>
                        <span className="text-right">AMOUNT</span>
                    </div>
                    {items.map((i) => (
                        <div
                            key={i.id}
                            className="grid grid-cols-[minmax(80px,1fr)_34px_62px_73px] gap-1.25 border-b border-line px-2 py-3.25 text-[11px] text-on-surface"
                        >
                            <p>{i.description}</p>
                            <span className="text-right">{i.quantity}</span>
                            <span className="text-right">{formatCurrency(i.rate)}</span>
                            <b className="text-right">{formatCurrency(i.quantity * i.rate)}</b>
                        </div>
                    ))}
                </div>
                <div className="mt-6.25 ml-auto grid w-50 gap-2.5">
                    <span className="flex justify-between text-[11px] text-on-surface-variant">
                        Subtotal <b className="text-on-surface">{formatCurrency(subtotal)}</b>
                    </span>
                    <span className="flex justify-between text-[11px] text-on-surface-variant">
                        VAT ({Math.round(taxRate * 100)}%){" "}
                        <b className="text-on-surface">{formatCurrency(tax)}</b>
                    </span>
                    <strong className="flex justify-between border-t border-ink pt-3 text-sm text-on-surface">
                        Total due <b>{formatCurrency(subtotal + tax)}</b>
                    </strong>
                </div>
                <div className="mt-25 border-t border-line pt-4">
                    <b className="text-[11px] text-on-surface">Payment details</b>
                    <p className="text-[11px] leading-4.25 text-on-surface-variant">
                        IBAN: DE89 3704 0044 0532 0130 00
                        <br />
                        BIC: COBADEFFXXX
                    </p>
                    <small className="mt-7 block text-[10px] text-muted">
                        Thank you for your business.
                    </small>
                </div>
            </article>
        </aside>
    );
}
