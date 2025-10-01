import { useEffect, useRef } from "react";

export type InputState = {
  left: boolean;
  right: boolean;
};

export default function useInput() {
  const state = useRef<InputState>({ left: false, right: false });

  useEffect(() => {
    // --- Keyboard controls ---
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") state.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.current.right = true;
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") state.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") state.current.right = false;
    };

    // --- Touch controls ---
    let startX: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startX === null) return;
      const deltaX = e.touches[0].clientX - startX;

      if (deltaX > 40) {
        state.current.right = true;
        state.current.left = false;
      } else if (deltaX < -40) {
        state.current.left = true;
        state.current.right = false;
      }
    };

    const handleTouchEnd = () => {
      state.current.left = false;
      state.current.right = false;
      startX = null;
    };

    // Listeners
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return state;
}
