import type {
    BankAccountDetails,
    InvoiceDetails,
    InvoiceItem,
    InvoiceMeta,
} from "@/types/invoice";

export interface ValidationInput {
    items: InvoiceItem[];
    meta: InvoiceMeta;
    details: InvoiceDetails;
    bankDetails: BankAccountDetails;
}

// Mirrors the `required` markers in the editor: invoice setup, sender
// name/email, client company/email, every line item, and bank routing.
export function validateInvoice(input: ValidationInput): string[] {
    const { items, meta, details, bankDetails } = input;
    const missing: string[] = [];

    if (!meta.invoiceNumber.trim()) missing.push("Invoice Number");
    if (!meta.issueDate.trim()) missing.push("Issue Date");
    if (!meta.currency.trim()) missing.push("Currency");

    if (!details.senderName.trim()) missing.push("Sender Name");
    if (!details.senderEmail.trim()) missing.push("Sender Email");

    if (!details.clientCompany.trim()) missing.push("Client / Company Name");
    if (!details.clientEmail.trim()) missing.push("Client Email");

    if (items.length === 0) {
        missing.push("At least one line item");
    } else {
        items.forEach((item, index) => {
            const tag = items.length > 1 ? `Item ${index + 1}` : "Line item";
            if (!item.description.trim()) missing.push(`${tag} description`);
            if (!(item.quantity > 0)) missing.push(`${tag} quantity`);
            if (!(item.rate > 0)) missing.push(`${tag} rate`);
        });
    }

    if (!bankDetails.accountHolder.trim()) missing.push("Account Holder Name");
    if (!bankDetails.bankAndBranch.trim()) missing.push("Bank and Branch");
    if (!bankDetails.accountNumber.trim()) missing.push("Account Number");

    return missing;
}
