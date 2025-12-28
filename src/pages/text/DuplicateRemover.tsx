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
                    `Removed ${removed} duplicate line${removed !== 1 ? "s" : ""
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
        <div className="page-container flex-col gap-lg h-fit max-w-3xl mx-auto">
            <div className="flex-col gap-sm">
                <h2 className="text-title text-gradient">Duplicate Line Remover</h2>
                <p className="text-subtitle">Remove duplicate lines from your text automatically</p>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <label className="label-text">Input Text</label>
                <textarea
                    placeholder="Enter text with duplicate lines..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input-field min-h-[200px] font-mono resize-y"
                />

                <button onClick={handleRemoveDuplicates} className="btn-base btn-primary w-full">
                    Remove Duplicates
                </button>
            </div>

            {output && (
                <div className="glass-panel p-6 flex-col gap-md">
                    <div className="flex-row justify-between items-center">
                        <label className="label-text">Result</label>
                        <button onClick={handleCopy} className="btn-base btn-secondary text-xs px-3 py-1">
                            Copy Result
                        </button>
                    </div>
                    <textarea value={output} readOnly className="input-field min-h-[50vh] font-mono resize-y bg-black/40" />
                </div>
            )}
        </div>
    );
}
