import { createLocalStorageListStore } from "@/lib/local-storage-store";

export interface SavedClient {
    id: string;
    company: string;
    name: string;
    email: string;
    phone: string;
    taxId: string;
    address: string;
    createdAt: number;
}

function isSavedClient(value: unknown): value is SavedClient {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.id === "string" && typeof v.company === "string";
}

const store = createLocalStorageListStore<SavedClient>("invoxa:saved-clients:v1", (value) =>
    Array.isArray(value) ? value.filter(isSavedClient) : [],
);

export const subscribeSavedClients = store.subscribe;
export const getSavedClientsSnapshot = store.getSnapshot;
export const getSavedClientsServerSnapshot = store.getServerSnapshot;
export const loadSavedClients = store.getSnapshot;
export const persistSavedClients = store.set;
