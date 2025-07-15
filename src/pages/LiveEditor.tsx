import React, { useEffect } from "react";
import "../styles/editor.css";
import EditorPanel from "../components/editor/EditorPanel";
import PreviewPanel from "../components/editor/PreviewPanel";
import ConsolePanel from "../components/editor/ConsolePanel";
import { useEditorStore } from "../store/editorStore";

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
  useEffect(() => { clearLogs(); }, [clearLogs]);

  return (
    <div className="live-editor-root">
      <div className="editor-left">
        <EditorPanel />
      </div>
      <div className="editor-right">
        <div className="preview-top">
          <PreviewPanel />
        </div>
        <div className="console-bottom">
          <ConsolePanel />
        </div>
      </div>
    </div>
  );
};

export default LiveEditor; 