import React, { type InputHTMLAttributes, forwardRef } from "react";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
    error?: boolean;
    className?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ error = false, className = "", ...props }, ref) => {
        return (
            <input
                ref={ref}
                type="text"
                className={`input-field ${error ? "error" : ""} ${className}`}
                {...props}
            />
        );
    }
);

TextInput.displayName = "TextInput";

