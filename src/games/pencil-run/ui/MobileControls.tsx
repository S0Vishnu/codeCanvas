import useInput from "../hooks";

export default function MobileControls() {
  const input = useInput();

  return (
    <div className="mobile-controls">
      <button
        onTouchStart={() => {
          input.current.left = true;
          input.current.right = false;
        }}
        onTouchEnd={() => {
          input.current.left = false;
        }}
      >
        ◀
      </button>

      <button
        onTouchStart={() => {
          input.current.right = true;
          input.current.left = false;
        }}
        onTouchEnd={() => {
          input.current.right = false;
        }}
      >
        ▶
      </button>
    </div>
  );
}
