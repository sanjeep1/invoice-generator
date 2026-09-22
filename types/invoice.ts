export interface InvoiceItem {
  id: string;
  description: string;
  rate: number;
  quantity: number;
}

export interface InvoiceData {
  // Invoice Setup
  invoiceNumber: string;
  issueDate: string;
  paymentTerms: string;
  currency: string;

  // Sender (Your Details)
  senderName: string;
  senderBusiness: string;
  senderEmail: string;
  senderTaxId: string;
  senderCountry: string;

  // Client (Billed To)
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientTaxId: string;
  clientAddress: string;

  // Items
  items: InvoiceItem[];

  // Tax & Discount
  taxRate: number;
  applyTax: boolean;
  discountValue: number;
  applyDiscount: boolean;

  // Notes
  notes: string;

  // Bank Details
  accountHolder: string;
  bankName: string;
  iban: string;
  bic: string;
  paymentReference: string;
}