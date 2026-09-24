import Image from "next/image";
import Logo from "@/public/brandlogo.svg";
import { Download, File, FolderOpen, Printer, Repeat2, Send } from "lucide-react";

const Header = () => {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-line bg-surface/90 px-4 shadow-header backdrop-blur-xl sm:px-6">
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
                    <button
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
                    </button>

                    <button
                        type="button"
                        className="bg-surface-container-low shrink-0 cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant select-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] hidden md:inline-flex"
                    >
                        <Repeat2 size={14} aria-hidden="true" className="shrink-0" />
                        Reset
                    </button>

                    <button
                        type="button"
                        className="bg-surface-container-low shrink-0 cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant select-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] hidden md:inline-flex"
                    >
                        <Printer size={14} aria-hidden="true" className="shrink-0" />
                        Print
                    </button>

                    <button
                        type="button"
                        className="bg-surface-container-low shrink-0 cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-medium whitespace-nowrap text-on-surface-variant select-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] hidden md:inline-flex"
                    >
                        <File size={14} aria-hidden="true" className="shrink-0" />
                        Doc
                    </button>

                    <button
                        type="button"
                        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-sm border border-[#3525CD33] bg-surface-container-low px-4 py-2 whitespace-nowrap text-primary shadow-level-1 select-none transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <Send size={14} aria-hidden="true" className="shrink-0" />
                        Send
                    </button>

                    <button
                        type="button"
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
