import React, { useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import "../styles/components/Dropdown.css";

export interface DropdownOption {
    label: string;
    value: string | number;
    icon?: ReactNode;
    disabled?: boolean;
}

export interface DropdownProps {
    options: DropdownOption[];
    value?: string | number;
    onChange?: (value: string | number) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
    optionClassName?: string;
    optionStyle?: CSSProperties;
    dropdownClassName?: string;
    dropdownStyle?: CSSProperties;
    renderOption?: (option: DropdownOption, isSelected: boolean) => ReactNode;
    portalTarget?: HTMLElement; // defaults to document.body
    closeOnSelect?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    disabled = false,
    className = "",
    style,
    optionClassName = "",
    optionStyle,
    dropdownClassName = "",
    dropdownStyle,
    renderOption,
    portalTarget,
    closeOnSelect = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
        top: 0,
        left: 0,
        width: 0,
    });
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (disabled) return;
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
        setIsOpen((prev) => !prev);
    };

    const handleSelect = (option: DropdownOption) => {
        if (option.disabled) return;
        onChange?.(option.value);
        if (closeOnSelect) setTimeout(() => setIsOpen(false), 0);
    };

    const selectedOption = options.find((o) => o.value === value);

    const dropdown = (
        <div
            ref={dropdownRef}
            className={`dropdown-options ${dropdownClassName}`}
            style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                position: "absolute",
                ...dropdownStyle,
            }}
            onMouseDown={(e) => e.stopPropagation()} // prevent outside click closure
        >
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <div
                        key={option.value}
                        className={`dropdown-option ${optionClassName} ${
                            isSelected ? "selected" : ""
                        } ${option.disabled ? "disabled" : ""}`}
                        style={optionStyle}
                        onClick={() => handleSelect(option)}
                    >
                        {renderOption ? (
                            renderOption(option, isSelected)
                        ) : (
                            <>
                                {option.icon && (
                                    <span className="dropdown-option-icon">{option.icon}</span>
                                )}
                                {option.label}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div
            ref={triggerRef}
            className={`dropdown-trigger ${className} ${disabled ? "disabled" : ""}`}
            style={style}
            onClick={toggleDropdown}
        >
            <span className={`dropdown-selected ${selectedOption ? "" : "placeholder"}`}>
                {selectedOption ? selectedOption.label : placeholder}
            </span>
            {isOpen && createPortal(dropdown, portalTarget || document.body)}
        </div>
    );
};

export default Dropdown;
