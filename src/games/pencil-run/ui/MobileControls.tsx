import { useInput } from "../hooks/inputContext";

export default function MobileControls() {
  const [input, setInput] = useInput();

  return (
    <div className="mobile-controls">
      {/* Left button */}
      <button
        onTouchStart={() => setInput(s => ({ ...s, left: true, right: false }))}
        onTouchEnd={() => setInput(s => ({ ...s, left: false }))}
      >
        ◀
      </button>

      {/* Pause button */}
      <button
        onTouchStart={() => setInput(s => ({ ...s, paused: !s.paused }))}
      >
        {input.paused ? "" : "⏸"}
      </button>

      {/* Right button */}
      <button
        onTouchStart={() => setInput(s => ({ ...s, right: true, left: false }))}
        onTouchEnd={() => setInput(s => ({ ...s, right: false }))}
      >
        ▶
      </button>
    </div>
  );
}
