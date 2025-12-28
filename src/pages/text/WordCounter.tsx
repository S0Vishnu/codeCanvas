import { useState, useEffect } from "react";
import "../../styles/texts/WordCounter.css";

export function WordCounter() {
    const [text, setText] = useState(() => localStorage.getItem("word-counter-text") || "");

    const stats = {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, "").length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text ? text.split("\n").length : 0,
        sentences: text ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0,
        paragraphs: text ? text.split(/\n\n+/).filter((p) => p.trim()).length : 0,
    };

    useEffect(() => {
        localStorage.setItem("word-counter-text", text);
    }, [text]);

    return (
        <div className="page-container flex-col gap-lg h-fit max-w-4xl mx-auto">
            <div className="flex-col gap-sm">
                <h2 className="text-title text-gradient">Word Counter</h2>
                <p className="text-subtitle">Analyze your text statistics in real-time</p>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <textarea
                    placeholder="Type or paste your text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="input-field min-h-[50vh] font-mono resize-y"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries({
                    Words: stats.words,
                    Characters: stats.characters,
                    "No Spaces": stats.charactersNoSpaces,
                    Lines: stats.lines,
                    Sentences: stats.sentences,
                    Paragraphs: stats.paragraphs,
                }).map(([label, value]) => (
                    <div key={label} className="glass-card p-4 flex-col gap-1 items-start group hover:bg-primary/20 transition-all">
                        <div className="text-2xl font-bold text-primary group-hover:text-white transition-colors">{value}</div>
                        <div className="text-xs text-secondary uppercase tracking-wider">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
