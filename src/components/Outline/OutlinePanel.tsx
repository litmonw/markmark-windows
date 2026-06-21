/**
 * Right-side outline panel.
 * Shows heading hierarchy from parsed outline.
 * Click heading to scroll viewer to that line.
 * Highlights current heading based on scroll position.
 */
import { useMemo } from "react";
import type { HeadingInfo } from "../../types";
import { t } from "../../services/localization";

interface OutlinePanelProps {
  headings: HeadingInfo[];
  activeLineNumber: number | null;
  onSelectHeading: (lineNumber: number) => void;
}

// Maximum indent level for visual indentation
const MAX_INDENT = 6;

export function OutlinePanel({
  headings,
  activeLineNumber,
  onSelectHeading,
}: OutlinePanelProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          flexShrink: 0,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="var(--fg-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="1" y1="3" x2="5" y2="3" />
          <line x1="3" y1="6" x2="7" y2="6" />
          <line x1="5" y1="9" x2="9" y2="9" />
        </svg>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {t("outlineTitle")}
        </span>
      </div>

      {/* Heading list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "4px 0",
        }}
      >
        {headings.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 6,
              color: "var(--fg-muted)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="14" height="14" rx="2" />
              <line x1="7" y1="8" x2="13" y2="8" />
              <line x1="7" y1="12" x2="11" y2="12" />
            </svg>
            <span style={{ fontSize: 11 }}>{t("outlineEmpty")}</span>
          </div>
        ) : (
          headings.map((heading, idx) => (
            <OutlineRow
              key={heading.id || idx}
              heading={heading}
              isActive={heading.lineNumber === activeLineNumber}
              onClick={() => onSelectHeading(heading.lineNumber)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single outline row
// ---------------------------------------------------------------------------

function OutlineRow({
  heading,
  isActive,
  onClick,
}: {
  heading: HeadingInfo;
  isActive: boolean;
  onClick: () => void;
}) {
  const indent = Math.min(heading.level - 1, MAX_INDENT - 1);
  const paddingLeft = indent * 14 + 8;

  const fontSize = heading.level <= 1 ? 13 : heading.level <= 2 ? 12.5 : heading.level <= 3 ? 12 : 11.5;
  const color = heading.level <= 1
    ? "var(--ink)"
    : heading.level <= 2
    ? "var(--fg-secondary)"
    : "var(--fg-muted)";

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        paddingLeft,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        border: "none",
        background: isActive ? "var(--accent-soft)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        gap: 6,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }
      }}
    >
      {/* Level indicator dot */}
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: isActive ? "var(--accent)" : "var(--fg-muted)",
          flexShrink: 0,
        }}
      />

      {/* Title */}
      <span
        style={{
          fontSize,
          color: isActive ? "var(--accent)" : color,
          fontWeight: heading.level <= 2 ? 500 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: "20px",
        }}
      >
        {heading.title}
      </span>
    </button>
  );
}
