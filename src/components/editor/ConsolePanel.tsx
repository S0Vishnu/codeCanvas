import React from "react";
import { useEditorStore } from "../../store/editorStore";

const ConsolePanel = () => {
  const { logs, clearLogs } = useEditorStore();

  return (
    <div className="console-panel">
      <div className="console-header">
        <span>Console</span>
        <button onClick={clearLogs}>Clear</button>
      </div>
      <div className="console-logs">
        {logs.map((log) => (
          <div key={log.id} className={`console-log ${log.type}`}>
            <span className="console-icon">{log.type === "log" ? "🟢" : log.type === "warn" ? "🟡" : "🔴"}</span>
            <span className="console-message">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsolePanel; 