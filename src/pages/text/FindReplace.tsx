import { useState, useEffect } from "react";
import { storage } from "../../utils/storage";
import "../../styles/texts/FindReplace.css";
import { useToast } from "../../providers/ToastContext";

export function FindReplace() {
    const [input, setInput] = useState(() => storage.get("find-replace-input", ""));
    const [findText, setFindText] = useState("");
    const { addToast } = useToast();
    const [replaceText, setReplaceText] = useState("");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [output, setOutput] = useState("");

    useEffect(() => {
        storage.set("find-replace-input", input);
    }, [input]);

    const handleReplace = () => {
        // Validate inputs
        if (!input.trim()) {
            addToast("Please enter some text to search", "warning");
            return;
        }

        if (!findText.trim()) {
            addToast("Please enter text to find", "warning");
            return;
        }

        try {
            let result = input;
            let count = 0;

            if (useRegex) {
                const flags = caseSensitive ? "g" : "gi";
                const regex = new RegExp(findText, flags);

                // Count matches before replacement
                const matches = input.match(regex);
                count = matches ? matches.length : 0;

                result = input.replace(regex, replaceText);
            } else {
                if (caseSensitive) {
                    // Count occurrences for case-sensitive search
                    let searchIndex = input.indexOf(findText);
                    while (searchIndex !== -1) {
                        count++;
                        searchIndex = input.indexOf(findText, searchIndex + 1);
                    }
                    result = input.split(findText).join(replaceText);
                } else {
                    const escapedFindText = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const regex = new RegExp(escapedFindText, "gi");

                    // Count matches
                    const matches = input.match(regex);
                    count = matches ? matches.length : 0;

                    result = input.replace(regex, replaceText);
                }
            }

            setOutput(result);

            // Show appropriate toast message
            if (count === 0) {
                addToast("No matches found", "info");
            } else {
                addToast(
                    `Replaced ${count} occurrence${count !== 1 ? "s" : ""} of "${findText}"`,
                    "success"
                );
            }
        } catch (error) {
            console.error("Replace error:", error);
            addToast("Invalid regular expression pattern", "error");
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
                textArea.style.position = "fixed";
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.opacity = "0";
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
        <div className="find-replace">
            <div className="fr-section">
                <label className="fr-label">Input Text</label>
                <textarea
                    placeholder="Enter text to search and replace..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="fr-textarea"
                />
            </div>

            <div className="fr-row">
                <div className="fr-field">
                    <label className="fr-label">Find</label>
                    <input
                        type="text"
                        placeholder="Text to find"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        className="fr-input"
                    />
                </div>
                <div className="fr-field">
                    <label className="fr-label">Replace</label>
                    <input
                        type="text"
                        placeholder="Replace with"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="fr-input"
                    />
                </div>
            </div>

            <div className="fr-options">
                <label className="fr-option">
                    <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => setCaseSensitive(e.target.checked)}
                    />
                    Case sensitive
                </label>
                <label className="fr-option">
                    <input
                        type="checkbox"
                        checked={useRegex}
                        onChange={(e) => setUseRegex(e.target.checked)}
                    />
                    Use regex
                </label>
            </div>

            <button onClick={handleReplace} disabled={!findText} className="fr-btn fr-action-btn">
                Replace All
            </button>

            {output && (
                <div className="fr-section">
                    <div className="fr-output-header">
                        <label className="fr-label">Output</label>
                        <button onClick={handleCopy} className="fr-btn fr-copy-btn">
                            Copy
                        </button>
                    </div>
                    <textarea value={output} readOnly className="fr-output" />
                </div>
            )}
        </div>
    );
}
