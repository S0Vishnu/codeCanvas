import { useState } from "react";
import Dropdown from "../../components/Dropdown";
import "../../styles/texts/LoremGenerator.css";
import { useToast } from "../../providers/ToastContext";

const loremWords =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(
        " "
    );

export function LoremGenerator() {
    const { addToast } = useToast();

    const [output, setOutput] = useState("");
    const [count, setCount] = useState(3);
    const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");

    const generateLorem = () => {
        let result = "";

        if (type === "paragraphs") {
            for (let i = 0; i < count; i++) {
                const sentenceCount = 3 + Math.floor(Math.random() * 4);
                const sentences = [];

                for (let j = 0; j < sentenceCount; j++) {
                    const wordCount = 8 + Math.floor(Math.random() * 8);
                    const words = [];
                    for (let k = 0; k < wordCount; k++) {
                        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
                    }
                    let sentence = words.join(" ");
                    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
                    sentences.push(sentence);
                }

                result += sentences.join(" ") + "\n\n";
            }
        } else if (type === "sentences") {
            for (let i = 0; i < count; i++) {
                const wordCount = 8 + Math.floor(Math.random() * 8);
                const words = [];
                for (let k = 0; k < wordCount; k++) {
                    words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
                }
                let sentence = words.join(" ");
                sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ". ";
                result += sentence;
            }
        } else {
            const words = [];
            for (let i = 0; i < count; i++) {
                words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
            }
            result = words.join(" ");
        }

        setOutput(result.trim());

        // Replace alert with toast
        addToast(`Generated ${count} ${type} of Lorem Ipsum`, "success");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);

        // Replace alert with toast
        addToast("Copied to clipboard!", "success");
    };

    return (
        <div className="lorem-generator">
            <div className="lg-row">
                <input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                    className="lg-input-count"
                />

                <Dropdown
                    options={[
                        { label: "Paragraphs", value: "paragraphs" },
                        { label: "Sentences", value: "sentences" },
                        { label: "Words", value: "words" },
                    ]}
                    value={type}
                    onChange={(val) => setType(val as typeof type)}
                    placeholder="Select type"
                    closeOnSelect
                />

                <button onClick={generateLorem} className="lg-btn lg-generate-btn">
                    Generate
                </button>
            </div>

            {output && (
                <div className="lg-section">
                    <div className="lg-output-header">
                        <label className="lg-label">Generated Text</label>
                        <button onClick={handleCopy} className="lg-btn lg-copy-btn">
                            Copy
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="lg-output"
                        placeholder="Generated lorem ipsum will appear here..."
                    />
                </div>
            )}
        </div>
    );
}
