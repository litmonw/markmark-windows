/**
 * Floating annotation toolbar for CriticMarkup.
 *
 * NOTE: The primary toolbar UI is rendered inside the iframe by markdown-reader.js
 * (which creates #mr-critic-toolbar dynamically). This React component serves as
 * a bridge that listens for selection events from the iframe and can optionally
 * render an external toolbar overlay for the parent window.
 *
 * The iframe toolbar handles:
 *   - 4 buttons: Delete, Highlight, Comment, Replace
 *   - Comment and Replace open inline input fields
 *   - Positioned near the selection using mouse coordinates
 *
 * The parent-side handler (in MarkdownViewer.tsx) receives postMessage criticAction
 * events and applies them via the criticMarkup service.
 *
 * This component exports utility functions and types for the critic toolbar bridge.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { apply } from "../../services/criticMarkup";
import { useDocumentStore } from "../../stores/documentStore";
import { t } from "../../services/localization";
import type { Operation } from "../../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CriticSelection {
  text: string;
  line: number;
  x: number;
  y: number;
}

export interface CriticToolbarProps {
  /** The iframe element containing the rendered markdown */
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  /** Callback when content is modified */
  onContentChange: (newContent: string) => void;
}

// ---------------------------------------------------------------------------
// Standalone external toolbar (overlay on parent window)
// ---------------------------------------------------------------------------

/**
 * ExternalCriticToolbar can be mounted in the parent window as an overlay.
 * It receives selection events from the iframe and renders its own toolbar.
 *
 * Usage: place this as a sibling to the iframe and it will listen for
 * 'textSelected' postMessage events from the iframe.
 */
export function ExternalCriticToolbar({
  iframeRef,
  onContentChange,
}: CriticToolbarProps) {
  const [selection, setSelection] = useState<CriticSelection | null>(null);
  const [mode, setMode] = useState<"buttons" | "comment" | "replace">("buttons");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addSessionAnnotation } = useDocumentStore();

  // Listen for selection events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      if (data.type === "textSelected") {
        setSelection({
          text: data.text,
          line: data.line,
          x: data.x,
          y: data.y,
        });
        setMode("buttons");
        setInputValue("");
      } else if (data.type === "selectionCleared") {
        setSelection(null);
        setMode("buttons");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Focus input when entering comment/replace mode
  useEffect(() => {
    if (mode !== "buttons" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const applyOperation = useCallback(
    (op: Operation) => {
      if (!selection) return;
      const currentContent = useDocumentStore.getState().content;
      const newContent = apply(op, currentContent, selection.text, selection.line);
      if (newContent !== null) {
        onContentChange(newContent);
        addSessionAnnotation(selection.text);
      }
      setSelection(null);
      setMode("buttons");
    },
    [selection, onContentChange, addSessionAnnotation]
  );

  const handleDelete = useCallback(() => {
    applyOperation({ kind: "delete" });
  }, [applyOperation]);

  const handleHighlight = useCallback(() => {
    applyOperation({ kind: "highlight" });
  }, [applyOperation]);

  const handleCommentSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    applyOperation({ kind: "comment", text: inputValue.trim() });
  }, [applyOperation, inputValue]);

  const handleReplaceSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    applyOperation({ kind: "replace", text: inputValue.trim() });
  }, [applyOperation, inputValue]);

  const handleCancel = useCallback(() => {
    setSelection(null);
    setMode("buttons");
    setInputValue("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (mode === "comment") handleCommentSubmit();
        else if (mode === "replace") handleReplaceSubmit();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [mode, handleCommentSubmit, handleReplaceSubmit, handleCancel]
  );

  if (!selection) return null;

  // Position the toolbar near the selection
  const toolbarStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(selection.x, window.innerWidth - 320),
    top: Math.max(selection.y - 48, 8),
    zIndex: 9999,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "4px",
    display: "flex",
    alignItems: "center",
    gap: 2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "4px 10px",
    border: "none",
    borderRadius: 4,
    background: "transparent",
    color: "var(--fg-secondary)",
    cursor: "pointer",
    fontSize: 12,
    whiteSpace: "nowrap",
  };

  const inputStyle: React.CSSProperties = {
    padding: "6px 8px",
    border: "1px solid var(--border)",
    borderRadius: 4,
    background: "var(--surface)",
    color: "var(--ink)",
    fontSize: 12,
    outline: "none",
    width: 200,
  };

  if (mode === "comment" || mode === "replace") {
    return (
      <div style={{ ...toolbarStyle, flexDirection: "column", padding: 8, minWidth: 240 }}>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === "comment" ? t("criticCommentHint") : t("criticReplaceHint")}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={handleCancel} style={buttonStyle}>
            {t("criticCancel")}
          </button>
          <button
            onClick={mode === "comment" ? handleCommentSubmit : handleReplaceSubmit}
            style={{ ...buttonStyle, color: "var(--accent)", fontWeight: 500 }}
          >
            {t("criticConfirm")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={toolbarStyle}>
      <button
        onClick={handleDelete}
        style={{ ...buttonStyle, color: "var(--danger)" }}
        title={t("criticDelete")}
      >
        {t("criticDelete")}
      </button>
      <button
        onClick={handleHighlight}
        style={buttonStyle}
        title={t("criticHighlight")}
      >
        {t("criticHighlight")}
      </button>
      <button
        onClick={() => setMode("comment")}
        style={{ ...buttonStyle, color: "var(--accent)" }}
        title={t("criticComment")}
      >
        {t("criticComment")}
      </button>
      <button
        onClick={() => setMode("replace")}
        style={{ ...buttonStyle, color: "var(--accent)" }}
        title={t("criticReplace")}
      >
        {t("criticReplace")}
      </button>
    </div>
  );
}
