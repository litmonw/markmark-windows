/**
 * Theme manager – ported from Swift ThemeDefinition.swift and ThemeColors.swift
 *
 * Defines theme types, all 33 preset themes (20 dark + 13 light),
 * color derivation from 5 base colors to 12+ tokens, and CSS generation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeType = "light" | "dark";

export interface ThemeDefinition {
  id: string;
  name: string;
  type: ThemeType;
  surface: string; // Background color (hex)
  ink: string; // Text color (hex)
  accent: string; // Accent color (hex)
  success: string; // Success color (hex)
  danger: string; // Danger color (hex)
  contrast: number; // Contrast level 0-100

  // Typography (undefined = use markdown.css defaults)
  bodyFontFamily?: string;
  headingFontFamily?: string;
  codeFontFamily?: string;
  bodyFontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  borderRadius?: string;
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number; // 0-1
}

export interface ThemeColors {
  // Core colors
  surface: string;
  ink: string;
  accent: string;
  success: string;
  danger: string;

  // Derived background colors
  bgElevated: string;
  bgSubtle: string;
  bgMuted: string;

  // Derived text colors
  fgSecondary: string; // rgba
  fgMuted: string; // rgba

  // Derived accent colors
  accentHover: string;
  accentSoft: string; // rgba

  // Derived border colors
  border: string; // rgba
  borderSubtle: string; // rgba

  // Typography (CSS values, undefined = use markdown.css defaults)
  bodyFontFamily?: string;
  headingFontFamily?: string;
  codeFontFamily?: string;
  bodyFontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  borderRadius?: string;
}

export interface ThemeCustomOverrides {
  surface?: string;
  ink?: string;
  accent?: string;
  success?: string;
  danger?: string;
  contrast?: number;
  bodyFontFamily?: string;
  headingFontFamily?: string;
  codeFontFamily?: string;
  bodyFontSize?: string;
  lineHeight?: string;
  letterSpacing?: string;
  borderRadius?: string;
}

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

/** Parse a hex color string (#RGB, #RRGGBB) to RGB components. */
export function hexToRgb(hex: string): RGB {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

/** Convert RGB components to a hex color string (#rrggbb). */
export function rgbToHex(rgb: RGB): string {
  const r = Math.round(Math.max(0, Math.min(255, rgb.r)));
  const g = Math.round(Math.max(0, Math.min(255, rgb.g)));
  const b = Math.round(Math.max(0, Math.min(255, rgb.b)));
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

/**
 * Mix two colors: for each RGB channel, `a * (1 - fraction) + b * fraction`.
 * This is the core color blending operation, matching the Swift implementation.
 */
export function mixColor(a: string, b: string, fraction: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r * (1 - fraction) + cb.r * fraction,
    g: ca.g * (1 - fraction) + cb.g * fraction,
    b: ca.b * (1 - fraction) + cb.b * fraction,
  });
}

/** Make a color lighter by mixing it with white. */
export function lighter(color: string, amount: number): string {
  return mixColor(color, "#ffffff", amount);
}

/** Make a color darker by mixing it with black. */
export function darker(color: string, amount: number): string {
  return mixColor(color, "#000000", amount);
}

