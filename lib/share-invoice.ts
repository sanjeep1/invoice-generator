import { computeTotals, parseCurrencyCode } from "@/lib/invoice-totals";
import { formatDueDate, formatPaperDate } from "@/lib/invoice-dates";
import { SAMPLE_DETAILS, SAMPLE_DISCOUNT, SAMPLE_ITEMS, SAMPLE_META, SAMPLE_NOTES, SAMPLE_TAX } from "@/lib/sample-invoice";
import { formatCurrency, numberToWords } from "@/lib/utils";
import type {
    BankAccountDetails,
    DiscountConfig,
    InvoiceDetails,
    InvoiceItem,
    InvoiceMeta,
    TaxConfig,
} from "@/types/invoice";

export interface ShareInput {
    items: InvoiceItem[];
    meta: InvoiceMeta;
    details: InvoiceDetails;
    notes: string;
    bankDetails: BankAccountDetails;
    discount?: DiscountConfig;
    tax?: TaxConfig;
    showSample: boolean;
}

// Plain-text rendering of the current invoice (same resolved data and totals
// as the preview/PDF) for copy-to-clipboard, native share, and email.
export function buildShareText(input: ShareInput): string {
    const { items, meta, details, notes, bankDetails, discount, tax, showSample } = input;
    const pick = (raw: string | undefined, sample: string) =>
        raw?.trim() || (showSample ? sample : "");

    const invoiceNumber = pick(meta.invoiceNumber, SAMPLE_META.invoiceNumber);
    const issueDate = pick(meta.issueDate, SAMPLE_META.issueDate);
    const paymentTerms = pick(meta.paymentTerms, SAMPLE_META.paymentTerms);
    const currencyCode = parseCurrencyCode(pick(meta.currency, SAMPLE_META.currency));
    const money = (amount: number) => {
        try {
            return formatCurrency(amount, currencyCode);
        } catch {
            return formatCurrency(amount);
        }
    };
    const displayItems = items.length > 0 ? items : showSample ? SAMPLE_ITEMS : [];
    const resolvedDiscount = discount?.enabled ? discount : showSample ? SAMPLE_DISCOUNT : undefined;
    const resolvedTax = tax?.enabled ? tax : showSample ? SAMPLE_TAX : undefined;
    const { subtotal, discountAmount, taxAmount, total } = computeTotals(
        displayItems,
        resolvedDiscount,
        resolvedTax,
    );

    const lines: string[] = [];
    lines.push(`INVOICE${invoiceNumber ? ` ${invoiceNumber}` : ""}`);
    const senderBits = [
        pick(details.senderName, SAMPLE_DETAILS.senderName),
        pick(details.senderBusiness, SAMPLE_DETAILS.senderBusiness),
    ].filter(Boolean);
    if (senderBits.length > 0) lines.push(`From: ${senderBits.join(" · ")}`);
    const clientBits = [
        pick(details.clientCompany, SAMPLE_DETAILS.clientCompany),
        pick(details.clientName, SAMPLE_DETAILS.clientName),
    ].filter(Boolean);
    if (clientBits.length > 0) lines.push(`Billed to: ${clientBits.join(" · ")}`);
    const issuedLabel = formatPaperDate(issueDate);
    const dueLabel = formatDueDate(issueDate, paymentTerms);
    if (issuedLabel) lines.push(`Issued: ${issuedLabel}`);
    if (dueLabel) lines.push(`Due: ${dueLabel}`);
    lines.push("");
    lines.push("ITEMS");
    for (const i of displayItems) {
        lines.push(
            `- ${i.description || "(no description)"} — ${i.quantity} x ${money(i.rate)} = ${money(i.quantity * i.rate)}`,
        );
    }
    lines.push("");
    lines.push(`Subtotal: ${money(subtotal)}`);
    if (resolvedDiscount) {
        const label = `Discount${resolvedDiscount.type === "percentage" ? ` (${resolvedDiscount.value}%)` : ""}${resolvedDiscount.reason.trim() ? ` · ${resolvedDiscount.reason.trim()}` : ""}`;
        lines.push(`${label}: -${money(discountAmount)}`);
    }
    if (resolvedTax) {
        lines.push(`${resolvedTax.type} (${resolvedTax.rate}%): ${money(taxAmount)}`);
    }
    lines.push(`Total due: ${money(total)}`);
    lines.push(`Amount in words: ${numberToWords(total, currencyCode)}`);
    const bankLines = [
        bankDetails.accountHolder && `Account Holder: ${bankDetails.accountHolder}`,
        bankDetails.bankAndBranch && `Bank & Branch: ${bankDetails.bankAndBranch}`,
        bankDetails.accountNumber && `Account Number: ${bankDetails.accountNumber}`,
        bankDetails.swiftCode && `SWIFT: ${bankDetails.swiftCode}`,
        bankDetails.paymentReference && `Reference: ${bankDetails.paymentReference}`,
    ].filter(Boolean) as string[];
    if (bankLines.length > 0) {
        lines.push("");
        lines.push("PAYMENT");
        lines.push(...bankLines);
    }
    const resolvedNotes = pick(notes, SAMPLE_NOTES);
    if (resolvedNotes) {
        lines.push("");
        lines.push(resolvedNotes);
    }
    return lines.join("\n");
}

export function buildShareSubject(input: Pick<ShareInput, "meta" | "showSample">): string {
    const number =
        input.meta.invoiceNumber?.trim() ||
        (input.showSample ? SAMPLE_META.invoiceNumber : "");
    return number ? `Invoice ${number}` : "Invoice";
}
