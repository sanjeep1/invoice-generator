import { useMemo } from "react";
import Image from "next/image";
import { formatCurrency, numberToWords } from "@/lib/utils";
import { computeTotals, parseCurrencyCode } from "@/lib/invoice-totals";
import { formatDueDate, formatPaperDate } from "@/lib/invoice-dates";
import { SAMPLE_DETAILS, SAMPLE_DISCOUNT, SAMPLE_ITEMS, SAMPLE_LOGO, SAMPLE_META, SAMPLE_NOTES, SAMPLE_TAX } from "@/lib/sample-invoice";
import type {
    BankAccountDetails,
    DiscountConfig,
    InvoiceDetails,
    InvoiceItem,
    InvoiceMeta,
    TaxConfig,
} from "@/types/invoice";
import { Landmark, Mail, MapPin, SquareDimensions } from "lucide-react";

type InvoicePreviewProps = {
    items: InvoiceItem[];
    meta?: InvoiceMeta;
    details?: InvoiceDetails;
    notes?: string;
    bankDetails?: BankAccountDetails;
    showSample?: boolean;
    discount?: DiscountConfig;
    tax?: TaxConfig;
};

const paperLabel = "font-inter text-[12px] tracking-wider text-muted";
const paperValue = "text-[11px] text-on-surface";

