export interface SavedIssuer {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  taxId: string;
  country: string;
  logo: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "invoxa:saved-issuers:v1";

const TEXT_FIELDS = [
  "name",
  "business",
  "email",
  "phone",
  "taxId",
  "country",
  "logo",
] as const;

function isSavedIssuer(value: unknown): value is SavedIssuer {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string") return false;
  return TEXT_FIELDS.every((field) => typeof v[field] === "string");
}

// The business title identifies an issuer profile; fall back to the sender
// name for freelancers who don't trade under a separate entity.
export function issuerLabel(business: string, name: string): string {
  return business.trim() || name.trim();
}

// Reads saved issuers from localStorage. Safe to call during SSR (returns []).
export function loadSavedIssuers(): SavedIssuer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedIssuer);
  } catch {
    return [];
  }
}

export function persistSavedIssuers(issuers: SavedIssuer[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(issuers));
    return true;
  } catch {
    return false;
  }
}
