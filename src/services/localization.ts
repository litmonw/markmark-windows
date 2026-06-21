/**
 * Localization service – ported from Swift LocalizationService.swift
 *
 * Flat key-value structure with 3 languages (zh-CN, zh-TW, en).
 * Use `t(key)` to get the translated string for the current language.
 * Use `t(key, { name: "foo" })` for interpolation.
 */

// ---------------------------------------------------------------------------
// Language types
// ---------------------------------------------------------------------------

export type Language = "zh-CN" | "zh-TW" | "en";

/** Language preference including the "auto" option that follows the system locale. */
export type LanguagePref = "auto" | Language;

// ---------------------------------------------------------------------------
// Localization keys
// ---------------------------------------------------------------------------

export type L10nKey =
  // App
  | "appName"
  // Settings – navigation
  | "settingsMenuLabel"
  | "settingsBackToApp"
  | "settingsTabGeneral"
  | "settingsTabAppearance"
  // Settings – general
  | "settingsGeneralLanguageTitle"
  | "settingsGeneralLanguageDesc"
  | "settingsGeneralDisplayTitle"
  | "settingsGeneralDisplayMode"
  | "settingsGeneralRenderedWidthTitle"
  | "settingsGeneralRenderedWidthDesc"
  | "settingsGeneralMaxWidthFollowsWindow"
  | "settingsGeneralStartupTitle"
  | "settingsGeneralReopenLastLocation"
  | "settingsGeneralFileTreeTitle"
  | "settingsGeneralShowHiddenFiles"
  | "settingsGeneralShowNonMarkdownFiles"
  | "settingsGeneralDefaultOpenerTitle"
  | "settingsGeneralDefaultOpenerDesc"
  | "settingsGeneralSetAsDefault"
  | "settingsGeneralIsDefault"
  | "settingsGeneralSetDefaultFailed"
  | "settingsGeneralCommandLineTitle"
  | "settingsGeneralCommandLineDesc"
  | "settingsGeneralCommandLineInstalled"
  | "settingsGeneralCommandLineInstallFailed"
  | "settingsGeneralCommandLineUninstallFailed"
  | "settingsGeneralQuickLookTitle"
  | "settingsGeneralQuickLookDesc"
  | "settingsGeneralQuickLookEnabled"
  // Settings – appearance
  | "settingsAppearanceThemeTitle"
  | "settingsAppearanceThemeDesc"
  | "settingsAppearanceModeLight"
  | "settingsAppearanceModeLightDesc"
  | "settingsAppearanceModeDark"
  | "settingsAppearanceModeDarkDesc"
  | "settingsAppearanceModeSystem"
  | "settingsAppearanceModeSystemDesc"
  | "settingsAppearanceSchemeTitle"
  | "settingsAppearanceSchemeDesc"
  | "settingsAppearanceCustomTitle"
  | "settingsAppearanceCustomDesc"
  | "settingsAppearanceCustomSurface"
  | "settingsAppearanceCustomInk"
  | "settingsAppearanceCustomAccent"
  | "settingsAppearanceCustomSuccess"
  | "settingsAppearanceCustomDanger"
  | "settingsAppearanceContrastTitle"
  | "settingsAppearanceContrastDesc"
  | "settingsAppearanceContrastLow"
  | "settingsAppearanceContrastHigh"
  | "settingsAppearanceTypographyTitle"
  | "settingsAppearanceSourceFontSize"
  | "settingsAppearanceContentPadding"
  // Language options
  | "languageAuto"
  | "languageZhCN"
  | "languageZhTW"
  | "languageEn"
  // Display mode
  | "displayModeRendered"
  | "displayModeRaw"
  // Common operations
  | "open"
  | "save"
  | "reset"
  | "confirm"
  // Clipboard
  | "newFromClipboard"
  | "clipboardScratchName"
  // Unsaved changes
  | "unsavedChangesTitle"
  | "unsavedChangesMessage"
  | "unsavedSave"
  | "unsavedDontSave"
  | "unsavedCancel"
  // File deleted externally
  | "fileDeletedTitle"
  | "fileDeletedMessage"
  | "fileDeletedSaveAs"
  | "fileDeletedDiscard"
  // File modified externally
  | "fileModifiedExternallyTitle"
  | "fileModifiedExternallyMessage"
  | "fileModifiedExternallyReload"
  | "fileModifiedExternallyDontRemind"
  // Open recent
  | "openRecent"
  | "openRecentEmpty"
  | "openRecentFiles"
  | "openRecentFolders"
  | "clearRecentItems"
  // Title bar
  | "titleBarToggleSidebar"
  | "titleBarDisplayMode"
  | "titleBarOpen"
  | "titleBarSave"
  | "titleBarReload"
  | "titleBarToggleOutline"
  | "titleBarCopyPath"
  // Copy / CriticMarkup
  | "titleBarCopyForAI"
  | "titleBarCopyMenu"
  | "copyForAIMenu"
  | "copyCriticMenu"
  | "copyFragmentsMenu"
  | "copyPromptMenu"
  | "copiedToast"
  // Annotation actions
  | "titleBarAnnotationActions"
  | "applyAnnotationsMenu"
  | "applyAnnotationsConfirmTitle"
  | "applyAnnotationsConfirmMessage"
  | "discardAnnotationsMenu"
  | "discardAnnotationsConfirmTitle"
  | "discardAnnotationsConfirmMessage"
  // Edit menu
  | "editUndo"
  | "editRedo"
  // Annotation panel
  | "titleBarAnnotationPanel"
  | "annotationGroupNew"
  | "annotationGroupHistory"
  | "annotationSelectAll"
  | "annotationSelectNew"
  | "annotationCopySelected"
  | "annotationStale"
  | "annotationEmpty"
  // AI prompt
  | "aiPromptDefaultTemplate"
  | "settingsAIPromptTitle"
  | "settingsAIPromptDescription"
  | "settingsAIPromptReset"
  // CriticMarkup operations
  | "criticDelete"
  | "criticHighlight"
  | "criticComment"
  | "criticReplace"
  | "criticConfirm"
  | "criticCancel"
  | "criticEdit"
  | "criticCommentHint"
  | "criticReplaceHint"
  | "criticNotFound"
  // Outline
  | "outlineTitle"
  | "outlineEmpty"
  // Sidebar
  | "loading"
  | "emptyDirectoryMessage"
  | "sidebarSettings"
  | "sidebarSettingsButton"
  // Welcome
  | "welcomeOpenFolder"
  | "welcomePressCmdO"
  | "selectFileHint"
  | "welcomeDropHint"
  // Context menu
  | "contextMenuNewFile"
  | "contextMenuNewSubdirectory"
  | "contextMenuRename"
  | "contextMenuMoveTo"
  | "contextMenuDelete"
  | "contextMenuReload"
  | "contextMenuCopyPath"
  // Context menu dialogs
  | "renameTitle"
  | "renameMessage"
  | "renameEmptyName"
  | "renameNameExists"
  | "deleteTitle"
  | "deleteMessage"
  | "deleteDirectoryMessage"
  | "moveSelectFolder"
  // Update
  | "updateAvailableTitle"
  | "updateAvailableVersion"
  | "updateChecking"
  | "updateUpToDate"
  | "updateDownload"
  | "updateDownloading"
  | "updateDownloadComplete"
  | "updateInstall"
  | "updateInstallAndRestart"
  | "updateInstalling"
  | "updateLater"
  | "updateSkipVersion"
  | "updateCancel"
  | "updateError"
  | "updateModeAuto"
  | "updateModeManual"
  | "updateInstallInstructionsTitle"
  | "updateManualInstallInstructions"
  | "updateReleaseNotesTitle"
  | "checkForUpdates"
  // Find & replace
  | "findBarSearchPlaceholder"
  | "findBarReplacePlaceholder"
  | "findBarFindNext"
  | "findBarFindPrevious"
  | "findBarReplace"
  | "findBarReplaceAll"
  | "findBarNoResults"
  | "findBarCaseSensitive"
  | "findBarWholeWord"
  | "findBarRegularExpression"
  | "findBarFind"
  | "findBarFindAndReplace"
  // Export PDF
  | "exportPDF"
  | "titleBarExportPDF"
  | "exportPDFSuccess"
  | "exportPDFFailed"
  // Drag & drop
  | "unsupportedFileTypeAlert";

// ---------------------------------------------------------------------------
// Translation dictionaries
// ---------------------------------------------------------------------------