/** Create an rgba() CSS string from a hex color and an alpha value. */
function rgbaString(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

/** Perceived brightness (0-255). Higher = lighter. */
function perceivedBrightness(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Blend two hex colors for code syntax: `base * (1 - fraction) + other * fraction`. */
function blendColors(base: string, fraction: number, other: string): string {
  return mixColor(base, other, fraction);
}

// ---------------------------------------------------------------------------
// Theme derivation: 5 base colors → 12+ tokens
// ---------------------------------------------------------------------------

/**
 * Derive all color tokens from a ThemeDefinition.
 * The algorithm matches the Swift `ThemeColors.from()` implementation.
 */
export function deriveTokens(theme: ThemeDefinition): ThemeColors {
  const c = theme.contrast / 100;
  const isDark = theme.type === "dark";

  const surface = theme.surface;
  const ink = theme.ink;
  const accent = theme.accent;
  const success = theme.success;
  const danger = theme.danger;

  const bgElevated = isDark
    ? mixColor(surface, ink, 0.08 + c * 0.08)
    : mixColor(surface, ink, 0.16 + c * 0.12);

  const bgSubtle = isDark
    ? mixColor(surface, ink, 0.02 + c * 0.02)
    : mixColor(surface, ink, 0.08 + c * 0.08);

  const bgMuted = isDark
    ? mixColor(surface, ink, 0.04 + c * 0.03)
    : mixColor(surface, ink, 0.12 + c * 0.10);

  const fgSecondary = rgbaString(ink, 0.65 + c * 0.10);

  const fgMuted = isDark
    ? rgbaString(ink, 0.42 + c * 0.13)
    : rgbaString(ink, 0.45 + c * 0.10);

  const accentHover = isDark ? lighter(accent, 0.12) : darker(accent, 0.08);

  const accentSoft = isDark
    ? mixColor("#000000", accent, 0.20 + c * 0.08)
    : mixColor(surface, accent, 0.11 + c * 0.04);

  const border = rgbaString(ink, 0.06 + c * 0.04);
  const borderSubtle = rgbaString(ink, 0.04 + c * 0.02);

  return {
    surface,
    ink,
    accent,
    success,
    danger,
    bgElevated,
    bgSubtle,
    bgMuted,
    fgSecondary,
    fgMuted,
    accentHover,
    accentSoft,
    border,
    borderSubtle,
    bodyFontFamily: theme.bodyFontFamily,
    headingFontFamily: theme.headingFontFamily,
    codeFontFamily: theme.codeFontFamily,
    bodyFontSize: theme.bodyFontSize,
    lineHeight: theme.lineHeight,
    letterSpacing: theme.letterSpacing,
    borderRadius: theme.borderRadius,
  };
}

// ---------------------------------------------------------------------------
// Theme resolution: merge base + custom overrides
// ---------------------------------------------------------------------------

/** Merge a base theme with custom overrides to produce a resolved theme. */
export function resolveTheme(base: ThemeDefinition, custom: ThemeCustomOverrides): ThemeDefinition {
  return {
    id: base.id,
    name: base.name,
    type: base.type,
    surface: custom.surface ?? base.surface,
    ink: custom.ink ?? base.ink,
    accent: custom.accent ?? base.accent,
    success: custom.success ?? base.success,
    danger: custom.danger ?? base.danger,
    contrast: custom.contrast ?? base.contrast,
    bodyFontFamily: custom.bodyFontFamily ?? base.bodyFontFamily,
    headingFontFamily: custom.headingFontFamily ?? base.headingFontFamily,
    codeFontFamily: custom.codeFontFamily ?? base.codeFontFamily,
    bodyFontSize: custom.bodyFontSize ?? base.bodyFontSize,
    lineHeight: custom.lineHeight ?? base.lineHeight,
    letterSpacing: custom.letterSpacing ?? base.letterSpacing,
    borderRadius: custom.borderRadius ?? base.borderRadius,
  };
}

// ---------------------------------------------------------------------------
// CSS generation
// ---------------------------------------------------------------------------

/** Generate CSS `:root` custom properties from derived theme colors. */
export function cssCustomProperties(colors: ThemeColors): string {
  let css = `:root {
  --surface: ${colors.surface};
  --ink: ${colors.ink};
  --accent: ${colors.accent};
  --success: ${colors.success};
  --danger: ${colors.danger};
  --bg-elevated: ${colors.bgElevated};
  --bg-subtle: ${colors.bgSubtle};
  --bg-muted: ${colors.bgMuted};
  --fg-secondary: ${colors.fgSecondary};
  --fg-muted: ${colors.fgMuted};
  --accent-hover: ${colors.accentHover};
  --accent-soft: ${colors.accentSoft};
  --border: ${colors.border};
  --border-subtle: ${colors.borderSubtle};`;

  if (colors.bodyFontFamily) css += `\n  --font-body: ${colors.bodyFontFamily};`;
  if (colors.headingFontFamily) css += `\n  --font-heading: ${colors.headingFontFamily};`;
  if (colors.codeFontFamily) css += `\n  --font-code: ${colors.codeFontFamily};`;
  if (colors.bodyFontSize) css += `\n  --font-size-base: ${colors.bodyFontSize};`;
  if (colors.lineHeight) css += `\n  --line-height: ${colors.lineHeight};`;
  if (colors.letterSpacing) css += `\n  --letter-spacing: ${colors.letterSpacing};`;
  if (colors.borderRadius) css += `\n  --border-radius: ${colors.borderRadius};`;

  css += "\n}\n";
  return css;
}

/** Generate CSS for code block syntax highlighting, matching the theme's palette. */
export function codeHighlightCSS(colors: ThemeColors): string {
  const isDark = perceivedBrightness(colors.surface) < perceivedBrightness(colors.ink);

  const codeFg = isDark
    ? rgbaString(colors.ink, 0.85)
    : rgbaString(colors.ink, 0.88);

  const codeBg = isDark
    ? mixColor(colors.surface, colors.ink, 0.06)
    : mixColor(colors.surface, colors.ink, 0.04);

  const keyword = colors.accent;

  const string = isDark
    ? lighter(colors.success, 0.15)
    : blendColors(colors.success, 0.15, colors.ink);

  const number = blendColors(colors.accent, 0.25, colors.danger);

  const comment = colors.fgMuted;

  const functionName = blendColors(colors.accent, 0.4, colors.ink);

  const variable = blendColors(colors.ink, 0.15, colors.success);

  const className = colors.success;

  const tag = blendColors(colors.accent, 0.4, colors.success);

  const attr = blendColors(colors.accent, 0.3, colors.danger);

  const deleted = colors.danger;
  const inserted = colors.success;

  const builtin = blendColors(colors.accent, 0.3, colors.ink);

  return `pre { color: ${codeFg}; background: ${codeBg}; }
.token.keyword { color: ${keyword}; font-weight: 600; }
.token.string, .token.regex { color: ${string}; }
.token.number { color: ${number}; }
.token.comment, .token.block-comment, .token.doc-comment { color: ${comment}; font-style: italic; }
.token.function, .token.function-name { color: ${functionName}; }
.token.variable, .token.constant, .token.property { color: ${variable}; }
.token.class-name { color: ${className}; }
.token.tag { color: ${tag}; }
.token.attr-value, .token.attribute { color: ${attr}; }
.token.deleted { color: ${deleted}; }
.token.inserted { color: ${inserted}; }
.token.boolean { color: ${keyword}; font-weight: 600; }
.token.builtin { color: ${builtin}; }
.token.operator, .token.punctuation { color: ${codeFg}; }`;
}

// ---------------------------------------------------------------------------
// Preset themes (20 dark + 13 light)
// ---------------------------------------------------------------------------

export const darkThemes: ThemeDefinition[] = [
  {
    id: "buddy-dark",
    name: "Default Dark",
    type: "dark",
    surface: "#18181a",
    ink: "#e8e8e3",
    accent: "#339cff",
    success: "#40c977",
    danger: "#fa423e",
    contrast: 60,
  },
  {
    id: "codex-dark",
    name: "Codex Dark",
    type: "dark",
    surface: "#111111",
    ink: "#ffffff",
    accent: "#0169cc",
    success: "#40c977",
    danger: "#fa423e",
    contrast: 60,
  },
  {
    id: "dracula",
    name: "Dracula",
    type: "dark",
    surface: "#282a36",
    ink: "#f8f8f2",
    accent: "#ff79c6",
    success: "#50fa7b",
    danger: "#ff5555",
    contrast: 60,
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    type: "dark",
    surface: "#1e1e2e",
    ink: "#cdd6f4",
    accent: "#cba6f7",
    success: "#a6e3a1",
    danger: "#f38ba8",
    contrast: 58,
  },
  {
    id: "catppuccin-macchiato",
    name: "Catppuccin Macchiato",
    type: "dark",
    surface: "#181825",
    ink: "#cad3f8",
    accent: "#c7a4f5",
    success: "#a6da95",
    danger: "#ed8796",
    contrast: 58,
  },
  {
    id: "nord",
    name: "Nord",
    type: "dark",
    surface: "#2e3440",
    ink: "#d8dee9",
    accent: "#88c0d0",
    success: "#a3be8c",
    danger: "#bf616a",
    contrast: 55,
  },
  {
    id: "one-dark-pro",
    name: "One Dark Pro",
    type: "dark",
    surface: "#282c34",
    ink: "#abb2bf",
    accent: "#4d78cc",
    success: "#98c379",
    danger: "#e06c75",
    contrast: 60,
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    type: "dark",
    surface: "#1a1b26",
    ink: "#a9b1d6",
    accent: "#7aa2f7",
    success: "#9ece6a",
    danger: "#f7768e",
    contrast: 58,
  },
  {
    id: "gruvbox-dark",
    name: "Gruvbox Dark",
    type: "dark",
    surface: "#282828",
    ink: "#ebdbb2",
    accent: "#fe8019",
    success: "#b8bb26",
    danger: "#fb4934",
    contrast: 55,
  },
  {
    id: "kanagawa",
    name: "Kanagawa Wave",
    type: "dark",
    surface: "#1f1f28",
    ink: "#dcd7ba",
    accent: "#658594",
    success: "#76956a",
    danger: "#c34043",
    contrast: 55,
  },
  {
    id: "rose-pine",
    name: "Rose Pine",
    type: "dark",
    surface: "#191724",
    ink: "#e0def4",
    accent: "#ebbcba",
    success: "#31748f",
    danger: "#eb6f92",
    contrast: 58,
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    type: "dark",
    surface: "#0d1117",
    ink: "#e6edf3",
    accent: "#1f6feb",
    success: "#3fb950",
    danger: "#f85149",
    contrast: 50,
  },
  {
    id: "material-palenight",
    name: "Material Palenight",
    type: "dark",
    surface: "#292d3e",
    ink: "#eeffff",
    accent: "#80cbc4",
    success: "#c3e88d",
    danger: "#ff5370",
    contrast: 58,
  },
  {
    id: "ayu-dark",
    name: "Ayu Dark",
    type: "dark",
    surface: "#0b0e14",
    ink: "#bfbdb6",
    accent: "#e6b450",
    success: "#c2d94c",
    danger: "#f07178",
    contrast: 55,
  },
  {
    id: "vitesse-dark",
    name: "Vitesse Dark",
    type: "dark",
    surface: "#121212",
    ink: "#dbd7ca",
    accent: "#4d9375",
    success: "#80a665",
    danger: "#cb7676",
    contrast: 55,
  },
  // MPE themes
  {
    id: "mpe-atom-material",
    name: "Atom Material",
    type: "dark",
    surface: "#263238",
    ink: "#eeffff",
    accent: "#82aaff",
    success: "#c3e88d",
    danger: "#f07178",
    contrast: 55,
    bodyFontFamily: "'Helvetica Neue',Helvetica,'Segoe UI',Arial,freesans,sans-serif",
    codeFontFamily: "Menlo,Monaco,Consolas,'Courier New',monospace",
  },
  {
    id: "mpe-gothic",
    name: "Gothic",
    type: "dark",
    surface: "#0e0e0e",
    ink: "#c7c7c7",
    accent: "#fe5e3a",
    success: "#40c977",
    danger: "#b33b2e",
    contrast: 55,
    bodyFontFamily: "Raleway,sans-serif",
    lineHeight: "1.75rem",
  },
  {
    id: "mpe-monokai",
    name: "Monokai",
    type: "dark",
    surface: "#282828",
    ink: "#f8f8f2",
    accent: "#a6e22e",
    success: "#a6e22e",
    danger: "#f92672",
    contrast: 55,
    bodyFontFamily: "'Helvetica Neue',Helvetica,'Segoe UI',Arial,freesans,sans-serif",
    codeFontFamily: "Menlo,Monaco,Consolas,'Courier New',monospace",
  },
  {
    id: "mpe-night",
    name: "Night",
    type: "dark",
    surface: "#363b40",
    ink: "#b8bfc6",
    accent: "#e0e0e0",
    success: "#dedede",
    danger: "#fa423e",
    contrast: 55,
    bodyFontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif",
    headingFontFamily: "'Lucida Grande',Corbal,Georgia,serif",
    codeFontFamily: "Monaco,Consolas,'Andale Mono','DejaVu Sans Mono',monospace",
    letterSpacing: "-1.5px",
  },
  {
    id: "mpe-solarized-dark",
    name: "Solarized Dark (MPE)",
    type: "dark",
    surface: "#002b36",
    ink: "#839496",
    accent: "#268bd2",
    success: "#859900",
    danger: "#dc322f",
    contrast: 55,
    bodyFontFamily: "'Helvetica Neue',Helvetica,'Segoe UI',Arial,freesans,sans-serif",
    codeFontFamily: "Menlo,Monaco,Consolas,'Courier New',monospace",
  },
];

export const lightThemes: ThemeDefinition[] = [
  {
    id: "buddy-light",
    name: "Default Light",
    type: "light",
    surface: "#ffffff",
    ink: "#1c1c1a",
    accent: "#339cff",
    success: "#00a240",
    danger: "#ba2623",
    contrast: 45,
  },
  {
    id: "codex-light",
    name: "Codex Light",
    type: "light",
    surface: "#ffffff",
    ink: "#1a1c1f",
    accent: "#0169cc",
    success: "#00a240",
    danger: "#ba2623",
    contrast: 45,
  },
  {
    id: "catppuccin-latte",
    name: "Catppuccin Latte",
    type: "light",
    surface: "#eff1f5",
    ink: "#4c4f69",
    accent: "#8839ef",
    success: "#40a02b",
    danger: "#d20f39",
    contrast: 45,
  },
  {
    id: "github-light",
    name: "GitHub Light",
    type: "light",
    surface: "#ffffff",
    ink: "#1f2328",
    accent: "#0969da",
    success: "#1a7f37",
    danger: "#cf222e",
    contrast: 42,
  },
  {
    id: "gruvbox-light",
    name: "Gruvbox Light",
    type: "light",
    surface: "#fbf1c7",
    ink: "#3c3836",
    accent: "#af3a03",
    success: "#79740e",
    danger: "#9d0006",
    contrast: 45,
  },
  {
    id: "kanagawa-lotus",
    name: "Kanagawa Lotus",
    type: "light",
    surface: "#f2ecbc",
    ink: "#5c5144",
    accent: "#c47247",
    success: "#6f894e",
    danger: "#c34043",
    contrast: 45,
  },
  {
    id: "one-light",
    name: "One Light",
    type: "light",
    surface: "#fafafa",
    ink: "#383a42",
    accent: "#526fff",
    success: "#50a14f",
    danger: "#e45649",
    contrast: 45,
  },
  {
    id: "rose-pine-dawn",
    name: "Rose Pine Dawn",
    type: "light",
    surface: "#faf4ed",
    ink: "#575279",
    accent: "#d7827e",
    success: "#286983",
    danger: "#b4637a",
    contrast: 42,
  },
  // MPE themes
  {
    id: "mpe-atom-light",
    name: "Atom Light",
    type: "light",
    surface: "#ffffff",
    ink: "#555555",
    accent: "#0088cc",
    success: "#00a240",
    danger: "#ba2623",
    contrast: 42,
    bodyFontFamily: "'Helvetica Neue',Helvetica,'Segoe UI',Arial,freesans,sans-serif",
    codeFontFamily: "Menlo,Monaco,Consolas,'Courier New',monospace",
  },
  {
    id: "mpe-medium",
    name: "Medium",
    type: "light",
    surface: "#ffffff",
    ink: "#333333",
    accent: "#1a99da",
    success: "#00a240",
    danger: "#ba2623",
    contrast: 42,
    bodyFontFamily:
      "'San Francisco',Roboto,'Segoe UI','Helvetica Neue','Lucida Grande',sans-serif",
    codeFontFamily: "Consolas,Menlo,Monaco,monospace,serif",
    bodyFontSize: "18px",
    lineHeight: "1.555",
    letterSpacing: "-0.003em",
  },
  {
    id: "mpe-newsprint",
    name: "Newsprint",
    type: "light",
    surface: "#fbfbfb",
    ink: "#333333",
    accent: "#b05a3a",
    success: "#00a240",
    danger: "#ba2623",
    contrast: 42,
    bodyFontFamily: "'PT Serif','Times New Roman',Times",
    lineHeight: "1.5em",
  },
  {
    id: "mpe-solarized-light",
    name: "Solarized Light (MPE)",
    type: "light",
    surface: "#fdf6e3",
    ink: "#657b83",
    accent: "#268bd2",
    success: "#859900",
    danger: "#dc322f",
    contrast: 42,
    bodyFontFamily: "'Helvetica Neue',Helvetica,'Segoe UI',Arial,freesans,sans-serif",
    codeFontFamily: "Menlo,Monaco,Consolas,'Courier New',monospace",
  },
  {
    id: "mpe-vue",
    name: "Vue",
    type: "light",
    surface: "#ffffff",
    ink: "#304455",
    accent: "#42b983",
    success: "#42b983",
    danger: "#ba2623",
    contrast: 42,
    bodyFontFamily: "Source Sans Pro,Helvetica Neue,Arial,sans-serif",
    headingFontFamily: "Dosis,Source Sans Pro,Helvetica Neue,Arial,sans-serif",
    letterSpacing: "0",
  },
];

/** All 33 preset themes (20 dark + 13 light). */
export const allThemes: ThemeDefinition[] = [...darkThemes, ...lightThemes];

/** Look up a preset theme by its id. */
export function themeById(id: string): ThemeDefinition | undefined {
  return allThemes.find((t) => t.id === id);
}

/** Get all themes of a given type. */
export function themesByType(type: ThemeType): ThemeDefinition[] {
  return type === "dark" ? darkThemes : lightThemes;
}

/** Get the default theme for a given type. */
export function defaultTheme(type: ThemeType): ThemeDefinition {
  return type === "dark" ? darkThemes[0] : lightThemes[0];
}

/** Check if a ThemeCustomOverrides has any non-default values. */
export function hasCustomOverrides(overrides: ThemeCustomOverrides): boolean {
  return (
    overrides.surface !== undefined ||
    overrides.ink !== undefined ||
    overrides.accent !== undefined ||
    overrides.success !== undefined ||
    overrides.danger !== undefined ||
    overrides.contrast !== undefined ||
    overrides.bodyFontFamily !== undefined ||
    overrides.headingFontFamily !== undefined ||
    overrides.codeFontFamily !== undefined ||
    overrides.bodyFontSize !== undefined ||
    overrides.lineHeight !== undefined ||
    overrides.letterSpacing !== undefined ||
    overrides.borderRadius !== undefined
  );
}

/** Empty overrides object (no customization). */
export const emptyOverrides: ThemeCustomOverrides = {};
