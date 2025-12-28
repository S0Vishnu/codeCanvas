import { useCallback, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useEditorStore } from "../../store/editorStore";
import { TABS } from "../../utils/editorUtils";
import { LOCAL_STORAGE_KEY } from "../../utils/constants";

const EditorPanel = () => {
  const { activeTab, setActiveTab, code, setCode } = useEditorStore();

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(code));
  }, [code]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(activeTab, value);
    }
  }, [activeTab, setCode]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex bg-black/40 border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`flex-1 px-4 py-3 bg-transparent border-0 text-white cursor-pointer border-b-2 transition-colors ${activeTab === tab
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-secondary hover:text-white hover:bg-white/5"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex-1 w-full overflow-hidden">
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          language={activeTab}
          value={code[activeTab]}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            automaticLayout: true,
            wordWrap: "on",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel; 