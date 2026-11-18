import ClientSave from "@/components/ClientSave";
import DetailsCard from "@/components/DetailsCard";
import IssuerSave from "@/components/IssuerSave";
import LineItemsCard from "@/components/LineItemsCard";
import LogoUpload from "@/components/LogoUpload";
import MetadataCard from "@/components/MetadataCard";
import NotesCard from "@/components/NotesCard";
import type { BankAccountDetails, DiscountConfig, InvoiceDetails, InvoiceItem, InvoiceMeta, TaxConfig } from "@/types/invoice";
import { SAMPLE_DETAILS } from "@/lib/sample-invoice";
import { Building2, User } from "lucide-react";
import BankDetails from "./BankDetails";

type EditorPanelProps = {
    items: InvoiceItem[];
    onAddItem: () => void;
    onUpdateItem: (
        id: string,
        key: "description" | "quantity" | "rate",
        value: string,
    ) => void;
    onRemoveItem: (id: string) => void;
    onMoveItem: (id: string, direction: "up" | "down") => void;
    onReorderItem: (dragId: string, targetId: string) => void;
    meta: InvoiceMeta;
    onMetaChange: (patch: Partial<InvoiceMeta>) => void;
    details: InvoiceDetails;
    onDetailsChange: (patch: Partial<InvoiceDetails>) => void;
    notes: string;
    onNotesChange: (value: string) => void;
    bankDetails: BankAccountDetails;
    onBankDetailsChange: (patch: Partial<BankAccountDetails>) => void;
    discount: DiscountConfig;
    onDiscountChange: (patch: Partial<DiscountConfig>) => void;
    tax: TaxConfig;
    onTaxChange: (patch: Partial<TaxConfig>) => void;
};

export default function EditorPanel({
    items,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    onMoveItem,
    onReorderItem,
    meta,
    onMetaChange,
    details,
    onDetailsChange,
    notes,
    onNotesChange,
    bankDetails,
    onBankDetailsChange,
    discount,
    onDiscountChange,
    tax,
    onTaxChange,
}: EditorPanelProps) {
    return (
        <section className="flex flex-col gap-6 print:hidden">
            <MetadataCard value={meta} onChange={onMetaChange} />
            <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                <DetailsCard
                    title="Your Details (Issuer)"
                    icon={<User stroke="var(--primary)" size={18} />}
                    side="Sender"
                    media={
                        <div className="flex flex-col gap-2">
                            <LogoUpload
                                value={details.senderLogo}
                                onChange={(logo) => onDetailsChange({ senderLogo: logo })}
                            />
                            {/* Saved-issuer choice fills the sender fields and
                                logo; editing them lets the profile be updated. */}
                            <IssuerSave
                                details={details}
                                onFillIssuer={onDetailsChange}
                            />
                        </div>
                    }
                    value={details}
                    onChange={onDetailsChange}
                    fields={[
                        { label: "Freelancer or Sender Name", fieldKey: "senderName", placeholder: SAMPLE_DETAILS.senderName, required: true },
                        {
                            label: "Business Entity / Trading Title",
                            fieldKey: "senderBusiness",
                            placeholder: SAMPLE_DETAILS.senderBusiness,
                        },
                        { label: "Email", fieldKey: "senderEmail", placeholder: SAMPLE_DETAILS.senderEmail, required: true },
                        { label: "Phone", fieldKey: "senderPhone", type: "tel", placeholder: SAMPLE_DETAILS.senderPhone },
                        { label: "Tax / PAN / VAT ID", fieldKey: "senderTaxId", placeholder: SAMPLE_DETAILS.senderTaxId },
                        { label: "Country / City", fieldKey: "senderCountry", placeholder: SAMPLE_DETAILS.senderCountry },
                    ]}
                />
                <DetailsCard
                    title="Client Details"
                    icon={<Building2 stroke="var(--primary)" size={18} />}
                    side="Recipient"
                    media={
                        // Saved-client choice fills all client fields; typing a
                        // new company name enables the Save Client button.
                        <ClientSave
                            details={details}
                            onFillClient={onDetailsChange}
                        />
                    }
                    value={details}
                    onChange={onDetailsChange}
                    fields={[
                        { label: "Client or Company Name", fieldKey: "clientCompany", placeholder: SAMPLE_DETAILS.clientCompany, required: true },
                        { label: "Contact Person", fieldKey: "clientName", placeholder: SAMPLE_DETAILS.clientName },
                        { label: "Email", fieldKey: "clientEmail", placeholder: SAMPLE_DETAILS.clientEmail, required: false },
                        { label: "Phone", fieldKey: "clientPhone", type: "tel", placeholder: SAMPLE_DETAILS.clientPhone },
                        { label: "Tax / PAN / VAT ID", fieldKey: "clientTaxId", placeholder: SAMPLE_DETAILS.clientTaxId },
                        { label: "Country / City", fieldKey: "clientAddress", placeholder: SAMPLE_DETAILS.clientAddress },
                    ]}
                />
            </div>
            <LineItemsCard
                items={items}
                onAdd={onAddItem}
                onUpdate={onUpdateItem}
                onRemove={onRemoveItem}
                onMove={onMoveItem}
                onReorder={onReorderItem}
                currency={meta.currency}
                discount={discount}
                onDiscountChange={onDiscountChange}
                tax={tax}
                onTaxChange={onTaxChange}
            />
            <NotesCard value={notes} onChange={onNotesChange} />
            <BankDetails value={bankDetails} onChange={onBankDetailsChange} />
        </section>
    );
}
