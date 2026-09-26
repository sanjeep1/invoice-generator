"use client";
import { useState } from "react";
import EditorPanel from "@/components/EditorPanel";
import ExportDrawer from "@/components/ExportDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InvoicePreview from "@/components/InvoicePreview";
import UtilityBar from "@/components/UtilityBar";
import type { BankAccountDetails, InvoiceDetails, InvoiceItem, InvoiceMeta } from "@/types/invoice";

export default function Home() {
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "Identity & strategy workshop", quantity: 1, rate: 1800 },
        { id: "2", description: "Website interface design", quantity: 2, rate: 1250 },
    ]);
    const [meta, setMeta] = useState<InvoiceMeta>({
        invoiceNumber: "INV-2026-001",
        issueDate: "2026-03-01",
        paymentTerms: "Net 15 Days",
        currency: "USD",
    });
    const [details, setDetails] = useState<InvoiceDetails>({
        senderName: "Sanjeep Banjara",
        senderBusiness: "Sanjeep Ltd.",
        senderEmail: "billing@sanjeep.com",
        senderPhone: "9876543210",
        senderTaxId: "849204910",
        senderCountry: "Kathmandu, Nepal",
        clientCompany: "Apple",
        clientName: "Steve Jobs",
        clientEmail: "hello@apple.com",
        clientPhone: "9876543210",
        clientTaxId: "942298120",
        clientAddress: "California, USA",
    });
    const [notes, setNotes] = useState(
        "Thank you for the opportunity to collaborate. Payment is due within 15 days of the invoice date.",
    );
    const [bankDetails, setBankDetails] = useState<BankAccountDetails>({
        accountHolder: "",
        bankAndBranch: "",
        accountNumber: "",
        swiftCode: "",
        paymentReference: "",
        qrImage: "",
    });

    const addItem = () =>
        setItems([
            ...items,
            { id: String(Date.now()), description: "New line item", quantity: 1, rate: 0 },
        ]);

    // String inputs for qty/rate coerce to numbers; description passes through.
    const updateItem = (
        id: string,
        key: "description" | "quantity" | "rate",
        value: string,
    ) =>
        setItems((list) =>
            list.map((i) =>
                i.id === id
                    ? { ...i, [key]: key === "description" ? value : Number(value) }
                    : i,
            ),
        );

    // Patch-style updaters merge partial edits into each state slice.
    const updateBankDetails = (patch: Partial<BankAccountDetails>) =>
        setBankDetails((prev) => ({ ...prev, ...patch }));

    const updateMeta = (patch: Partial<InvoiceMeta>) =>
        setMeta((prev) => ({ ...prev, ...patch }));

    const updateDetails = (patch: Partial<InvoiceDetails>) =>
        setDetails((prev) => ({ ...prev, ...patch }));

    return (
        <main className="min-w-250 max-lg:min-w-0">
            <Header />
            <UtilityBar />
            <div className="mx-auto mt-6 grid max-w-308 grid-cols-[708px_minmax(0,1fr)] gap-6 pb-32.5 max-lg:m-4 max-lg:grid-cols-1 max-lg:px-4 max-lg:pb-32.5">
                <EditorPanel
                    items={items}
                    onAddItem={addItem}
                    onUpdateItem={updateItem}
                    meta={meta}
                    onMetaChange={updateMeta}
                    details={details}
                    onDetailsChange={updateDetails}
                    notes={notes}
                    onNotesChange={setNotes}
                    bankDetails={bankDetails}
                    onBankDetailsChange={updateBankDetails}
                />
                <InvoicePreview
                    items={items}
                    meta={meta}
                    details={details}
                    notes={notes}
                    bankDetails={bankDetails}
                />
            </div>
            <ExportDrawer />
            <Footer />
        </main>
    );
}
