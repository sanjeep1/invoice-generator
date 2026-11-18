"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BookmarkCheck, Landmark } from "lucide-react";
import {
    getSavedPaymentDetailsServerSnapshot,
    getSavedPaymentDetailsSnapshot,
    persistSavedPaymentDetails,
    paymentProfileLabel,
    subscribeSavedPaymentDetails,
    type SavedPaymentDetails,
} from "@/lib/saved-payment-details";
import type { BankAccountDetails } from "@/types/invoice";

type PaymentSaveProps = {
    details: BankAccountDetails;
    onFillPayment: (patch: Partial<BankAccountDetails>) => void;
};

// QR images are data URLs, so keep the saved list small enough for localStorage.
const MAX_SAVED = 20;

export default function PaymentSave({ details, onFillPayment }: PaymentSaveProps) {
    const saved = useSyncExternalStore(
        subscribeSavedPaymentDetails,
        getSavedPaymentDetailsSnapshot,
        getSavedPaymentDetailsServerSnapshot,
    );
    const [justSaved, setJustSaved] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        if (!justSaved) return;
        const timer = window.setTimeout(() => setJustSaved(false), 2000);
        return () => window.clearTimeout(timer);
    }, [justSaved]);

    // Account number identifies a payee profile; changing holder/bank updates
    // that same entry instead of adding a duplicate.
    const accountNumber = details.accountNumber.trim();
    const selectedId = useMemo(() => {
        if (!accountNumber) return "";
        const match = saved.find(
            (entry) => entry.accountNumber.trim() === accountNumber,
        );
        return match?.id ?? "";
    }, [saved, accountNumber]);

    const isExisting = selectedId !== "";
    const canSave = accountNumber !== "";

    const handleSelect = (id: string) => {
        if (!id) return;
        const match = saved.find((entry) => entry.id === id);
        if (!match) return;
        onFillPayment({
            accountHolder: match.accountHolder,
            bankAndBranch: match.bankAndBranch,
            accountNumber: match.accountNumber,
            swiftCode: match.swiftCode,
            paymentReference: match.paymentReference,
            qrImage: match.qrImage,
        });
    };

    const handleSave = () => {
        if (!canSave) return;
        const now = Date.now();
        const existing = saved.find((entry) => entry.id === selectedId);
        const entry: SavedPaymentDetails = {
            id: existing?.id ?? `payment-${now}`,
            accountHolder: details.accountHolder.trim(),
            bankAndBranch: details.bankAndBranch.trim(),
            accountNumber: details.accountNumber.trim(),
            swiftCode: details.swiftCode.trim(),
            paymentReference: details.paymentReference.trim(),
            qrImage: details.qrImage,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
        const next = existing
            ? saved.map((item) => (item.id === existing.id ? entry : item))
            : [...saved, entry].slice(-MAX_SAVED);
        if (!persistSavedPaymentDetails(next)) {
            setJustSaved(false);
            setSaveError("Could not save — browser storage is full or blocked.");
            return;
        }
        setSaveError("");
        setJustSaved(true);
    };

    return (
        <div className="flex flex-col gap-1.5 rounded-sm border border-surface-container bg-surface-container-low p-2.5 text-xs leading-4 font-medium text-on-surface-variant">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <Landmark stroke="var(--primary)" size={16} />
                    <span>Saved Payment Details</span>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    title={
                        canSave
                            ? isExisting
                                ? "Update this saved payment for future invoices"
                                : "Save these payment details for future invoices"
                            : "Enter an account number to save these payment details for future invoices"
                    }
                    className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-1 transition-colors ${
                        canSave
                            ? "cursor-pointer bg-primary text-on-primary hover:bg-primary-container"
                            : "cursor-not-allowed bg-primary/10 text-primary/50"
                    }`}
                >
                    <BookmarkCheck size={14} aria-hidden="true" />
                    <span className="text-[11px] whitespace-nowrap">
                        {justSaved
                            ? "Saved for future"
                            : isExisting
                                ? "Update saved payment"
                                : "Save payment for future"}
                    </span>
                </button>
            </div>
            <p className="text-[11px] font-normal leading-4 text-muted">
                Save these details once, then reuse them on future invoices.
            </p>
            <select
                aria-label="Saved payment details"
                value={selectedId}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full rounded-sm border border-surface-container bg-white px-2 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
            >
                <option value="">
                    {saved.length === 0
                        ? "No saved payment details yet"
                        : "Select payment details"}
                </option>
                {saved.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                        {paymentProfileLabel(entry)}
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
