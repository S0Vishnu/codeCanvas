import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TABS, DEFAULT_CODE } from "../utils/editorUtils";

export type LogEntry = { id: string; type: "log" | "warn" | "error"; message: string };
export interface EditorState {
  code: Record<string, string>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setCode: (tab: string, value: string) => void;
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, 'id'>) => void;
  clearLogs: () => void;
  previewKey: number;
  bumpPreviewKey: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      code: { ...DEFAULT_CODE },
      activeTab: TABS[0],
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCode: (tab, value) => set((state) => ({
        code: { ...state.code, [tab]: value },
      })),
      logs: [],
      addLog: (log) => set((state) => ({
        logs: [...state.logs, { ...log, id: crypto.randomUUID() }]
      })),
      clearLogs: () => set({ logs: [] }),
      previewKey: 0,
      bumpPreviewKey: () => set((state) => ({
        previewKey: state.previewKey + 1
      })),
    }),
    {
      name: "live-editor-store",
      partialize: (state) => ({
        code: state.code,
        activeTab: state.activeTab,
        previewKey: state.previewKey
      })
    }
  )
);
