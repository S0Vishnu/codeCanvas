import React from "react";
import { type Toast as ToastType } from "../types/toast"; // Fixed import
import { useToast } from "../providers/ToastContext";
import "../styles/Toast.css";

interface ToastProps {
    toast: ToastType;
    onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const getIcon = () => {
        switch (toast.type) {
            case "success":
                return "✓";
            case "error":
                return "✕";
            case "warning":
                return "⚠";
            case "info":
                return "ℹ";
            default:
                return "ℹ";
        }
    };

    return (
        <div className={`toast toast-${toast.type}`}>
            <div className="toast-content">
                <span className="toast-icon">{getIcon()}</span>
                <span className="toast-message">{toast.message}</span>
            </div>
            <button
                className="toast-close btn-base"
                onClick={() => onClose(toast.id)}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container flex-col gap-sm" aria-live="polite" aria-atomic="true">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
    );
};
