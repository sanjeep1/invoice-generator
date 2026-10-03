"use client";

import { useEffect, useMemo, useState } from "react";
import { BookmarkCheck, Contact2 } from "lucide-react";
import {
    loadSavedClients,
    persistSavedClients,
    type SavedClient,
} from "@/lib/saved-clients";
import type { InvoiceDetails } from "@/types/invoice";

type ClientSaveProps = {
    details: InvoiceDetails;
    onFillClient: (patch: Partial<InvoiceDetails>) => void;
};

export default function ClientSave({ details, onFillClient }: ClientSaveProps) {
    const [saved, setSaved] = useState<SavedClient[]>(() => loadSavedClients());
    const [justSaved, setJustSaved] = useState(false);

    useEffect(() => {
        if (!justSaved) return;
        const timer = window.setTimeout(() => setJustSaved(false), 2000);
        return () => window.clearTimeout(timer);
    }, [justSaved]);

    const company = details.clientCompany.trim();

    // The select tracks the saved entry matching the typed company name.
    const selectedId = useMemo(() => {
        if (!company) return "";
        const match = saved.find(
            (c) => c.company.trim().toLowerCase() === company.toLowerCase(),
        );
        return match?.id ?? "";
    }, [saved, company]);

    // Enable Save only when the typed company isn't already in the list.
    const alreadySaved = selectedId !== "";
    const canSave = company !== "" && !alreadySaved;

    const handleSelect = (id: string) => {
        if (!id) return;
        const match = saved.find((c) => c.id === id);
        if (!match) return;
        onFillClient({
            clientCompany: match.company,
            clientName: match.name,
            clientEmail: match.email,
            clientPhone: match.phone,
            clientTaxId: match.taxId,
            clientAddress: match.address,
        });
    };

    const handleSave = () => {
        if (!canSave) return;
        const entry: SavedClient = {
            id: `client-${Date.now()}`,
            company: details.clientCompany.trim(),
            name: details.clientName.trim(),
            email: details.clientEmail.trim(),
            phone: details.clientPhone.trim(),
            taxId: details.clientTaxId.trim(),
            address: details.clientAddress.trim(),
            createdAt: Date.now(),
        };
        const next = [...saved, entry];
        setSaved(next);
        persistSavedClients(next);
        setJustSaved(true);
    };

    return (
        <label className="flex flex-col gap-1.5 rounded-sm border border-surface-container bg-surface-container-low p-2.5 text-xs leading-4 font-medium text-on-surface-variant">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Contact2 stroke="var(--primary)" size={16} />
                    <span>Choose Saved Clients</span>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    title={
                        canSave
                            ? "Save these client details"
                            : alreadySaved
                              ? "This client is already saved"
                              : "Type a new client company name to save it"
                    }
                    className={`flex items-center gap-1 rounded-xl px-2 py-0.5 transition-colors ${
                        canSave
                            ? "cursor-pointer bg-primary text-on-primary hover:bg-primary-container"
                            : "cursor-not-allowed bg-primary/10 text-primary/50"
                    }`}
                >
                    <BookmarkCheck size={14} aria-hidden="true" />
                    <span className="text-[11px]">
                        {justSaved ? "Saved!" : "Save Client"}
                    </span>
                </button>
            </div>
            <select
                aria-label="Saved clients"
                value={selectedId}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full rounded-sm border border-surface-container bg-white px-2 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
            >
                <option value="">
                    {saved.length === 0 ? "No saved clients yet" : "Select a client"}
                </option>
                {saved.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.company}
                    </option>
                ))}
            </select>
        </label>
    );
}
