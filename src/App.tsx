/**
 * Main application component implementing the three-pane layout:
 *   Left:   Sidebar with file tree (resizable, collapsible)
 *   Center: Markdown viewer (iframe)
 *   Right:  Outline panel (resizable, collapsible)
 *
 * Applies theme colors as CSS custom properties on :root.
 * Keyboard shortcuts: Ctrl+O (open folder), Ctrl+S (save), Ctrl+\ (toggle sidebar).
 */
import { useCallback, useEffect, useMemo, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

import { useAppStore } from "./stores/appStore";
import { useDocumentStore } from "./stores/documentStore";
import { useFileTreeStore } from "./stores/fileTreeStore";

import {
  themeById,
  deriveTokens,
  cssCustomProperties,
  codeHighlightCSS,
  defaultTheme,
  allThemes,
} from "./services/themeManager";
import {
  setLanguage as setL10nLanguage,
  detectLanguage,
  t,
} from "./services/localization";
import type { FileNode } from "./types";

import { FileTree } from "./components/Sidebar/FileTree";
import { MarkdownViewer } from "./components/Viewer/MarkdownViewer";
import { OutlinePanel } from "./components/Outline/OutlinePanel";
import { ResizeHandle } from "./components/ResizeHandle";
import { WelcomeView } from "./components/WelcomeView";
import { SettingsView } from "./components/Settings/SettingsView";

// ---------------------------------------------------------------------------
// SVG icons (inline to avoid extra deps)
// ---------------------------------------------------------------------------

const IconSidebar = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
    <line x1="5.5" y1="2.5" x2="5.5" y2="13.5" />
  </svg>
);

const IconOutline = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
    <line x1="10.5" y1="2.5" x2="10.5" y2="13.5" />
  </svg>
);

const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 4v8a1.5 1.5 0 001.5 1.5h10A1.5 1.5 0 0014.5 12V6A1.5 1.5 0 0013 4.5H8L6.5 3H3A1.5 1.5 0 001.5 4.5" />
  </svg>
);

const IconGear = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="2" />
    <path d="M13.2 10a1.1 1.1 0 00.2 1.2l.04.04a1.34 1.34 0 11-1.9 1.9l-.04-.04a1.1 1.1 0 00-1.86.8v.1a1.34 1.34 0 01-2.68 0v-.06A1.1 1.1 0 006 13.2l-.04.04a1.34 1.34 0 11-1.9-1.9l.04-.04a1.1 1.1 0 00-.8-1.86h-.1a1.34 1.34 0 010-2.68h.06A1.1 1.1 0 004.06 6l-.04-.04a1.34 1.34 0 111.9-1.9l.04.04a1.1 1.1 0 001.86-.8v-.1a1.34 1.34 0 012.68 0v.06a1.1 1.1 0 00.7.96l.04-.04a1.34 1.34 0 111.9 1.9l-.04.04a1.1 1.1 0 00.8 1.86h.1a1.34 1.34 0 010 2.68h-.06z" />
  </svg>
);

const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v8m0 0l-3-3m3 3l3-3" />
    <path d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3" />
  </svg>
);

// ---------------------------------------------------------------------------
// Helper: apply theme CSS variables to document root
// ---------------------------------------------------------------------------

function applyThemeCSSVars(themeId: string, contrast: number) {
  const def = themeById(themeId) ?? defaultTheme("dark");
  const resolved = { ...def, contrast };
  const colors = deriveTokens(resolved);
  const root = document.documentElement;

  root.style.setProperty("--surface", colors.surface);
  root.style.setProperty("--ink", colors.ink);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--success", colors.success);
  root.style.setProperty("--danger", colors.danger);
  root.style.setProperty("--bg-elevated", colors.bgElevated);
  root.style.setProperty("--bg-subtle", colors.bgSubtle);
  root.style.setProperty("--bg-muted", colors.bgMuted);
  root.style.setProperty("--fg-secondary", colors.fgSecondary);
  root.style.setProperty("--fg-muted", colors.fgMuted);
  root.style.setProperty("--accent-hover", colors.accentHover);
  root.style.setProperty("--accent-soft", colors.accentSoft);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--border-subtle", colors.borderSubtle);

  if (colors.bodyFontFamily)
    root.style.setProperty("--font-body", colors.bodyFontFamily);
  if (colors.headingFontFamily)
    root.style.setProperty("--font-heading", colors.headingFontFamily);
  if (colors.codeFontFamily)
    root.style.setProperty("--font-code", colors.codeFontFamily);
  if (colors.bodyFontSize)
    root.style.setProperty("--font-size-base", colors.bodyFontSize);
  if (colors.lineHeight)
    root.style.setProperty("--line-height", colors.lineHeight);
  if (colors.letterSpacing)
    root.style.setProperty("--letter-spacing", colors.letterSpacing);
  if (colors.borderRadius)
    root.style.setProperty("--border-radius", colors.borderRadius);

  return { colors, codeCSS: codeHighlightCSS(colors) };
}

