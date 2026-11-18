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

export interface LineItemErrors {
    description?: string;
    quantity?: string;
    rate?: string;
}

// Per-row checks shared by validateInvoice (export gate) and the editor's
// inline errors: description must be non-empty, quantity and rate must be
// finite numbers greater than 0 (so rate = 0 never passes).
export function getLineItemErrors(
    item: InvoiceItem,
    label = "Line item",
): LineItemErrors {
    const errors: LineItemErrors = {};
    if (!String(item.description ?? "").trim()) {
        errors.description = `${label} description is required`;
    }
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || !(quantity > 0)) {
        errors.quantity = `${label} quantity must be greater than 0`;
    }
    const rate = Number(item.rate);
    if (!Number.isFinite(rate) || !(rate > 0)) {
        errors.rate = `${label} rate must be greater than 0`;
    }
    return errors;
}

// Mirrors the `required` markers in the editor: invoice setup, sender
// name/email, client company, every line item, and bank routing.
export function validateInvoice(input: ValidationInput): string[] {
    const { items, meta, details, bankDetails } = input;
    const missing: string[] = [];

    if (!meta.invoiceNumber.trim()) missing.push("Invoice Number");
    if (!meta.issueDate.trim()) missing.push("Issue Date");
    if (!meta.currency.trim()) missing.push("Currency");

    if (!details.senderName.trim()) missing.push("Sender Name");
    if (!details.senderEmail.trim()) missing.push("Sender Email");

    if (!details.clientCompany.trim()) missing.push("Client / Company Name");
    if (items.length === 0) {
        missing.push("At least one line item");
    } else {
        items.forEach((item, index) => {
            const tag = items.length > 1 ? `Item ${index + 1}` : "Line item";
            const errors = getLineItemErrors(item, tag);
            if (errors.description) missing.push(errors.description);
            if (errors.quantity) missing.push(errors.quantity);
            if (errors.rate) missing.push(errors.rate);
        });
    }

    if (!bankDetails.accountHolder.trim()) missing.push("Account Holder Name");
    if (!bankDetails.bankAndBranch.trim()) missing.push("Bank and Branch");
    if (!bankDetails.accountNumber.trim()) missing.push("Account Number");

    return missing;
}
