import { useState, useEffect } from "react";
import { storage } from "../../utils/storage";
import "../../styles/texts/DuplicateRemover.css";
import { useToast } from "../../providers/ToastContext";

export function DuplicateRemover() {
    const { addToast } = useToast();
    const [input, setInput] = useState(() => storage.get("duplicate-remover-input", ""));
    const [output, setOutput] = useState("");

    useEffect(() => {
        storage.set("duplicate-remover-input", input);
    }, [input]);

    const handleRemoveDuplicates = () => {
        if (!input.trim()) {
            addToast("Please enter some text first", "warning");
            return;
        }

        try {
            const lines = input.split("\n").filter((line) => line.trim() !== "");
            const uniqueLines = [...new Set(lines)];
            const result = uniqueLines.join("\n");
            setOutput(result);

            const removed = lines.length - uniqueLines.length;
            const totalLines = lines.length;

            if (removed > 0) {
                addToast(
                    `Removed ${removed} duplicate line${
                        removed !== 1 ? "s" : ""
                    } (${totalLines} → ${uniqueLines.length})`,
                    "success"
                );
            } else if (totalLines === 0) {
                addToast("No text found to process", "warning");
            } else {
                addToast("No duplicates found - all lines are unique", "info");
            }
        } catch (error) {
            console.error("Error removing duplicates:", error);
            addToast("Error processing text", "error");
        }
    };

    const handleCopy = async () => {
        if (!output.trim()) {
            addToast("No text to copy", "warning");
            return;
        }

        try {
            await navigator.clipboard.writeText(output);
            addToast("Copied to clipboard!", "success");
        } catch (error) {
            console.error("Copy failed:", error);

            // Fallback copy method
            try {
                const textArea = document.createElement("textarea");
                textArea.value = output;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                addToast("Copied to clipboard!", "success");
            } catch (fallbackError) {
                console.error("Fallback copy failed:", fallbackError);
                addToast("Failed to copy to clipboard", "error");
            }
        }
    };

    return (
        <div className="duplicate-remover">
            <div className="dr-section">
                <label className="dr-label">Input Text</label>
                <textarea
                    placeholder="Enter text with duplicate lines..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="dr-textarea"
                />
            </div>

            <button onClick={handleRemoveDuplicates} className="dr-btn dr-action-btn">
                Remove Duplicates
            </button>

            {output && (
                <div className="dr-section">
                    <div className="dr-output-header">
                        <label className="dr-label">Output</label>
                        <button onClick={handleCopy} className="dr-btn dr-copy-btn">
                            Copy
                        </button>
                    </div>
                    <textarea value={output} readOnly className="dr-output" />
                </div>
            )}
        </div>
    );
}
