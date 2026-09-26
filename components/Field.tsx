import type { InputHTMLAttributes } from "react";

type FieldProps = {
    label: string;
    defaultValue?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue">;

// Reusable labeled text input. Spreads extra props onto the <input> so
// callers can make it controlled (value/onChange) or specialized (type/date).
export default function Field({ label, defaultValue, ...inputProps }: FieldProps) {
    return (
        <label className="flex flex-col gap-1 text-xs text-on-surface-variant">
            <span>{label}</span>
            <input
                className="h-7.5 w-full rounded-sm border-0 bg-surface-container-low px-2.5 py-1.5 text-[13px] text-on-surface outline-none focus:outline-2 focus:outline-primary-fixed-dim"
                defaultValue={defaultValue}
                {...inputProps}
            />
        </label>
    );
}
