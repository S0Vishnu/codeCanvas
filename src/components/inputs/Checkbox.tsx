import { type InputHTMLAttributes, forwardRef } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
    error?: boolean;
    className?: string;
    label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ error = false, className = "", label, ...props }, ref) => {
        const checkbox = (
            <input
                ref={ref}
                type="checkbox"
                className={`input-checkbox ${error ? "error" : ""} ${className}`}
                {...props}
            />
        );

        if (label) {
            return (
                <label className="flex flex-row items-center gap-sm cursor-pointer">
                    {checkbox}
                    <span className="text-base text-main">{label}</span>
                </label>
            );
        }

        return checkbox;
    }
);

Checkbox.displayName = "Checkbox";

