import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats via Intl; throws for unknown codes, so callers fall back to USD.
export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Convert number to words (simple version)
export function numberToWords(num: number): string {
  // We will improve this later. For now return a placeholder.
  return `${num.toFixed(2)} US Dollars`;
}