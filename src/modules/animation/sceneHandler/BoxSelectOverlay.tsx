import { useRef, useState, useEffect } from "react";

const BoxSelectOverlay = ({
  onBoxSelect,
}: {
  onBoxSelect: (box: DOMRect) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!e.ctrlKey) return;

    start.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);

    if (boxRef.current) {
      boxRef.current.style.display = "block";
      boxRef.current.style.left = `${e.clientX}px`;
      boxRef.current.style.top = `${e.clientY}px`;
      boxRef.current.style.width = "0px";
      boxRef.current.style.height = "0px";
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !start.current || !boxRef.current) return;

    const parent = boxRef.current.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();

    const endX = Math.min(
      Math.max(e.clientX, parentRect.left),
      parentRect.right
    );
    const endY = Math.min(
      Math.max(e.clientY, parentRect.top),
      parentRect.bottom
    );

    const minX = Math.min(start.current.x, endX);
    const minY = Math.min(start.current.y, endY);
    const width = Math.abs(endX - start.current.x);
    const height = Math.abs(endY - start.current.y);

    boxRef.current.style.left = `${minX - parentRect.left}px`;
    boxRef.current.style.top = `${minY - parentRect.top}px`;
    boxRef.current.style.width = `${width}px`;
    boxRef.current.style.height = `${height}px`;
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging || !start.current || !boxRef.current) return;

    const parent = boxRef.current.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();

    const endX = Math.min(
      Math.max(e.clientX, parentRect.left),
      parentRect.right
    );
    const endY = Math.min(
      Math.max(e.clientY, parentRect.top),
      parentRect.bottom
    );

    const rect = new DOMRect(
      Math.min(start.current.x, endX),
      Math.min(start.current.y, endY),
      Math.abs(endX - start.current.x),
      Math.abs(endY - start.current.y)
    );

    onBoxSelect(rect);
    setIsDragging(false);
    start.current = null;

    if (boxRef.current) {
      boxRef.current.style.display = "none";
      boxRef.current.style.width = "0px";
      boxRef.current.style.height = "0px";
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: isCtrlPressed ? "all" : "none",
        height: "100vh",
        width: "calc(100vw - 300px)",
        zIndex: 10,
      }}
    >
      <div
        ref={boxRef}
        style={{
          position: "absolute",
          display: "none",
          border: "1px dashed #00aaff",
          background: "rgba(0, 170, 255, 0.1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default BoxSelectOverlay;
