import { createContext, useContext, useEffect, useState } from "react";

export type InputState = {
  left: boolean;
  right: boolean;
  paused: boolean;
};

type InputContextType = [
  InputState,
  React.Dispatch<React.SetStateAction<InputState>>
];

const InputContext = createContext<InputContextType | undefined>(undefined);

export function InputProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InputState>({
    left: false,
    right: false,
    paused: false,
  });

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        setState(s => ({ ...s, left: true }));
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        setState(s => ({ ...s, right: true }));
      }
      if (e.code === "Escape" || e.code === "KeyP") {
        // toggle pause
        setState(s => ({ ...s, paused: !s.paused }));
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        setState(s => ({ ...s, left: false }));
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        setState(s => ({ ...s, right: false }));
      }
      // no need to handle pause on keyup, it's toggled on keydown
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return (
    <InputContext.Provider value={[state, setState]}>
      {children}
    </InputContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInput() {
  const ctx = useContext(InputContext);
  if (!ctx) {
    throw new Error("useInput must be used inside <InputProvider>");
  }
  return ctx;
}
