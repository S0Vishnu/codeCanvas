import { useEffect, useRef } from "react";

function useKeyInput() {
    const keys = useRef<Record<string, boolean>>({});
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
        const onUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
        window.addEventListener("keydown", onDown);
        window.addEventListener("keyup", onUp);
        return () => {
            window.removeEventListener("keydown", onDown);
            window.removeEventListener("keyup", onUp);
        };
    }, []);
    return keys;
}

export default useKeyInput;
