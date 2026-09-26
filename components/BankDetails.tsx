import { Building2, QrCode } from "lucide-react";
import type { ChangeEvent } from "react";
import Field from "@/components/Field";
import type { BankAccountDetails } from "@/types/invoice";

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
};

export default function BankDetails({ value, onChange }: BankDetailsProps) {
    const details = value ?? defaultValue;

    const handleChange =
        (key: keyof BankAccountDetails) => (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.({ [key]: e.target.value });
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
                <div className="col-span-5 flex flex-col justify-between rounded-lg border border-surface-container bg-surface-container-low p-4 max-lg:col-span-1">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                        <QrCode size={14} stroke="var(--primary)" />
                        <p>Payment QR Code</p>
                    </div>
                </div>
            </div>

        </section>
    );
}
