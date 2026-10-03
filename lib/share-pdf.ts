import { buildInvoicePdf, type PdfExportInput } from "@/lib/export-pdf";

export type ShareOutcome = "shared" | "downloaded" | "cancelled";

// Same document as the "Export" button — sharing reuses the styled PDF
// instead of re-sending the plain-text summary.
function toPdfFile(input: PdfExportInput): { file: File; filename: string } {
    const { doc, filename } = buildInvoicePdf(input);
    const blob = doc.output("blob");
    return { file: new File([blob], filename, { type: "application/pdf" }), filename };
}

// Web Share file attachments need both `share` and `canShare`; browsers expose
// one without the other, and Safari throws when asked about an unsupported file.
function canAttachFiles(file: File): boolean {
    if (typeof navigator === "undefined" || typeof File === "undefined") return false;
    if (typeof navigator.share !== "function") return false;
    if (typeof navigator.canShare !== "function") return false;
    try {
        return navigator.canShare({ files: [file] });
    } catch {
        return false;
    }
}

function downloadFile(file: File): void {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoke on a later tick so the browser has time to start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Shares the invoice PDF as a file attachment. Note: no `await` runs before
// `navigator.share`, so the click's user activation is still intact (iOS
// requires it). Where file sharing is unavailable or fails, the PDF is saved
// instead so the user still ends up with a shareable file.
export async function shareInvoicePdf(
    input: PdfExportInput,
    subject: string,
): Promise<ShareOutcome> {
    const { file } = toPdfFile(input);
    if (canAttachFiles(file)) {
        try {
            await navigator.share({ files: [file], title: subject });
            return "shared";
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return "cancelled";
            }
        }
    }
    downloadFile(file);
    return "downloaded";
}

// A `mailto:` link cannot carry an attachment, so save the PDF and open the
// mail app with the invoice subject plus a note to attach the saved file.
export async function emailInvoicePdf(
    input: PdfExportInput,
    subject: string,
): Promise<ShareOutcome> {
    const { file } = toPdfFile(input);
    downloadFile(file);
    const body = [
        `Please find the invoice attached as "${file.name}".`,
        "",
        "The PDF was saved to your device by this page — attach it to this email before sending.",
    ].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return "downloaded";
}