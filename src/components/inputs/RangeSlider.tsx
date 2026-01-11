import { type InputHTMLAttributes, forwardRef } from "react";

export interface RangeSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
    error?: boolean;
    className?: string;
    showValue?: boolean;
    valueLabel?: (value: number) => string;
}

export const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
    ({ error = false, className = "", showValue = false, valueLabel, ...props }, ref) => {
        const currentValue = props.value !== undefined ? Number(props.value) : (props.defaultValue !== undefined ? Number(props.defaultValue) : 0);
        const displayValue = valueLabel ? valueLabel(currentValue) : currentValue.toString();

        return (
            <div className="flex flex-col gap-xs w-full">
                <div className="flex flex-row items-center gap-md w-full">
                    <input
                        ref={ref}
                        type="range"
                        className={`input-range ${error ? "error" : ""} ${className}`}
                        {...props}
                    />
                    {showValue && (
                        <span className="text-sm text-secondary min-w-[3rem] text-right">
                            {displayValue}
                        </span>
                    )}
                </div>
            </div>
        );
    }
);

RangeSlider.displayName = "RangeSlider";

