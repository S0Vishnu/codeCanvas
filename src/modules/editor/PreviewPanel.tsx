import { useEffect, useRef } from "react";
import { useEditorStore } from "../../store/editorStore";
import { buildPreviewHtml } from "../../utils/editorUtils";

function useDebouncedEffect(effect: () => void, deps: unknown[], delay: number) {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [...deps, delay]);
}

const PreviewPanel = () => {
  const { code } = useEditorStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clearLogs = useEditorStore(state => state.clearLogs);

  useDebouncedEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Clear logs first
    clearLogs();

    // Then, update the preview
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(buildPreviewHtml(code.html, code.css, code.javascript));
    doc.close();
  }, [code], 500);

  return (
    <div className="preview-panel">
      <iframe
        ref={iframeRef}
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
        className="preview-iframe"
      />
    </div>
  );
};

export default PreviewPanel; 