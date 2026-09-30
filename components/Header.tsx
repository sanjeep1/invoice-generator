"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Logo from "@/public/brandlogo.svg";
import { Check, ChevronDown, Copy, Download, FolderOpen, Mail, Printer, Repeat2, Share2Icon } from "lucide-react";

type HeaderProps = {
    onReset?: () => void;
    onPrint?: () => void;
    onExportPdf?: () => void;
    shareSubject?: string;
    shareText?: string;
};

const ghostButton =
    "bg-surface-container-low shrink-0 cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant select-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] hidden md:inline-flex";

const Header = ({ onReset, onPrint, onExportPdf, shareSubject = "Invoice", shareText = "" }: HeaderProps) => {
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);

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

    const copyText = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
        } catch {
            // Clipboard API unavailable (permissions/insecure context): fall
            // back to a hidden textarea + execCommand.
            const area = document.createElement("textarea");
            area.value = shareText;
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

    const nativeShare = async () => {
        setShareOpen(false);
        if (typeof navigator !== "undefined" && "share" in navigator) {
            try {
                await navigator.share({ title: shareSubject, text: shareText });
            } catch {
                // User dismissed the sheet or share failed — stay silent.
            }
        } else {
            await copyText();
        }
    };

    const emailShare = () => {
        setShareOpen(false);
        window.location.href = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareText)}`;
    };

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
                            Invoice Studio
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
                            onClick={() => setShareOpen((open) => !open)}
                            aria-haspopup="menu"
                            aria-expanded={shareOpen}
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
                        {shareOpen ? (
                            <div
                                role="menu"
                                aria-label="Share options"
                                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-line bg-white py-1 text-left shadow-sheet"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        void copyText();
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
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
                                        void nativeShare();
                                    }}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                                >
                                    <Share2Icon size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    <span>
                                        Share via…
                                        <span className="block text-[11px] font-normal text-muted">
                                            System share sheet
                                        </span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={emailShare}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                                >
                                    <Mail size={15} aria-hidden="true" className="shrink-0 text-primary" />
                                    <span>
                                        Email invoice
                                        <span className="block text-[11px] font-normal text-muted">
                                            Opens your mail app
                                        </span>
                                    </span>
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={onExportPdf}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-semibold whitespace-nowrap text-on-primary shadow-sm select-none transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <Download size={14} aria-hidden="true" className="shrink-0" />
                        Export
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
