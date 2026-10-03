import { useMemo } from "react";
import Image from "next/image";
import { formatCurrency, numberToWords } from "@/lib/utils";
import { computeTotals, parseCurrencyCode } from "@/lib/invoice-totals";
import { formatDueDate, formatPaperDate } from "@/lib/invoice-dates";
import { SAMPLE_DETAILS, SAMPLE_ITEMS, SAMPLE_META, SAMPLE_NOTES } from "@/lib/sample-invoice";
import type {
    BankAccountDetails,
    DiscountConfig,
    InvoiceDetails,
    InvoiceItem,
    InvoiceMeta,
    TaxConfig,
} from "@/types/invoice";
import { SquareDimensions } from "lucide-react";

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

    // Shared payment-instructions block: only non-empty bank fields print
    const paymentInstructions = (
        <div>
            <b className="text-[11px] text-on-surface">Payment Instructions</b>
            <p className="text-[11px] leading-4.25 text-on-surface-variant">
                {bankDetails?.accountHolder ? (
                    <>
                        Account Holder: {bankDetails.accountHolder}
                        <br />
                    </>
                ) : null}
                {bankDetails?.bankAndBranch ? (
                    <>
                        Bank Name &amp; Branch: {bankDetails.bankAndBranch}
                        <br />
                    </>
                ) : null}
                {bankDetails?.accountNumber ? (
                    <>
                        Account Number: {bankDetails.accountNumber}
                        <br />
                    </>
                ) : null}
                {bankDetails?.swiftCode ? (
                    <>
                        SWIFT: {bankDetails.swiftCode}
                        <br />
                    </>
                ) : null}
                {bankDetails?.paymentReference ? (
                    <>Reference: {bankDetails.paymentReference}</>
                ) : null}
                {!bankDetails?.accountHolder &&
                    !bankDetails?.bankAndBranch &&
                    !bankDetails?.accountNumber &&
                    !bankDetails?.swiftCode &&
                    !bankDetails?.paymentReference ? (
                    <>
                        Account Number: 0037000012345678
                        <br />
                        SWIFT: COBADEFFXXX
                    </>
                ) : null}
            </p>
        </div>
    );
    const currencyCode = parseCurrencyCode(resolvedMeta.currency);
    // Currency-aware formatter with a USD fallback for unknown codes.
    const money = (amount: number) => {
        try {
            return formatCurrency(amount, currencyCode);
        } catch {
            return formatCurrency(amount);
        }
    };
    const { subtotal, discountAmount, taxAmount, total } = useMemo(
        () => computeTotals(displayItems, discount, tax),
        [displayItems, discount, tax],
    );
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
                <div className="flex flex-wrap items-center justify-between pb-6 gap-x-1.5 gap-y-3 text-primary">
                    <div className="flex min-w-0 flex-row items-center gap-2">
                        {details?.senderLogo ? (
                            <Image
                                src={details.senderLogo}
                                alt={`${sender.business} logo`}
                                width={64}
                                height={64}
                                className="size-16 shrink-0 object-contain"
                            />
                        ) : null}
                        <div className="flex min-w-0 flex-col items-start wrap-break-words">
                            {sender.name ? (
                                <p className="text-headline-sm text-on-surface">{sender.name}</p>
                            ) : null}
                            {sender.business ? (
                                <p className="text-headline-sm text-on-surface">{sender.business}</p>
                            ) : null}
                            {sender.email ? (
                                <p className="text-sm text-on-surface-variant">{sender.email}</p>
                            ) : null}
                            {sender.country ? (
                                <p className="text-sm text-on-surface-variant">{sender.country}</p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-center">
                        <p className="py-1 px-3 rounded-sm bg-surface-container-high text-label-num-sm uppercase">INVOICE</p>
                        {resolvedMeta.invoiceNumber ? (
                            <p className="text-headline-sm text-on-surface">{resolvedMeta.invoiceNumber}</p>
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
                    {discount?.enabled ? (
                        <span className="flex justify-between text-[12px] text-on-surface-variant font-[Inter]">
                            Discount
                            {discount.type === "percentage" ? ` (${discount.value}%)` : ""}
                            {discount.reason.trim() ? ` · ${discount.reason.trim()}` : ""}{" "}
                            <b className="text-on-surface font-semibold text-[14px]">−{money(discountAmount)}</b>
                        </span>
                    ) : null}
                    {tax?.enabled ? (
                        <span className="flex justify-between text-[12px] text-on-surface-variant font-[Inter]">
                            {tax.type} ({tax.rate}%){" "}
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
                <div className="p-4 rounded-sm bg-surface-container-low">
                    {bankDetails?.qrImage ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <Image
                                    width={50}
                                    height={50}
                                    src={bankDetails.qrImage}
                                    alt="Payment QR code"
                                    className="size-20 rounded-sm border border-line bg-white object-contain p-1"
                                />
                            </div>
                            {paymentInstructions}
                        </div>
                    ) : (
                        paymentInstructions
                    )}
                    {sender.taxID ? (
                        <p className="mt-4 text-label-num-sm">Tax / PAN ID: {sender.taxID}</p>
                    ) : null}

                    <div>
                        {resolvedNotes ? (
                            <small className="mt-2 block text-[11px] text-muted">
                                {resolvedNotes}
                            </small>
                        ) : null}
                    </div>
                </div>
            </div>
        </aside>
    );
}
