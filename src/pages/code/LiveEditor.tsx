import React, { useEffect } from "react";

import { useEditorStore } from "../../store/editorStore";
import EditorPanel from "../../modules/editor/EditorPanel";
import PreviewPanel from "../../modules/editor/PreviewPanel";
import ConsolePanel from "../../modules/editor/ConsolePanel";

const LiveEditor = () => {
    const { addLog, clearLogs } = useEditorStore();
    const addLogRef = React.useRef(addLog);
    addLogRef.current = addLog;

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (typeof event.data === "object" && event.data.type && event.data.message) {
                if (["log", "warn", "error"].includes(event.data.type)) {
                    addLogRef.current({ type: event.data.type, message: event.data.message });
                }
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // Clear logs on mount (optional)
    useEffect(() => {
        clearLogs();
    }, [clearLogs]);

    return (
        <div className="flex h-screen w-screen bg-black overflow-hidden font-sans">
            <div className="w-[40vw] min-w-[350px] flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-md">
                <EditorPanel />
            </div>
            <div className="flex-1 flex flex-col h-full relative">
                <div className="flex-[2] border-b border-white/10 relative bg-white/5">
                    <PreviewPanel />
                </div>
                <div className="flex-1 bg-black/80 overflow-hidden flex flex-col">
                    <ConsolePanel />
                </div>
            </div>
        </div>
    );
};

export default LiveEditor;
