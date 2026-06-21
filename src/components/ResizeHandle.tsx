/**
 * Draggable resize handle between panes.
 * Vertical bar: 4px visible, 8px hit area.
 * Cursor changes on hover (col-resize).
 */
import { useCallback, useRef, useEffect, useState } from "react";

interface ResizeHandleProps {
  /** Called with pixel delta while dragging */
  onResize: (deltaX: number) => void;
  /** Minimum width constraint (optional, handled by parent) */
  minWidth?: number;
  /** Maximum width constraint (optional, handled by parent) */
  maxWidth?: number;
}

export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const dragging = useRef(false);
  const lastX = useRef(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastX.current = e.clientX;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - lastX.current;
      lastX.current = e.clientX;
      onResize(delta);
    };

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 8,
        cursor: "col-resize",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: hovered ? 3 : 1,
          height: "100%",
          background: hovered ? "var(--accent)" : "var(--border)",
          borderRadius: 1,
          transition: "width 0.1s, background 0.1s",
        }}
      />
    </div>
  );
}
