import { useState, useEffect } from "react";
import Dropdown from "../../components/Dropdown";
import "../../styles/texts/TextSorter.css";
import { useToast } from "../../providers/ToastContext";

export function TextSorter() {
    const { addToast } = useToast();

    const [input, setInput] = useState(() => localStorage.getItem("text-sorter-input") || "");
    const [output, setOutput] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [removeDuplicates, setRemoveDuplicates] = useState(true);

    useEffect(() => {
        localStorage.setItem("text-sorter-input", input);
    }, [input]);

    const [isCopying, setIsCopying] = useState(false);

    const handleSort = async () => {
        if (!input.trim()) {
            addToast("Please enter some text to sort", "warning");
            return;
        }

        // Small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            let lines = input.split("\n").filter((line) => line.trim());
            const originalLength = lines.length;

            if (removeDuplicates) {
                const beforeDedupe = lines.length;
                lines = [...new Set(lines)];
                const removedCount = beforeDedupe - lines.length;

                if (removedCount > 0) {
                    addToast(
                        `Removed ${removedCount} duplicate line${removedCount !== 1 ? "s" : ""}`,
                        "info"
                    );
                }
            }

            lines.sort((a, b) => {
                const cmp = a.localeCompare(b, undefined, { sensitivity: "base" });
                return sortOrder === "asc" ? cmp : -cmp;
            });

            setOutput(lines.join("\n"));

            // Success message
            const lineCount = lines.length;
            const order = sortOrder === "asc" ? "ascending" : "descending";

            addToast(
                `Sorted ${lineCount} line${
                    lineCount !== 1 ? "s" : ""
                } in ${order} order, Original lines ${originalLength}`,
                "success"
            );
        } catch (error) {
            console.error("Error sorting text:", error);
            addToast("Error sorting text. Please try again.", "error");
        }
    };

    const handleCopy = async () => {
        if (!output.trim() || isCopying) {
            addToast("No text to copy", "warning");
            return;
        }

        setIsCopying(true);

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(output);
                addToast("📋 Copied to clipboard!", "success");
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = output;
                textArea.style.position = "fixed";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
                addToast("📋 Copied to clipboard!", "success");
            }
        } catch (error) {
            console.error("Copy failed:", error);
            addToast("❌ Failed to copy to clipboard", "error");
        } finally {
            setIsCopying(false);
        }
    };

    return (
        <div className="ts-container">
            {/* Input */}
            <div>
                <label className="ts-label">Input Text</label>
                <textarea
                    placeholder="Enter lines to sort..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="ts-textarea"
                />
            </div>

            {/* Controls */}
            <div className="ts-controls">
                <Dropdown
                    options={[
                        { label: "Ascending (A–Z)", value: "asc" },
                        { label: "Descending (Z–A)", value: "desc" },
                    ]}
                    value={sortOrder}
                    onChange={(val) => setSortOrder(val as "asc" | "desc")}
                    placeholder="Select order"
                    closeOnSelect
                />

                <button
                    onClick={() => setRemoveDuplicates(!removeDuplicates)}
                    className={`ts-btn ${removeDuplicates ? "ts-btn-active" : "ts-btn-outline"}`}
                >
                    {removeDuplicates ? "Remove Duplicates" : "Keep Duplicates"}
                </button>
                {/* Sort Button */}
                <button onClick={handleSort} className="ts-btn ts-btn-main">
                    Sort Text
                </button>
            </div>

            {/* Output */}
            {output && (
                <div className="ts-output-section">
                    <div className="ts-output-header">
                        <label className="ts-label">Output</label>
                        <button onClick={handleCopy} className="ts-btn ts-btn-copy">
                            Copy
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="ts-textarea"
                        placeholder="Sorted text will appear here..."
                    />
                </div>
            )}
        </div>
    );
}
