"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BookmarkCheck, UserRound } from "lucide-react";
import {
    getSavedIssuersServerSnapshot,
    getSavedIssuersSnapshot,
    issuerLabel,
    persistSavedIssuers,
    subscribeSavedIssuers,
    type SavedIssuer,
} from "@/lib/saved-issuers";
import type { InvoiceDetails } from "@/types/invoice";

type IssuerSaveProps = {
    details: InvoiceDetails;
    onFillIssuer: (patch: Partial<InvoiceDetails>) => void;
};

export default function IssuerSave({ details, onFillIssuer }: IssuerSaveProps) {
    const saved = useSyncExternalStore(
        subscribeSavedIssuers,
        getSavedIssuersSnapshot,
        getSavedIssuersServerSnapshot,
    );
    const [justSaved, setJustSaved] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        if (!justSaved) return;
        const timer = window.setTimeout(() => setJustSaved(false), 2000);
        return () => window.clearTimeout(timer);
    }, [justSaved]);

    const label = issuerLabel(details.senderBusiness, details.senderName);

    // The select tracks the saved profile matching the typed business/name.
    const selectedId = useMemo(() => {
        if (!label) return "";
        const match = saved.find(
            (issuer) =>
                issuerLabel(issuer.business, issuer.name).toLowerCase() ===
                label.toLowerCase(),
        );
        return match?.id ?? "";
    }, [saved, label]);

    // Saving over an existing profile keeps the list free of duplicates while
    // letting updated contact details replace the old ones.
    const isExisting = selectedId !== "";
    const canSave = label !== "";

    const handleSelect = (id: string) => {
        if (!id) return;
        const match = saved.find((issuer) => issuer.id === id);
        if (!match) return;
        onFillIssuer({
            senderName: match.name,
            senderBusiness: match.business,
            senderEmail: match.email,
            senderPhone: match.phone,
            senderTaxId: match.taxId,
            senderCountry: match.country,
            senderLogo: match.logo,
        });
    };

    const handleSave = () => {
        if (!canSave) return;
        const now = Date.now();
        const existing = saved.find((issuer) => issuer.id === selectedId);
        const entry: SavedIssuer = {
            id: existing?.id ?? `issuer-${now}`,
            name: details.senderName.trim(),
            business: details.senderBusiness.trim(),
            email: details.senderEmail.trim(),
            phone: details.senderPhone.trim(),
            taxId: details.senderTaxId.trim(),
            country: details.senderCountry.trim(),
            logo: details.senderLogo,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
        const next = existing
            ? saved.map((issuer) => (issuer.id === existing.id ? entry : issuer))
            : [...saved, entry];
        if (!persistSavedIssuers(next)) {
            setJustSaved(false);
            setSaveError("Could not save — browser storage is full or blocked.");
            return;
        }
        setSaveError("");
        setJustSaved(true);
    };

    return (
        <div className="flex flex-col gap-1.5 rounded-sm border border-surface-container bg-surface-container-low p-2.5 text-xs leading-4 font-medium text-on-surface-variant">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <UserRound stroke="var(--primary)" size={16} />
                    <span>Saved Issuer Profiles</span>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    title={
                        canSave
                            ? isExisting
                                ? "Update this saved issuer profile"
                                : "Save these issuer details for future invoices"
                            : "Type an issuer name or business to save it"
                    }
                    className={`flex items-center gap-1 rounded-xl px-2 py-0.5 transition-colors ${
                        canSave
                            ? "cursor-pointer bg-primary text-on-primary hover:bg-primary-container"
                            : "cursor-not-allowed bg-primary/10 text-primary/50"
                    }`}
                >
                    <BookmarkCheck size={14} aria-hidden="true" />
                    <span className="text-[11px]">
                        {justSaved
                            ? "Saved!"
                            : isExisting
                              ? "Update Issuer"
                              : "Save Issuer"}
                    </span>
                </button>
            </div>
            <select
                aria-label="Saved issuer profiles"
                value={selectedId}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full rounded-sm border border-surface-container bg-white px-2 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
            >
                <option value="">
                    {saved.length === 0
                        ? "No saved issuers yet"
                        : "Select an issuer"}
                </option>
                {saved.map((issuer) => (
                    <option key={issuer.id} value={issuer.id}>
                        {issuerLabel(issuer.business, issuer.name)}
                    </option>
                ))}
            </select>
            {saveError ? (
                <small role="alert" className="text-[11px] leading-3.75 text-error">
                    {saveError}
                </small>
            ) : null}
        </div>
    );
}
