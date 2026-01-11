import { type InputHTMLAttributes, forwardRef } from "react";

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
    error?: boolean;
    className?: string;
    accept?: string;
    multiple?: boolean;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    ({ error = false, className = "", accept, multiple = false, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type="file"
                accept={accept}
                multiple={multiple}
                className={`input-file ${error ? "error" : ""} ${className}`}
                {...props}
            />
        );
    }
);

FileInput.displayName = "FileInput";

