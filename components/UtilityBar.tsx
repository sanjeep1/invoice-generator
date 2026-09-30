export default function UtilityBar() {
    // const actionButton =
    //     "rounded-sm bg-transparent p-2 text-xs text-on-surface-variant transition-colors hover:bg-surface-container-low";

    return (
        <section className="flex h-12.5 items-center justify-between border-b border-line bg-white px-6 text-xs text-on-surface-variant max-lg:px-4 print:hidden">
            <div className="flex items-center gap-2">
                <span className="text-[11px] text-primary-container">●</span>
                <b className="text-on-surface">Draft invoice</b>
                <span>·</span>
                <span className="max-md:hidden">
                    Autosaved locally — ready to export when you are.
                </span>
            </div>
            {/* <div className="flex items-center gap-2">
                <button className={`${actionButton} max-lg:hidden`}>↔ Switch layout</button>
                <button className={`${actionButton} max-lg:hidden`}>⎙ Clone</button>
                <button className={`${actionButton} max-lg:hidden`}>♧ Clear all</button>
                <button
                    className={`${actionButton} bg-primary px-4 text-white shadow-sm hover:bg-primary-container`}
                >
                    ↗ Publish invoice
                </button>
                <button className={actionButton}>•••</button>
            </div> */}
        </section>
    );
}
