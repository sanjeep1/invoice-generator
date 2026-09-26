import ClientSelect from "@/components/ClientSelect";
import DetailsCard from "@/components/DetailsCard";
import LineItemsCard from "@/components/LineItemsCard";
import LogoUpload from "@/components/LogoUpload";
import MetadataCard from "@/components/MetadataCard";
import NotesCard from "@/components/NotesCard";
import type { BankAccountDetails, InvoiceItem, InvoiceMeta } from "@/types/invoice";
import BankDetails from "./BankDetails";

type EditorPanelProps = {
    items: InvoiceItem[];
    onAddItem: () => void;
    onUpdateItem: (
        id: string,
        key: "description" | "quantity" | "rate",
        value: string,
    ) => void;
    meta: InvoiceMeta;
    onMetaChange: (patch: Partial<InvoiceMeta>) => void;
    bankDetails: BankAccountDetails;
    onBankDetailsChange: (patch: Partial<BankAccountDetails>) => void;
};

export default function EditorPanel({
    items,
    onAddItem,
    onUpdateItem,
    meta,
    onMetaChange,
    bankDetails,
    onBankDetailsChange,
}: EditorPanelProps) {
    return (
        <section className="flex flex-col gap-6">
            <MetadataCard value={meta} onChange={onMetaChange} />
            <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                <DetailsCard
                    title="Your Details (Issuer)"
                    side="Sender"
                    media={<LogoUpload />}
                    fields={[
                        { label: "Freelancer or Studio Name", defaultValue: "Julian Vance" },
                        {
                            label: "Business Entity / Trading Title",
                            defaultValue: "Vance Interactive Studio Ltd.",
                        },
                        { label: "Business Email", defaultValue: "billing@vancestudio.design" },
                        { label: "Phone", defaultValue: "9876543210", type: "tel" },
                        { label: "Tax / PAN / VAT ID", defaultValue: "849204910" },
                        { label: "Country / City", defaultValue: "Berlin, Germany" },
                    ]}
                />
                <DetailsCard
                    title="♙ Client Details"
                    side="Recipient"
                    media={<ClientSelect />}
                    fields={[
                        { label: "Client or Company Name", defaultValue: "Aster & Co." },
                        { label: "Contact Person", defaultValue: "Marina Ellis" },
                        { label: "Client Email", defaultValue: "hello@asterandco.com" },
                        { label: "Phone", defaultValue: "9876543210", type: "tel" },
                        { label: "Tax / PAN / VAT ID", defaultValue: "942298120" },
                        { label: "Country / City", defaultValue: "New York, USA" },
                    ]}
                />
            </div>
            <LineItemsCard items={items} onAdd={onAddItem} onUpdate={onUpdateItem} />
            <NotesCard />
            <BankDetails value={bankDetails} onChange={onBankDetailsChange} />
        </section>
    );
}
