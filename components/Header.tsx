"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "@/public/brandlogo.svg";
import { AlertTriangle, Check, ChevronDown, Copy, Download, Mail, Menu, Printer, Repeat2, Share2Icon, X } from "lucide-react";
import { buildShareText } from "@/lib/share-invoice";
import { emailInvoicePdf, shareInvoicePdf, type ShareOutcome } from "@/lib/share-pdf";
import type { PdfExportInput } from "@/lib/export-pdf";

type HeaderProps = {
    onReset?: () => void;
    onPrint?: () => void;
    onExportPdf?: () => void;
    invoice: PdfExportInput;
    shareSubject?: string;
    missingFields?: string[];
};

const ghostButton =
    "bg-surface-container-low shrink-0 cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant select-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] hidden md:inline-flex";

const Header = ({ onReset, onPrint, onExportPdf, invoice, shareSubject = "Invoice", missingFields = [] }: HeaderProps) => {
    const [shareOpen, setShareOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [pending, setPending] = useState<"share" | "email" | null>(null);
    const [status, setStatus] = useState<{ action: "share" | "email"; outcome: ShareOutcome } | null>(null);
    const shareRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const warningTimer = useRef<number | null>(null);

    // Close the share menu on outside click or Escape.
    useEffect(() => {
        if (!shareOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
                setShareOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShareOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [shareOpen]);

    // Same dismiss behavior for the mobile overflow menu.
    useEffect(() => {
        if (!menuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menuOpen]);

    const copyText = async () => {
        const text = buildShareText(invoice);
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Clipboard API unavailable (permissions/insecure context): fall
            // back to a hidden textarea + execCommand.
            const area = document.createElement("textarea");
            area.value = text;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    const blocked = missingFields.length > 0;
    // Share rows also go inert while a PDF is being built; other rows (reset,
    // print, copy) stay enabled, so they take their own disabled state.
    const shareBusy = !!pending;

    // Warn (instead of silently disabling) when required fields are missing.
    // Buttons stay clickable so the click can explain what to fill.
    const showBlockedWarning = useCallback(() => {
        if (warningTimer.current) window.clearTimeout(warningTimer.current);
        const list = missingFields.join(", ");
        setWarning(
            list
                ? `Please fill the required fields: ${list}.`
                : "Please fill the required fields before sharing or exporting.",
        );
        warningTimer.current = window.setTimeout(() => setWarning(null), 5000);
    }, [missingFields]);

    // Clear the auto-dismiss timer on unmount.
    useEffect(() => {
        return () => {
            if (warningTimer.current) window.clearTimeout(warningTimer.current);
        };
    }, []);

    // One style for every dropdown row; only a busy PDF build makes a row
    // truly inert. Blocked rows stay clickable so they can warn about
    // missing required fields instead of silently doing nothing.
    const menuItem = (disabled: boolean) =>
        `flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors ${
            disabled
                ? "cursor-not-allowed text-on-surface/40"
                : "text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
        }`;

    // Builds the PDF once per attempt, then reports what happened so the menu
    // can explain a download fallback instead of silently failing.
    const runShare = async (action: "share" | "email") => {
        if (pending) return;
        if (blocked) {
            showBlockedWarning();
            return;
        }
        setPending(action);
        try {
            const outcome =
                action === "share"
                    ? await shareInvoicePdf(invoice, shareSubject)
                    : await emailInvoicePdf(invoice, shareSubject);
            setStatus({ action, outcome });
        } catch {
            setStatus({ action, outcome: "cancelled" });
        } finally {
            setPending(null);
        }
    };

    // Rendered under the trigger, so it stays readable after the menu closes.
    // Building the PDF is synchronous, so this mostly reports the outcome.
    const shareNote = pending
        ? "Preparing PDF…"
        : status?.outcome === "downloaded"
          ? status.action === "email"
              ? "PDF saved — attach it to the email."
              : "This browser can't attach files, so the PDF was saved instead."
          : null;

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-line bg-surface/90 px-4 shadow-header backdrop-blur-xl sm:px-6 print:hidden">
            <div className="mx-auto flex w-full items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    <Image
                        className="size-8 shrink-0 rounded-sm bg-primary-container"
                        src={Logo}
                        alt="Invoxa Logo"
                        width={32}
                        height={32}
                        priority
                    />
                    <div className="flex items-center gap-2">
                        <span className="text-lg leading-none font-semibold tracking-tight text-on-surface">
                            invoxa
                        </span>
                        <span
                            aria-hidden="true"
                            className="text-sm font-light text-divider select-none"
                        >
                            |
                        </span>
                        <span className="hidden text-sm whitespace-nowrap text-on-surface-variant sm:block">
                            Invoice Generator
                        </span>
                    </div>
                </div>

                <nav
                    aria-label="Invoice actions"
                    className="flex shrink-0 items-center gap-1.5 sm:gap-2"
                >
                    {/* <button
                        type="button"
                        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-sm bg-surface-container px-4 py-2 text-xs font-medium whitespace-nowrap text-on-surface select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <FolderOpen
                            size={14}
                            aria-hidden="true"
                            className="shrink-0 text-primary"
                        />
                        Invoices
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-fixed px-1 text-[10px] leading-none font-semibold tabular-nums text-primary">
                            5
                        </span>
                    </button> */}

                    <button
                        type="button"
                        onClick={onReset}
                        className={ghostButton}
                    >
                        <Repeat2 size={14} aria-hidden="true" className="shrink-0" />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={onPrint}
                        className={ghostButton}
                    >
                        <Printer size={14} aria-hidden="true" className="shrink-0" />
                        Print
                    </button>

                    <div ref={shareRef} className="relative hidden shrink-0 md:block">
                        <button
                            type="button"
                            onClick={() => {
                                if (blocked) {
                                    showBlockedWarning();
                                    return;
                                }
                                setShareOpen((open) => !open);
                                setStatus(null);
                                setWarning(null);
                            }}
                            aria-haspopup="menu"
                            aria-expanded={shareOpen}
                            aria-disabled={blocked}
                            title={blocked ? "Fill the required fields to share" : undefined}
                            className={ghostButton}
                        >
                            <Share2Icon size={14} aria-hidden="true" className="shrink-0" />
                            Share
                            <ChevronDown
                                size={14}
                                aria-hidden="true"
                                className={`shrink-0 transition-transform ${shareOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                        {shareOpen && !blocked ? (
                            <div
                                role="menu"
                                aria-label="Share options"
                                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-line bg-white py-1 text-left shadow-sheet"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => void copyText()}
                                    disabled={shareBusy}
                                    className={menuItem(shareBusy)}
                                >
                                    {copied ? (
                                        <Check size={15} aria-hidden="true" className="shrink-0 text-tertiary" />
                                    ) : (
                                        <Copy size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    )}
                                    <span>
                                        {copied ? "Copied!" : "Copy invoice text"}
                                        <span className="block text-[11px] font-normal text-muted">
                                            Plain-text summary
                                        </span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setShareOpen(false);
                                        void runShare("share");
                                    }}
                                    disabled={shareBusy}
                                    className={menuItem(shareBusy)}
                                >
                                    <Share2Icon size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    <span>
                                        Share invoice PDF
                                        <span className="block text-[11px] font-normal text-muted">
                                            PDF via system share sheet
                                        </span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setShareOpen(false);
                                        void runShare("email");
                                    }}
                                    disabled={shareBusy}
                                    className={menuItem(shareBusy)}
                                >
                                    <Mail size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    <span>
                                        Email invoice
                                        <span className="block text-[11px] font-normal text-muted">
                                            Saves the PDF, then opens your mail app
                                        </span>
                                    </span>
                                </button>
                            </div>
                        ) : null}
                        {shareNote ? (
                            <p
                                role="status"
                                className="absolute right-0 top-full mt-2 w-52 rounded-sm border border-line bg-white px-3 py-2 text-[11px] text-on-surface-variant shadow-sheet"
                            >
                                {shareNote}
                            </p>
                        ) : null}
                    </div>

                    <div ref={menuRef} className="relative shrink-0 md:hidden">
                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen((open) => !open);
                                setStatus(null);
                            }}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            aria-label="More actions"
                            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-sm bg-surface-container-low px-3 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant select-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] md:hidden"
                        >
                            <Menu size={16} aria-hidden="true" className="shrink-0" />
                        </button>
                        {menuOpen ? (
                            <div
                                role="menu"
                                aria-label="More actions"
                                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-line bg-white py-1 text-left shadow-sheet"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onReset?.();
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                                >
                                    <Repeat2 size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onPrint?.();
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                                >
                                    <Printer size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    Print
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        if (blocked) {
                                            showBlockedWarning();
                                            return;
                                        }
                                        setMenuOpen(false);
                                        void copyText();
                                    }}
                                    disabled={shareBusy}
                                    className={menuItem(shareBusy)}
                                >
                                    {copied ? (
                                        <Check size={15} aria-hidden="true" className="shrink-0 text-tertiary" />
                                    ) : (
                                        <Copy size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    )}
                                    {copied ? "Copied!" : "Copy invoice text"}
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        if (blocked) {
                                            showBlockedWarning();
                                            return;
                                        }
                                        if (shareBusy) return;
                                        setMenuOpen(false);
                                        void runShare("share");
                                    }}
                                    disabled={shareBusy}
                                    className={menuItem(shareBusy)}
                                >
                                    <Share2Icon size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    Share invoice PDF
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        if (blocked) {
                                            showBlockedWarning();
                                            return;
                                        }
                                        if (shareBusy) return;
                                        setMenuOpen(false);
                                        void runShare("email");
                                    }}
                                    disabled={shareBusy}
                                    className={menuItem(shareBusy)}
                                >
                                    <Mail size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    Email invoice
                                </button>
                            </div>
                        ) : null}
                        {shareNote ? (
                            <p
                                role="status"
                                className="absolute right-0 top-full mt-2 w-52 rounded-sm border border-line bg-white px-3 py-2 text-[11px] text-on-surface-variant shadow-sheet"
                            >
                                {shareNote}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            if (missingFields.length > 0) {
                                showBlockedWarning();
                                return;
                            }
                            setWarning(null);
                            onExportPdf?.();
                        }}
                        aria-disabled={missingFields.length > 0}
                        title={blocked ? "Fill the required fields to export" : undefined}
                        className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-semibold whitespace-nowrap select-none transition-colors active:scale-[0.98] max-sm:px-3 ${
                            missingFields.length > 0
                                ? "bg-primary/50 text-on-primary/50 hover:bg-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                : "bg-primary text-on-primary shadow-sm hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        }`}
                    >
                        <Download size={14} aria-hidden="true" className="shrink-0" />
                        Export
                    </button>
                </nav>
            </div>
            {warning ? (
                <div
                    role="alert"
                    className="fixed top-20 right-4 z-50 flex max-w-sm items-start gap-2.5 rounded-lg border border-error/30 bg-white px-4 py-3 shadow-sheet"
                >
                    <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-error" />
                    <p className="text-xs leading-5 font-medium text-on-surface">{warning}</p>
                    <button
                        type="button"
                        onClick={() => setWarning(null)}
                        aria-label="Dismiss warning"
                        className="shrink-0 cursor-pointer rounded-sm p-0.5 text-muted transition-colors hover:text-on-surface"
                    >
                        <X size={14} aria-hidden="true" />
                    </button>
                </div>
            ) : null}
        </header>
    );
};

export default Header;