// ---------------------------------------------------------------------------
// Helper: open directory via Tauri and load into file tree
// ---------------------------------------------------------------------------

async function loadDirectory(dirPath: string) {
  const fileTreeStore = useFileTreeStore.getState();
  fileTreeStore.setIsLoading(true);
  fileTreeStore.setRootPath(dirPath);
  try {
    const nodes = await invoke<FileNode[]>("open_directory", {
      path: dirPath,
    });
    fileTreeStore.setFileNodes(nodes);
  } catch (err) {
    fileTreeStore.setErrorMessage(String(err));
  }
}

async function loadFileContent(filePath: string) {
  const docStore = useDocumentStore.getState();
  try {
    const content = await invoke<string>("read_file", { path: filePath });
    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    docStore.loadDocument(content, filePath, fileName);
    useFileTreeStore.getState().setSelectedFilePath(filePath);
  } catch (err) {
    console.error("Failed to read file:", err);
  }
}

async function saveFileContent() {
  const docStore = useDocumentStore.getState();
  const { content, fileURL, isDirty } = docStore;
  if (!fileURL || !isDirty) return;
  try {
    await invoke("write_file", { path: fileURL, content });
    docStore.setIsDirty(false);
  } catch (err) {
    console.error("Failed to save file:", err);
  }
}

// ---------------------------------------------------------------------------
// App component
// ---------------------------------------------------------------------------

