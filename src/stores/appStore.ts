/**
 * Global application state store.
 * Manages sidebar, outline, settings, theme, and appearance.
 */
import { create } from "zustand";

export type AppearanceMode = "light" | "dark" | "system";

interface AppState {
  // Sidebar
  sidebarVisible: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarVisible: (v: boolean) => void;
  setSidebarWidth: (w: number) => void;

  // Outline
  outlineVisible: boolean;
  outlineWidth: number;
  toggleOutline: () => void;
  setOutlineVisible: (v: boolean) => void;
  setOutlineWidth: (w: number) => void;

  // Settings
  isSettingsOpen: boolean;
  settingsTab: "general" | "appearance";
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
  setSettingsTab: (tab: "general" | "appearance") => void;

  // Theme
  themeId: string;
  setThemeId: (id: string) => void;

  // Appearance
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;

  // Language
  language: string;
  setLanguage: (lang: string) => void;

  // Content display
  contentPadding: number;
  setContentPadding: (px: number) => void;
  fontSize: number;
  setFontSize: (px: number) => void;
  contrast: number;
  setContrast: (val: number) => void;

  // Annotation panel
  annotationPanelVisible: boolean;
  toggleAnnotationPanel: () => void;

  // Find bar
  findBarVisible: boolean;
  showFindBar: () => void;
  hideFindBar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar defaults
  sidebarVisible: true,
  sidebarWidth: 250,
  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  setSidebarVisible: (v) => set({ sidebarVisible: v }),
  setSidebarWidth: (w) => set({ sidebarWidth: Math.max(160, Math.min(500, w)) }),

  // Outline defaults
  outlineVisible: true,
  outlineWidth: 200,
  toggleOutline: () => set((s) => ({ outlineVisible: !s.outlineVisible })),
  setOutlineVisible: (v) => set({ outlineVisible: v }),
  setOutlineWidth: (w) => set({ outlineWidth: Math.max(140, Math.min(400, w)) }),

  // Settings
  isSettingsOpen: false,
  settingsTab: "general",
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleSettings: () => set((s) => ({ isSettingsOpen: !s.isSettingsOpen })),
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  // Theme
  themeId: "buddy-dark",
  setThemeId: (id) => set({ themeId: id }),

  // Appearance
  appearanceMode: "dark",
  setAppearanceMode: (mode) => set({ appearanceMode: mode }),

  // Language
  language: "en",
  setLanguage: (lang) => set({ language: lang }),

  // Content display
  contentPadding: 32,
  setContentPadding: (px) => set({ contentPadding: Math.max(8, Math.min(80, px)) }),
  fontSize: 16,
  setFontSize: (px) => set({ fontSize: Math.max(10, Math.min(28, px)) }),
  contrast: 60,
  setContrast: (val) => set({ contrast: Math.max(0, Math.min(100, val)) }),

  // Annotation panel
  annotationPanelVisible: false,
  toggleAnnotationPanel: () =>
    set((s) => ({ annotationPanelVisible: !s.annotationPanelVisible })),

  // Find bar
  findBarVisible: false,
  showFindBar: () => set({ findBarVisible: true }),
  hideFindBar: () => set({ findBarVisible: false }),
}));
