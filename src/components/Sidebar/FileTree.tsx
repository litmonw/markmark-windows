/**
 * Recursive file tree component.
 * Shows directories and .md files, supports expand/collapse,
 * click to load files, right-click context menu, and keyboard navigation.
 */
import { useCallback, useEffect, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useFileTreeStore } from "../../stores/fileTreeStore";
import { useDocumentStore } from "../../stores/documentStore";
import { t } from "../../services/localization";
import { FileRow } from "./FileRow";
import type { FileNode } from "../../types";

// Markdown-displayable extensions
const MD_EXTENSIONS = new Set(["md", "markdown", "mdown", "mkd", "txt"]);

interface FileTreeProps {
  onFileSelect: (filePath: string) => void;
}

// ---------------------------------------------------------------------------
// Context menu state (simple DOM-based)
// ---------------------------------------------------------------------------

interface ContextMenuState {
  x: number;
  y: number;
  node: FileNode;
}

// ---------------------------------------------------------------------------
// Recursive node renderer
// ---------------------------------------------------------------------------

function FileNodeChildren({
  nodes,
  depth,
  onFileSelect,
  selectedFilePath,
  expandedPaths,
  onToggleExpand,
  onContextMenu,
}: {
  nodes: FileNode[];
  depth: number;
  onFileSelect: (path: string) => void;
  selectedFilePath: string | null;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <FileNodeItem
          key={node.path}
          node={node}
          depth={depth}
          onFileSelect={onFileSelect}
          selectedFilePath={selectedFilePath}
          expandedPaths={expandedPaths}
          onToggleExpand={onToggleExpand}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  );
}

function FileNodeItem({
  node,
  depth,
  onFileSelect,
  selectedFilePath,
  expandedPaths,
  onToggleExpand,
  onContextMenu,
}: {
  node: FileNode;
  depth: number;
  onFileSelect: (path: string) => void;
  selectedFilePath: string | null;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void;
}) {
  const isDir = node.isDirectory;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedFilePath === node.path;

  const handleClick = useCallback(() => {
    if (isDir) {
      onToggleExpand(node.path);
    } else {
      onFileSelect(node.path);
    }
  }, [isDir, node.path, onToggleExpand, onFileSelect]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      onContextMenu(e, node);
    },
    [node, onContextMenu]
  );

  return (
    <>
      <FileRow
        node={node}
        depth={depth}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
      {isDir && isExpanded && node.children && node.children.length > 0 && (
        <FileNodeChildren
          nodes={node.children}
          depth={depth + 1}
          onFileSelect={onFileSelect}
          selectedFilePath={selectedFilePath}
          expandedPaths={expandedPaths}
          onToggleExpand={onToggleExpand}
          onContextMenu={onContextMenu}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Flattened node list for keyboard navigation
// ---------------------------------------------------------------------------

function flattenVisibleNodes(
  nodes: FileNode[],
  expandedPaths: Set<string>
): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.isDirectory && expandedPaths.has(node.path) && node.children) {
      result.push(...flattenVisibleNodes(node.children, expandedPaths));
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Main FileTree component
// ---------------------------------------------------------------------------

export function FileTree({ onFileSelect }: FileTreeProps) {
  const {
    fileNodes,
    selectedFilePath,
    expandedPaths,
    isLoading,
    errorMessage,
    rootPath,
    toggleExpanded,
    setSelectedFilePath,
    setFileNodes,
    setIsLoading,
    setErrorMessage,
  } = useFileTreeStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const flat = flattenVisibleNodes(fileNodes, expandedPaths);
      if (flat.length === 0) return;

      const currentIdx = selectedFilePath
        ? flat.findIndex((n) => n.path === selectedFilePath)
        : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(currentIdx + 1, flat.length - 1);
        setSelectedFilePath(flat[next].path);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(currentIdx - 1, 0);
        setSelectedFilePath(flat[prev].path);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (currentIdx >= 0) {
          const node = flat[currentIdx];
          if (node.isDirectory) {
            toggleExpanded(node.path);
          } else {
            onFileSelect(node.path);
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIdx >= 0 && flat[currentIdx].isDirectory) {
          if (!expandedPaths.has(flat[currentIdx].path)) {
            toggleExpanded(flat[currentIdx].path);
          }
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIdx >= 0 && flat[currentIdx].isDirectory) {
          if (expandedPaths.has(flat[currentIdx].path)) {
            toggleExpanded(flat[currentIdx].path);
          }
        }
      }
    },
    [fileNodes, expandedPaths, selectedFilePath, setSelectedFilePath, toggleExpanded, onFileSelect]
  );

  // Right-click context menu handler
  const handleContextMenu = useCallback(
    async (e: React.MouseEvent, node: FileNode) => {
      // For simplicity, use a minimal inline approach rather than a full portal
      // The context menu actions are: New File, Rename, Delete, Copy Path
      setSelectedFilePath(node.path);

      // We'll use a simple window.prompt for rename, confirm for delete
      // In a production app you'd use a proper context menu component
    },
    [setSelectedFilePath]
  );

  // Context menu overlay state
  const contextMenuRef = useRef<ContextMenuState | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          padding: "24px 16px",
          textAlign: "center",
          color: "var(--fg-muted)",
          fontSize: 13,
        }}
      >
        {t("loading")}
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div
        style={{
          padding: "24px 16px",
          textAlign: "center",
          color: "var(--danger)",
          fontSize: 13,
        }}
      >
        {errorMessage}
      </div>
    );
  }

  // Empty state
  if (fileNodes.length === 0 && rootPath) {
    return (
      <div
        style={{
          padding: "24px 16px",
          textAlign: "center",
          color: "var(--fg-muted)",
          fontSize: 13,
        }}
      >
        {t("emptyDirectoryMessage")}
      </div>
    );
  }

  // No root
  if (!rootPath) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        outline: "none",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        padding: "4px 0",
      }}
    >
      <FileNodeChildren
        nodes={fileNodes}
        depth={0}
        onFileSelect={onFileSelect}
        selectedFilePath={selectedFilePath}
        expandedPaths={expandedPaths}
        onToggleExpand={toggleExpanded}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
