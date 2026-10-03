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

const STORAGE_KEY = "invoxa:saved-clients:v1";

function isSavedClient(value: unknown): value is SavedClient {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.id === "string" && typeof v.company === "string";
}

// Reads saved clients from localStorage. Safe to call during SSR (returns []).
export function loadSavedClients(): SavedClient[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isSavedClient);
    } catch {
        return [];
    }
}

export function persistSavedClients(clients: SavedClient[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch {
        // Storage full/blocked: keep in-memory list, don't crash.
    }
}
