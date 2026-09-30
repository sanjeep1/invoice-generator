"use client";
import { useState } from "react";
import EditorPanel from "@/components/EditorPanel";
// import ExportDrawer from "@/components/ExportDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InvoicePreview from "@/components/InvoicePreview";
import UtilityBar from "@/components/UtilityBar";
import { downloadInvoicePdf } from "@/lib/export-pdf";
import { buildShareSubject, buildShareText } from "@/lib/share-invoice";
import type { BankAccountDetails, DiscountConfig, InvoiceDetails, InvoiceItem, InvoiceMeta, TaxConfig } from "@/types/invoice";
import { SAMPLE_ITEMS } from "@/lib/sample-invoice";

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
    const [items, setItems] = useState<InvoiceItem[]>([{ ...SAMPLE_ITEMS[0] }]);
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

    // Direct vector-PDF download — no print dialog.
    const handleExportPdf = () =>
        downloadInvoicePdf({
            items,
            meta,
            details,
            notes,
            bankDetails,
            discount,
            tax,
            showSample: !hasEdited,
        });

    return (
        <main className="min-w-250 max-lg:min-w-0 print:min-w-0">
            <Header
                onReset={resetAll}
                onPrint={handlePrint}
                onExportPdf={handleExportPdf}
                shareSubject={buildShareSubject({ meta, showSample: !hasEdited })}
                shareText={buildShareText({
                    items,
                    meta,
                    details,
                    notes,
                    bankDetails,
                    discount,
                    tax,
                    showSample: !hasEdited,
                })}
            />
            <UtilityBar />
            <div className="mx-auto mt-6 grid max-w-308 grid-cols-[708px_minmax(0,1fr)] gap-6 pb-32.5 max-lg:m-4 max-lg:grid-cols-1 max-lg:px-4 max-lg:pb-32.5 print:m-0 print:max-w-none print:grid-cols-1 print:gap-0 print:px-0 print:pb-0">
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
            {/* <ExportDrawer /> */}
            <Footer />
        </main>
    );
}
