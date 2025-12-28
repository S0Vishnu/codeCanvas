import { useState } from "react";
import "../../styles/StringToArrayParser.css";

type Link = {
    index: number;
    enabled: boolean;
    rotationMin?: number[];
    rotationMax?: number[];
    limitation?: number[];
};

type ParsedObject = {
    target: number;
    effector: number;
    links: Link[];
    ringRadius: number;
    maxheight: number;
    minheight: number;
};

export const StringToArrayParser = () => {
    const [copied, setCopied] = useState<boolean>(false);
    const [inputString, setInputString] = useState<string>(`[
    {
        target: 7,
        effector: 6,
        links: [
            {
                index: 5,
                enabled: true,
                rotationMin: [-Math.PI / 2, 0, 0],
                rotationMax: [Math.PI / 2, 0, 0],
            },
            {
                index: 4,
                enabled: true,
                rotationMin: [-Math.PI / 2, 0, 0],
                rotationMax: [0, 0, 0],
            },
            {
                index: 3,
                enabled: true,
                rotationMin: [0, 0, 0],
                rotationMax: [2, 0, 0],
            },
            { index: 1, enabled: true, limitation: [0, 1, 0] },
            { index: 0, enabled: false, limitation: [0, 0, 0] },
        ],
        ringRadius: 0,
        maxheight: 1,
        minheight: 0.5
    }
]`);
    const [result, setResult] = useState<ParsedObject[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sanitizeJsonString = (str: string): string => {
        return (
            str
                // Remove line comments
                .replace(/\/\/.*$/gm, "")

                // Replace Math.PI expressions
                .replace(/(-?)Math\.PI\s*\/\s*(\d+(\.\d+)?)/g, (_, sign, divisor) =>
                    (((sign === "-" ? -1 : 1) * Math.PI) / parseFloat(divisor)).toString()
                )
                .replace(/(-?)Math\.PI/g, (_, sign) => (sign === "-" ? -1 : 1) * Math.PI + "")

                // Add double quotes around keys
                .replace(/(\s*)(\w+)\s*:/g, '$1"$2":')

                // Remove trailing commas
                .replace(/,\s*(?=[}\]])/g, "")
        );
    };

    const handleConvert = () => {
        setError(null);
        try {
            const safeString = sanitizeJsonString(inputString);
            const parsed = JSON.parse(safeString);

            // ✅ You can now modify the parsed object!
            // Example: set all enabled = true
            (parsed as ParsedObject[]).forEach((item: ParsedObject) => {
                item.links.forEach((link: Link) => {
                    link.enabled = true;
                });
            });

            setResult(parsed);
        } catch (err) {
            console.error("Parsing error:", err);
            setError(
                "⚠️ Failed to parse input. Ensure it is valid JSON and expressions are correct."
            );
        }
    };

    const handleCopy = () => {
        if (!result.length) return;
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="page-container flex-col gap-lg h-fit">
            <div className="flex-col gap-sm">
                <h2 className="text-title text-gradient">Object Parser</h2>
                <p className="text-subtitle">Convert raw JS-like object strings into valid JSON</p>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <label className="label-text">Input Object String</label>
                <textarea
                    className="input-field min-h-[30vh] font-mono text-success bg-black/40"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="Paste your object string here..."
                />

                <div className="flex-row gap-md">
                    <button className="btn-base btn-primary" onClick={handleConvert}>
                        Convert to Object
                    </button>
                    {JSON.stringify(result) !== "[]" && (
                        <button
                            className="btn-base btn-secondary"
                            onClick={handleCopy}
                            disabled={!result.length}
                            title={!result.length ? "Convert first" : "Copy JSON to clipboard"}
                        >
                            {copied ? "✅ Copied!" : "Copy JSON"}
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200">{error}</div>}

            {result.length > 0 && (
                <div className="glass-panel p-6 flex-col gap-md">
                    <label className="label-text">Parsed Result (JSON)</label>
                    <pre className="input-field min-h-[30vh] max-h-[50vh] overflow-y-auto font-mono text-xs bg-black/60">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};
