/**
 * Document state store.
 * Manages the currently-open file's content, dirty state, and headings.
 */
import { create } from "zustand";
import type { HeadingInfo } from "../types";

interface DocumentState {
  /** Current file content (Markdown source) */
  content: string;
  /** Absolute path of the currently open file, or null */
  fileURL: string | null;
  /** Whether the file has unsaved changes */
  isDirty: boolean;
  /** Display name of the current file */
  fileName: string;
  /** Parsed headings from the latest render */
  headings: HeadingInfo[];
  /** Set of annotation texts created during this session (for "new this session" tracking) */
  sessionAnnotations: string[];

  // Scroll tracking
  /** The line number of the topmost visible element in the rendered view */
  visibleLineNumber: number;
  /** The heading currently visible (for outline highlight sync) */
  activeHeadingLineNumber: number | null;

  // Scroll-to-line request (incremented counter triggers effect)
  scrollToLineRequest: { lineNumber: number; counter: number } | null;

  // Actions
  setContent: (content: string) => void;
  setFileURL: (url: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setFileName: (name: string) => void;
  setHeadings: (headings: HeadingInfo[]) => void;
  addSessionAnnotation: (text: string) => void;
  clearSessionAnnotations: () => void;
  setVisibleLineNumber: (line: number) => void;
  setActiveHeadingLineNumber: (line: number | null) => void;
  requestScrollToLine: (lineNumber: number) => void;
  clearDocument: () => void;
  loadDocument: (content: string, fileURL: string, fileName: string) => void;
}

let scrollCounter = 0;

export const useDocumentStore = create<DocumentState>((set) => ({
  content: "",
  fileURL: null,
  isDirty: false,
  fileName: "",
  headings: [],
  sessionAnnotations: [],
  visibleLineNumber: 1,
  activeHeadingLineNumber: null,
  scrollToLineRequest: null,

  setContent: (content) => set({ content, isDirty: true }),
  setFileURL: (url) => set({ fileURL: url }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setFileName: (name) => set({ fileName: name }),
  setHeadings: (headings) => set({ headings }),
  addSessionAnnotation: (text) =>
    set((s) => ({ sessionAnnotations: [...s.sessionAnnotations, text] })),
  clearSessionAnnotations: () => set({ sessionAnnotations: [] }),
  setVisibleLineNumber: (line) => set({ visibleLineNumber: line }),
  setActiveHeadingLineNumber: (line) => set({ activeHeadingLineNumber: line }),
  requestScrollToLine: (lineNumber) => {
    scrollCounter++;
    set({ scrollToLineRequest: { lineNumber, counter: scrollCounter } });
  },
  clearDocument: () =>
    set({
      content: "",
      fileURL: null,
      isDirty: false,
      fileName: "",
      headings: [],
      sessionAnnotations: [],
      visibleLineNumber: 1,
      activeHeadingLineNumber: null,
      scrollToLineRequest: null,
    }),
  loadDocument: (content, fileURL, fileName) =>
    set({
      content,
      fileURL,
      fileName,
      isDirty: false,
      headings: [],
      sessionAnnotations: [],
      visibleLineNumber: 1,
      activeHeadingLineNumber: null,
    }),
}));
