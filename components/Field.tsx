import type { InputHTMLAttributes } from "react";

type FieldProps = {
    label: string;
    defaultValue?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue">;

// Reusable labeled text input. Spreads extra props onto the <input> so
// callers can make it controlled (value/onChange) or specialized (type/date).
export default function Field({ label, defaultValue, required, ...inputProps }: FieldProps) {
    return (
        <label className="flex flex-col gap-1.5 text-xs leading-4 font-medium text-on-surface-variant">
            <span>
                {label}
                {required ? (
                    <span aria-hidden="true" className="ml-0.5 text-error">
                        *
                    </span>
                ) : null}
            </span>
            <input
                className="h-9 w-full rounded-sm border border-line bg-surface-container-lowest px-3 py-2 text-[13px] font-normal text-on-surface shadow-[inset_0_1px_2px_rgb(15_23_42/0.05)] outline-none transition placeholder:text-muted/60 hover:border-divider focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim/50 disabled:cursor-not-allowed disabled:opacity-60"
                defaultValue={defaultValue}
                required={required}
                {...inputProps}
            />
        </label>
    );
}
