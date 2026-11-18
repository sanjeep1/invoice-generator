// Strict ISO parser (local time, avoiding the UTC shift of `new Date(str)`).
// Returns null for blank/invalid input so callers can show a fallback.
export function parseIssueDate(raw: string): Date | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) return null;
    const [, y, m, d] = isoMatch;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatPaperDate(raw: string): string | null {
    const parsed = parseIssueDate(raw);
    if (!parsed) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    }).format(parsed);
}

// Extracts the day count from free text like "Net 15 Days".
export function parseTermsDays(raw: string): number | null {
    const match = raw.match(/(\d+)/);
    if (!match) return null;
    const days = Number(match[1]);
    return Number.isNaN(days) ? null : days;
}

// Due date = issue date + terms days; null when unparseable or out of range.
export function formatDueDate(issueRaw: string, termsRaw: string): string | null {
    const issued = parseIssueDate(issueRaw);
    const days = parseTermsDays(termsRaw);
    if (!issued || days === null || days > 365000) return null;
    const due = new Date(issued);
    due.setDate(due.getDate() + days);
    if (Number.isNaN(due.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    }).format(due);
}
