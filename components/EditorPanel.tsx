import ClientSelect from "@/components/ClientSelect";
import DetailsCard from "@/components/DetailsCard";
import LineItemsCard from "@/components/LineItemsCard";
import LogoUpload from "@/components/LogoUpload";
import MetadataCard from "@/components/MetadataCard";
import NotesCard from "@/components/NotesCard";
import type { BankAccountDetails, InvoiceDetails, InvoiceItem, InvoiceMeta } from "@/types/invoice";
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
    details: InvoiceDetails;
    onDetailsChange: (patch: Partial<InvoiceDetails>) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    bankDetails: BankAccountDetails;
    onBankDetailsChange: (patch: Partial<BankAccountDetails>) => void;
};

export default function EditorPanel({
    items,
    onAddItem,
    onUpdateItem,
    meta,
    onMetaChange,
    details,
    onDetailsChange,
    notes,
    onNotesChange,
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
                    value={details}
                    onChange={onDetailsChange}
                    fields={[
                        { label: "Freelancer or Studio Name", fieldKey: "senderName" },
                        {
                            label: "Business Entity / Trading Title",
                            fieldKey: "senderBusiness",
                        },
                        { label: "Business Email", fieldKey: "senderEmail" },
                        { label: "Phone", fieldKey: "senderPhone", type: "tel" },
                        { label: "Tax / PAN / VAT ID", fieldKey: "senderTaxId" },
                        { label: "Country / City", fieldKey: "senderCountry" },
                    ]}
                />
                <DetailsCard
                    title="♙ Client Details"
                    side="Recipient"
                    media={
                        // Saved-client choice fills the company-name field.
                        <ClientSelect
                            value={details.clientCompany || undefined}
                            onChange={(client) => onDetailsChange({ clientCompany: client })}
                        />
                    }
                    value={details}
                    onChange={onDetailsChange}
                    fields={[
                        { label: "Client or Company Name", fieldKey: "clientCompany" },
                        { label: "Contact Person", fieldKey: "clientName" },
                        { label: "Client Email", fieldKey: "clientEmail" },
                        { label: "Phone", fieldKey: "clientPhone", type: "tel" },
                        { label: "Tax / PAN / VAT ID", fieldKey: "clientTaxId" },
                        { label: "Country / City", fieldKey: "clientAddress" },
                    ]}
                />
            </div>
            <LineItemsCard
                items={items}
                onAdd={onAddItem}
                onUpdate={onUpdateItem}
                currency={meta.currency}
            />
            <NotesCard value={notes} onChange={onNotesChange} />
            <BankDetails value={bankDetails} onChange={onBankDetailsChange} />
        </section>
    );
}
