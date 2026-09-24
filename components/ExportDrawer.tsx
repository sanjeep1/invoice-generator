export default function ExportDrawer() {
    const actionButton =
        "rounded-sm bg-surface-container px-4 py-2 text-xs text-on-surface transition-colors hover:bg-surface-container-low max-md:hidden";

    return (
        <aside className="fixed right-0 bottom-12 left-0 z-10 flex h-16.5 items-center justify-between bg-white px-6 py-4 shadow-[0_-4px_12px_rgb(15_23_42/0.08)] max-lg:px-4">
            <div className="text-xs text-on-surface-variant max-lg:hidden">
                <b className="mr-3 text-on-surface">Keyboard shortcuts</b>
                <span className="mr-3">
                    <kbd className="rounded-sm border border-[#d9d9e2] bg-surface-container-low px-2 py-0.75 font-mono text-[11px]">
                        ⌘
                    </kbd>{" "}
                    +{" "}
                    <kbd className="rounded-sm border border-[#d9d9e2] bg-surface-container-low px-2 py-0.75 font-mono text-[11px]">
                        S
                    </kbd>{" "}
                    Save draft
                </span>
                <span>
                    <kbd className="rounded-sm border border-[#d9d9e2] bg-surface-container-low px-2 py-0.75 font-mono text-[11px]">
                        ⌘
                    </kbd>{" "}
                    Export
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button className={actionButton}>✉ Send via Email</button>
                <button className={actionButton}>⇩ Export .docx</button>
                <button className="rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-container">
                    ⇩ 1-Click PDF
                </button>
            </div>
        </aside>
    );
}