const en: Record<L10nKey, string> = {
  appName: "MarkMark",
  settingsMenuLabel: "Settings\u2026",
  settingsBackToApp: "Back to App",
  settingsTabGeneral: "General",
  settingsTabAppearance: "Appearance",
  settingsGeneralLanguageTitle: "Language",
  settingsGeneralLanguageDesc: 'Choose the interface language. "Auto" follows your system.',
  settingsGeneralDisplayTitle: "Display",
  settingsGeneralDisplayMode: "Default display mode",
  settingsGeneralRenderedWidthTitle: "Rendered Width",
  settingsGeneralRenderedWidthDesc:
    "Control the maximum width of rendered content. When off, a fixed width is used.",
  settingsGeneralMaxWidthFollowsWindow: "Follow window width",
  settingsGeneralStartupTitle: "Startup",
  settingsGeneralReopenLastLocation: "Reopen last location on launch",
  settingsGeneralFileTreeTitle: "File Tree",
  settingsGeneralShowHiddenFiles: "Show hidden files",
  settingsGeneralShowNonMarkdownFiles: "Show non-Markdown files",
  settingsGeneralDefaultOpenerTitle: "Default Markdown Opener",
  settingsGeneralDefaultOpenerDesc:
    "Set MarkMark as the default application for opening .md, .markdown, .mdown, .mkd files.",
  settingsGeneralSetAsDefault: "Set as Default",
  settingsGeneralIsDefault: "MarkMark is the default Markdown opener",
  settingsGeneralSetDefaultFailed: "Failed to set as default opener. Please try again.",
  settingsGeneralCommandLineTitle: "Command Line Tool",
  settingsGeneralCommandLineDesc:
    "Install the `mdr` command to open files from Terminal. Example: mdr README.md",
  settingsGeneralCommandLineInstalled: "mdr command is available in Terminal",
  settingsGeneralCommandLineInstallFailed: "Failed to install command line tool. Please try again.",
  settingsGeneralCommandLineUninstallFailed:
    "Failed to uninstall command line tool. Please try again.",
  settingsGeneralQuickLookTitle: "Quick Look Preview",
  settingsGeneralQuickLookDesc:
    "Enable Markdown rendering in Finder Quick Look (press Space to preview).",
  settingsGeneralQuickLookEnabled: "Enable Quick Look preview",
  settingsAppearanceThemeTitle: "Theme",
  settingsAppearanceThemeDesc: "Choose the application appearance mode.",
  settingsAppearanceModeLight: "Light",
  settingsAppearanceModeLightDesc: "Always use light appearance",
  settingsAppearanceModeDark: "Dark",
  settingsAppearanceModeDarkDesc: "Always use dark appearance",
  settingsAppearanceModeSystem: "System",
  settingsAppearanceModeSystemDesc: "Follow system setting",
  settingsAppearanceSchemeTitle: "Color Scheme",
  settingsAppearanceSchemeDesc: "Choose a preset color scheme for the current mode.",
  settingsAppearanceCustomTitle: "Custom Colors",
  settingsAppearanceCustomDesc:
    "Customize individual color tokens. Changes override the current scheme.",
  settingsAppearanceCustomSurface: "Surface",
  settingsAppearanceCustomInk: "Ink",
  settingsAppearanceCustomAccent: "Accent",
  settingsAppearanceCustomSuccess: "Success",
  settingsAppearanceCustomDanger: "Danger",
  settingsAppearanceContrastTitle: "Contrast",
  settingsAppearanceContrastDesc: "Adjust the contrast between background and foreground layers.",
  settingsAppearanceContrastLow: "Low",
  settingsAppearanceContrastHigh: "High",
  settingsAppearanceTypographyTitle: "Typography",
  settingsAppearanceSourceFontSize: "Source font size",
  settingsAppearanceContentPadding: "Content padding",
  languageAuto: "Auto / Auto Detect",
  languageZhCN: "Simplified Chinese",
  languageZhTW: "Traditional Chinese",
  languageEn: "English",
  displayModeRendered: "Rendered",
  displayModeRaw: "Raw",
  open: "Open",
  save: "Save",
  reset: "Reset",
  confirm: "OK",
  newFromClipboard: "New Annotation from Clipboard",
  clipboardScratchName: "Clipboard Annotation",
  unsavedChangesTitle: "Unsaved Changes",
  unsavedChangesMessage:
    "Your changes will be lost if you don't save them. Do you want to save before closing?",
  unsavedSave: "Save",
  unsavedDontSave: "Don't Save",
  unsavedCancel: "Cancel",
  fileDeletedTitle: "File Deleted",
  fileDeletedMessage:
    'The file "{name}" was deleted externally. You have unsaved changes.',
  fileDeletedSaveAs: "Save As\u2026",
  fileDeletedDiscard: "Discard Changes",
  fileModifiedExternallyTitle: "File Modified Externally",
  fileModifiedExternallyMessage:
    "The file has been modified by another application. Reloading will discard your current changes.",
  fileModifiedExternallyReload: "Reload",
  fileModifiedExternallyDontRemind: "Don't remind me again",
  openRecent: "Open Recent",
  openRecentEmpty: "No Recent Items",
  openRecentFiles: "Files",
  openRecentFolders: "Folders",
  clearRecentItems: "Clear Menu",
  titleBarToggleSidebar: "Toggle Sidebar",
  titleBarDisplayMode: "Display Mode",
  titleBarOpen: "Open",
  titleBarSave: "Save",
  titleBarReload: "Reload",
  titleBarToggleOutline: "Toggle Outline",
  titleBarCopyPath: "Copy Path",
  titleBarCopyForAI: "Copy annotated doc for AI",
  titleBarCopyMenu: "Copy: CriticMarkup or for AI",
  copyForAIMenu: "Copy for AI (with instructions)",
  copyCriticMenu: "Copy CriticMarkup",
  copyFragmentsMenu: "Copy New Annotated Fragments",
  copyPromptMenu: "Copy AI Prompt",
  copiedToast: "Copied",
  titleBarAnnotationActions: "Apply or discard all annotations",
  applyAnnotationsMenu: "Apply All Annotations\u2026",
  applyAnnotationsConfirmTitle: "Apply all annotations?",
  applyAnnotationsConfirmMessage:
    "Deletions and replacements will be applied to the text; highlights and comments will be removed. This cannot be undone.",
  discardAnnotationsMenu: "Discard All Annotations\u2026",
  discardAnnotationsConfirmTitle: "Discard all annotations?",
  discardAnnotationsConfirmMessage:
    "This removes every CriticMarkup mark and restores the original text. This cannot be undone.",
  editUndo: "Undo",
  editRedo: "Redo",
  titleBarAnnotationPanel: "Annotations",
  annotationGroupNew: "New this session",
  annotationGroupHistory: "Existing",
  annotationSelectAll: "Select All",
  annotationSelectNew: "New Only",
  annotationCopySelected: "Copy Selected Fragments",
  annotationStale: "Stale",
  annotationEmpty: "No annotations",
  aiPromptDefaultTemplate: `The content below contains review annotations in CriticMarkup syntax:
- {++ addition ++}        suggested addition
- {-- deletion --}        suggested removal
- {~~ old ~> new ~~}      suggested replacement
- {>> comment <<}         my comment/question
- {== highlight ==}       part I want to focus on

---

{{MarkMark:content}}`,
  settingsAIPromptTitle: "AI Prompt Template",
  settingsAIPromptDescription:
    'Used by "Copy for AI" and "Copy AI Prompt". {{MarkMark:content}} marks where the document is inserted.',
  settingsAIPromptReset: "Restore Default",
  criticDelete: "Delete",
  criticHighlight: "Highlight",
  criticComment: "Comment",
  criticReplace: "Replace",
  criticConfirm: "Apply",
  criticCancel: "Cancel",
  criticEdit: "Edit",
  criticCommentHint: "Add a comment\u2026",
  criticReplaceHint: "Replace with\u2026",
  criticNotFound: "Could not locate the selection in the source",
  outlineTitle: "Outline",
  outlineEmpty: "No headings",
  loading: "Loading...",
  emptyDirectoryMessage: "No Markdown files in this directory",
  sidebarSettings: "Settings",
  sidebarSettingsButton: "Settings",
  welcomeOpenFolder: "Open a folder to get started",
  welcomePressCmdO: "Press Ctrl+O or click Open in toolbar",
  selectFileHint: "Select a file to preview",
  welcomeDropHint: "or drag a file or folder here",
  contextMenuNewFile: "New File",
  contextMenuNewSubdirectory: "New Subdirectory",
  contextMenuRename: "Rename",
  contextMenuMoveTo: "Move to\u2026",
  contextMenuDelete: "Move to Trash",
  contextMenuReload: "Reload",
  contextMenuCopyPath: "Copy Path",
  renameTitle: "Rename",
  renameMessage: 'Enter a new name for "{name}":',
  renameEmptyName: "Name cannot be empty.",
  renameNameExists: "An item with this name already exists.",
  deleteTitle: "Move to Trash",
  deleteMessage: 'Are you sure you want to move "{name}" to the Trash?',
  deleteDirectoryMessage:
    'Are you sure you want to move "{name}" and all its contents to the Trash?',
  moveSelectFolder: "Select Destination Folder",
  updateAvailableTitle: "Update Available",
  updateAvailableVersion: "Version {version}",
  updateChecking: "Checking for updates\u2026",
  updateUpToDate: "MarkMark is up to date.",
  updateDownload: "Download",
  updateDownloading: "Downloading update\u2026",
  updateDownloadComplete: "Download complete. Click Install to continue.",
  updateInstall: "Install",
  updateInstallAndRestart: "Install & Restart",
  updateInstalling: "Installing update\u2026",
  updateLater: "Later",
  updateSkipVersion: "Skip This Version",
  updateCancel: "Cancel",
  updateError: "Update check failed.",
  updateModeAuto: "Auto install & restart",
  updateModeManual: "Manual install required",
  updateInstallInstructionsTitle: "Installation",
  updateManualInstallInstructions:
    "1. Download the installer and run it\n2. Follow the setup wizard\n3. On first launch, your antivirus may flag the app:\n   \u2022 Allow the app in your antivirus settings\n   \u2022 Or right-click and choose 'Run as administrator'\n4. You can also pin MarkMark to your taskbar for quick access",
  updateReleaseNotesTitle: "Release Notes",
  checkForUpdates: "Check for Updates\u2026",
  findBarSearchPlaceholder: "Search",
  findBarReplacePlaceholder: "Replace",
  findBarFindNext: "Find Next",
  findBarFindPrevious: "Find Previous",
  findBarReplace: "Replace",
  findBarReplaceAll: "Replace All",
  findBarNoResults: "No results",
  findBarCaseSensitive: "Match Case",
  findBarWholeWord: "Match Whole Word",
  findBarRegularExpression: "Use Regular Expression",
  findBarFind: "Find",
  findBarFindAndReplace: "Find and Replace",
  exportPDF: "Export PDF\u2026",
  titleBarExportPDF: "Export PDF",
  exportPDFSuccess: "PDF exported successfully",
  exportPDFFailed: "Failed to export PDF",
  unsupportedFileTypeAlert:
    "Unsupported file type (.{ext}). Only Markdown files can be opened.",
};

