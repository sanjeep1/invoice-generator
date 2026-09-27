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

// Convert number to words (US style, no "and" inside the integer part so
// the single "and" cleanly separates dollars from cents).
const LESS_THAN_TWENTY = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const SCALES = ["", "Thousand", "Million", "Billion", "Trillion"];

function convertBelowHundred(n: number): string {
  if (n < 20) return LESS_THAN_TWENTY[n];
  const ten = Math.floor(n / 10);
  const rest = n % 10;
  return rest === 0 ? TENS[ten] : `${TENS[ten]}-${LESS_THAN_TWENTY[rest]}`;
}

function convertBelowThousand(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundred > 0) {
    parts.push(`${LESS_THAN_TWENTY[hundred]} Hundred`);
  }
  if (rest > 0) {
    parts.push(convertBelowHundred(rest));
  }
  return parts.join(" ");
}

function integerToWords(n: number): string {
  if (n === 0) return "Zero";
  if (!Number.isSafeInteger(n)) return String(n);
  const chunks: string[] = [];
  let scale = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk > 0) {
      const words = convertBelowThousand(chunk);
      const scaleName = SCALES[scale];
      chunks.unshift(scaleName ? `${words} ${scaleName}` : words);
    }
    n = Math.floor(n / 1000);
    scale += 1;
  }
  return chunks.join(" ");
}

function pluralizeCurrencyName(singular: string, count: number): string {
  if (count === 1) return singular;
  return singular.endsWith("s") ? singular : `${singular}s`;
}

function currencyName(code: string, count: number): string {
  try {
    const singular = new Intl.DisplayNames(["en"], { type: "currency" }).of(
      code.toUpperCase(),
    );
    if (singular) return pluralizeCurrencyName(singular, count);
  } catch {
    // Fall through to the code fallback below.
  }
  const upper = code.toUpperCase();
  return count === 1 ? upper : upper;
}

function subunitName(code: string, count: number): string {
  const upper = code.toUpperCase();
  if (["INR", "NPR", "PKR", "BDT", "LKR"].includes(upper)) return "Paisa";
  if (upper === "GBP") return count === 1 ? "Penny" : "Pence";
  return count === 1 ? "Cent" : "Cents";
}

export function numberToWords(amount: number, currencyCode = "USD"): string {
  if (!Number.isFinite(amount)) return "";
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const negative = rounded < 0;
  const abs = Math.abs(rounded);
  const intPart = Math.floor(abs);
  const cents = Math.round((abs - intPart) * 100);
  const major = currencyName(currencyCode, intPart);
  const prefix = negative ? "Minus " : "";
  if (cents === 0) {
    return `${prefix}${integerToWords(intPart)} ${major} Only`;
  }
  const minor = subunitName(currencyCode, cents);
  return `${prefix}${integerToWords(intPart)} ${major} and ${integerToWords(cents)} ${minor} Only`;
}