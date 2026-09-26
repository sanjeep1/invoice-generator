import { Building2, QrCode, Upload, X } from "lucide-react";
import jsQR from "jsqr";
import { useRef, useState, type ChangeEvent } from "react";
import Field from "@/components/Field";
import type { BankAccountDetails } from "@/types/invoice";
import Image from "next/image";

type BankDetailsProps = {
    value?: BankAccountDetails;
    onChange?: (patch: Partial<BankAccountDetails>) => void;
};

const defaultValue: BankAccountDetails = {
    accountHolder: "",
    bankAndBranch: "",
    accountNumber: "",
    swiftCode: "",
    paymentReference: "",
    qrImage: "",
};

const ALLOWED_QR_TYPES = ["image/png", "image/jpeg"];
const MAX_QR_SIZE = 2 * 1024 * 1024; // 2 MB upload cap
const QR_SCAN_MAX_DIM = 800; // downscale target for fast QR decoding

// Returns true when the image contains a decodable QR code.
function decodeQrFromDataUrl(dataUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            try {
                const scale = Math.min(1, QR_SCAN_MAX_DIM / Math.max(img.width, img.height));
                const w = Math.max(1, Math.round(img.width * scale));
                const h = Math.max(1, Math.round(img.height * scale));
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                if (!ctx) {
                    resolve(false);
                    return;
                }
                ctx.drawImage(img, 0, 0, w, h);
                const imageData = ctx.getImageData(0, 0, w, h);
                resolve(jsQR(imageData.data, w, h) !== null);
            } catch {
                resolve(false);
            }
        };
        img.onerror = () => resolve(false);
        img.src = dataUrl;
    });
}

export default function BankDetails({ value, onChange }: BankDetailsProps) {
    const details = value ?? defaultValue;
    const fileRef = useRef<HTMLInputElement>(null);
    const [qrError, setQrError] = useState("");
    const [qrChecking, setQrChecking] = useState(false);

    // Text fields merge straight into state; qrImage is set by handleFile.
    const handleChange =
        (key: keyof BankAccountDetails) => (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.({ [key]: e.target.value } as Partial<BankAccountDetails>);
        };

    // Upload pipeline: MIME/extension check → size check → QR-content check.
    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || qrChecking) return;
        const ext = file.name.split(".").pop()?.toLowerCase();
        const typeOk =
            ALLOWED_QR_TYPES.includes(file.type) ||
            (!file.type && (ext === "png" || ext === "jpg" || ext === "jpeg"));
        if (!typeOk) {
            setQrError("Only PNG or JPG/JPEG images are allowed.");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_QR_SIZE) {
            setQrError("Image must be 2 MB or smaller.");
            e.target.value = "";
            return;
        }
        setQrError("");
        setQrChecking(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const dataUrl = reader.result;
                if (typeof dataUrl !== "string") {
                    setQrError("Could not read this image. Please try another file.");
                    return;
                }
                const hasQr = await decodeQrFromDataUrl(dataUrl);
                if (!hasQr) {
                    setQrError("No QR code detected. Please upload an image of a valid QR code.");
                    return;
                }
                onChange?.({ qrImage: dataUrl });
            } finally {
                setQrChecking(false);
            }
        };
        reader.onerror = () => {
            setQrError("Could not read this image. Please try another file.");
            setQrChecking(false);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleRemove = () => {
        onChange?.({ qrImage: "" });
        setQrError("");
    };

    return (
        <section className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-[0_1px_2px_0_rgba(0, 0, 0, 0.05)]">
            <div className="flex justify-between border-b border-surface-container pb-2">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <h2 className="text-headline-sm text-on-surface">
                        Bank Details &amp; Payout Routing
                    </h2>
                </div>
                <div className="rounded-xs bg-primary/10 px-2 py-0.5 font-serif text-[11px] font-medium tracking-wider">
                    <p>Direct Wire</p>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-6 max-lg:grid-cols-1">
                <div className="col-span-7 grid grid-cols-2 content-start gap-4 max-md:grid-cols-1 max-lg:col-span-1">
                    <div className="col-span-2 max-md:col-span-1">
                        <Field
                            label="Account Holder Name"
                            placeholder="e.g. Julian Vance"
                            value={details.accountHolder}
                            onChange={handleChange("accountHolder")}
                            autoComplete="off"
                        />
                    </div>
                    <div className="col-span-2 max-md:col-span-1">
                        <Field
                            label="Bank and Branch"
                            placeholder="e.g. Deutsche Bank, Berlin Hauptstrasse Branch"
                            value={details.bankAndBranch}
                            onChange={handleChange("bankAndBranch")}
                            autoComplete="off"
                        />
                    </div>
                    <Field
                        label="Account Number"
                        placeholder="e.g. 0532 0130 00"
                        value={details.accountNumber}
                        onChange={handleChange("accountNumber")}
                        autoComplete="off"
                        inputMode="numeric"
                    />
                    <Field
                        label="SWIFT Code"
                        placeholder="e.g. COBADEFFXXX"
                        value={details.swiftCode}
                        onChange={handleChange("swiftCode")}
                        autoComplete="off"
                        style={{ textTransform: "uppercase" }}
                    />
                    <div className="col-span-2 max-md:col-span-1">
                        <Field
                            label="Payment Reference"
                            placeholder="e.g. INV-2025-084"
                            value={details.paymentReference}
                            onChange={handleChange("paymentReference")}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="col-span-5 flex flex-col gap-3 rounded-lg border border-surface-container bg-surface-container-low p-4 max-lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                            <QrCode size={14} stroke="var(--primary)" />
                            <p>Payment QR Code</p>
                        </div>
                        {details.qrImage ? (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="flex items-center gap-1 rounded-sm bg-white px-2 py-1 text-[11px] font-medium text-on-surface-variant transition-colors hover:text-error"
                                aria-label="Remove QR image"
                            >
                                <X size={12} />
                                Remove
                            </button>
                        ) : null}
                    </div>
                    {details.qrImage ? (
                        <Image
                            width={50}
                            height={50}
                            src={details.qrImage}
                            alt="Payment QR code"
                            className="mx-auto size-28 rounded-sm border border-surface-container bg-white object-contain p-1"
                        />
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-divider bg-white/60 px-3 py-6 text-center">
                            <QrCode size={22} stroke="var(--muted)" />
                            <p className="text-[11px] font-medium text-on-surface-variant">
                                No QR uploaded
                            </p>
                            <small className="text-[10px] leading-3.75 text-muted">
                                PNG or JPG/JPEG only · Max 2 MB
                            </small>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={qrChecking}
                        className="flex items-center justify-center gap-1.5 rounded-sm bg-white px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-container disabled:cursor-wait disabled:opacity-60"
                    >
                        <Upload size={13} />
                        {qrChecking ? "Scanning QR…" : details.qrImage ? "Replace QR" : "Upload QR"}
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFile}
                        className="hidden"
                        aria-label="Upload payment QR image (PNG or JPG, max 2 MB)"
                    />
                    {qrError ? (
                        <p role="alert" className="text-[11px] leading-4 text-error">
                            {qrError}
                        </p>
                    ) : null}
                </div>
            </div>

        </section>
    );
}
