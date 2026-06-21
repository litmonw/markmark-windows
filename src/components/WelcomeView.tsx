/**
 * Empty state when no file is open.
 * Shows app logo/title, open folder button, and keyboard shortcut hints.
 */
import { t } from "../services/localization";

interface WelcomeViewProps {
  onOpenFolder: () => void;
  onOpenFile: () => void;
}

export function WelcomeView({ onOpenFolder, onOpenFile }: WelcomeViewProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 40,
        userSelect: "none",
      }}
    >
      {/* App icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 16,
          background: "var(--accent-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4h18l8 8v20a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
          <polyline points="24,4 24,12 32,12" />
          <line x1="10" y1="18" x2="26" y2="18" />
          <line x1="10" y1="23" x2="22" y2="23" />
          <line x1="10" y1="28" x2="18" y2="28" />
        </svg>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "var(--ink)",
          margin: 0,
        }}
      >
        {t("appName")}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 15,
          color: "var(--fg-secondary)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {t("welcomeOpenFolder")}
      </p>

      {/* Shortcut hint */}
      <p
        style={{
          fontSize: 13,
          color: "var(--fg-muted)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {t("welcomePressCmdO")}
      </p>

      <p
        style={{
          fontSize: 13,
          color: "var(--fg-muted)",
          margin: 0,
        }}
      >
        {t("welcomeDropHint")}
      </p>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button
          onClick={onOpenFolder}
          style={{
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 500,
            border: "none",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.background = "var(--accent-hover)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.background = "var(--accent)")
          }
        >
          {t("open")}
        </button>
      </div>
    </div>
  );
}
