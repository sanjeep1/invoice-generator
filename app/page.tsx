"use client";
import { useState } from "react";
import EditorPanel from "@/components/EditorPanel";
import ExportDrawer from "@/components/ExportDrawer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import InvoicePreview from "@/components/InvoicePreview";
import UtilityBar from "@/components/UtilityBar";
import type { InvoiceItem } from "@/types/invoice";

export default function Home() {
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "Identity & strategy workshop", quantity: 1, rate: 1800 },
        { id: "2", description: "Website interface design", quantity: 2, rate: 1250 },
    ]);

    const addItem = () =>
        setItems([
            ...items,
            { id: String(Date.now()), description: "New line item", quantity: 1, rate: 0 },
        ]);

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

    return (
        <main className="min-w-250 max-lg:min-w-0">
            <Header />
            <UtilityBar />
            <div className="mx-auto mt-6 grid max-w-308 grid-cols-[708px_minmax(0,1fr)] gap-6 pb-32.5 max-lg:m-4 max-lg:grid-cols-1 max-lg:px-4 max-lg:pb-32.5">
                <EditorPanel items={items} onAddItem={addItem} onUpdateItem={updateItem} />
                <InvoicePreview items={items} />
            </div>
            <ExportDrawer />
            <Footer />
        </main>
    );
}
