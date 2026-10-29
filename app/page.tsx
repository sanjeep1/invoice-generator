"use client";
import { useState } from "react";
import EditorPanel from "@/components/EditorPanel";
// import ExportDrawer from "@/components/ExportDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InvoicePreview from "@/components/InvoicePreview";
import UtilityBar from "@/components/UtilityBar";
import { Eye, Pencil } from "lucide-react";
import { downloadInvoicePdf, type PdfExportInput } from "@/lib/export-pdf";
import {
    loadInvoiceHistory,
    persistInvoiceHistory,
    upsertInvoiceHistory,
    type InvoiceHistoryEntry,
    type InvoiceSnapshot,
} from "@/lib/invoice-history";
import { buildShareSubject } from "@/lib/share-invoice";
import { validateInvoice } from "@/lib/validation";
import type { BankAccountDetails, DiscountConfig, InvoiceDetails, InvoiceItem, InvoiceMeta, TaxConfig } from "@/types/invoice";
// import { SAMPLE_ITEMS } from "@/lib/sample-invoice";

// Local-time ISO date (yyyy-mm-dd) for the date input. Built manually to
// avoid the UTC-day shift of `toISOString`.
function todayISO(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

export default function Home() {
    // Editor fields start empty so placeholder hints show; the preview
    // falls back to lib/sample-invoice content until the user types.
    const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, rate: 0 }]);
    const [meta, setMeta] = useState<InvoiceMeta>(() => ({
        invoiceNumber: "",
        issueDate: todayISO(),
        paymentTerms: "",
        currency: "",
    }));
    const [details, setDetails] = useState<InvoiceDetails>({
        senderName: "",
        senderBusiness: "",
        senderEmail: "",
        senderPhone: "",
        senderTaxId: "",
        senderCountry: "",
        senderLogo: "",
        clientCompany: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientTaxId: "",
        clientAddress: "",
    });
    const [notes, setNotes] = useState("");
    const [history, setHistory] = useState<InvoiceHistoryEntry[]>(() =>
        loadInvoiceHistory(),
    );
    // Discount/tax config lives here so the editor controls and the preview
    // totals stay in sync. Toggling them doesn't leave sample mode.
    const [discount, setDiscount] = useState<DiscountConfig>({
        enabled: false,
        type: "percentage",
        value: 10,
        reason: "",
    });
    const [tax, setTax] = useState<TaxConfig>({
        enabled: false,
        type: "VAT",
        rate: 13,
    }); const [bankDetails, setBankDetails] = useState<BankAccountDetails>({
        accountHolder: "",
        bankAndBranch: "",
        accountNumber: "",
        swiftCode: "",
        paymentReference: "",
        qrImage: "",
    });

    // Once the user edits anything, the preview leaves sample mode: empty
    // fields then hide instead of falling back to sample content.
    const [hasEdited, setHasEdited] = useState(false);
    const markEdited = () => setHasEdited(true);

    const addItem = () => {
        markEdited();
        setItems([
            ...items,
            { id: String(Date.now()), description: "", quantity: 1, rate: 0 },
        ]);
    };

    // String inputs for qty/rate coerce to numbers; description passes through.
    const updateItem = (
        id: string,
        key: "description" | "quantity" | "rate",
        value: string,
    ) => {
        markEdited();
        setItems((list) =>
            list.map((i) =>
                i.id === id
                    ? { ...i, [key]: key === "description" ? value : Number(value) }
                    : i,
            ),
        );
    };

    const removeItem = (id: string) => {
        markEdited();
        setItems((list) => list.filter((i) => i.id !== id));
    };

    const moveItem = (id: string, direction: "up" | "down") => {
        markEdited();
        setItems((list) => {
            const index = list.findIndex((i) => i.id === id);
            if (index === -1) return list;
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= list.length) return list;
            const next = [...list];
            [next[index], next[newIndex]] = [next[newIndex], next[index]];
            return next;
        });
    };

    const reorderItem = (dragId: string, targetId: string) => {
        markEdited();
        setItems((list) => {
            const from = list.findIndex((i) => i.id === dragId);
            const to = list.findIndex((i) => i.id === targetId);
            if (from === -1 || to === -1 || from === to) return list;
            const next = [...list];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };

    // Patch-style updaters merge partial edits into each state slice.
    const updateBankDetails = (patch: Partial<BankAccountDetails>) => {
        markEdited();
        setBankDetails((prev) => ({ ...prev, ...patch }));
    };

    const updateMeta = (patch: Partial<InvoiceMeta>) => {
        markEdited();
        setMeta((prev) => ({ ...prev, ...patch }));
    };

    const updateDetails = (patch: Partial<InvoiceDetails>) => {
        markEdited();
        setDetails((prev) => ({ ...prev, ...patch }));
    };

    const updateNotes = (value: string) => {
        markEdited();
        setNotes(value);
    };

    const updateDiscount = (patch: Partial<DiscountConfig>) =>
        setDiscount((prev) => ({ ...prev, ...patch }));

    const updateTax = (patch: Partial<TaxConfig>) =>
        setTax((prev) => ({ ...prev, ...patch }));

    // Clears every entered value and returns the preview to sample mode.
    const resetAll = () => {
        setItems([]);
        setMeta({
            invoiceNumber: "",
            issueDate: todayISO(),
            paymentTerms: "",
            currency: "",
        });
        setDetails({
            senderName: "",
            senderBusiness: "",
            senderEmail: "",
            senderPhone: "",
            senderTaxId: "",
            senderCountry: "",
            senderLogo: "",
            clientCompany: "",
            clientName: "",
            clientEmail: "",
            clientPhone: "",
            clientTaxId: "",
            clientAddress: "",
        });
        setNotes("");
        setBankDetails({
            accountHolder: "",
            bankAndBranch: "",
            accountNumber: "",
            swiftCode: "",
            paymentReference: "",
            qrImage: "",
        });
        setDiscount({ enabled: false, type: "percentage", value: 10, reason: "" });
        setTax({ enabled: false, type: "VAT", rate: 13 });
        setHasEdited(false);
    };

    // Print CSS (see globals.css) isolates the invoice sheet on paper.
    const handlePrint = () => window.print();

    // One resolved snapshot of the invoice, shared by the PDF export and the
    // share actions (the PDF is now what gets shared, not the text summary).
    const invoice: PdfExportInput = {
        items,
        meta,
        details,
        notes,
        bankDetails,
        discount,
        tax,
        showSample: !hasEdited,
    };

    // Each export or share archives a snapshot so the invoice is available
    // later even after the editor is reset. Saving the same invoice number
    // updates its existing history entry.
    const saveInvoiceToHistory = (): boolean => {
        const snapshot: InvoiceSnapshot = {
            items,
            meta,
            details,
            notes,
            bankDetails,
            discount,
            tax,
        };
        const next = upsertInvoiceHistory(loadInvoiceHistory(), snapshot);
        if (!persistInvoiceHistory(next)) return false;
        setHistory(next);
        return true;
    };

    const deleteHistoryInvoice = (id: string) => {
        const next = loadInvoiceHistory().filter((entry) => entry.id !== id);
        persistInvoiceHistory(next);
        setHistory(next);
    };

    const loadHistoryInvoice = (entry: InvoiceHistoryEntry) => {
        const snapshot = entry.snapshot;
        setItems(snapshot.items);
        setMeta(snapshot.meta);
        setDetails(snapshot.details);
        setNotes(snapshot.notes);
        setBankDetails(snapshot.bankDetails);
        setDiscount(
            snapshot.discount ?? {
                enabled: false,
                type: "percentage",
                value: 10,
                reason: "",
            },
        );
        setTax(snapshot.tax ?? { enabled: false, type: "VAT", rate: 13 });
        setHasEdited(true);
    };

    // Direct vector-PDF download — no print dialog.
    const handleExportPdf = () => {
        downloadInvoicePdf(invoice);
        saveInvoiceToHistory();
    };

    // Required-field gate for export/share. Recomputed each render; cheap.
    const missingFields = validateInvoice({ items, meta, details, bankDetails });

    // Small screens show Edit / Preview as tabs instead of the side-by-side
    // desktop grid. Desktop (lg+) always renders both columns.
    const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
    const tabButton = (active: boolean) =>
        `flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            active
                ? "bg-white text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
        }`;

    return (
        <main className="min-w-250 max-lg:min-w-0 print:min-w-0">
            <Header
                onReset={resetAll}
                onPrint={handlePrint}
                onExportPdf={handleExportPdf}
                missingFields={missingFields}
                invoice={invoice}
                shareSubject={buildShareSubject({ meta, showSample: !hasEdited })}
                history={history}
                onRecordInvoice={saveInvoiceToHistory}
                onLoadInvoice={loadHistoryInvoice}
                onDeleteInvoice={deleteHistoryInvoice}
            />
            <UtilityBar />
            <div
                role="tablist"
                aria-label="Editor and preview"
                className="sticky top-16 z-20 mx-4 mt-4 flex gap-1 rounded-md border border-line bg-surface-container-low p-1 lg:hidden print:hidden"
            >
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobileTab === "edit"}
                    onClick={() => setMobileTab("edit")}
                    className={tabButton(mobileTab === "edit")}
                >
                    <Pencil size={14} aria-hidden="true" className="shrink-0" />
                    Edit
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobileTab === "preview"}
                    onClick={() => setMobileTab("preview")}
                    className={tabButton(mobileTab === "preview")}
                >
                    <Eye size={14} aria-hidden="true" className="shrink-0" />
                    Preview
                </button>
            </div>
            <div className="mx-auto mt-6 grid max-w-308 grid-cols-[708px_minmax(0,1fr)] gap-6 pb-32.5 max-lg:m-4 max-lg:grid-cols-1 max-lg:px-4 max-lg:pb-32.5 print:m-0 print:max-w-none print:grid-cols-1 print:gap-0 print:px-0 print:pb-0">
                <div className={`min-w-0 ${mobileTab === "edit" ? "" : "max-lg:hidden"} print:block`}>
                    <EditorPanel
                        items={items}
                        onAddItem={addItem}
                        onUpdateItem={updateItem}
                        onRemoveItem={removeItem}
                        onMoveItem={moveItem}
                        onReorderItem={reorderItem}
                        meta={meta}
                        onMetaChange={updateMeta}
                        details={details}
                        onDetailsChange={updateDetails}
                        notes={notes}
                        onNotesChange={updateNotes}
                        bankDetails={bankDetails}
                        onBankDetailsChange={updateBankDetails}
                        discount={discount}
                        onDiscountChange={updateDiscount}
                        tax={tax}
                        onTaxChange={updateTax}
                    />
                </div>
                <div className={`min-w-0 ${mobileTab === "preview" ? "" : "max-lg:hidden"} print:block`}>
                    <InvoicePreview
                        items={items}
                        meta={meta}
                        details={details}
                        notes={notes}
                        bankDetails={bankDetails}
                        showSample={!hasEdited}
                        discount={discount}
                        tax={tax}
                    />
                </div>
            </div>
            {/* <ExportDrawer /> */}
            <Footer />
        </main>
    );
}
