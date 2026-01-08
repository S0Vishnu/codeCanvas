import React, { type TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
    error?: boolean;
    className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ error = false, className = "", ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={`input-field ${error ? "error" : ""} ${className}`}
                {...props}
            />
        );
    }
);

Textarea.displayName = "Textarea";

