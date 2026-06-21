/**
 * Single file/directory row in the file tree.
 * Displays icon, name with truncation, active state, and indentation.
 */
import { useCallback, useState } from "react";
import type { FileNode } from "../../types";

// Markdown-displayable extensions
const MD_EXTENSIONS = new Set(["md", "markdown", "mdown", "mkd"]);

interface FileRowProps {
  node: FileNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

// SVG icons for files and folders
const FolderIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="var(--fg-muted)"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <path d="M1.5 4.5A1.5 1.5 0 013 3h3.5L8 4.5h5A1.5 1.5 0 0114.5 6v.5H3L1.5 12V4.5z" />
    ) : (
      <path d="M1.5 4.5A1.5 1.5 0 013 3h3.5L8 4.5h5A1.5 1.5 0 0114.5 6v6a1.5 1.5 0 01-1.5 1.5H3A1.5 1.5 0 011.5 12V4.5z" />
    )}
  </svg>
);

const FileIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="var(--fg-muted)"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 1.5h5.5L13 5v9a.5.5 0 01-.5.5h-9A.5.5 0 013 14V2a.5.5 0 01.5-.5z" />
    <polyline points="9.5,1.5 9.5,5.5 13,5.5" />
  </svg>
);

const MdFileIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="var(--accent)"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    opacity="0.7"
  >
    <path d="M4 1.5h5.5L13 5v9a.5.5 0 01-.5.5h-9A.5.5 0 013 14V2a.5.5 0 01.5-.5z" />
    <polyline points="9.5,1.5 9.5,5.5 13,5.5" />
    <text
      x="8"
      y="11.5"
      textAnchor="middle"
      fill="var(--accent)"
      stroke="none"
      fontSize="5"
      fontWeight="bold"
      fontFamily="sans-serif"
    >
      M
    </text>
  </svg>
);

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="var(--fg-muted)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform 0.15s ease",
      flexShrink: 0,
    }}
  >
    <polyline points="4.5,2.5 7.5,6 4.5,9.5" />
  </svg>
);

export function FileRow({
  node,
  depth,
  isSelected,
  isExpanded,
  onClick,
  onDoubleClick,
  onContextMenu,
}: FileRowProps) {
  const [hovered, setHovered] = useState(false);

  const isDir = node.isDirectory;
  const ext = node.extension || node.name.split(".").pop()?.toLowerCase() || "";
  const isMd = MD_EXTENSIONS.has(ext);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onContextMenu?.(e);
    },
    [onContextMenu]
  );

  return (
    <div
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 8px",
        paddingLeft: 8 + depth * 16,
        cursor: "pointer",
        borderRadius: 4,
        margin: "0 4px",
        background: isSelected
          ? "var(--accent-soft)"
          : hovered
          ? "var(--bg-muted)"
          : "transparent",
        color: isSelected ? "var(--ink)" : "var(--fg-secondary)",
        fontSize: 13,
        lineHeight: "22px",
        userSelect: "none",
        transition: "background 0.1s",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {/* Chevron for directories */}
      {isDir ? (
        <ChevronIcon expanded={isExpanded} />
      ) : (
        <span style={{ width: 12, flexShrink: 0 }} />
      )}

      {/* Icon */}
      {isDir ? (
        <FolderIcon open={isExpanded} />
      ) : isMd ? (
        <MdFileIcon />
      ) : (
        <FileIcon />
      )}

      {/* Name */}
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: isSelected ? 500 : 400,
        }}
      >
        {node.name}
      </span>
    </div>
  );
}
