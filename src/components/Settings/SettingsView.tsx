/**
 * Settings panel component.
 * Provides theme picker, appearance mode toggle, language selector,
 * font size slider, contrast slider, and content padding slider.
 */
import { useCallback, useMemo } from "react";
import {
  allThemes,
  themeById,
  deriveTokens,
  darkThemes,
  lightThemes,
} from "../../services/themeManager";
import { t, setLanguage as setL10nLanguage, detectLanguage } from "../../services/localization";
import type { AppearanceMode } from "../../stores/appStore";
import type { ThemeDefinition } from "../../types";

interface SettingsViewProps {
  tab: "general" | "appearance";
  themeId: string;
  setThemeId: (id: string) => void;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  language: string;
  setLanguage: (lang: string) => void;
  fontSize: number;
  setFontSize: (px: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  contentPadding: number;
  setContentPadding: (px: number) => void;
}

// ---------------------------------------------------------------------------
// Reusable sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: "var(--ink)",
        margin: "24px 0 8px 0",
      }}
    >
      {children}
    </h3>
  );
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: "var(--fg-muted)",
        margin: "0 0 12px 0",
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid var(--border-subtle)",
        gap: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  labelLow,
  labelHigh,
  width,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  labelLow?: string;
  labelHigh?: string;
  width?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {labelLow && (
        <span style={{ fontSize: 11, color: "var(--fg-muted)", whiteSpace: "nowrap" }}>
          {labelLow}
        </span>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: width || 150,
          accentColor: "var(--accent)",
          cursor: "pointer",
        }}
      />
      {labelHigh && (
        <span style={{ fontSize: 11, color: "var(--fg-muted)", whiteSpace: "nowrap" }}>
          {labelHigh}
        </span>
      )}
      <span
        style={{
          fontSize: 11,
          color: "var(--fg-secondary)",
          minWidth: 28,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme card
// ---------------------------------------------------------------------------

function ThemeCard({
  theme,
  isSelected,
  onClick,
}: {
  theme: ThemeDefinition;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = useMemo(() => deriveTokens(theme), [theme]);

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: 8,
        border: isSelected ? "2px solid var(--accent)" : "2px solid var(--border-subtle)",
        borderRadius: 8,
        background: "transparent",
        cursor: "pointer",
        transition: "border-color 0.15s",
        minWidth: 0,
      }}
    >
      {/* Preview swatch */}
      <div
        style={{
          width: 56,
          height: 36,
          borderRadius: 4,
          background: colors.surface,
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simulated text lines */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            right: 6,
            height: 2,
            borderRadius: 1,
            background: colors.ink,
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 6,
            width: "60%",
            height: 2,
            borderRadius: 1,
            background: colors.ink,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 6,
            width: "45%",
            height: 2,
            borderRadius: 1,
            background: colors.accent,
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 6,
            width: "70%",
            height: 2,
            borderRadius: 1,
            background: colors.ink,
            opacity: 0.25,
          }}
        />
        {/* Color dots */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            display: "flex",
            gap: 2,
          }}
        >
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: colors.accent }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: colors.success }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: colors.danger }} />
        </div>
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: 10,
          color: isSelected ? "var(--accent)" : "var(--fg-secondary)",
          fontWeight: isSelected ? 600 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 64,
        }}
      >
        {theme.name}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// General settings
// ---------------------------------------------------------------------------

