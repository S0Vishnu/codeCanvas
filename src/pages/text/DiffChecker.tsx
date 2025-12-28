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
        <div className="page-container flex-col gap-lg h-fit">
            <div className="flex-col gap-sm">
                <h2 className="text-title text-gradient">Text Diff Checker</h2>
                <p className="text-subtitle">Compare two texts and highlight the differences</p>
            </div>

            <div className="grid-2">
                <div className="glass-panel p-6 flex-col gap-md">
                    <label className="label-text">Original Text</label>
                    <textarea
                        placeholder="Enter original text..."
                        value={text1}
                        onChange={(e) => setText1(e.target.value)}
                        className="input-field min-h-[300px] font-mono resize-y"
                    />
                </div>
                <div className="glass-panel p-6 flex-col gap-md">
                    <label className="label-text">Modified Text</label>
                    <textarea
                        placeholder="Enter modified text..."
                        value={text2}
                        onChange={(e) => setText2(e.target.value)}
                        className="input-field min-h-[300px] font-mono resize-y"
                    />
                </div>
            </div>

            <div className="glass-panel p-6 flex-col gap-md">
                <label className="label-text">Comparison Result</label>
                <div className="flex-col gap-1 max-h-[400px] overflow-y-auto pr-2 rounded-lg bg-black/40 p-4 font-mono text-sm">
                    {Array.from({ length: maxLines }).map((_, i) => {
                        const diffType = getDiffClass(lines1[i] || "", lines2[i] || "");
                        let bgClass = "bg-transparent";
                        let textClass = "text-secondary";

                        if (diffType === "diff-added") { bgClass = "bg-green-500/10"; textClass = "text-green-400"; }
                        else if (diffType === "diff-removed") { bgClass = "bg-red-500/10"; textClass = "text-red-400"; }
                        else if (diffType === "diff-modified") { bgClass = "bg-yellow-500/10"; textClass = "text-yellow-400"; }

                        return (
                            <div key={i} className={`grid grid-cols-2 gap-4 p-2 rounded ${bgClass} ${textClass} hover:bg-white/5`}>
                                <div className="truncate border-r border-white/10 pr-2">{lines1[i] || ""}</div>
                                <div className="truncate pl-2">{lines2[i] || ""}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex-row gap-lg justify-center mt-2">
                    <div className="flex-row gap-sm items-center">
                        <span className="w-3 h-3 rounded bg-white/10 border border-white/20"></span>
                        <span className="text-sm text-secondary">Same</span>
                    </div>
                    <div className="flex-row gap-sm items-center">
                        <span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/40"></span>
                        <span className="text-sm text-secondary">Modified</span>
                    </div>
                    <div className="flex-row gap-sm items-center">
                        <span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/40"></span>
                        <span className="text-sm text-secondary">Added</span>
                    </div>
                    <div className="flex-row gap-sm items-center">
                        <span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40"></span>
                        <span className="text-sm text-secondary">Removed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
