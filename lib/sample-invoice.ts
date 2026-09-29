import type { InvoiceDetails, InvoiceItem, InvoiceMeta } from "@/types/invoice";

// Sample content shown in the live preview (and as editor placeholders)
// while the corresponding form fields are still empty. Once the user types
// into a field, the typed value takes over in the preview.
export const SAMPLE_META: InvoiceMeta = {
    invoiceNumber: "INV-2026-001",
    issueDate: "2026-03-01",
    paymentTerms: "Net 15 Days",
    currency: "USD",
};

export const SAMPLE_DETAILS: InvoiceDetails = {
    senderName: "Sanjeep Banjara",
    senderBusiness: "Sanjeep Ltd.",
    senderEmail: "billing@sanjeep.com",
    senderPhone: "9876543210",
    senderTaxId: "849204910",
    senderCountry: "Kathmandu, Nepal",
    senderLogo: "",
    clientCompany: "Apple",
    clientName: "Steve Jobs",
    clientEmail: "hello@apple.com",
    clientPhone: "9876543210",
    clientTaxId: "942298120",
    clientAddress: "California, USA",
};

export const SAMPLE_ITEMS: InvoiceItem[] = [
    { id: "sample-1", description: "Identity & strategy workshop", quantity: 1, rate: 1800 },
    { id: "sample-2", description: "Website interface design", quantity: 2, rate: 1250 },
];

export const SAMPLE_NOTES =
    "Thank you for the opportunity to collaborate. Payment is due within 15 days of the invoice date.";