function GeneralSettings({
  language,
  setLanguage,
}: {
  language: string;
  setLanguage: (lang: string) => void;
}) {
  const langOptions: Array<{ value: string; label: string }> = [
    { value: "auto", label: t("languageAuto") },
    { value: "en", label: t("languageEn") },
    { value: "zh-CN", label: t("languageZhCN") },
    { value: "zh-TW", label: t("languageZhTW") },
  ];

  return (
    <div>
      <SectionTitle>{t("settingsGeneralLanguageTitle")}</SectionTitle>
      <SectionDescription>{t("settingsGeneralLanguageDesc")}</SectionDescription>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {langOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setLanguage(opt.value)}
            style={{
              padding: "6px 14px",
              border:
                language === opt.value
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
              borderRadius: 6,
              background: language === opt.value ? "var(--accent-soft)" : "transparent",
              color: language === opt.value ? "var(--accent)" : "var(--fg-secondary)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: language === opt.value ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appearance settings
// ---------------------------------------------------------------------------

function AppearanceSettings({
  themeId,
  setThemeId,
  appearanceMode,
  setAppearanceMode,
  fontSize,
  setFontSize,
  contrast,
  setContrast,
  contentPadding,
  setContentPadding,
}: {
  themeId: string;
  setThemeId: (id: string) => void;
  appearanceMode: AppearanceMode;
  setAppearanceMode: (mode: AppearanceMode) => void;
  fontSize: number;
  setFontSize: (px: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  contentPadding: number;
  setContentPadding: (px: number) => void;
}) {
  const currentTheme = themeById(themeId);
  const isDarkTheme = currentTheme ? currentTheme.type === "dark" : true;

  const filteredThemes = useMemo(() => {
    if (appearanceMode === "dark") return darkThemes;
    if (appearanceMode === "light") return lightThemes;
    // "system" - show all
    return allThemes;
  }, [appearanceMode]);

  return (
    <div>
      {/* Appearance mode */}
      <SectionTitle>{t("settingsAppearanceThemeTitle")}</SectionTitle>
      <SectionDescription>{t("settingsAppearanceThemeDesc")}</SectionDescription>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["light", "dark", "system"] as AppearanceMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setAppearanceMode(mode);
              // Auto-switch to a matching theme
              if (mode === "light" && isDarkTheme) {
                setThemeId("buddy-light");
              } else if (mode === "dark" && !isDarkTheme) {
                setThemeId("buddy-dark");
              }
            }}
            style={{
              padding: "8px 16px",
              border:
                appearanceMode === mode
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
              borderRadius: 6,
              background: appearanceMode === mode ? "var(--accent-soft)" : "transparent",
              color: appearanceMode === mode ? "var(--accent)" : "var(--fg-secondary)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: appearanceMode === mode ? 600 : 400,
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {mode === "light" && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="3" />
                <line x1="7" y1="1" x2="7" y2="3" />
                <line x1="7" y1="11" x2="7" y2="13" />
                <line x1="1" y1="7" x2="3" y2="7" />
                <line x1="11" y1="7" x2="13" y2="7" />
              </svg>
            )}
            {mode === "dark" && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8A5.5 5.5 0 016 2a5.5 5.5 0 106 6z" />
              </svg>
            )}
            {mode === "system" && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="2" width="12" height="8" rx="1" />
                <line x1="4" y1="12" x2="10" y2="12" />
              </svg>
            )}
            {mode === "light" ? t("settingsAppearanceModeLight") : mode === "dark" ? t("settingsAppearanceModeDark") : t("settingsAppearanceModeSystem")}
          </button>
        ))}
      </div>

      {/* Color scheme grid */}
      <SectionTitle>{t("settingsAppearanceSchemeTitle")}</SectionTitle>
      <SectionDescription>{t("settingsAppearanceSchemeDesc")}</SectionDescription>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {filteredThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={theme.id === themeId}
            onClick={() => setThemeId(theme.id)}
          />
        ))}
      </div>

      {/* Contrast slider */}
      <SectionTitle>{t("settingsAppearanceContrastTitle")}</SectionTitle>
      <SectionDescription>{t("settingsAppearanceContrastDesc")}</SectionDescription>
      <Slider
        value={contrast}
        min={0}
        max={100}
        step={1}
        onChange={setContrast}
        labelLow={t("settingsAppearanceContrastLow")}
        labelHigh={t("settingsAppearanceContrastHigh")}
        width={200}
      />

      {/* Typography */}
      <SectionTitle>{t("settingsAppearanceTypographyTitle")}</SectionTitle>

      <SettingRow label={t("settingsAppearanceSourceFontSize")}>
        <Slider value={fontSize} min={10} max={28} step={1} onChange={setFontSize} width={120} />
      </SettingRow>

      <SettingRow label={t("settingsAppearanceContentPadding")}>
        <Slider
          value={contentPadding}
          min={8}
          max={80}
          step={2}
          onChange={setContentPadding}
          width={120}
        />
      </SettingRow>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SettingsView
// ---------------------------------------------------------------------------

export function SettingsView({
  tab,
  themeId,
  setThemeId,
  appearanceMode,
  setAppearanceMode,
  language,
  setLanguage,
  fontSize,
  setFontSize,
  contrast,
  setContrast,
  contentPadding,
  setContentPadding,
}: SettingsViewProps) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "32px 40px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {tab === "general" ? (
          <GeneralSettings language={language} setLanguage={setLanguage} />
        ) : (
          <AppearanceSettings
            themeId={themeId}
            setThemeId={setThemeId}
            appearanceMode={appearanceMode}
            setAppearanceMode={setAppearanceMode}
            fontSize={fontSize}
            setFontSize={setFontSize}
            contrast={contrast}
            setContrast={setContrast}
            contentPadding={contentPadding}
            setContentPadding={setContentPadding}
          />
        )}
      </div>
    </div>
  );
}
