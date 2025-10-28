import { useState, useEffect } from "react";
import { storage } from "../../utils/storage";
import "../../styles/texts/DiffChecker.css";

export function DiffChecker() {
    const [text1, setText1] = useState(() => storage.get("diff-checker-text1", ""));
    const [text2, setText2] = useState(() => storage.get("diff-checker-text2", ""));

    useEffect(() => {
        storage.set("diff-checker-text1", text1);
    }, [text1]);

    useEffect(() => {
        storage.set("diff-checker-text2", text2);
    }, [text2]);

    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const maxLines = Math.max(lines1.length, lines2.length);

    const getDiffClass = (line1: string, line2: string) => {
        if (line1 === line2) return "diff-same";
        if (!line1) return "diff-added";
        if (!line2) return "diff-removed";
        return "diff-modified";
    };

    return (
        <div className="diff-checker">
            <div className="diff-inputs">
                <div className="diff-column">
                    <label className="diff-label">Original Text</label>
                    <textarea
                        placeholder="Enter original text..."
                        value={text1}
                        onChange={(e) => setText1(e.target.value)}
                        className="diff-textarea"
                    />
                </div>
                <div className="diff-column">
                    <label className="diff-label">Modified Text</label>
                    <textarea
                        placeholder="Enter modified text..."
                        value={text2}
                        onChange={(e) => setText2(e.target.value)}
                        className="diff-textarea"
                    />
                </div>
            </div>

            <div className="diff-results">
                <label className="diff-label">Comparison</label>
                <div className="diff-list">
                    {Array.from({ length: maxLines }).map((_, i) => (
                        <div
                            key={i}
                            className={`diff-line ${getDiffClass(
                                lines1[i] || "",
                                lines2[i] || ""
                            )}`}
                        >
                            <div className="diff-line-text">{lines1[i] || ""}</div>
                            <div className="diff-line-text">{lines2[i] || ""}</div>
                        </div>
                    ))}
                </div>

                <div className="diff-legend">
                    <div className="diff-legend-item">
                        <span className="diff-color-box diff-same"></span>
                        <span>Same</span>
                    </div>
                    <div className="diff-legend-item">
                        <span className="diff-color-box diff-modified"></span>
                        <span>Modified</span>
                    </div>
                    <div className="diff-legend-item">
                        <span className="diff-color-box diff-added"></span>
                        <span>Added</span>
                    </div>
                    <div className="diff-legend-item">
                        <span className="diff-color-box diff-removed"></span>
                        <span>Removed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
