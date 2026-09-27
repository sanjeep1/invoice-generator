import { useMemo } from "react";
import Image from "next/image";
import { formatCurrency, numberToWords } from "@/lib/utils";
import type {
    BankAccountDetails,
    InvoiceDetails,
    InvoiceItem,
    InvoiceMeta,
} from "@/types/invoice";
import { SquareDimensions } from "lucide-react";

type InvoicePreviewProps = {
    items: InvoiceItem[];
    taxRate?: number;
    meta?: InvoiceMeta;
    details?: InvoiceDetails;
    notes?: string;
    bankDetails?: BankAccountDetails;
};

const paperLabel = "font-inter text-[12px] tracking-wider text-muted";
const paperValue = "text-[11px] text-on-surface";

// Strict ISO parser (local time, avoiding the UTC shift of `new Date(str)`).
// Returns null for blank/invalid input so callers can show a fallback.
function parseIssueDate(raw: string): Date | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) return null;
    const [, y, m, d] = isoMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatPaperDate(raw: string): string | null {
    const parsed = parseIssueDate(raw);
    if (!parsed) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    }).format(parsed);
}

// Extracts the day count from free text like "Net 15 Days".
function parseTermsDays(raw: string): number | null {
    const match = raw.match(/(\d+)/);
    if (!match) return null;
    const days = Number(match[1]);
    return Number.isNaN(days) ? null : days;
}

// Due date = issue date + terms days; null when either is unparseable.
function formatDueDate(issueRaw: string, termsRaw: string): string | null {
    const issued = parseIssueDate(issueRaw);
    const days = parseTermsDays(termsRaw);
    if (!issued || days === null) return null;
    const due = new Date(issued);
    due.setDate(due.getDate() + days);
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    }).format(due);
}

// Normalizes currency input to an Intl code: 3-letter codes pass through,
// bare symbols (€/₹/£/$) map to their currency, otherwise USD.
function parseCurrencyCode(raw: string): string {
    const codeMatch = raw.match(/\b([A-Za-z]{3})\b/);
    if (codeMatch) return codeMatch[1].toUpperCase();
    if (raw.includes("€")) return "EUR";
    if (raw.includes("₹")) return "INR";
    if (raw.includes("£")) return "GBP";
    if (raw.includes("$")) return "USD";
    return "USD";
}

export default function InvoicePreview({
    items,
    taxRate = 0.19,
    meta,
    details,
    notes,
    bankDetails,
}: InvoicePreviewProps) {
    // Raw trimmed values with no dummy fallbacks: the initial state in
    // `app/page.tsx` carries the presentable defaults, so the sheet is full
    // on first paint — but once the user clears a field, its line hides
    // instead of resurrecting placeholder data.
    const resolvedMeta = {
        invoiceNumber: meta?.invoiceNumber?.trim() ?? "",
        issueDate: meta?.issueDate?.trim() ?? "",
        paymentTerms: meta?.paymentTerms?.trim() ?? "",
        currency: meta?.currency?.trim() ?? "",
    };
    const sender = {
        name: details?.senderName?.trim() ?? "",
        business: details?.senderBusiness?.trim() ?? "",
        email: details?.senderEmail?.trim() ?? "",
        country: details?.senderCountry?.trim() ?? "",
        taxID: details?.senderTaxId?.trim() ?? "",
    };
    const client = {
        company: details?.clientCompany?.trim() ?? "",
        name: details?.clientName?.trim() ?? "",
        email: details?.clientEmail?.trim() ?? "",
        address: details?.clientAddress?.trim() ?? "",
        taxId: details?.clientTaxId?.trim() ?? "",
    };
    const resolvedNotes = notes?.trim() ?? "";

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
    const subtotal = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity * i.rate, 0),
        [items],
    );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const amountInWords = numberToWords(total, currencyCode);
    const issuedLabel = formatPaperDate(resolvedMeta.issueDate);
    const dueLabel = formatDueDate(resolvedMeta.issueDate, resolvedMeta.paymentTerms);
    const hasMetaRows = Boolean(issuedLabel || dueLabel || resolvedMeta.currency);
    const hasClient = Boolean(
        client.company || client.name || client.email || client.address || client.taxId,
    );

    return (
        <aside className="min-h-337.5 rounded-lg p-4 max-lg:min-h-0 max-md:p-2 gap-4">
            <div className="mb-2 px-2 flex items-center justify-between">
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
            <div className="flex flex-col mx-auto min-h-262.5 bg-white px-9.5 py-10.5 gap-6 shadow-sheet max-lg:max-w-150 max-md:px-5 max-md:py-7">
                <div className="flex items-center justify-between pb-6 gap-1.5 text-primary">
                    <div className="flex flex-row items-center gap-2">
                        {details?.senderLogo ? (
                            <Image
                                src={details.senderLogo}
                                alt={`${sender.business} logo`}
                                width={64}
                                height={64}
                                className="size-16 shrink-0 object-contain"
                            />
                        ) : null}
                        <div className="flex flex-col items-start">
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
                    <div className="flex flex-col gap-1">
                        <p className="py-1 px-3 rounded-sm bg-surface-container-high text-label-num-sm uppercase">INVOICE</p>
                        {resolvedMeta.invoiceNumber ? (
                            <p className="text-headline-sm text-on-surface">{resolvedMeta.invoiceNumber}</p>
                        ) : null}
                    </div>
                </div>
                <div className="pb-6 border-b border-line flex justify-between gap-6">
                    {hasClient ? (
                        <div className="flex flex-col gap-1">
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
                            <span className="text-right">{money(i.rate)}</span>
                            <b className="text-right">{money(i.quantity * i.rate)}</b>
                        </div>
                    ))}
                </div>
                <div className="mt-6.25 ml-auto grid w-60 gap-2.5">
                    <span className="flex justify-between text-[11px] text-on-surface-variant">
                        Subtotal <b className="text-on-surface">{money(subtotal)}</b>
                    </span>
                    <span className="flex justify-between text-[11px] text-on-surface-variant">
                        VAT ({Math.round(taxRate * 100)}%){" "}
                        <b className="text-on-surface">{money(tax)}</b>
                    </span>
                    <strong className="flex justify-between border-t border-ink pt-3 text-sm text-on-surface">
                        Total due <b>{money(total)}</b>
                    </strong>
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
                    <p className="mt-4 text-label-num-sm">Tax / PAN ID: {sender.taxID}</p>
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
