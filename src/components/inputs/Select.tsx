import React, { type SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
    options: SelectOption[];
    error?: boolean;
    className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, error = false, className = "", ...props }, ref) => {
        return (
            <select
                ref={ref}
                className={`input-select ${error ? "error" : ""} ${className}`}
                {...props}
            >
                {props.placeholder && (
                    <option value="" disabled>
                        {props.placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }
);

Select.displayName = "Select";

