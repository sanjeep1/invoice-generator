import { createLocalStorageListStore } from "@/lib/local-storage-store";
import type { BankAccountDetails } from "@/types/invoice";

export interface SavedPaymentDetails extends BankAccountDetails {
    id: string;
    createdAt: number;
    updatedAt: number;
}

const TEXT_FIELDS = [
    "accountHolder",
    "bankAndBranch",
    "accountNumber",
    "swiftCode",
    "paymentReference",
    "qrImage",
] as const;

function isSavedPaymentDetails(value: unknown): value is SavedPaymentDetails {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    if (typeof v.id !== "string") return false;
    if (typeof v.createdAt !== "number" || typeof v.updatedAt !== "number") return false;
    return TEXT_FIELDS.every((field) => typeof v[field] === "string");
}

// A saved profile is identified by account holder/bank plus account number.
export function paymentProfileLabel(details: BankAccountDetails): string {
    const holder = details.accountHolder.trim();
    const bank = details.bankAndBranch.trim();
    const number = details.accountNumber.trim();
    return [holder || bank, number].filter(Boolean).join(" · ") || "Unnamed payment details";
}

const store = createLocalStorageListStore<SavedPaymentDetails>("invoxa:saved-payment-details:v1", (value) =>
    Array.isArray(value) ? value.filter(isSavedPaymentDetails) : [],
);

export const subscribeSavedPaymentDetails = store.subscribe;
export const getSavedPaymentDetailsSnapshot = store.getSnapshot;
export const getSavedPaymentDetailsServerSnapshot = store.getServerSnapshot;
export const loadSavedPaymentDetails = store.getSnapshot;
export const persistSavedPaymentDetails = store.set;
