import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

export interface PdfExportInput {
    items: InvoiceItem[];
    meta: InvoiceMeta;
    details: InvoiceDetails;
    notes: string;
    bankDetails: BankAccountDetails;
    discount?: DiscountConfig;
    tax?: TaxConfig;
    showSample: boolean;
}

// Palette mirrors app/globals.css so the PDF reads like the on-screen sheet.
const INK: [number, number, number] = [19, 27, 46];
const VARIANT: [number, number, number] = [70, 69, 85];
const MUTED: [number, number, number] = [119, 117, 135];
const LINE: [number, number, number] = [229, 229, 238];
const BAND: [number, number, number] = [242, 243, 255];
const BADGE: [number, number, number] = [226, 231, 255];
const PRIMARY: [number, number, number] = [53, 37, 205];

function imageFormat(dataUrl: string): "PNG" | "JPEG" | null {
    if (dataUrl.startsWith("data:image/png")) return "PNG";
    if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg"))
        return "JPEG";
    return null;
}

// jsPDF's plain text calls never wrap. Split user-supplied strings against the
// current font metrics so long values stay inside the printable area.
function wrappedLines(doc: jsPDF, text: string, maxWidth: number): string[] {
    return text
        ? (doc.splitTextToSize(text, Math.max(1, maxWidth)) as string[])
        : [];
}

function drawWrapped(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: "left" | "right" = "left",
): number {
    const lines = wrappedLines(doc, text, maxWidth);
    if (lines.length === 0) return y;
    doc.text(lines, x, y, { align });
    return y + lines.length * lineHeight;
}

