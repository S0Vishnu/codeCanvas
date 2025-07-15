import React, { useCallback, useEffect } from "react";
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
    <div className="editor-panel">
      <div className="editor-tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      <MonacoEditor
        height="100%"
        theme="vs-dark"
        language={activeTab}
        value={code[activeTab]}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 15,
          automaticLayout: true,
          wordWrap: "on",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
        }}
      />
    </div>
  );
};

export default EditorPanel; 