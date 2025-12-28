import { useEditorStore } from "../../store/editorStore";

const ConsolePanel = () => {
  const { logs, clearLogs } = useEditorStore();

  return (
    <div className="flex flex-col h-full bg-black/80 font-mono text-sm text-gray-300">
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Console</span>
        <button onClick={clearLogs} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.map((log) => (
          <div key={log.id} className={`flex items-start gap-2 ${log.type === "error" ? "text-red-400 bg-red-500/10 p-1 rounded" : log.type === "warn" ? "text-yellow-400 bg-yellow-500/10 p-1 rounded" : "text-green-400"}`}>
            <span className="shrink-0">{log.type === "log" ? "›" : log.type === "warn" ? "⚠" : "✕"}</span>
            <span className="break-all whitespace-pre-wrap">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsolePanel; 