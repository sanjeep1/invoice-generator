import Image from "next/image";
import { X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

type LogoUploadProps = {
    value?: string;
    onChange?: (logo: string) => void;
};

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB upload cap

export default function LogoUpload({ value = "", onChange }: LogoUploadProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [logoError, setLogoError] = useState("");

    // Upload pipeline: MIME/extension check → size check → data-URL read.
    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split(".").pop()?.toLowerCase();
        const typeOk =
            ALLOWED_LOGO_TYPES.includes(file.type) ||
            (!file.type && (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "svg"));
        if (!typeOk) {
            setLogoError("Only PNG, JPG or SVG images are allowed.");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_LOGO_SIZE) {
            setLogoError("Image must be 2 MB or smaller.");
            e.target.value = "";
            return;
        }
        setLogoError("");
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (typeof dataUrl !== "string") {
                setLogoError("Could not read this image. Please try another file.");
                return;
            }
            onChange?.(dataUrl);
        };
        reader.onerror = () => {
            setLogoError("Could not read this image. Please try another file.");
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleRemove = () => {
        onChange?.("");
        setLogoError("");
    };

    return (
        <div className="flex items-center gap-2 rounded-sm border border-dashed border-divider bg-surface-container-low p-2.75">
            {value ? (
                <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-surface-container bg-white">
                    <Image
                        src={value}
                        alt="Brand logo preview"
                        width={48}
                        height={48}
                        className="size-12 object-contain p-1"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        aria-label="Remove logo"
                        className="absolute top-0 right-0 rounded-bl-sm bg-white/90 p-0.5 text-on-surface-variant transition-colors hover:text-error"
                    >
                        <X size={12} />
                    </button>
                </span>
            ) : (
                <span className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-surface-container bg-white text-xl">
                    ▧
                </span>
            )}
            <div className="flex flex-1 flex-col gap-0.5">
                <b className="text-xs text-on-surface">Brand Logo</b>
                <small className="text-[11px] leading-3.75 text-on-surface-variant">
                    PNG, JPG or SVG on live letterhead
                </small>
                {logoError ? (
                    <small role="alert" className="text-[11px] leading-3.75 text-error">
                        {logoError}
                    </small>
                ) : null}
            </div>
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-sm bg-white px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-container-low"
            >
                ↥ {value ? "Replace" : "Upload"}
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleFile}
                className="hidden"
                aria-label="Upload brand logo (PNG, JPG or SVG, max 2 MB)"
            />
        </div>
    );
}
