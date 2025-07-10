import { useState } from "react";
import "../styles/StringToArrayParser.css";

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
        .replace(
          /(-?)Math\.PI/g,
          (_, sign) => (sign === "-" ? -1 : 1) * Math.PI + ""
        )

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
    <div className="parser-container">
      <h2 className="main-header">Convert JSON-like String to Object</h2>

      <textarea
        className="parser-textarea"
        value={inputString}
        onChange={(e) => setInputString(e.target.value)}
      />

      <div className="parser-buttons">
        <button className="parser-button" onClick={handleConvert}>
          Convert
        </button>
        {JSON.stringify(result) !== "[]" && (
          <button
            className="parser-button"
            onClick={handleCopy}
            disabled={!result.length}
            title={!result.length ? "Convert first" : "Copy JSON to clipboard"}
          >
            {copied ? "✅ Copied!" : "Copy JSON"}
          </button>
        )}
      </div>

      {error && <div className="parser-error">{error}</div>}

      <pre className="parser-output">{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};