const zhCN: Record<L10nKey, string> = {
  appName: "MarkMark",
  settingsMenuLabel: "\u8bbe\u7f6e\u2026",
  settingsBackToApp: "\u8fd4\u56de\u5e94\u7528",
  settingsTabGeneral: "\u901a\u7528",
  settingsTabAppearance: "\u5916\u89c2",
  settingsGeneralLanguageTitle: "\u754c\u9762\u8bed\u8a00",
  settingsGeneralLanguageDesc: "\u9009\u62e9\u5e94\u7528\u754c\u9762\u7684\u8bed\u8a00\u3002\u300c\u81ea\u52a8\u68c0\u6d4b\u300d\u4f1a\u8ddf\u968f\u7cfb\u7edf\u3002",
  settingsGeneralDisplayTitle: "\u663e\u793a",
  settingsGeneralDisplayMode: "\u9ed8\u8ba4\u663e\u793a\u6a21\u5f0f",
  settingsGeneralRenderedWidthTitle: "\u6e32\u67d3\u5bbd\u5ea6",
  settingsGeneralRenderedWidthDesc: "\u63a7\u5236\u6e32\u67d3\u5185\u5bb9\u7684\u6700\u5927\u5bbd\u5ea6\u3002\u5173\u95ed\u65f6\u4f7f\u7528\u56fa\u5b9a\u5bbd\u5ea6\u3002",
  settingsGeneralMaxWidthFollowsWindow: "\u8ddf\u968f\u7a97\u53e3\u5bbd\u5ea6",
  settingsGeneralStartupTitle: "\u542f\u52a8",
  settingsGeneralReopenLastLocation: "\u542f\u52a8\u65f6\u91cd\u65b0\u6253\u5f00\u4e0a\u6b21\u4f4d\u7f6e",
  settingsGeneralFileTreeTitle: "\u6587\u4ef6\u6811",
  settingsGeneralShowHiddenFiles: "\u663e\u793a\u9690\u85cf\u6587\u4ef6",
  settingsGeneralShowNonMarkdownFiles: "\u663e\u793a\u975e Markdown \u6587\u4ef6",
  settingsGeneralDefaultOpenerTitle: "\u9ed8\u8ba4 Markdown \u6253\u5f00\u7a0b\u5e8f",
  settingsGeneralDefaultOpenerDesc:
    "\u5c06 MarkMark \u8bbe\u7f6e\u4e3a .md\u3001.markdown\u3001.mdown\u3001.mkd \u6587\u4ef6\u7684\u9ed8\u8ba4\u6253\u5f00\u7a0b\u5e8f\u3002",
  settingsGeneralSetAsDefault: "\u8bbe\u4e3a\u9ed8\u8ba4",
  settingsGeneralIsDefault: "MarkMark \u5df2\u662f\u9ed8\u8ba4 Markdown \u6253\u5f00\u7a0b\u5e8f",
  settingsGeneralSetDefaultFailed: "\u8bbe\u7f6e\u9ed8\u8ba4\u6253\u5f00\u7a0b\u5e8f\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002",
  settingsGeneralCommandLineTitle: "\u547d\u4ee4\u884c\u5de5\u5177",
  settingsGeneralCommandLineDesc:
    "\u5b89\u88c5 mdr \u547d\u4ee4\uff0c\u53ef\u5728\u7ec8\u7aef\u4e2d\u6253\u5f00\u6587\u4ef6\u3002\u4f8b\u5982\uff1amdr README.md",
  settingsGeneralCommandLineInstalled: "mdr \u547d\u4ee4\u5df2\u5728\u7ec8\u7aef\u4e2d\u53ef\u7528",
  settingsGeneralCommandLineInstallFailed: "\u5b89\u88c5\u547d\u4ee4\u884c\u5de5\u5177\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002",
  settingsGeneralCommandLineUninstallFailed: "\u5378\u8f7d\u547d\u4ee4\u884c\u5de5\u5177\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u3002",
  settingsGeneralQuickLookTitle: "Quick Look \u9884\u89c8",
  settingsGeneralQuickLookDesc:
    "\u5728 Finder \u4e2d\u6309\u7a7a\u683c\u952e\u9884\u89c8 Markdown \u6587\u4ef6\u7684\u6e32\u67d3\u6548\u679c\u3002",
  settingsGeneralQuickLookEnabled: "\u542f\u7528 Quick Look \u9884\u89c8",
  settingsAppearanceThemeTitle: "\u4e3b\u9898",
  settingsAppearanceThemeDesc: "\u9009\u62e9\u5e94\u7528\u7684\u5916\u89c2\u6a21\u5f0f\u3002",
  settingsAppearanceModeLight: "\u6d45\u8272",
  settingsAppearanceModeLightDesc: "\u59cb\u7ec8\u4f7f\u7528\u6d45\u8272\u5916\u89c2",
  settingsAppearanceModeDark: "\u6df1\u8272",
  settingsAppearanceModeDarkDesc: "\u59cb\u7ec8\u4f7f\u7528\u6df1\u8272\u5916\u89c2",
  settingsAppearanceModeSystem: "\u8ddf\u968f\u7cfb\u7edf",
  settingsAppearanceModeSystemDesc: "\u8ddf\u968f\u7cfb\u7edf\u8bbe\u7f6e",
  settingsAppearanceSchemeTitle: "\u914d\u8272\u65b9\u6848",
  settingsAppearanceSchemeDesc: "\u4e3a\u5f53\u524d\u6a21\u5f0f\u9009\u62e9\u9884\u8bbe\u914d\u8272\u65b9\u6848\u3002",
  settingsAppearanceCustomTitle: "\u81ea\u5b9a\u4e49\u989c\u8272",
  settingsAppearanceCustomDesc:
    "\u81ea\u5b9a\u4e49\u5404\u989c\u8272\u4ee4\u724c\u3002\u4fee\u6539\u5c06\u8986\u76d6\u5f53\u524d\u65b9\u6848\u7684\u5bf9\u5e94\u989c\u8272\u3002",
  settingsAppearanceCustomSurface: "\u80cc\u666f\u8272",
  settingsAppearanceCustomInk: "\u6587\u5b57\u8272",
  settingsAppearanceCustomAccent: "\u5f3a\u8c03\u8272",
  settingsAppearanceCustomSuccess: "\u6210\u529f\u8272",
  settingsAppearanceCustomDanger: "\u5371\u9669\u8272",
  settingsAppearanceContrastTitle: "\u5bf9\u6bd4\u5ea6",
  settingsAppearanceContrastDesc: "\u8c03\u6574\u80cc\u666f\u4e0e\u524d\u666f\u5c42\u4e4b\u95f4\u7684\u5bf9\u6bd4\u5ea6\u3002",
  settingsAppearanceContrastLow: "\u4f4e",
  settingsAppearanceContrastHigh: "\u9ad8",
  settingsAppearanceTypographyTitle: "\u5b57\u4f53\u4e0e\u6392\u7248",
  settingsAppearanceSourceFontSize: "\u6e90\u7801\u5b57\u53f7",
  settingsAppearanceContentPadding: "\u5185\u5bb9\u8fb9\u8ddd",
  languageAuto: "\u81ea\u52a8\u68c0\u6d4b",
  languageZhCN: "\u7b80\u4f53\u4e2d\u6587",
  languageZhTW: "\u7e41\u9ad4\u4e2d\u6587",
  languageEn: "English",
  displayModeRendered: "\u6e32\u67d3",
  displayModeRaw: "\u7f16\u8f91",
  open: "\u6253\u5f00",
  save: "\u4fdd\u5b58",
  reset: "\u91cd\u7f6e",
  confirm: "\u786e\u8ba4",
  newFromClipboard: "\u4ece\u526a\u8d34\u677f\u65b0\u5efa\u6807\u6ce8",
  clipboardScratchName: "\u526a\u8d34\u677f\u6807\u6ce8",
  unsavedChangesTitle: "\u672a\u4fdd\u5b58\u7684\u66f4\u6539",
  unsavedChangesMessage:
    "\u5982\u679c\u4e0d\u4fdd\u5b58\uff0c\u60a8\u7684\u66f4\u6539\u5c06\u4f1a\u4e22\u5931\u3002\u5173\u95ed\u524d\u662f\u5426\u4fdd\u5b58\uff1f",
  unsavedSave: "\u4fdd\u5b58",
  unsavedDontSave: "\u4e0d\u4fdd\u5b58",
  unsavedCancel: "\u53d6\u6d88",
  fileDeletedTitle: "\u6587\u4ef6\u5df2\u88ab\u5220\u9664",
  fileDeletedMessage:
    "\u6587\u4ef6\u300c{name}\u300d\u5df2\u88ab\u5916\u90e8\u5220\u9664\uff0c\u60a8\u6709\u672a\u4fdd\u5b58\u7684\u66f4\u6539\u3002",
  fileDeletedSaveAs: "\u53e6\u5b58\u4e3a\u2026",
  fileDeletedDiscard: "\u653e\u5f03\u66f4\u6539",
  fileModifiedExternallyTitle: "\u6587\u4ef6\u5df2\u88ab\u5916\u90e8\u4fee\u6539",
  fileModifiedExternallyMessage:
    "\u6587\u4ef6\u5df2\u88ab\u5176\u4ed6\u5e94\u7528\u4fee\u6539\uff0c\u91cd\u65b0\u52a0\u8f7d\u5c06\u4e22\u5f03\u5f53\u524d\u672a\u4fdd\u5b58\u7684\u66f4\u6539\u3002",
  fileModifiedExternallyReload: "\u91cd\u65b0\u52a0\u8f7d",
  fileModifiedExternallyDontRemind: "\u4ee5\u540e\u4e0d\u518d\u63d0\u9192",
  openRecent: "\u6253\u5f00\u6700\u8fd1\u4f7f\u7528",
  openRecentEmpty: "\u65e0\u6700\u8fd1\u6253\u5f00\u7684\u9879",
  openRecentFiles: "\u6587\u4ef6",
  openRecentFolders: "\u6587\u4ef6\u5939",
  clearRecentItems: "\u6e05\u9664\u83dc\u5355",
  titleBarToggleSidebar: "\u5207\u6362\u4fa7\u8fb9\u680f",
  titleBarDisplayMode: "\u663e\u793a\u6a21\u5f0f",
  titleBarOpen: "\u6253\u5f00",
  titleBarSave: "\u4fdd\u5b58",
  titleBarReload: "\u91cd\u65b0\u52a0\u8f7d",
  titleBarToggleOutline: "\u5207\u6362\u5927\u7eb2",
  titleBarCopyPath: "\u590d\u5236\u8def\u5f84",
  titleBarCopyForAI: "\u590d\u5236\u6807\u6ce8\u6587\u6863\u7ed9 AI",
  titleBarCopyMenu: "\u590d\u5236\uff1aCriticMarkup \u539f\u6587 \u6216 \u7ed9 AI\uff08\u542b\u8bf4\u660e\uff09",
  copyForAIMenu: "\u590d\u5236\u7ed9 AI\uff08\u542b\u8bf4\u660e\uff09",
  copyCriticMenu: "\u590d\u5236 CriticMarkup",
  copyFragmentsMenu: "\u590d\u5236\u672c\u6b21\u65b0\u589e\u7684\u6807\u6ce8\u7247\u6bb5",
  copyPromptMenu: "\u590d\u5236 AI \u63d0\u793a\u8bcd",
  copiedToast: "\u5df2\u590d\u5236",
  titleBarAnnotationActions: "\u5e94\u7528\u6216\u653e\u5f03\u6240\u6709\u6807\u6ce8",
  applyAnnotationsMenu: "\u5e94\u7528\u6240\u6709\u6807\u6ce8\u2026",
  applyAnnotationsConfirmTitle: "\u5e94\u7528\u6240\u6709\u6807\u6ce8\uff1f",
  applyAnnotationsConfirmMessage:
    "\u5220\u9664\u548c\u66ff\u6362\u5c06\u76f4\u63a5\u4fee\u6539\u6b63\u6587\uff0c\u9ad8\u4eae\u548c\u8bc4\u8bba\u5c06\u88ab\u79fb\u9664\u3002\u6b64\u64cd\u4f5c\u65e0\u6cd5\u64a4\u9500\u3002",
  discardAnnotationsMenu: "\u653e\u5f03\u6240\u6709\u6807\u6ce8\u2026",
  discardAnnotationsConfirmTitle: "\u653e\u5f03\u6240\u6709\u6807\u6ce8\uff1f",
  discardAnnotationsConfirmMessage:
    "\u5c06\u79fb\u9664\u6240\u6709 CriticMarkup \u6807\u6ce8\u5e76\u6062\u590d\u539f\u6587\uff0c\u6b64\u64cd\u4f5c\u65e0\u6cd5\u64a4\u9500\u3002",
  editUndo: "\u64a4\u9500",
  editRedo: "\u91cd\u505a",
  titleBarAnnotationPanel: "\u6807\u6ce8\u5217\u8868",
  annotationGroupNew: "\u672c\u6b21\u65b0\u589e",
  annotationGroupHistory: "\u5386\u53f2\u6807\u6ce8",
  annotationSelectAll: "\u5168\u9009",
  annotationSelectNew: "\u53ea\u9009\u65b0\u589e",
  annotationCopySelected: "\u590d\u5236\u6240\u9009\u7247\u6bb5",
  annotationStale: "\u5df2\u5931\u6548",
  annotationEmpty: "\u6682\u65e0\u6807\u6ce8",
  aiPromptDefaultTemplate: `\u4e0b\u9762\u7684\u5185\u5bb9\u4e2d\u5305\u542b\u4f7f\u7528 CriticMarkup \u8bed\u6cd5\u7684\u5ba1\u9605\u6807\u6ce8\uff0c\u6807\u8bb0\u542b\u4e49\u5982\u4e0b\uff1a
- {++ \u65b0\u589e\u5185\u5bb9 ++}        \u5efa\u8bae\u65b0\u589e
- {-- \u5220\u9664\u5185\u5bb9 --}        \u5efa\u8bae\u5220\u9664
- {~~ \u65e7\u5185\u5bb9 ~> \u65b0\u5185\u5bb9 ~~} \u5efa\u8bae\u66ff\u6362\u4e3a\u65b0\u5185\u5bb9
- {>> \u8bc4\u8bba <<}            \u6211\u7684\u8bc4\u8bba/\u7591\u95ee
- {== \u9ad8\u4eae\u5185\u5bb9 ==}        \u6211\u91cd\u70b9\u5173\u6ce8\u7684\u90e8\u5206

---

{{MarkMark:content}}`,
  settingsAIPromptTitle: "AI \u63d0\u793a\u8bcd\u6a21\u677f",
  settingsAIPromptDescription:
    "\u300c\u590d\u5236\u7ed9 AI\u300d\u4e0e\u300c\u590d\u5236 AI \u63d0\u793a\u8bcd\u300d\u5171\u7528\u3002{{MarkMark:content}} \u4e3a\u6b63\u6587\u63d2\u5165\u4f4d\u7f6e\u5360\u4f4d\u7b26\u3002",
  settingsAIPromptReset: "\u6062\u590d\u9ed8\u8ba4",
  criticDelete: "\u5220\u9664",
  criticHighlight: "\u9ad8\u4eae",
  criticComment: "\u8bc4\u8bba",
  criticReplace: "\u66ff\u6362",
  criticConfirm: "\u5e94\u7528",
  criticCancel: "\u53d6\u6d88",
  criticEdit: "\u7f16\u8f91",
  criticCommentHint: "\u8f93\u5165\u8bc4\u8bba\u2026",
  criticReplaceHint: "\u66ff\u6362\u4e3a\u2026",
  criticNotFound: "\u65e0\u6cd5\u5728\u6e90\u7801\u4e2d\u5b9a\u4f4d\u9009\u533a\uff08\u8bd5\u8bd5\u53ea\u9009\u4e0d\u8de8\u683c\u5f0f\u7684\u6587\u5b57\uff09",
  outlineTitle: "\u5927\u7eb2",
  outlineEmpty: "\u6682\u65e0\u6807\u9898",
  loading: "\u52a0\u8f7d\u4e2d...",
  emptyDirectoryMessage: "\u8be5\u76ee\u5f55\u4e0b\u65e0 Markdown \u6587\u4ef6",
  sidebarSettings: "\u8bbe\u7f6e",
  sidebarSettingsButton: "\u8bbe\u7f6e",
  welcomeOpenFolder: "\u6253\u5f00\u6587\u4ef6\u5939\u5f00\u59cb\u9605\u8bfb",
  welcomePressCmdO: "\u6309 Ctrl+O \u6216\u70b9\u51fb\u5de5\u5177\u680f\u4e2d\u7684\u6253\u5f00\u6309\u94ae",
  selectFileHint: "\u9009\u62e9\u6587\u4ef6\u4ee5\u9884\u89c8",
  welcomeDropHint: "\u6216\u62d6\u62fd\u6587\u4ef6/\u6587\u4ef6\u5939\u5230\u6b64\u5904",
  contextMenuNewFile: "\u65b0\u5efa\u6587\u6863",
  contextMenuNewSubdirectory: "\u65b0\u5efa\u5b50\u76ee\u5f55",
  contextMenuRename: "\u91cd\u547d\u540d",
  contextMenuMoveTo: "\u79fb\u52a8\u5230\u2026",
  contextMenuDelete: "\u79fb\u5230\u56de\u6536\u7ad9",
  contextMenuReload: "\u91cd\u65b0\u52a0\u8f7d",
  contextMenuCopyPath: "\u590d\u5236\u8def\u5f84",
  renameTitle: "\u91cd\u547d\u540d",
  renameMessage: "\u8f93\u5165\u300c{name}\u300d\u7684\u65b0\u540d\u79f0\uff1a",
  renameEmptyName: "\u540d\u79f0\u4e0d\u80fd\u4e3a\u7a7a\u3002",
  renameNameExists: "\u5df2\u5b58\u5728\u540c\u540d\u9879\u76ee\u3002",
  deleteTitle: "\u79fb\u5230\u56de\u6536\u7ad9",
  deleteMessage: "\u786e\u5b9a\u8981\u5c06\u300c{name}\u300d\u79fb\u5230\u56de\u6536\u7ad9\u5417\uff1f",
  deleteDirectoryMessage:
    "\u786e\u5b9a\u8981\u5c06\u300c{name}\u300d\u53ca\u5176\u6240\u6709\u5185\u5bb9\u79fb\u5230\u56de\u6536\u7ad9\u5417\uff1f",
  moveSelectFolder: "\u9009\u62e9\u76ee\u6807\u6587\u4ef6\u5939",
  updateAvailableTitle: "\u53d1\u73b0\u65b0\u7248\u672c",
  updateAvailableVersion: "\u7248\u672c {version}",
  updateChecking: "\u6b63\u5728\u68c0\u67e5\u66f4\u65b0\u2026",
  updateUpToDate: "MarkMark \u5df2\u662f\u6700\u65b0\u7248\u672c\u3002",
  updateDownload: "\u4e0b\u8f7d",
  updateDownloading: "\u6b63\u5728\u4e0b\u8f7d\u66f4\u65b0\u2026",
  updateDownloadComplete: "\u4e0b\u8f7d\u5b8c\u6210\uff0c\u70b9\u51fb\u300c\u5b89\u88c5\u300d\u7ee7\u7eed\u3002",
  updateInstall: "\u5b89\u88c5",
  updateInstallAndRestart: "\u5b89\u88c5\u5e76\u91cd\u542f",
  updateInstalling: "\u6b63\u5728\u5b89\u88c5\u66f4\u65b0\u2026",
  updateLater: "\u7a0d\u540e",
  updateSkipVersion: "\u8df3\u8fc7\u6b64\u7248\u672c",
  updateCancel: "\u53d6\u6d88",
  updateError: "\u68c0\u67e5\u66f4\u65b0\u5931\u8d25\u3002",
  updateModeAuto: "\u81ea\u52a8\u5b89\u88c5\u5e76\u91cd\u542f",
  updateModeManual: "\u9700\u624b\u52a8\u5b89\u88c5",
  updateInstallInstructionsTitle: "\u5b89\u88c5\u8bf4\u660e",
  updateManualInstallInstructions:
    "1. \u4e0b\u8f7d\u5b89\u88c5\u7a0b\u5e8f\u5e76\u53cc\u51fb\u6253\u5f00\n2. \u6309\u7167\u5b89\u88c5\u5411\u5bfc\u64cd\u4f5c\n3. \u9996\u6b21\u6253\u5f00\u65f6\uff0c\u60a8\u7684\u6740\u6bd2\u8f6f\u4ef6\u53ef\u80fd\u4f1a\u6807\u8bb0\u8be5\u5e94\u7528\uff1a\n   \u2022 \u5728\u6740\u6bd2\u8f6f\u4ef6\u8bbe\u7f6e\u4e2d\u5141\u8bb8\u8be5\u5e94\u7528\n   \u2022 \u6216\u53f3\u952e\u70b9\u51fb\u5e76\u9009\u62e9\u300c\u4ee5\u7ba1\u7406\u5458\u8eab\u4efd\u8fd0\u884c\u300d\n4. \u4e5f\u53ef\u4ee5\u5c06 MarkMark \u56fa\u5b9a\u5230\u4efb\u52a1\u680f\u4ee5\u4fbf\u5feb\u901f\u8bbf\u95ee",
  updateReleaseNotesTitle: "\u66f4\u65b0\u5185\u5bb9",
  checkForUpdates: "\u68c0\u67e5\u66f4\u65b0\u2026",
  findBarSearchPlaceholder: "\u641c\u7d22",
  findBarReplacePlaceholder: "\u66ff\u6362",
  findBarFindNext: "\u67e5\u627e\u4e0b\u4e00\u4e2a",
  findBarFindPrevious: "\u67e5\u627e\u4e0a\u4e00\u4e2a",
  findBarReplace: "\u66ff\u6362",
  findBarReplaceAll: "\u5168\u90e8\u66ff\u6362",
  findBarNoResults: "\u65e0\u7ed3\u679c",
  findBarCaseSensitive: "\u533a\u5206\u5927\u5c0f\u5199",
  findBarWholeWord: "\u5168\u8bcd\u5339\u914d",
  findBarRegularExpression: "\u4f7f\u7528\u6b63\u5219\u8868\u8fbe\u5f0f",
  findBarFind: "\u67e5\u627e",
  findBarFindAndReplace: "\u67e5\u627e\u548c\u66ff\u6362",
  exportPDF: "\u5bfc\u51fa PDF\u2026",
  titleBarExportPDF: "\u5bfc\u51fa PDF",
  exportPDFSuccess: "PDF \u5bfc\u51fa\u6210\u529f",
  exportPDFFailed: "PDF \u5bfc\u51fa\u5931\u8d25",
  unsupportedFileTypeAlert:
    "\u4e0d\u652f\u6301\u7684\u6587\u4ef6\u7c7b\u578b\uff08.{ext}\uff09\u3002\u4ec5\u652f\u6301\u6253\u5f00 Markdown \u6587\u4ef6\u3002",
};

