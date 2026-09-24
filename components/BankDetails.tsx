import { Building2 } from "lucide-react"

export default function BankDetails() {
    return (
        <section className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-[0_1px_2px_0_rgba(0, 0, 0, 0.05)]">
            <div className="flex justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                    <Building2 />
                    <h2>Bank Details & Payout Routing</h2>
                </div>
                <div className="rounded-xs py-0.5 px-2 bg-primary/10 text-[11px] font-serif tracking-wider font-medium letter-spacing-[0.22px]">
                    <p>Direct Wire</p>
                </div>
            </div>
            <div className="grid grid-cols-12 grid-rows-1 gap-6 w-[660.67px] h-68.5">
                <div>
                    <p>Account Details</p>
                </div>

                <div className="w-[261.28px] h-[146.5px] justify-between rounded-lg border p-4 left-[399.39px] row-start-1 col-start-8 col-span-5 row-span-1">
                    <p>Upload QR</p>
                </div>
            </div>
        </section>
    );
}