export default function InvoicePreview({
    items,
    meta,
    details,
    notes,
    bankDetails,
    showSample = true,
    discount,
    tax,
}: InvoicePreviewProps) {
    // Sample mode (before the user edits anything): empty editor fields fall
    // back to sample content so the sheet shows a full example invoice. Once
    // editing starts, empty fields resolve to "" and their lines hide.
    const pick = (raw: string | undefined, sample: string) =>
        raw?.trim() || (showSample ? sample : "");
    const resolvedMeta = {
        invoiceNumber: pick(meta?.invoiceNumber, SAMPLE_META.invoiceNumber),
        issueDate: pick(meta?.issueDate, SAMPLE_META.issueDate),
        paymentTerms: pick(meta?.paymentTerms, SAMPLE_META.paymentTerms),
        currency: pick(meta?.currency, SAMPLE_META.currency),
    };
    const sender = {
        name: pick(details?.senderName, SAMPLE_DETAILS.senderName),
        business: pick(details?.senderBusiness, SAMPLE_DETAILS.senderBusiness),
        email: pick(details?.senderEmail, SAMPLE_DETAILS.senderEmail),
        country: pick(details?.senderCountry, SAMPLE_DETAILS.senderCountry),
        taxID: pick(details?.senderTaxId, SAMPLE_DETAILS.senderTaxId),
    };
    const client = {
        company: pick(details?.clientCompany, SAMPLE_DETAILS.clientCompany),
        name: pick(details?.clientName, SAMPLE_DETAILS.clientName),
        email: pick(details?.clientEmail, SAMPLE_DETAILS.clientEmail),
        address: pick(details?.clientAddress, SAMPLE_DETAILS.clientAddress),
        taxId: pick(details?.clientTaxId, SAMPLE_DETAILS.clientTaxId),
    };
    const resolvedNotes = pick(notes, SAMPLE_NOTES);
    // Sample letterhead logo until the user uploads one; hides once editing
    // starts with no logo, matching the other sample fallbacks.
    const displayLogo = details?.senderLogo?.trim() || (showSample ? SAMPLE_LOGO : "");
    // Line items are user-owned once they have meaningful content
    // (a description or a rate > 0); the default qty=1 alone doesn't count.
    const hasRealItems = useMemo(
        () => items.some((i) => i.description.trim() || i.rate > 0),
        [items],
    );
    const displayItems = useMemo(
        () => (hasRealItems ? items : showSample ? SAMPLE_ITEMS : []),
        [hasRealItems, items, showSample],
    );

    // Structured bank rows: label/value pairs (with the sample fallback when
    // every bank field is empty) rendered as a definition grid in the footer.
    const bankRows: { label: string; value: string }[] = (() => {
        const rows = [
            bankDetails?.accountHolder && { label: "Account holder", value: bankDetails.accountHolder },
            bankDetails?.bankAndBranch && { label: "Bank & branch", value: bankDetails.bankAndBranch },
            bankDetails?.accountNumber && { label: "Account number", value: bankDetails.accountNumber },
            bankDetails?.swiftCode && { label: "SWIFT / BIC", value: bankDetails.swiftCode },
            bankDetails?.paymentReference && { label: "Reference", value: bankDetails.paymentReference },
        ].filter(Boolean) as { label: string; value: string }[];
        return rows.length > 0
            ? rows
            : [
                  { label: "Account number", value: "0037000012345678" },
                  { label: "SWIFT / BIC", value: "COBADEFFXXX" },
              ];
    })();
    const currencyCode = parseCurrencyCode(resolvedMeta.currency);
    // Currency-aware formatter with a USD fallback for unknown codes.
    const money = (amount: number) => {
        try {
            return formatCurrency(amount, currencyCode);
        } catch {
            return formatCurrency(amount);
        }
    };
    const { subtotal, discountAmount, taxAmount, total } = useMemo(() => {
        // Sample mode shows example discount/tax rows until the user
        // enables the real controls; afterwards only enabled configs print.
        const resolvedDiscount = discount?.enabled ? discount : showSample ? SAMPLE_DISCOUNT : undefined;
        const resolvedTax = tax?.enabled ? tax : showSample ? SAMPLE_TAX : undefined;
        return computeTotals(displayItems, resolvedDiscount, resolvedTax);
    }, [displayItems, discount, tax, showSample]);
    // Resolved configs drive the totals rows so the preview matches PDF/share.
    const displayDiscount = discount?.enabled ? discount : showSample ? SAMPLE_DISCOUNT : undefined;
    const displayTax = tax?.enabled ? tax : showSample ? SAMPLE_TAX : undefined;
    const amountInWords = numberToWords(total, currencyCode);
    const issuedLabel = formatPaperDate(resolvedMeta.issueDate);
    const dueLabel = formatDueDate(resolvedMeta.issueDate, resolvedMeta.paymentTerms);
    const hasMetaRows = Boolean(issuedLabel || dueLabel || resolvedMeta.currency);
    const hasClient = Boolean(
        client.company || client.name || client.email || client.address || client.taxId,
    );

    return (
        <aside className="min-h-337.5 rounded-lg p-4 max-lg:min-h-0 max-md:p-2 gap-4 print:min-h-0 print:p-0">
            <div className="mb-2 px-2 flex flex-wrap items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-2 font-semibold text-[11px] text-on-surface">
                    <div className="w-2.5 h-2.5 rounded-4xl bg-[#4EDEA3]" />
                    <span>LIVE PREVIEW (A4 STANDARD)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-2 py items-center    rounded-sm bg-surface-container-low font-medium text-[11px] text-on-surface-variant">
                        <p>210 X 297 mm</p>
                    </div>
                    <SquareDimensions width={22} height={18} />
                </div>
            </div>
            <div className="flex flex-col mx-auto min-h-262.5 bg-white px-9.5 py-10.5 gap-6 shadow-sheet max-lg:max-w-150 max-md:px-5 max-md:py-7 print:min-h-0 print:shadow-none">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-b border-line pb-6">
                    <div className="flex min-w-0 flex-1 flex-row items-start gap-3.5">
                        {displayLogo ? (
                            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-sm">
                                <Image
                                    src={displayLogo}
                                    alt={`${sender.business || sender.name || "Brand"} logo`}
                                    width={56}
                                    height={56}
                                    className="size-full object-contain"
                                />
                            </span>
                        ) : null}
                        <div className="flex min-w-0 flex-col gap-0.5 wrap-break-words">
                            {sender.business ? (
                                <p className="text-[17px] leading-6 font-bold tracking-tight text-on-surface">{sender.business}</p>
                            ) : null}
                            {sender.name ? (
                                <p className="text-[13px] leading-5 font-medium text-on-surface-variant">{sender.name}</p>
                            ) : null}
                            {sender.email || sender.country ? (
                                <div className="mt-1.5 flex flex-col gap-1">
                                    {sender.email ? (
                                        <p className="flex items-center gap-1.5 text-[12px] leading-4 text-muted">
                                            <Mail size={12} aria-hidden="true" className="shrink-0" />
                                            <span className="min-w-0 truncate">{sender.email}</span>
                                        </p>
                                    ) : null}
                                    {sender.country ? (
                                        <p className="flex items-center gap-1.5 text-[12px] leading-4 text-muted">
                                            <MapPin size={12} aria-hidden="true" className="shrink-0" />
                                            <span className="min-w-0 truncate">{sender.country}</span>
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                        <p className="rounded-sm bg-surface-container-high px-3 py-1 text-label-num-sm uppercase">INVOICE</p>
                        {resolvedMeta.invoiceNumber ? (
                            <p className="text-xl font-bold tracking-tight text-on-surface tabular-nums">{resolvedMeta.invoiceNumber}</p>
                        ) : null}
                    </div>
                </div>
                <div className="pb-6 border-b border-line flex flex-wrap justify-between gap-x-6 gap-y-4">
                    {hasClient ? (
                        <div className="flex min-w-0 flex-col gap-1 wrap-break-words">
                            <p className="uppercase text-label-num-sm text-muted">Billed To</p>
                            {client.company ? (
                                <p className="text-body-md font-semibold text-on-surface">{client.company}</p>
                            ) : null}
                            {client.name ? (
                                <p className="text-label-num-sm text-on-surface-variant">{client.name}</p>
                            ) : null}
                            {client.email ? (
                                <p className="text-label-num-sm text-primary">{client.email}</p>
                            ) : null}
                            {client.address ? (
                                <p className="text-[11px] font-medium text-muted">{client.address}</p>
                            ) : null}
                            {client.taxId ? (
                                <p className="text-[11px] font-medium text-muted">TaxID: {client.taxId}</p>
                            ) : null}
                        </div>
                    ) : null}
                    {hasMetaRows ? (
                        <div className="flex flex-col gap-1 items-end">
                            <p className="uppercase text-label-num-sm text-muted">Invoice Details</p>
                            {issuedLabel ? (
                                <div className="flex gap-2 items-center justify-center">
                                    <span className={paperLabel}>Issued:</span>
                                    <b className={paperValue}>{issuedLabel}</b>
                                </div>
                            ) : null}
                            {dueLabel ? (
                                <div className="flex gap-2 items-center justify-center">
                                    <span className={paperLabel}>Due:</span>
                                    <b className={paperValue}>{dueLabel}</b>
                                </div>
                            ) : null}
                            {resolvedMeta.currency ? (
                                <div className="flex gap-2 items-center justify-center">
                                    <span className={paperLabel}>Currency:</span>
                                    <b className={paperValue}>{resolvedMeta.currency}</b>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <div>
                    <div className="grid grid-cols-[minmax(80px,1fr)_34px_62px_73px] gap-1.25 bg-surface-container p-2 font-mono font-medium text-[11px] tracking-wider text-muted uppercase">
                        <span>DESCRIPTION</span>
                        <span className="text-right">QTY</span>
                        <span className="text-right">RATE</span>
                        <span className="text-right">AMOUNT</span>
                    </div>
                    {displayItems.map((i) => (
                        <div
                            key={i.id}
                            className="grid grid-cols-[minmax(80px,1fr)_34px_62px_73px] gap-1.25 border-b border-line px-2 py-3.25 font-medium font-[Inter] text-[11px] text-on-surface"
                        >
                            <p className="min-w-0 wrap-break-words">{i.description}</p>
                            <span className="text-right">{i.quantity}</span>
                            <span className="text-right">{money(i.rate)}</span>
                            <b className="text-right">{money(i.quantity * i.rate)}</b>
                        </div>
                    ))}
                </div>
                <div className="mt-6.25 ml-auto grid w-60 max-w-full gap-2.5">
                    <span className="flex justify-between text-[12px] text-on-surface-variant font-[Inter]">
                        Subtotal <b className="text-on-surface font-semibold text-[14px]">{money(subtotal)}</b>
                    </span>
                    {displayDiscount ? (
                        <span className="flex justify-between text-[12px] text-on-surface-variant font-[Inter]">
                            Discount
                            {displayDiscount.type === "percentage" ? ` (${displayDiscount.value}%)` : ""}
                            {displayDiscount.reason.trim() ? ` · ${displayDiscount.reason.trim()}` : ""}{" "}
                            <b className="text-on-surface font-semibold text-[14px]">−{money(discountAmount)}</b>
                        </span>
                    ) : null}
                    {displayTax ? (
                        <span className="flex justify-between text-[12px] text-on-surface-variant font-[Inter]">
                            {displayTax.type} ({displayTax.rate}%){" "}
                            <b className="text-on-surface font-semibold text-[14px]">{money(taxAmount)}</b>
                        </span>
                    ) : null}
                    <div className="flex items-center justify-between p-3 text-sm text-on-surface bg-surface-container-low rounded-sm font-mono">
                        Total due: <b className="font-mono font-bold text-[28px] text-primary">{money(total)}</b>
                    </div>
                    <div className="flex flex-col items-end py-1.5 px-3 bg-surface-container-low/70 rounded-sm">
                        <p className="uppercase text-[10px] text-muted tracking-wider">Amount in words:</p>
                        <p className="text-right text-[11px] font-medium text-on-surface-variant leading-4.25">{amountInWords}</p>
                    </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-line">
                    <div className="flex items-center gap-2 border-b border-line bg-surface-container-low px-4 py-2.5">
                        <Landmark size={14} aria-hidden="true" className="shrink-0 text-primary" />
                        <p className="text-[12px] font-semibold text-on-surface">Payment Instructions</p>
                    </div>
                    <div className="flex items-start gap-5 px-4 py-3.5 max-sm:flex-col max-sm:gap-3">
                        <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 max-sm:grid-cols-1">
                            {bankRows.map((row) => (
                                <div key={row.label} className="min-w-0">
                                    <dt className="text-[10px] font-medium tracking-wider text-muted uppercase">
                                        {row.label}
                                    </dt>
                                    <dd className="mt-0.5 truncate text-[12.5px] font-semibold text-on-surface tabular-nums" title={row.value}>
                                        {row.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        {bankDetails?.qrImage ? (
                            <figure className="flex w-26 shrink-0 flex-col items-center gap-1.5">
                                <Image
                                    width={96}
                                    height={96}
                                    src={bankDetails.qrImage}
                                    alt="Scan to pay QR code"
                                    className="size-24 rounded-md border border-line bg-white object-contain p-1.5 shadow-sm"
                                />
                                <figcaption className="text-[10px] font-medium tracking-wider text-muted uppercase">
                                    Scan to pay
                                </figcaption>
                            </figure>
                        ) : null}
                    </div>
                    {sender.taxID || resolvedNotes ? (
                        <div className="flex flex-col gap-1.5 border-t border-line bg-surface-container-low/60 px-4 py-3">
                            {sender.taxID ? (
                                <p className="text-[11px] text-on-surface-variant">
                                    <span className="font-medium tracking-wider text-muted uppercase">Tax / PAN ID: </span>
                                    <span className="font-semibold text-on-surface tabular-nums">{sender.taxID}</span>
                                </p>
                            ) : null}
                            {resolvedNotes ? (
                                <p className="text-[11px] leading-4.5 text-muted italic">{resolvedNotes}</p>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </aside>
    );
}