const zhTW: Record<L10nKey, string> = {
  appName: "MarkMark",
  settingsMenuLabel: "\u8a2d\u5b9a\u2026",
  settingsBackToApp: "\u8fd4\u56de\u61c9\u7528",
  settingsTabGeneral: "\u4e00\u822c",
  settingsTabAppearance: "\u5916\u89c0",
  settingsGeneralLanguageTitle: "\u4ecb\u9762\u8a9e\u8a00",
  settingsGeneralLanguageDesc:
    "\u9078\u64c7\u61c9\u7528\u4ecb\u9762\u7684\u8a9e\u8a00\u3002\u300c\u81ea\u52d5\u5075\u6e2c\u300d\u6703\u8ddf\u96a8\u7cfb\u7d71\u3002",
  settingsGeneralDisplayTitle: "\u986f\u793a",
  settingsGeneralDisplayMode: "\u9810\u8a2d\u986f\u793a\u6a21\u5f0f",
  settingsGeneralRenderedWidthTitle: "\u6e32\u67d3\u5bec\u5ea6",
  settingsGeneralRenderedWidthDesc:
    "\u63a7\u5236\u6e32\u67d3\u5167\u5bb9\u7684\u6700\u5927\u5bec\u5ea6\u3002\u95dc\u9589\u6642\u4f7f\u7528\u56fa\u5b9a\u5bec\u5ea6\u3002",
  settingsGeneralMaxWidthFollowsWindow: "\u8ddf\u96a8\u8996\u7a97\u5bec\u5ea6",
  settingsGeneralStartupTitle: "\u555f\u52d5",
  settingsGeneralReopenLastLocation: "\u555f\u52d5\u6642\u91cd\u65b0\u958b\u555f\u4e0a\u6b21\u4f4d\u7f6e",
  settingsGeneralFileTreeTitle: "\u6a94\u6848\u6a39",
  settingsGeneralShowHiddenFiles: "\u986f\u793a\u96b1\u85cf\u6a94\u6848",
  settingsGeneralShowNonMarkdownFiles: "\u986f\u793a\u975e Markdown \u6a94\u6848",
  settingsGeneralDefaultOpenerTitle: "\u9810\u8a2d Markdown \u958b\u555f\u7a0b\u5f0f",
  settingsGeneralDefaultOpenerDesc:
    "\u5c07 MarkMark \u8a2d\u70ba .md\u3001.markdown\u3001.mdown\u3001.mkd \u6a94\u6848\u7684\u9810\u8a2d\u958b\u555f\u7a0b\u5f0f\u3002",
  settingsGeneralSetAsDefault: "\u8a2d\u70ba\u9810\u8a2d",
  settingsGeneralIsDefault: "MarkMark \u5df2\u662f\u9810\u8a2d Markdown \u958b\u555f\u7a0b\u5f0f",
  settingsGeneralSetDefaultFailed: "\u8a2d\u5b9a\u9810\u8a2d\u958b\u555f\u7a0b\u5f0f\u5931\u6557\uff0c\u8acb\u91cd\u8a66\u3002",
  settingsGeneralCommandLineTitle: "\u547d\u4ee4\u5217\u5de5\u5177",
  settingsGeneralCommandLineDesc:
    "\u5b89\u88dd mdr \u547d\u4ee4\uff0c\u53ef\u5728\u7d42\u7aef\u6a5f\u4e2d\u958b\u555f\u6a94\u6848\u3002\u4f8b\u5982\uff1amdr README.md",
  settingsGeneralCommandLineInstalled: "mdr \u547d\u4ee4\u5df2\u5728\u7d42\u7aef\u6a5f\u4e2d\u53ef\u7528",
  settingsGeneralCommandLineInstallFailed: "\u5b89\u88dd\u547d\u4ee4\u5217\u5de5\u5177\u5931\u6557\uff0c\u8acb\u91cd\u8a66\u3002",
  settingsGeneralCommandLineUninstallFailed:
    "\u89e3\u9664\u5b89\u88dd\u547d\u4ee4\u5217\u5de5\u5177\u5931\u6557\uff0c\u8acb\u91cd\u8a66\u3002",
  settingsGeneralQuickLookTitle: "Quick Look \u9810\u89bd",
  settingsGeneralQuickLookDesc:
    "\u5728 Finder \u4e2d\u6309\u7a7a\u767d\u9375\u9810\u89bd Markdown \u6a94\u6848\u7684\u6e32\u67d3\u6548\u679c\u3002",
  settingsGeneralQuickLookEnabled: "\u555f\u7528 Quick Look \u9810\u89bd",
  settingsAppearanceThemeTitle: "\u4e3b\u984c",
  settingsAppearanceThemeDesc: "\u9078\u64c7\u61c9\u7528\u7684\u5916\u89c0\u6a21\u5f0f\u3002",
  settingsAppearanceModeLight: "\u6dfa\u8272",
  settingsAppearanceModeLightDesc: "\u59cb\u7d42\u4f7f\u7528\u6dfa\u8272\u5916\u89c0",
  settingsAppearanceModeDark: "\u6df1\u8272",
  settingsAppearanceModeDarkDesc: "\u59cb\u7d42\u4f7f\u7528\u6df1\u8272\u5916\u89c0",
  settingsAppearanceModeSystem: "\u8ddf\u96a8\u7cfb\u7d71",
  settingsAppearanceModeSystemDesc: "\u8ddf\u96a8\u7cfb\u7d71\u8a2d\u5b9a",
  settingsAppearanceSchemeTitle: "\u914d\u8272\u65b9\u6848",
  settingsAppearanceSchemeDesc: "\u70ba\u76ee\u524d\u6a21\u5f0f\u9078\u64c7\u9810\u8a2d\u914d\u8272\u65b9\u6848\u3002",
  settingsAppearanceCustomTitle: "\u81ea\u8a02\u984f\u8272",
  settingsAppearanceCustomDesc:
    "\u81ea\u8a02\u5404\u984f\u8272\u4ee4\u724c\u3002\u4fee\u6539\u5c07\u8986\u84cb\u76ee\u524d\u65b9\u6848\u7684\u5c0d\u61c9\u984f\u8272\u3002",
  settingsAppearanceCustomSurface: "\u80cc\u666f\u8272",
  settingsAppearanceCustomInk: "\u6587\u5b57\u8272",
  settingsAppearanceCustomAccent: "\u5f37\u8abf\u8272",
  settingsAppearanceCustomSuccess: "\u6210\u529f\u8272",
  settingsAppearanceCustomDanger: "\u5371\u96aa\u8272",
  settingsAppearanceContrastTitle: "\u5c0d\u6bd4\u5ea6",
  settingsAppearanceContrastDesc: "\u8abf\u6574\u80cc\u666f\u8207\u524d\u666f\u5c64\u4e4b\u9593\u7684\u5c0d\u6bd4\u5ea6\u3002",
  settingsAppearanceContrastLow: "\u4f4e",
  settingsAppearanceContrastHigh: "\u9ad8",
  settingsAppearanceTypographyTitle: "\u5b57\u9ad4\u8207\u6392\u7248",
  settingsAppearanceSourceFontSize: "\u539f\u59cb\u78bc\u5b57\u865f",
  settingsAppearanceContentPadding: "\u5167\u5bb9\u908a\u8ddd",
  languageAuto: "\u81ea\u52d5\u5075\u6e2c",
  languageZhCN: "\u7b80\u4f53\u4e2d\u6587",
  languageZhTW: "\u7e41\u9ad4\u4e2d\u6587",
  languageEn: "English",
  displayModeRendered: "\u6e32\u67d3",
  displayModeRaw: "\u7de8\u8f2f",
  open: "\u958b\u555f",
  save: "\u5132\u5b58",
  reset: "\u91cd\u8a2d",
  confirm: "\u78ba\u8a8d",
  newFromClipboard: "\u5f9e\u526a\u8cbc\u7c3f\u65b0\u5efa\u6a19\u8a3b",
  clipboardScratchName: "\u526a\u8cbc\u7c3f\u6a19\u8a3b",
  unsavedChangesTitle: "\u672a\u5132\u5b58\u7684\u8b8a\u66f4",
  unsavedChangesMessage:
    "\u5982\u679c\u4e0d\u5132\u5b58\uff0c\u60a8\u7684\u8b8a\u66f4\u5c07\u6703\u907a\u5931\u3002\u95dc\u9589\u524d\u662f\u5426\u5132\u5b58\uff1f",
  unsavedSave: "\u5132\u5b58",
  unsavedDontSave: "\u4e0d\u5132\u5b58",
  unsavedCancel: "\u53d6\u6d88",
  fileDeletedTitle: "\u6a94\u6848\u5df2\u88ab\u522a\u9664",
  fileDeletedMessage:
    "\u6a94\u6848\u300c{name}\u300d\u5df2\u88ab\u5916\u90e8\u522a\u9664\uff0c\u60a8\u6709\u672a\u5132\u5b58\u7684\u8b8a\u66f4\u3002",
  fileDeletedSaveAs: "\u53e6\u5b58\u70ba\u2026",
  fileDeletedDiscard: "\u653e\u68c4\u8b8a\u66f4",
  fileModifiedExternallyTitle: "\u6a94\u6848\u5df2\u88ab\u5916\u90e8\u4fee\u6539",
  fileModifiedExternallyMessage:
    "\u6a94\u6848\u5df2\u88ab\u5176\u4ed6\u61c9\u7528\u4fee\u6539\uff0c\u91cd\u65b0\u8f09\u5165\u5c07\u6368\u68c4\u76ee\u524d\u672a\u5132\u5b58\u7684\u8b8a\u66f4\u3002",
  fileModifiedExternallyReload: "\u91cd\u65b0\u8f09\u5165",
  fileModifiedExternallyDontRemind: "\u4ee5\u5f8c\u4e0d\u518d\u63d0\u9192",
  openRecent: "\u958b\u555f\u6700\u8fd1\u4f7f\u7528",
  openRecentEmpty: "\u7121\u6700\u8fd1\u958b\u555f\u7684\u9805\u76ee",
  openRecentFiles: "\u6a94\u6848",
  openRecentFolders: "\u8cc7\u6599\u593e",
  clearRecentItems: "\u6e05\u9664\u9078\u55ae",
  titleBarToggleSidebar: "\u5207\u63db\u5074\u908a\u6b04",
  titleBarDisplayMode: "\u986f\u793a\u6a21\u5f0f",
  titleBarOpen: "\u958b\u555f",
  titleBarSave: "\u5132\u5b58",
  titleBarReload: "\u91cd\u65b0\u8f09\u5165",
  titleBarToggleOutline: "\u5207\u63db\u5927\u7db1",
  titleBarCopyPath: "\u8907\u88fd\u8def\u5f91",
  titleBarCopyForAI: "\u8907\u88fd\u6a19\u8a3b\u6587\u4ef6\u7d66 AI",
  titleBarCopyMenu: "\u8907\u88fd\uff1aCriticMarkup \u539f\u6587 \u6216 \u7d66 AI\uff08\u542b\u8aaa\u660e\uff09",
  copyForAIMenu: "\u8907\u88fd\u7d66 AI\uff08\u542b\u8aaa\u660e\uff09",
  copyCriticMenu: "\u8907\u88fd CriticMarkup",
  copyFragmentsMenu: "\u8907\u88fd\u672c\u6b21\u65b0\u589e\u7684\u6a19\u8a3b\u7247\u6bb5",
  copyPromptMenu: "\u8907\u88fd AI \u63d0\u793a\u8a5e",
  copiedToast: "\u5df2\u8907\u88fd",
  titleBarAnnotationActions: "\u5957\u7528\u6216\u653e\u68c4\u6240\u6709\u6a19\u8a3b",
  applyAnnotationsMenu: "\u5957\u7528\u6240\u6709\u6a19\u8a3b\u2026",
  applyAnnotationsConfirmTitle: "\u5957\u7528\u6240\u6709\u6a19\u8a3b\uff1f",
  applyAnnotationsConfirmMessage:
    "\u522a\u9664\u548c\u66ff\u63db\u5c07\u76f4\u63a5\u4fee\u6539\u6b63\u6587\uff0c\u9ad8\u4eae\u548c\u8a55\u8ad6\u5c07\u88ab\u79fb\u9664\u3002\u6b64\u64cd\u4f5c\u7121\u6cd5\u5fa9\u539f\u3002",
  discardAnnotationsMenu: "\u653e\u68c4\u6240\u6709\u6a19\u8a3b\u2026",
  discardAnnotationsConfirmTitle: "\u653e\u68c4\u6240\u6709\u6a19\u8a3b\uff1f",
  discardAnnotationsConfirmMessage:
    "\u5c07\u79fb\u9664\u6240\u6709 CriticMarkup \u6a19\u8a3b\u4e26\u6062\u5fa9\u539f\u6587\uff0c\u6b64\u64cd\u4f5c\u7121\u6cd5\u5fa9\u539f\u3002",
  editUndo: "\u5fa9\u539f",
  editRedo: "\u91cd\u505a",
  titleBarAnnotationPanel: "\u6a19\u8a3b\u6e05\u55ae",
  annotationGroupNew: "\u672c\u6b21\u65b0\u589e",
  annotationGroupHistory: "\u6b77\u53f2\u6a19\u8a3b",
  annotationSelectAll: "\u5168\u9078",
  annotationSelectNew: "\u53ea\u9078\u65b0\u589e",
  annotationCopySelected: "\u8907\u88fd\u6240\u9078\u7247\u6bb5",
  annotationStale: "\u5df2\u5931\u6548",
  annotationEmpty: "\u66ab\u7121\u6a19\u8a3b",
  aiPromptDefaultTemplate: `\u4e0b\u9762\u7684\u5167\u5bb9\u4e2d\u5305\u542b\u4f7f\u7528 CriticMarkup \u8a9e\u6cd5\u7684\u5be9\u95b1\u6a19\u8a3b\uff0c\u6a19\u8a18\u542b\u7fa9\u5982\u4e0b\uff1a
- {++ \u65b0\u589e\u5167\u5bb9 ++}        \u5efa\u8b70\u65b0\u589e
- {-- \u522a\u9664\u5167\u5bb9 --}        \u5efa\u8b70\u522a\u9664
- {~~ \u820a\u5167\u5bb9 ~> \u65b0\u5167\u5bb9 ~~} \u5efa\u8b70\u66ff\u63db\u70ba\u65b0\u5167\u5bb9
- {>> \u8a55\u8ad6 <<}            \u6211\u7684\u8a55\u8ad6/\u7591\u554f
- {== \u9ad8\u4eae\u5167\u5bb9 ==}        \u6211\u91cd\u9ede\u95dc\u6ce8\u7684\u90e8\u5206

---

{{MarkMark:content}}`,
  settingsAIPromptTitle: "AI \u63d0\u793a\u8a5e\u6a21\u677f",
  settingsAIPromptDescription:
    "\u300c\u8907\u88fd\u7d66 AI\u300d\u8207\u300c\u8907\u88fd AI \u63d0\u793a\u8a5e\u300d\u5171\u7528\u3002{{MarkMark:content}} \u70ba\u6b63\u6587\u63d2\u5165\u4f4d\u7f6e\u4f54\u4f4d\u7b26\u3002",
  settingsAIPromptReset: "\u6062\u5fa9\u9810\u8a2d",
  criticDelete: "\u522a\u9664",
  criticHighlight: "\u9ad8\u4eae",
  criticComment: "\u8a55\u8ad6",
  criticReplace: "\u66ff\u63db",
  criticConfirm: "\u5957\u7528",
  criticCancel: "\u53d6\u6d88",
  criticEdit: "\u7de8\u8f2f",
  criticCommentHint: "\u8f38\u5165\u8a55\u8ad6\u2026",
  criticReplaceHint: "\u66ff\u63db\u70ba\u2026",
  criticNotFound: "\u7121\u6cd5\u5728\u6e90\u78bc\u4e2d\u5b9a\u4f4d\u9078\u5340\uff08\u8a66\u8a66\u53ea\u9078\u4e0d\u8de8\u683c\u5f0f\u7684\u6587\u5b57\uff09",
  outlineTitle: "\u5927\u7db1",
  outlineEmpty: "\u66ab\u7121\u6a19\u984c",
  loading: "\u8f09\u5165\u4e2d...",
  emptyDirectoryMessage: "\u6b64\u76ee\u9304\u4e0b\u7121 Markdown \u6a94\u6848",
  sidebarSettings: "\u8a2d\u5b9a",
  sidebarSettingsButton: "\u8a2d\u5b9a",
  welcomeOpenFolder: "\u958b\u555f\u8cc7\u6599\u593e\u958b\u59cb\u95b1\u8b80",
  welcomePressCmdO: "\u6309 Ctrl+O \u6216\u9ede\u64ca\u5de5\u5177\u5217\u4e2d\u7684\u958b\u555f\u6309\u9215",
  selectFileHint: "\u9078\u64c7\u6a94\u6848\u4ee5\u9810\u89bd",
  welcomeDropHint: "\u6216\u62d6\u62fd\u6a94\u6848/\u8cc7\u6599\u593e\u5230\u6b64\u8655",
  contextMenuNewFile: "\u65b0\u589e\u6a94\u6848",
  contextMenuNewSubdirectory: "\u65b0\u589e\u5b50\u76ee\u9304",
  contextMenuRename: "\u91cd\u65b0\u547d\u540d",
  contextMenuMoveTo: "\u79fb\u52d5\u5230\u2026",
  contextMenuDelete: "\u79fb\u5230\u5783\u573e\u6876",
  contextMenuReload: "\u91cd\u65b0\u8f09\u5165",
  contextMenuCopyPath: "\u8907\u88fd\u8def\u5f91",
  renameTitle: "\u91cd\u65b0\u547d\u540d",
  renameMessage: "\u8f38\u5165\u300c{name}\u300d\u7684\u65b0\u540d\u7a31\uff1a",
  renameEmptyName: "\u540d\u7a31\u4e0d\u80fd\u70ba\u7a7a\u3002",
  renameNameExists: "\u5df2\u5b58\u5728\u540c\u540d\u9805\u76ee\u3002",
  deleteTitle: "\u79fb\u5230\u5783\u573e\u6876",
  deleteMessage: "\u78ba\u5b9a\u8981\u5c07\u300c{name}\u300d\u79fb\u5230\u5783\u573e\u6876\u55ce\uff1f",
  deleteDirectoryMessage:
    "\u78ba\u5b9a\u8981\u5c07\u300c{name}\u300d\u53ca\u5176\u6240\u6709\u5167\u5bb9\u79fb\u5230\u5783\u573e\u6876\u55ce\uff1f",
  moveSelectFolder: "\u9078\u64c7\u76ee\u6a19\u8cc7\u6599\u593e",
  updateAvailableTitle: "\u767c\u73fe\u65b0\u7248\u672c",
  updateAvailableVersion: "\u7248\u672c {version}",
  updateChecking: "\u6b63\u5728\u6aa2\u67e5\u66f4\u65b0\u2026",
  updateUpToDate: "MarkMark \u5df2\u662f\u6700\u65b0\u7248\u672c\u3002",
  updateDownload: "\u4e0b\u8f09",
  updateDownloading: "\u6b63\u5728\u4e0b\u8f09\u66f4\u65b0\u2026",
  updateDownloadComplete: "\u4e0b\u8f09\u5b8c\u6210\uff0c\u9ede\u64ca\u300c\u5b89\u88dd\u300d\u7e7c\u7e8c\u3002",
  updateInstall: "\u5b89\u88dd",
  updateInstallAndRestart: "\u5b89\u88dd\u4e26\u91cd\u65b0\u555f\u52d5",
  updateInstalling: "\u6b63\u5728\u5b89\u88dd\u66f4\u65b0\u2026",
  updateLater: "\u7a0d\u5f8c",
  updateSkipVersion: "\u8df3\u904e\u6b64\u7248\u672c",
  updateCancel: "\u53d6\u6d88",
  updateError: "\u6aa2\u67e5\u66f4\u65b0\u5931\u6557\u3002",
  updateModeAuto: "\u81ea\u52d5\u5b89\u88dd\u4e26\u91cd\u65b0\u555f\u52d5",
  updateModeManual: "\u9700\u624b\u52d5\u5b89\u88dd",
  updateInstallInstructionsTitle: "\u5b89\u88dd\u8aaa\u660e",
  updateManualInstallInstructions:
    "1. \u4e0b\u8f09\u5b89\u88dd\u7a0b\u5f0f\u4e26\u57f7\u884c\n2. \u6309\u7167\u5b89\u88dd\u5411\u5c0e\u64cd\u4f5c\n3. \u9996\u6b21\u958b\u555f\u6642\uff0c\u60a8\u7684\u6bba\u6bd2\u8edf\u9ad4\u53ef\u80fd\u6703\u6a19\u8a18\u8a72\u61c9\u7528\uff1a\n   \u2022 \u5728\u6bba\u6bd2\u8edf\u9ad4\u8a2d\u5b9a\u4e2d\u5141\u8a31\u8a72\u61c9\u7528\n   \u2022 \u6216\u53f3\u9375\u9ede\u64ca\u4e26\u9078\u64c7\u300c\u4ee5\u7ba1\u7406\u54e1\u8eab\u4efd\u57f7\u884c\u300d\n4. \u4e5f\u53ef\u4ee5\u5c07 MarkMark \u56fa\u5b9a\u5230\u5de5\u4f5c\u5217\u4ee5\u4fbf\u5feb\u901f\u5b58\u53d6",
  updateReleaseNotesTitle: "\u66f4\u65b0\u5167\u5bb9",
  checkForUpdates: "\u6aa2\u67e5\u66f4\u65b0\u2026",
  findBarSearchPlaceholder: "\u641c\u5c0b",
  findBarReplacePlaceholder: "\u53d6\u4ee3",
  findBarFindNext: "\u5c0b\u627e\u4e0b\u4e00\u500b",
  findBarFindPrevious: "\u5c0b\u627e\u4e0a\u4e00\u500b",
  findBarReplace: "\u53d6\u4ee3",
  findBarReplaceAll: "\u5168\u90e8\u53d6\u4ee3",
  findBarNoResults: "\u7121\u7d50\u679c",
  findBarCaseSensitive: "\u5340\u5206\u5927\u5c0f\u5beb",
  findBarWholeWord: "\u5168\u5b57\u5339\u914d",
  findBarRegularExpression: "\u4f7f\u7528\u898f\u5247\u8868\u9054\u5f0f",
  findBarFind: "\u5c0b\u627e",
  findBarFindAndReplace: "\u5c0b\u627e\u548c\u53d6\u4ee3",
  exportPDF: "\u532f\u51fa PDF\u2026",
  titleBarExportPDF: "\u532f\u51fa PDF",
  exportPDFSuccess: "PDF \u532f\u51fa\u6210\u529f",
  exportPDFFailed: "PDF \u532f\u51fa\u5931\u6557",
  unsupportedFileTypeAlert:
    "\u4e0d\u652f\u63f4\u7684\u6a94\u6848\u985e\u578b\uff08.{ext}\uff09\u3002\u50c5\u652f\u63f4\u958b\u555f Markdown \u6a94\u6848\u3002",
};