// Builds the styled invoice document and its download filename. Split out
// from downloadInvoicePdf so output can be inspected programmatically.
export function buildInvoicePdf(input: PdfExportInput): { doc: jsPDF; filename: string } {
    const { items, meta, details, notes, bankDetails, discount, tax, showSample } = input;
    const pick = (raw: string | undefined, sample: string) =>
        raw?.trim() || (showSample ? sample : "");

    const invoiceNumber = pick(meta.invoiceNumber, SAMPLE_META.invoiceNumber);
    const issueDate = pick(meta.issueDate, SAMPLE_META.issueDate);
    const paymentTerms = pick(meta.paymentTerms, SAMPLE_META.paymentTerms);
    const currency = pick(meta.currency, SAMPLE_META.currency);
    const currencyCode = parseCurrencyCode(currency);
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

    const sender = {
        name: pick(details.senderName, SAMPLE_DETAILS.senderName),
        business: pick(details.senderBusiness, SAMPLE_DETAILS.senderBusiness),
        email: pick(details.senderEmail, SAMPLE_DETAILS.senderEmail),
        country: pick(details.senderCountry, SAMPLE_DETAILS.senderCountry),
        taxID: pick(details.senderTaxId, SAMPLE_DETAILS.senderTaxId),
    };
    const client = {
        company: pick(details.clientCompany, SAMPLE_DETAILS.clientCompany),
        name: pick(details.clientName, SAMPLE_DETAILS.clientName),
        email: pick(details.clientEmail, SAMPLE_DETAILS.clientEmail),
        address: pick(details.clientAddress, SAMPLE_DETAILS.clientAddress),
        taxId: pick(details.clientTaxId, SAMPLE_DETAILS.clientTaxId),
    };
    const issuedLabel = formatPaperDate(issueDate);
    const dueLabel = formatDueDate(issueDate, paymentTerms);
    const resolvedNotes = pick(notes, SAMPLE_NOTES);

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const right = pageWidth - margin;
    const numberMaxWidth = Math.min(right - margin, 80);
    let y = 16;

    // Sender block (logo card + business title / name / email / country),
    // mirroring the preview letterhead hierarchy.
    let textX = margin;
    const logoFormat = details.senderLogo
        ? imageFormat(details.senderLogo)
        : null;
    if (logoFormat) {
        try {
            doc.setDrawColor(...LINE);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, y - 5, 17, 17, 2, 2, "D");
            doc.addImage(
                details.senderLogo,
                logoFormat,
                margin + 1.75,
                y - 3.25,
                13.5,
                13.5,
            );
            textX = margin + 21;
        } catch {
            textX = margin;
        }
    }
    // Reserve the invoice-number column so wrapped sender lines never run
    // underneath the right-aligned number.
    const senderMaxWidth = Math.max(20, right - numberMaxWidth - 4 - textX);
    if (sender.business) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...INK);
        y = drawWrapped(doc, sender.business, textX, y, senderMaxWidth, 6);
    }
    if (sender.name) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...VARIANT);
        y = drawWrapped(doc, sender.name, textX, y, senderMaxWidth, 5);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    if (sender.email) {
        y = drawWrapped(doc, sender.email, textX, y, senderMaxWidth, 4.5);
    }
    if (sender.country) {
        y = drawWrapped(doc, sender.country, textX, y, senderMaxWidth, 4.5);
    }

    // INVOICE badge + number, top right.
    const badgeW = 24;
    const badgeH = 8;
    const badgeY = 10;
    doc.setFillColor(...BADGE);
    doc.roundedRect(right - badgeW, badgeY, badgeW, badgeH, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PRIMARY);
    doc.text("INVOICE", right - badgeW / 2, badgeY + 5.5, { align: "center" });
    let numberLines = 0;
    if (invoiceNumber) {
        doc.setFontSize(12);
        doc.setTextColor(...INK);
        numberLines = wrappedLines(doc, invoiceNumber, numberMaxWidth).length;
        drawWrapped(
            doc,
            invoiceNumber,
            right,
            badgeY + 13,
            numberMaxWidth,
            6,
            "right",
        );
    }
    y = Math.max(y + 2, badgeY + 13 + numberLines * 6, badgeY + 19);

    // Divider.
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(margin, y, right, y);
    y += 7;

    // Billed To (left) / Invoice Details (right).
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const hasClient = Boolean(
        client.company ||
        client.name ||
        client.email ||
        client.address ||
        client.taxId,
    );
    const hasMetaRows = Boolean(issuedLabel || dueLabel || currency);
    if (hasClient) doc.text("BILLED TO", margin, y);
    if (hasMetaRows) doc.text("INVOICE DETAILS", right, y, { align: "right" });
    y += 5;
    const colY = y;
    const clientMaxWidth = (right - margin) * 0.55;
    if (hasClient) {
        let cy = colY;
        if (client.company) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(...INK);
            cy = drawWrapped(doc, client.company, margin, cy, clientMaxWidth, 5);
        }
        if (client.name) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(...VARIANT);
            cy = drawWrapped(doc, client.name, margin, cy, clientMaxWidth, 4.5);
        }
        if (client.email) {
            doc.setFontSize(8.5);
            doc.setTextColor(...PRIMARY);
            cy = drawWrapped(doc, client.email, margin, cy, clientMaxWidth, 4.5);
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        if (client.address) {
            cy = drawWrapped(doc, client.address, margin, cy, clientMaxWidth, 4.5);
        }
        if (client.taxId) {
            cy = drawWrapped(
                doc,
                `TaxID: ${client.taxId}`,
                margin,
                cy,
                clientMaxWidth,
                4.5,
            );
        }
        y = Math.max(y, cy);
    }
    if (hasMetaRows) {
        let my = colY;
        const metaValueWidth = 46;
        const metaRow = (label: string, value: string) => {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(...MUTED);
            const labelLines = wrappedLines(doc, label, 24);
            doc.text(labelLines, right - metaValueWidth - 2, my, { align: "right" });
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(...INK);
            const valueLines = wrappedLines(doc, value, metaValueWidth);
            doc.text(valueLines, right, my, { align: "right" });
            my += Math.max(labelLines.length, valueLines.length) * 5;
        };
        if (issuedLabel) metaRow("Issued:", issuedLabel);
        if (dueLabel) metaRow("Due:", dueLabel);
        if (currency) metaRow("Currency:", currency);
        y = Math.max(y, my);
    }
    y += 4;

    // Line items table.
    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [
            [
                "Description",
                { content: "Qty", styles: { halign: "right" } },
                { content: "Rate", styles: { halign: "right" } },
                { content: "Amount", styles: { halign: "right" } },
            ],
        ],
        body: displayItems.map((i) => [
            i.description,
            String(i.quantity),
            money(i.rate),
            money(i.quantity * i.rate),
        ]),
        theme: "plain",
        styles: {
            fontSize: 9,
            textColor: INK,
            overflow: "linebreak",
            cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
        },
        headStyles: {
            fillColor: BAND,
            textColor: MUTED,
            fontStyle: "bold",
            fontSize: 8,
        },
        bodyStyles: { lineColor: LINE, lineWidth: { bottom: 0.3 } },
        columnStyles: {
            0: { cellWidth: "auto" },
            1: { halign: "right", cellWidth: 18 },
            2: { halign: "right", cellWidth: 32 },
            3: { halign: "right", cellWidth: 36, fontStyle: "bold" },
        },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;

    // Measure wrapped rows first so a long discount reason or amount can't
    // push part of the totals block past the page edge.
    const labelAnchor = right - 44;
    const totalValueWidth = 42;
    const totalLabelWidth = labelAnchor - margin - 3;
    const totalsData = [
        { label: "Subtotal:", value: money(subtotal) },
        ...(resolvedDiscount
            ? [
                    {
                        label: `Discount${resolvedDiscount.type === "percentage" ? ` (${resolvedDiscount.value}%)` : ""}${resolvedDiscount.reason.trim() ? ` \u00B7 ${resolvedDiscount.reason.trim()}` : ""}`,
                        value: `-${money(discountAmount)}`,
                    },
                ]
            : []),
        ...(resolvedTax
            ? [
                    {
                        label: `${resolvedTax.type} (${resolvedTax.rate}%)`,
                        value: money(taxAmount),
                    },
                ]
            : []),
    ].map((row) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const labelLines = wrappedLines(doc, row.label, totalLabelWidth);
        doc.setFont("helvetica", "bold");
        const valueLines = wrappedLines(doc, row.value, totalValueWidth);
        return { ...row, labelLines, valueLines };
    });
    const totalsH =
        totalsData.reduce(
            (sum, row) =>
                sum + Math.max(row.labelLines.length, row.valueLines.length) * 5.5,
            0,
        ) + 17;
    if (y + totalsH + 12 > pageHeight - margin) {
        doc.addPage();
        y = 16;
    }

    // Totals, right aligned like the preview's totals column: labels end at
    // a fixed anchor so long discount reasons can't collide with values.
    for (const row of totalsData) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...VARIANT);
        doc.text(row.labelLines, labelAnchor, y, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...INK);
        doc.text(row.valueLines, right, y, { align: "right" });
        y += Math.max(row.labelLines.length, row.valueLines.length) * 5.5;
    }

    // Total-due band, mirroring the preview's highlighted totals row.
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const bandLabelLines = wrappedLines(doc, "Total due", 32);
    doc.setFontSize(12);
    const bandValueLines = wrappedLines(doc, money(total), 40);
    const totalBandH = Math.max(10, bandValueLines.length * 6 + 4);
    if (y + totalBandH > pageHeight - margin) {
        doc.addPage();
        y = 16;
    }
    doc.setFillColor(...BAND);
    doc.roundedRect(right - 76, y, 76, totalBandH, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...VARIANT);
    doc.text(bandLabelLines, right - 42, y + 6.5, { align: "right" });
    doc.setFontSize(12);
    doc.setTextColor(...PRIMARY);
    doc.text(bandValueLines, right - 2, y + 6.5, { align: "right" });
    y += totalBandH + 7;

    // Amount-in-words band. Split with the render font so the band height
    // matches the lines actually drawn.
    const words = `AMOUNT IN WORDS:  ${numberToWords(total, currencyCode)}`;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const wrappedWords = wrappedLines(doc, words, right - margin - 6);
    const wordsH = wrappedWords.length * 4 + 6;
    if (y + wordsH > pageHeight - margin) {
        doc.addPage();
        y = 16;
    }
    doc.setFillColor(...BAND);
    doc.roundedRect(margin, y, right - margin, wordsH, 1.5, 1.5, "F");
    doc.setTextColor(...VARIANT);
    doc.text(wrappedWords, margin + 3, y + 5);
    y += wordsH + 7;

    // Payment card mirroring the preview footer: header strip, label/value
    // grid, QR card with caption, and a separated tax/notes strip. Content is
    // measured first so the band is painted before text goes over it.
    const qrFormat = bankDetails.qrImage
        ? imageFormat(bankDetails.qrImage)
        : null;
    const qrCard = qrFormat ? 30 : 0;
    const gridW = right - margin - 8 - (qrFormat ? qrCard + 4 : 0);
    const colW = (gridW - 4) / 2;
    const bankRows = [
        bankDetails.accountHolder && {
            label: "ACCOUNT HOLDER",
            value: bankDetails.accountHolder,
        },
        bankDetails.bankAndBranch && {
            label: "BANK & BRANCH",
            value: bankDetails.bankAndBranch,
        },
        bankDetails.accountNumber && {
            label: "ACCOUNT NUMBER",
            value: bankDetails.accountNumber,
        },
        bankDetails.swiftCode && {
            label: "SWIFT / BIC",
            value: bankDetails.swiftCode,
        },
        bankDetails.paymentReference && {
            label: "REFERENCE",
            value: bankDetails.paymentReference,
        },
    ].filter(Boolean) as { label: string; value: string }[];
    const payRows =
        bankRows.length > 0
            ? bankRows
            : [
                    { label: "ACCOUNT NUMBER", value: "0037000012345678" },
                    { label: "SWIFT / BIC", value: "COBADEFFXXX" },
                ];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    const cellLines = payRows.map((row) => ({
        label: row.label,
        lines: wrappedLines(doc, row.value, colW - 1),
    }));
    let gridH = 0;
    for (let r = 0; r < cellLines.length; r += 2) {
        const left = cellLines[r]?.lines.length ?? 0;
        const rightCell = cellLines[r + 1]?.lines.length ?? 0;
        gridH += 3 + Math.max(left, rightCell, 1) * 4 + 2.5;
    }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    const wrappedNotes = wrappedLines(doc, resolvedNotes, right - margin - 8);
    const taxLabel = "TAX / PAN ID:  ";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const taxLabelWidth = doc.getTextWidth(taxLabel);
    doc.setFont("helvetica", "bold");
    const taxLines = sender.taxID
        ? wrappedLines(doc, sender.taxID, right - margin - 8 - taxLabelWidth)
        : [];
    const footH =
        taxLines.length * 5 +
        wrappedNotes.length * 4.5 +
        (taxLines.length > 0 || wrappedNotes.length > 0 ? 4 : 0);
    const boxH = 7 + 5.5 + 1 + 3.5 + gridH + 2 + footH + 4;
    const boxNeededH = qrFormat
        ? Math.max(boxH, 7 + 5.5 + 1 + 3.5 + qrCard + 6 + 4)
        : boxH;
    if (y + boxNeededH > pageHeight - margin) {
        doc.addPage();
        y = 16;
    }
    doc.setFillColor(...BAND);
    doc.roundedRect(margin, y, right - margin, boxNeededH, 1.5, 1.5, "F");

    let boxY = y + 7;
    doc.setFillColor(...PRIMARY);
    // Center the dot on the heading's visual midline, not on its baseline.
    doc.rect(margin + 4, boxY - 2.3, 2.2, 2.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text("Payment Instructions", margin + 8, boxY);
    boxY += 5.5;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(margin + 4, boxY, right - 4, boxY);
    boxY += 3.5;

    const gridX = margin + 4;
    let cellY = boxY;
    for (let r = 0; r < cellLines.length; r += 2) {
        const pair = [cellLines[r], cellLines[r + 1]].filter(Boolean);
        const rowH = 3 + Math.max(...pair.map((c) => c.lines.length), 1) * 4 + 2.5;
        pair.forEach((cell, c) => {
            const cx = gridX + c * (colW + 4);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(...MUTED);
            doc.text(cell.label, cx, cellY + 3);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(...INK);
            doc.text(cell.lines, cx, cellY + 7);
        });
        cellY += rowH;
    }
    if (qrFormat) {
        const qrX = right - 4 - qrCard;
        const qrY = boxY;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...LINE);
        doc.roundedRect(qrX, qrY, qrCard, qrCard, 1.5, 1.5, "FD");
        try {
            doc.addImage(
                bankDetails.qrImage,
                qrFormat,
                qrX + 2,
                qrY + 2,
                qrCard - 4,
                qrCard - 8,
            );
        } catch {
            // Skip unloadable QR artwork; the payment lines still print.
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text("SCAN TO PAY", qrX + qrCard / 2, qrY + qrCard - 1.5, {
            align: "center",
        });
    }
    boxY = Math.max(cellY + 2, boxY + (qrFormat ? qrCard + 6 : 0));
    if (sender.taxID || wrappedNotes.length > 0) {
        doc.setDrawColor(...LINE);
        doc.line(margin + 4, boxY, right - 4, boxY);
        boxY += 4;
        if (taxLines.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(...MUTED);
            doc.text(taxLabel, margin + 4, boxY);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...INK);
            doc.text(taxLines, margin + 4 + taxLabelWidth, boxY);
            boxY += taxLines.length * 5;
        }
        if (wrappedNotes.length > 0) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8.5);
            doc.setTextColor(...MUTED);
            doc.text(wrappedNotes, margin + 4, boxY);
        }
    }

    const safeName = (invoiceNumber || "invoice").replace(/[^\w-]+/g, "-");
    return { doc, filename: `${safeName}.pdf` };
}

// Generates the invoice PDF and downloads it directly — no print dialog.
export function downloadInvoicePdf(input: PdfExportInput): void {
    const { doc, filename } = buildInvoicePdf(input);
    doc.save(filename);
}
