import { createLocalStorageListStore } from "@/lib/local-storage-store";

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

const store = createLocalStorageListStore<SavedIssuer>("invoxa:saved-issuers:v1", (value) =>
  Array.isArray(value) ? value.filter(isSavedIssuer) : [],
);

export const subscribeSavedIssuers = store.subscribe;
export const getSavedIssuersSnapshot = store.getSnapshot;
export const getSavedIssuersServerSnapshot = store.getServerSnapshot;
export const loadSavedIssuers = store.getSnapshot;
export const persistSavedIssuers = store.set;
