import type { DiscountConfig, InvoiceDetails, InvoiceItem, InvoiceMeta, TaxConfig } from "@/types/invoice";

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

// Sample discount/tax shown in the preview/PDF/share text before the user
// enables the real controls. Matches the editor's default 10% / VAT 13%.
export const SAMPLE_DISCOUNT: DiscountConfig = {
    enabled: true,
    type: "percentage",
    value: 10,
    reason: "",
};

export const SAMPLE_TAX: TaxConfig = {
    enabled: true,
    type: "VAT",
    rate: 13,
};

// Sample brand mark shown on the preview letterhead before the user uploads
// a logo. Points at public/brandlogo.svg; preview-only (PDF can't embed SVG).
export const SAMPLE_LOGO = "/brandlogo.svg";
