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
        <div className="page-container flex-col gap-lg h-fit max-w-3xl mx-auto">
            <div className="flex-col gap-sm">
                <h2 className="text-title text-gradient">Lorem Ipsum Generator</h2>
                <p className="text-subtitle">Generate placeholder text for your projects</p>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="flex-col gap-sm">
                        <label className="label-text">Length</label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                            className="input-field"
                        />
                    </div>

                    <div className="flex-col gap-sm">
                        <label className="label-text">Type</label>
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
                    </div>

                    <button onClick={generateLorem} className="btn-base btn-primary h-[42px]">
                        Generate
                    </button>
                </div>
            </div>

            {output && (
                <div className="glass-panel p-6 flex-col gap-md">
                    <div className="flex-row justify-between items-center">
                        <label className="label-text">Generated Text</label>
                        <button onClick={handleCopy} className="btn-base btn-secondary text-xs px-3 py-1">
                            Copy Result
                        </button>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="input-field min-h-[50vh] font-mono resize-y bg-black/40"
                        placeholder="Generated lorem ipsum will appear here..."
                    />
                </div>
            )}
        </div>
    );
}
