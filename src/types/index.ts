/**
 * Shared TypeScript interfaces for the MarkMark Tauri app.
 */

// ---------------------------------------------------------------------------
// File tree
// ---------------------------------------------------------------------------

export interface FileNode {
  /** File or directory name (e.g. "README.md") */
  name: string;
  /** Absolute filesystem path */
  path: string;
  /** True if this node is a directory */
  isDirectory: boolean;
  /** Child nodes (only present on directories) */
  children?: FileNode[];
  /** File extension without the dot (e.g. "md") */
  extension?: string;
  /** File size in bytes */
  size?: number;
  /** Last modified timestamp (ISO string or epoch ms) */
  modified?: string;
}

// ---------------------------------------------------------------------------
// Re-exports from services
// ---------------------------------------------------------------------------

export type { Operation, AnnotationKind, Annotation, Fragment } from "../services/criticMarkup";
export type { RenderResult, HeadingInfo, BuildFullHTMLParams } from "../services/markdownRenderer";
export type { OutlineItem } from "../services/outlineService";
export type {
  ThemeType,
  ThemeDefinition,
  ThemeColors,
  ThemeCustomOverrides,
  RGB,
  RGBA,
} from "../services/themeManager";
export type { Language, LanguagePref, L10nKey } from "../services/localization";

// ---------------------------------------------------------------------------
// iframe message types (postMessage protocol between iframe and parent)
// ---------------------------------------------------------------------------

/** Scroll sync message sent from iframe to parent */
export interface ScrollSyncMessage {
  type: "scrollSync";
  line: number;
  heading: {
    id: string;
    level: number;
    title: string;
    lineNumber: number;
  } | null;
}

/** CriticMarkup action message sent from iframe to parent */
export interface CriticActionMessage {
  type: "criticAction";
  op: "delete" | "highlight" | "comment" | "replace";
  text: string;
  line: number;
  payload: string | null;
}

/** Union of all messages from the iframe */
export type IframeMessage = ScrollSyncMessage | CriticActionMessage;

/** Messages sent from parent to iframe */
export interface ParentScrollToLine {
  type: "scrollToLine";
  lineNumber: number;
}

export interface ParentScrollToHeading {
  type: "scrollToHeading";
  id: string;
}

export type ParentMessage = ParentScrollToLine | ParentScrollToHeading;
