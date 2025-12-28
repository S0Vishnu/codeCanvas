import { useState } from "react";
import Dropdown from "../../components/Dropdown";
import { useToast } from "../../providers/ToastContext";
import "../../styles/texts/RandomDataGenerator.css";

const firstNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
];
const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
];
const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "icloud.com",
    "protonmail.com",
];

export function RandomDataGenerator() {
    const { addToast } = useToast();
    const [output, setOutput] = useState("");
    const [count, setCount] = useState(10);
    const [dataType, setDataType] = useState<"names" | "emails" | "numbers" | "uuids">("names");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const generateData = async () => {
        if (count <= 0) {
            addToast("Please enter a count greater than 0", "warning");
            return;
        }

        if (count > 10000) {
            addToast("Count is too large. Please use 10,000 or less.", "warning");
            return;
        }

        setIsGenerating(true);

        // Small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 50));

        try {
            const results: string[] = [];

            for (let i = 0; i < count; i++) {
                switch (dataType) {
                    case "names": {
                        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
                        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
                        results.push(`${first} ${last}`);
                        break;
                    }
                    case "emails": {
                        const first =
                            firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase();
                        const last =
                            lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase();
                        const domain = domains[Math.floor(Math.random() * domains.length)];
                        // Random email format variations
                        const formats = [
                            `${first}.${last}@${domain}`,
                            `${first}${last}@${domain}`,
                            `${first.charAt(0)}.${last}@${domain}`,
                            `${first}_${last}@${domain}`,
                        ];
                        results.push(formats[Math.floor(Math.random() * formats.length)]);
                        break;
                    }
                    case "numbers": {
                        // Generate numbers with different ranges
                        const number = Math.floor(Math.random() * 1_000_000_000);
                        results.push(number.toString());
                        break;
                    }
                    case "uuids": {
                        results.push(crypto.randomUUID());
                        break;
                    }
                }
            }

            setOutput(results.join("\n"));

            const dataTypeLabels = {
                names: "names",
                emails: "email addresses",
                numbers: "random numbers",
                uuids: "UUIDs",
            };

            addToast(`Generated ${count} ${dataTypeLabels[dataType]}`, "success");
        } catch (error) {
            console.error("Error generating data:", error);
            addToast("Error generating data. Please try again.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!output.trim() || isCopying) {
            addToast("No data to copy", "warning");
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
            addToast("Failed to copy to clipboard", "error");
        } finally {
            setIsCopying(false);
        }
    };

    const handleClear = () => {
        setOutput("");
        addToast("Output cleared", "info");
    };

    return (
        <div className="page-container flex-col gap-lg h-fit max-w-3xl mx-auto">
            <div className="flex-row justify-between items-center">
                <div className="flex-col gap-sm">
                    <h2 className="text-title text-gradient">Random Data Generator</h2>
                    <p className="text-subtitle">Generate random names, emails, numbers, and more</p>
                </div>
                <button
                    onClick={handleClear}
                    className="btn-base btn-danger"
                    disabled={!output.trim()}
                >
                    Clear
                </button>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="flex-col gap-sm">
                        <label className="label-text">Count</label>
                        <input
                            type="number"
                            min={1}
                            max={10000}
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                            className="input-field"
                        />
                    </div>

                    <div className="flex-col gap-sm">
                        <label className="label-text">Data Type</label>
                        <Dropdown
                            options={[
                                { label: "Random Names", value: "names" },
                                { label: "Random Emails", value: "emails" },
                                { label: "Random Numbers", value: "numbers" },
                                { label: "UUIDs", value: "uuids" },
                            ]}
                            value={dataType}
                            onChange={(val) => setDataType(val as typeof dataType)}
                            placeholder="Select data type"
                            closeOnSelect
                        />
                    </div>

                    <button
                        onClick={generateData}
                        className="btn-base btn-primary h-[42px]"
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate Data"}
                    </button>
                </div>
            </div>

            {output && (
                <div className="glass-panel p-6 flex-col gap-md">
                    <div className="flex-row justify-between items-center">
                        <label className="label-text">
                            Generated Data ({output.split("\n").length} items)
                        </label>
                        <button
                            onClick={handleCopy}
                            className="btn-base btn-secondary text-xs px-3 py-1"
                            disabled={isCopying}
                        >
                            {isCopying ? "Copying..." : "Copy Result"}
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="input-field min-h-[50vh] font-mono resize-y bg-black/40"
                        placeholder="Generated data will appear here..."
                        rows={Math.min(20, output.split("\n").length)}
                    />
                </div>
            )}
        </div>
    );
}
