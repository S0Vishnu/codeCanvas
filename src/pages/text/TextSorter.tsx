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
                `Sorted ${lineCount} line${lineCount !== 1 ? "s" : ""
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
        <div className="page-container flex-col gap-lg h-fit max-w-3xl mx-auto">
            <div className="flex-col gap-sm">
                <h2 className="text-title text-gradient">Text Sorter</h2>
                <p className="text-subtitle">Sort lines of text alphabetically or numerically</p>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <div className="flex-col gap-sm">
                    <label className="label-text">Input Text</label>
                    <textarea
                        placeholder="Enter lines to sort..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="input-field min-h-[32vh] font-mono resize-y"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
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
                        className={`btn-base ${removeDuplicates ? "btn-primary" : "btn-secondary"} h-[42px]`}
                    >
                        {removeDuplicates ? "Remove Duplicates" : "Keep Duplicates"}
                    </button>

                    <button onClick={handleSort} className="btn-base btn-primary h-[42px] w-full">
                        Sort Text
                    </button>
                </div>
            </div>

            {output && (
                <div className="glass-panel p-6 flex-col gap-md">
                    <div className="flex-row justify-between items-center">
                        <label className="label-text">Output</label>
                        <button onClick={handleCopy} className="btn-base btn-secondary text-xs px-3 py-1">
                            Copy Result
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="input-field min-h-[32vh] font-mono resize-y bg-black/40"
                        placeholder="Sorted text will appear here..."
                    />
                </div>
            )}
        </div>
    );
}
