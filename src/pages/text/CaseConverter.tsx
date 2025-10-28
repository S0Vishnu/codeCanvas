import { useState, useEffect } from "react";
import { storage } from "../../utils/storage";
import "../../styles/texts/CaseConverter.css";
import { useToast } from "../../providers/ToastContext";

const caseTypes = [
    { id: "lower", label: "lowercase", fn: (s: string) => s.toLowerCase() },
    { id: "upper", label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
    {
        id: "title",
        label: "Title Case",
        fn: (s: string) =>
            s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
    },
    {
        id: "sentence",
        label: "Sentence case",
        fn: (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
    },
    {
        id: "camel",
        label: "camelCase",
        fn: (s: string) =>
            s
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (t, i) =>
                    i === 0 ? t.toLowerCase() : t.toUpperCase()
                )
                .replace(/\s+/g, ""),
    },
    {
        id: "pascal",
        label: "PascalCase",
        fn: (s: string) =>
            s.replace(/(?:^\w|[A-Z]|\b\w)/g, (t) => t.toUpperCase()).replace(/\s+/g, ""),
    },
    { id: "snake", label: "snake_case", fn: (s: string) => s.toLowerCase().replace(/\s+/g, "_") },
    { id: "kebab", label: "kebab-case", fn: (s: string) => s.toLowerCase().replace(/\s+/g, "-") },
    {
        id: "constant",
        label: "CONSTANT_CASE",
        fn: (s: string) => s.toUpperCase().replace(/\s+/g, "_"),
    },
    {
        id: "dot",
        label: "dot.case",
        fn: (s: string) => s.toLowerCase().replace(/\s+/g, "."),
    },
];

export function CaseConverter() {
    const { addToast } = useToast();
    const [input, setInput] = useState(() => storage.get("case-converter-input", ""));
    const [output, setOutput] = useState("");
    const [isCopying, setIsCopying] = useState(false);

    useEffect(() => {
        storage.set("case-converter-input", input);
    }, [input]);

    const handleConvert = (convertFn: (s: string) => string) => {
        if (!input.trim()) {
            addToast("Please enter some text to convert", "warning");
            return;
        }

        try {
            const result = convertFn(input);
            setOutput(result);
            addToast("Text converted successfully!", "success");
        } catch (error) {
            console.error("Conversion error:", error);
            addToast("Conversion failed. Please try again.", "error");
        }
    };

    const handleCopy = async (): Promise<void> => {
        if (!output.trim() || isCopying) return;

        setIsCopying(true);

        try {
            // Method 1: Modern Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(output);
                addToast("Copied to clipboard!", "success");
            }
            // Method 2: Legacy execCommand fallback
            else {
                await legacyCopy(output);
            }
        } catch (error) {
            console.error("Clipboard copy failed:", error);

            // Method 3: Manual copy fallback
            manualCopyFallback(output);
        } finally {
            setIsCopying(false);
        }
    };

    const legacyCopy = (text: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Style to be invisible
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = "2em";
            textArea.style.height = "2em";
            textArea.style.padding = "0";
            textArea.style.border = "none";
            textArea.style.outline = "none";
            textArea.style.boxShadow = "none";
            textArea.style.background = "transparent";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                const successful = document.execCommand("copy");
                document.body.removeChild(textArea);

                if (successful) {
                    addToast("Copied to clipboard!", "success");
                    resolve();
                } else {
                    reject(new Error("Copy command failed"));
                }
            } catch (error) {
                document.body.removeChild(textArea);
                reject(error);
            }
        });
    };

    const manualCopyFallback = (text: string): void => {
        // Create temporary input for manual selection
        const input = document.createElement("input");
        input.value = text;
        input.style.position = "fixed";
        input.style.top = "0";
        input.style.left = "0";
        input.style.opacity = "0";

        document.body.appendChild(input);
        input.select();
        input.focus();

        addToast("Text selected - press Ctrl+C to copy manually", "info", 4000);

        // Clean up
        setTimeout(() => {
            document.body.removeChild(input);
        }, 100);
    };

    const clearAll = (): void => {
        setInput("");
        setOutput("");
        addToast("Cleared all text", "info");
    };

    const copyInput = async (): Promise<void> => {
        if (!input.trim()) {
            addToast("No input text to copy", "warning");
            return;
        }

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(input);
                addToast("Input copied to clipboard!", "success");
            } else {
                await legacyCopy(input);
            }
        } catch (error) {
            console.error("Copy input failed:", error);
            manualCopyFallback(input);
        }
    };

    return (
        <div className="case-converter">
            <div className="case-header">
                <h2>Text Case Converter</h2>
                <div className="case-actions">
                    <button
                        onClick={clearAll}
                        className="case-action-btn clear-btn"
                        disabled={!input && !output}
                    >
                        Clear All
                    </button>
                </div>
            </div>

            <div className="case-section">
                <div className="case-input-header">
                    <label className="case-label">Input Text</label>
                    <button onClick={copyInput} className="case-copy-btn" disabled={!input.trim()}>
                        📋 Copy Input
                    </button>
                </div>
                <textarea
                    placeholder="Enter your text here to convert between different cases..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="case-textarea"
                    rows={5}
                />
                <div className="case-input-info">
                    <span>
                        Characters: {input.length} | Words:{" "}
                        {input.trim() ? input.trim().split(/\s+/).length : 0}
                    </span>
                </div>
            </div>

            <div className="case-buttons-section">
                <h3>Convert To:</h3>
                <div className="case-buttons">
                    {caseTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => handleConvert(type.fn)}
                            className="case-btn"
                            disabled={!input.trim()}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {output && (
                <div className="case-section">
                    <div className="case-output-header">
                        <label className="case-label">Converted Output</label>
                        <button
                            onClick={handleCopy}
                            className="case-copy-btn"
                            disabled={isCopying || !output.trim()}
                        >
                            {isCopying ? "Copying..." : "📋 Copy Output"}
                        </button>
                    </div>
                    <textarea value={output} readOnly className="case-output" rows={5} />
                    <div className="case-output-info">
                        <span>
                            Characters: {output.length} | Words:{" "}
                            {output.trim() ? output.trim().split(/\s+/).length : 0}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
