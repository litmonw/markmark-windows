/**
 * File tree state store.
 * Manages the directory tree structure and selection state.
 */
import { create } from "zustand";
import type { FileNode } from "../types";

interface FileTreeState {
  /** Root directory path (null when no folder is open) */
  rootPath: string | null;
  /** Top-level file/directory nodes */
  fileNodes: FileNode[];
  /** Currently selected file path */
  selectedFilePath: string | null;
  /** Set of expanded directory paths */
  expandedPaths: Set<string>;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  errorMessage: string | null;

  // Actions
  setRootPath: (path: string | null) => void;
  setFileNodes: (nodes: FileNode[]) => void;
  setSelectedFilePath: (path: string | null) => void;
  toggleExpanded: (path: string) => void;
  expandPath: (path: string) => void;
  collapsePath: (path: string) => void;
  isExpanded: (path: string) => boolean;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  clearTree: () => void;
}

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  rootPath: null,
  fileNodes: [],
  selectedFilePath: null,
  expandedPaths: new Set<string>(),
  isLoading: false,
  errorMessage: null,

  setRootPath: (path) => set({ rootPath: path }),
  setFileNodes: (nodes) => set({ fileNodes: nodes, isLoading: false, errorMessage: null }),
  setSelectedFilePath: (path) => set({ selectedFilePath: path }),
  toggleExpanded: (path) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return { expandedPaths: next };
    }),
  expandPath: (path) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      next.add(path);
      return { expandedPaths: next };
    }),
  collapsePath: (path) =>
    set((s) => {
      const next = new Set(s.expandedPaths);
      next.delete(path);
      return { expandedPaths: next };
    }),
  isExpanded: (path) => get().expandedPaths.has(path),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setErrorMessage: (msg) => set({ errorMessage: msg, isLoading: false }),
  clearTree: () =>
    set({
      rootPath: null,
      fileNodes: [],
      selectedFilePath: null,
      expandedPaths: new Set<string>(),
      isLoading: false,
      errorMessage: null,
    }),
}));
