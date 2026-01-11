import { type InputHTMLAttributes, forwardRef } from "react";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
    error?: boolean;
    className?: string;
    label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ error = false, className = "", label, ...props }, ref) => {
        const radio = (
            <input
                ref={ref}
                type="radio"
                className={`input-radio ${error ? "error" : ""} ${className}`}
                {...props}
            />
        );

        if (label) {
            return (
                <label className="flex flex-row items-center gap-sm cursor-pointer">
                    {radio}
                    <span className="text-base text-main">{label}</span>
                </label>
            );
        }

        return radio;
    }
);

Radio.displayName = "Radio";

