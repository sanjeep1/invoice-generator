// Picks a saved client; the parent maps the choice onto the client fields
// (currently `clientCompany`) via `onChange`.
const SAVED_CLIENTS = ["Aster & Co.", "Globex Corporation", "Initech LLC", "Umbrella Co."];

type ClientSelectProps = {
    clients?: string[];
    value?: string;
    onChange?: (client: string) => void;
};

export default function ClientSelect({
    clients = SAVED_CLIENTS,
    value,
    onChange,
}: ClientSelectProps) {
    return (
        <label className="flex flex-col gap-1.5 text-xs leading-4 font-medium text-on-surface-variant">
            <span>Saved clients</span>
            <select
                className="h-9 w-full cursor-pointer rounded-sm border border-line bg-surface-container-lowest px-3 py-2 text-[13px] font-normal text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50"
                value={value}
                defaultValue={value === undefined ? clients[0] : undefined}
                onChange={(e) => onChange?.(e.target.value)}
            >
                {clients.map((client) => (
                    <option key={client} value={client}>
                        {client}
                    </option>
                ))}
            </select>
        </label>
    );
}
