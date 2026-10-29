"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock, Download, FolderOpen, Trash, X } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/export-pdf";
import { formatPaperDate } from "@/lib/invoice-dates";
import type {
  InvoiceHistoryEntry,
  InvoiceSnapshot,
} from "@/lib/invoice-history";
import { computeTotals, parseCurrencyCode } from "@/lib/invoice-totals";
import { formatCurrency } from "@/lib/utils";

type InvoiceHistoryProps = {
  history: InvoiceHistoryEntry[];
  onClose: () => void;
  onLoad: (entry: InvoiceHistoryEntry) => void;
  onDelete: (id: string) => void;
};

function formatTotal(snapshot: InvoiceSnapshot): string {
  const currency = parseCurrencyCode(snapshot.meta.currency);
  const { total } = computeTotals(
    snapshot.items,
    snapshot.discount,
    snapshot.tax,
  );
  try {
    return formatCurrency(total, currency);
  } catch {
    return formatCurrency(total);
  }
}

function formatSavedAt(savedAt: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(savedAt));
}

export default function InvoiceHistory({
  history,
  onClose,
  onLoad,
  onDelete,
}: InvoiceHistoryProps) {
  // Lock the page behind the drawer and close it with Escape.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Remove this invoice from history?")) return;
    onDelete(id);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-40 print:hidden">
      <button
        type="button"
        aria-label="Close invoice history"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-on-surface/30 backdrop-blur-[1px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-history-title"
        className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-sheet"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} aria-hidden="true" className="text-primary" />
            <h2
              id="invoice-history-title"
              className="text-headline-sm text-on-surface"
            >
              Invoice History
            </h2>
            <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold tabular-nums text-on-surface-variant">
              {history.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invoice history"
            className="cursor-pointer rounded-sm p-1 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-line px-5 py-3">
          <p className="text-[11px] leading-4 text-muted">
            Invoices are saved here automatically when you export or share them.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-divider bg-white px-6 py-10 text-center">
              <Clock size={22} aria-hidden="true" className="text-muted" />
              <p className="text-sm font-medium text-on-surface">
                No invoices yet
              </p>
              <p className="text-[11px] leading-4 text-on-surface-variant">
                Export or share an invoice and it will appear here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {history.map((entry) => {
                const { snapshot } = entry;
                const number =
                  snapshot.meta.invoiceNumber.trim() || "Untitled invoice";
                const issued = formatPaperDate(snapshot.meta.issueDate);
                return (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-line bg-white p-3.5 shadow-[0_1px_1px_rgb(0_0_0/0.05)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {number}
                        </p>
                        <p className="truncate text-[11px] text-on-surface-variant">
                          {snapshot.details.clientCompany.trim() || "No client"}
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          {issued ? `Issued ${issued} · ` : ""}
                          Saved {formatSavedAt(entry.savedAt)}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-semibold text-on-surface">
                        {formatTotal(snapshot)}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onLoad(entry)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-surface-container-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <FolderOpen size={13} aria-hidden="true" />
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          downloadInvoicePdf({
                            ...snapshot,
                            showSample: false,
                          })
                        }
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-surface-container-low px-2.5 py-1.5 text-[11px] font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-primary"
                        title="Download this invoice as PDF"
                      >
                        <Download size={13} aria-hidden="true" />
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry.id)}
                        aria-label={`Remove ${number} from history`}
                        className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[11px] font-medium text-muted transition-colors hover:bg-error-container hover:text-error focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <Trash size={13} aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
