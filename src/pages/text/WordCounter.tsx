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
        <div className="wc-container">
            <textarea
                placeholder="Type or paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="wc-textarea"
            />

            <div className="wc-grid">
                {Object.entries({
                    Words: stats.words,
                    Characters: stats.characters,
                    "Characters (no spaces)": stats.charactersNoSpaces,
                    Lines: stats.lines,
                    Sentences: stats.sentences,
                    Paragraphs: stats.paragraphs,
                }).map(([label, value]) => (
                    <div key={label} className="wc-card">
                        <div className="wc-card-value">{value}</div>
                        <div className="wc-card-label">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