export default function App() {
  const {
    sidebarVisible,
    sidebarWidth,
    setSidebarWidth,
    outlineVisible,
    outlineWidth,
    setOutlineWidth,
    toggleSidebar,
    toggleOutline,
    isSettingsOpen,
    toggleSettings,
    closeSettings,
    settingsTab,
    setSettingsTab,
    themeId,
    setThemeId,
    appearanceMode,
    setAppearanceMode,
    language,
    setLanguage: setAppLanguage,
    contentPadding,
    setContentPadding,
    fontSize,
    setFontSize,
    contrast,
    setContrast,
  } = useAppStore();

  const {
    content,
    fileURL,
    isDirty,
    fileName,
    headings,
    activeHeadingLineNumber,
    scrollToLineRequest,
    requestScrollToLine,
    setContent,
    setHeadings,
    clearDocument,
  } = useDocumentStore();

  const { rootPath, selectedFilePath } = useFileTreeStore();

  // Compute theme CSS once per theme/contrast change
  const themeCSS = useMemo(() => {
    const { colors, codeCSS } = applyThemeCSSVars(themeId, contrast);
    const cssProps = cssCustomProperties(colors);
    return cssProps + codeCSS;
  }, [themeId, contrast]);

  // Sync language to localization service
  useEffect(() => {
    const resolvedLang = language === "auto" ? detectLanguage() : (language as "en" | "zh-CN" | "zh-TW");
    setL10nLanguage(resolvedLang);
  }, [language]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "o") {
        e.preventDefault();
        handleOpenFolder();
      } else if (ctrl && e.key === "s") {
        e.preventDefault();
        saveFileContent();
      } else if (ctrl && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      } else if (ctrl && e.key === ",") {
        e.preventDefault();
        toggleSettings();
      }
    },
    [toggleSidebar, toggleSettings]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Open folder dialog
  const handleOpenFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected) {
      await loadDirectory(selected as string);
      useAppStore.getState().setSidebarVisible(true);
    }
  }, []);

  // Open single file dialog
  const handleOpenFile = useCallback(async () => {
    const selected = await open({
      directory: false,
      multiple: false,
      filters: [{ name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd", "txt"] }],
    });
    if (selected) {
      await loadFileContent(selected as string);
    }
  }, []);

  // Called when a file is selected in the tree
  const handleFileSelect = useCallback(
    async (filePath: string) => {
      await loadFileContent(filePath);
    },
    []
  );

  // Called when content is modified via CriticMarkup
  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
    },
    [setContent]
  );

  // Called when headings are parsed
  const handleHeadingsUpdate = useCallback(
    (h: typeof headings) => {
      setHeadings(h);
    },
    [setHeadings]
  );

  // Whether we have a document open
  const hasDocument = fileURL !== null || content.length > 0;

  // Whether we should show the welcome screen
  const showWelcome = !hasDocument && !rootPath && !isSettingsOpen;

  return (
    <div className="app-shell">
      {isSettingsOpen ? (
        // Settings mode
        <>
          <div
            className="app-sidebar"
            style={{ width: 200 }}
          >
            <div className="app-sidebar__header">
              <button
                className="icon-btn"
                onClick={closeSettings}
                title={t("settingsBackToApp")}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </button>
              <span style={{ fontSize: 12, color: "var(--fg-secondary)" }}>
                {t("settingsMenuLabel")}
              </span>
            </div>
            <div className="app-sidebar__content" style={{ padding: "8px" }}>
              <button
                onClick={() => setSettingsTab("general")}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 6,
                  background: settingsTab === "general" ? "var(--accent-soft)" : "transparent",
                  color: settingsTab === "general" ? "var(--ink)" : "var(--fg-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <IconGear />
                {t("settingsTabGeneral")}
              </button>
              <button
                onClick={() => setSettingsTab("appearance")}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: 6,
                  background: settingsTab === "appearance" ? "var(--accent-soft)" : "transparent",
                  color: settingsTab === "appearance" ? "var(--ink)" : "var(--fg-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 2a6 6 0 010 12" fill="currentColor" opacity="0.3" />
                </svg>
                {t("settingsTabAppearance")}
              </button>
            </div>
          </div>

          <div className="app-viewer">
            <SettingsView
              tab={settingsTab}
              themeId={themeId}
              setThemeId={setThemeId}
              appearanceMode={appearanceMode}
              setAppearanceMode={setAppearanceMode}
              language={language}
              setLanguage={setAppLanguage}
              fontSize={fontSize}
              setFontSize={setFontSize}
              contrast={contrast}
              setContrast={setContrast}
              contentPadding={contentPadding}
              setContentPadding={setContentPadding}
            />
          </div>
        </>
      ) : (
        // Normal mode
        <>
          {/* Sidebar */}
          <div
            className={`app-sidebar ${sidebarVisible ? "" : "collapsed"}`}
            style={{ width: sidebarVisible ? sidebarWidth : 0 }}
          >
            <div className="app-sidebar__header">
              <button className="icon-btn" onClick={toggleSidebar} title={t("titleBarToggleSidebar")}>
                <IconSidebar />
              </button>
              <button className="icon-btn" onClick={handleOpenFolder} title={t("titleBarOpen")}>
                <IconFolder />
              </button>
              <div style={{ flex: 1 }} />
            </div>
            <div className="app-sidebar__content">
              <FileTree onFileSelect={handleFileSelect} />
            </div>
            <div className="app-sidebar__footer">
              <button
                onClick={toggleSettings}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  border: "none",
                  background: "transparent",
                  color: "var(--fg-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <IconGear />
                {t("sidebarSettingsButton")}
              </button>
            </div>
          </div>

          {/* Resize handle between sidebar and viewer */}
          {sidebarVisible && (
            <ResizeHandle
              onResize={(delta) => setSidebarWidth(sidebarWidth + delta)}
            />
          )}

          {/* Center viewer */}
          <div className="app-viewer">
            {/* Titlebar */}
            <div className="app-viewer__titlebar">
              {!sidebarVisible && (
                <>
                  <button className="icon-btn" onClick={toggleSidebar} title={t("titleBarToggleSidebar")}>
                    <IconSidebar />
                  </button>
                  <button className="icon-btn" onClick={handleOpenFolder} title={t("titleBarOpen")}>
                    <IconFolder />
                  </button>
                </>
              )}

              {hasDocument && (
                <span className="file-path-label">
                  {isDirty && "\u2022 "}
                  {fileName || fileURL || "Untitled"}
                </span>
              )}

              <div style={{ flex: 1 }} />

              {hasDocument && (
                <button
                  className="icon-btn"
                  onClick={saveFileContent}
                  disabled={!isDirty}
                  title={t("titleBarSave")}
                  style={isDirty ? { color: "var(--accent)" } : undefined}
                >
                  <IconSave />
                </button>
              )}

              <button
                className={`icon-btn ${outlineVisible ? "active" : ""}`}
                onClick={toggleOutline}
                disabled={!hasDocument}
                title={t("titleBarToggleOutline")}
              >
                <IconOutline />
              </button>
            </div>

            {/* Content area */}
            <div className="app-viewer__content">
              {showWelcome ? (
                <WelcomeView onOpenFolder={handleOpenFolder} onOpenFile={handleOpenFile} />
              ) : hasDocument ? (
                <>
                  <div className="app-viewer__markdown">
                    <MarkdownViewer
                      content={content}
                      themeCSS={themeCSS}
                      contentPadding={contentPadding}
                      isDark={
                        themeById(themeId)?.type === "dark" ||
                        (!themeById(themeId) && true)
                      }
                      scrollToLineRequest={scrollToLineRequest}
                      onContentChange={handleContentChange}
                      onHeadingsUpdate={handleHeadingsUpdate}
                    />
                  </div>

                  {outlineVisible && (
                    <>
                      <ResizeHandle
                        onResize={(delta) => setOutlineWidth(outlineWidth - delta)}
                      />
                      <div className="app-outline" style={{ width: outlineWidth }}>
                        <OutlinePanel
                          headings={headings}
                          activeLineNumber={activeHeadingLineNumber}
                          onSelectHeading={(lineNumber) =>
                            requestScrollToLine(lineNumber)
                          }
                        />
                      </div>
                    </>
                  )}
                </>
              ) : rootPath ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--fg-secondary)",
                    fontSize: 14,
                  }}
                >
                  {t("selectFileHint")}
                </div>
              ) : (
                <WelcomeView onOpenFolder={handleOpenFolder} onOpenFile={handleOpenFile} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
