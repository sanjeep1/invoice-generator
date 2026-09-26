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
        <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
            <span>Saved clients</span>
            <select
                className="h-7.5 w-full rounded-sm border-0 bg-surface-container-low px-2.5 py-1.5 text-[13px] text-on-surface outline-none focus:outline-2 focus:outline-primary-fixed-dim"
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
