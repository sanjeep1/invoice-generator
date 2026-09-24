export default function LogoUpload() {
    return (
        <div className="mb-2.5 flex items-center gap-2 rounded-sm border border-dashed border-divider bg-surface-container-low p-2.75">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-surface-container bg-white text-xl">
                ▧
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
                <b className="text-xs text-on-surface">Brand / Studio Logo</b>
                <small className="text-[11px] leading-3.75 text-on-surface-variant">
                    PNG, JPG or SVG on live letterhead
                </small>
            </div>
            <button className="rounded-sm bg-white px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-container-low">
                ↥ Upload
            </button>
        </div>
    );
}
