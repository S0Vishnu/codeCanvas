import React, { type ReactNode } from "react";

export interface InputLabelProps {
    htmlFor?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}

export const InputLabel: React.FC<InputLabelProps> = ({
    htmlFor,
    required = false,
    children,
    className = "",
}) => {
    return (
        <label
            htmlFor={htmlFor}
            className={`label-text ${required ? "required" : ""} ${className}`}
        >
            {children}
        </label>
    );
};

