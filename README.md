# Invoxa — Invoice Generator

A client-side invoice builder with a live preview, browser-local saved profiles, and direct PDF export. There is no backend, account, or environment setup required — invoice data stays in the browser unless you download or share it.

## Features

- Live editor and print-styled invoice preview, with an Edit / Preview tab layout on small screens.
- Sample content is shown before editing. Once editing starts, required fields keep their sample fallback so the sheet stays readable, while optional fields drop their samples.
- Reorderable line items with per-row validation for description, quantity, and rate.
- Optional percentage/fixed discount and VAT / Service Tax / GST configuration.
- Saved issuer, client, and payment-detail profiles stored locally for reuse.
- Invoice history: exported or shared invoices are archived locally and can be reopened; re-saving the same invoice number updates its entry.
- Payment QR upload with PNG/JPEG validation, size limit, and QR decoding.
- Direct vector PDF download, browser print, PDF file sharing via the Web Share API, and an email fallback that prepares the PDF plus a `mailto:` draft.
- PDF layout handles long descriptions, rates, amounts, and many items across multiple pages.
- Reset restores the initial blank form, including one empty line item.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript and ESLint
- Tailwind CSS 4
- jsPDF + jsPDF-AutoTable for PDF generation
- jsQR for payment QR validation
- lucide-react for icons
- date-fns, clsx, and tailwind-merge for utilities

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- pnpm 11.25.0 (the version pinned in `package.json`; Corepack can install it)

### Install and run

```bash
corepack enable
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `pnpm dev`               | Start the development server.      |
| `pnpm build`             | Create a production build.         |
| `pnpm start`             | Serve the production build.        |
| `pnpm lint`              | Run ESLint.                        |
| `pnpm exec tsc --noEmit` | Type-check without emitting files. |

## How it works

### Sample data and validation

Sample values live in `lib/sample-invoice.ts`. `app/page.tsx` tracks whether the user has edited anything and passes `showSample={!hasEdited}` to the preview.

Required fields are defined in `lib/validation.ts`:

- Invoice number, issue date, and currency
- Sender name and email
- Client / company name
- At least one valid line item
- Account holder, bank and branch, and account number

Export and share actions are blocked until all required fields are valid, and the UI lists what is missing.

### Local storage

All persistence is browser-local under these keys:

| Key                               | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `invoxa:saved-issuers:v1`         | Saved sender profiles, including logos.           |
| `invoxa:saved-clients:v1`         | Saved client profiles.                            |
| `invoxa:saved-payment-details:v1` | Saved bank details and payment QR images.         |
| `invoxa:invoice-history:v1`       | Archived invoice snapshots, capped at 50 entries. |

Profiles are identified by a meaningful field (business/name, company, or account number), so re-saving updates the existing entry instead of creating a duplicate. Payment profiles are capped at 20 entries because QR images are stored as data URLs. Clearing site data removes all saved profiles and history.

### PDF, print, and sharing

`lib/export-pdf.ts` builds the PDF directly in the browser. Text is wrapped against font metrics, table cells can break onto multiple lines, and block heights are measured so totals and payment sections do not overlap. Page-break guards keep short blocks together when invoices span multiple pages.

`lib/share-pdf.ts` reuses the same PDF for file sharing. If the browser cannot attach files, it downloads the PDF instead. Email uses a `mailto:` draft and asks the user to attach the downloaded PDF, since email links cannot carry attachments.

Printing uses the same preview markup with print-specific CSS that hides the app chrome and prints only the invoice sheet.

## Project structure

```text
app/
  layout.tsx          Fonts and root metadata
  page.tsx            Editor state, history, export/share wiring
components/
  EditorPanel.tsx     Form cards and section layout
  LineItemsCard.tsx   Line item table, drag reordering, inline errors
  InvoicePreview.tsx  On-screen and print invoice sheet
  Header.tsx          Actions, sharing, and invoice history
  BankDetails.tsx     Bank fields and QR upload
  PaymentSave.tsx     Saved payment-detail control
  IssuerSave.tsx      Saved sender profiles
  ClientSave.tsx      Saved client profiles
lib/
  validation.ts       Canonical required-field rules
  sample-invoice.ts   Default sample content
  export-pdf.ts       PDF generation and layout
  share-pdf.ts        Web Share / email fallback
  invoice-history.ts  Local invoice snapshot persistence
  saved-*.ts          Local profile persistence
  invoice-totals.ts   Subtotal, discount, tax, and grand total
  invoice-dates.ts    Date and due-date formatting
types/invoice.ts      Shared invoice types
```

## Configuration

No environment variables are required. If this app is deployed publicly and you want a stable share subject or branded filename, add that configuration in `lib/share-invoice.ts` / `lib/export-pdf.ts` rather than reading `window.location.origin` inside the PDF builder.

## Development notes

The repository uses 4-space indentation, LF line endings, and long lines. Workspace settings in `.vscode/settings.json` disable format-on-save to prevent whole-file reformatting; `.editorconfig`, `biome.json`, and `.gitattributes` keep editor and Git behavior consistent.

Run `pnpm lint` and `pnpm exec tsc --noEmit` before committing, and `pnpm build` when changing PDF or print logic.

## Deploy

Build normally and deploy to any Node.js host, for example Vercel:

```bash
pnpm build
pnpm start
```

The app is fully static/client-side, so no database or server configuration is needed.