// ---------------------------------------------------------------------------
// Dictionaries by language
// ---------------------------------------------------------------------------

const dictionaries: Record<Language, Record<L10nKey, string>> = {
  en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
};

// ---------------------------------------------------------------------------
// Global language state
// ---------------------------------------------------------------------------

let currentLanguage: Language = "en";

/** Set the active language for subsequent `t()` calls. */
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

/** Get the currently active language. */
export function getLanguage(): Language {
  return currentLanguage;
}

/**
 * Detect the system language.
 * Uses `navigator.language` in browser environments, falls back to "en".
 */
export function detectLanguage(): Language {
  if (typeof navigator !== "undefined" && navigator.language) {
    const lang = navigator.language;
    if (lang.startsWith("zh")) {
      // Distinguish simplified vs traditional
      const lower = lang.toLowerCase();
      if (lower.includes("hant") || lower.includes("tw") || lower.includes("hk") || lower.includes("mo")) {
        return "zh-TW";
      }
      return "zh-CN";
    }
    if (lang.startsWith("en")) {
      return "en";
    }
  }
  return "en";
}

/**
 * Resolve a LanguagePref to an actual Language.
 * "auto" uses system detection; explicit values are returned as-is.
 */
export function resolveLanguage(pref: LanguagePref): Language {
  if (pref === "auto") return detectLanguage();
  return pref;
}

// ---------------------------------------------------------------------------
// Translation function
// ---------------------------------------------------------------------------

/**
 * Look up a translated string for the current language.
 *
 * @param key  The localization key.
 * @param args Optional interpolation values: `{ name: "foo" }` replaces `{name}`.
 */
export function t(key: L10nKey, args?: Record<string, string>): string {
  const dict = dictionaries[currentLanguage] ?? dictionaries.en;
  let result = dict[key] ?? dictionaries.en[key] ?? key;

  if (args) {
    for (const [k, v] of Object.entries(args)) {
      result = result.split(`{${k}}`).join(v);
    }
  }

  return result;
}

/**
 * Look up a translated string for a specific language (does not use global state).
 */
export function tr(key: L10nKey, lang: Language, args?: Record<string, string>): string {
  const dict = dictionaries[lang] ?? dictionaries.en;
  let result = dict[key] ?? dictionaries.en[key] ?? key;

  if (args) {
    for (const [k, v] of Object.entries(args)) {
      result = result.split(`{${k}}`).join(v);
    }
  }

  return result;
}
