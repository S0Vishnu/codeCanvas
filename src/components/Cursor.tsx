import { useEffect, useRef } from "react";
import "../styles/Cursor.css";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const last = { x: 0, y: 0 };

    const updateMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button")) {
        document.body.classList.add("button-hovered");
      } else {
        document.body.classList.remove("button-hovered");
      }
    };

    document.addEventListener("mousemove", updateMouse);
    document.addEventListener("mouseover", handleHover);
    document.addEventListener("mouseout", handleHover);

    const animate = () => {
      pos.x += (mouse.x - pos.x) * 0.12;
      pos.y += (mouse.y - pos.y) * 0.12;

      const dx = pos.x - last.x;
      const dy = pos.y - last.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const velocity = Math.sqrt(dx * dx + dy * dy);

      const scaleX = 1 + Math.min(velocity / 15, 0.5);
      const scaleY = 1 - Math.min(velocity / 25, 0.2);

      if (cursorRef.current && innerRef.current) {
        cursorRef.current.style.transform = `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
        innerRef.current.style.transform = `rotate(${-angle}deg)`;
      }

      last.x = pos.x;
      last.y = pos.y;

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      document.removeEventListener("mousemove", updateMouse);
      document.removeEventListener("mouseover", handleHover);
      document.removeEventListener("mouseout", handleHover);
    };
  }, []);

  return (
    <div className="cb-cursor" ref={cursorRef}>
      <div className="cb-cursor-inner" ref={innerRef}></div>
    </div>
  );
};

export default Cursor;
