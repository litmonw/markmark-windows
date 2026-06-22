# MarkMark for Windows

A lightweight, fast Markdown editor for Windows, built with [Tauri v2](https://tauri.app/) + React.

MarkMark is a port of the original macOS [MarkMark](https://github.com/) to Windows, preserving the same clean writing experience while leveraging native Windows capabilities.

## Features

- **Live Markdown Preview** — Real-time rendering via `markdown-it` with support for GFM, KaTeX math, Mermaid diagrams, and syntax highlighting (Prism)
- **CriticMarkup** — Native support for `{++additions++}`, `{--deletions--}`, `{~~substitutions~>replacements~~}`, `{==highlights==}`, and `{>>comments<<}`
- **33 Built-in Themes** — Switch between curated writing themes instantly
- **File System Native** — Open folders, browse directory trees, and save files with native dialogs
- **Clipboard Integration** — Copy rendered HTML or raw Markdown to clipboard
- **Lightweight** — ~5 MB installer, starts instantly, minimal resource usage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust (Tauri v2) |
| Frontend | React 18 + TypeScript 5 |
| Bundler | Vite 6 |
| State | Zustand 5 |
| Markdown | markdown-it 14 + KaTeX + Mermaid + Prism |
| Installer | NSIS |

## Prerequisites

- **Node.js** >= 18 (recommended: 24 LTS)
- **Rust** >= 1.70 (via [rustup](https://rustup.rs/))
- **WebView2** (pre-installed on Windows 10/11)

## Development

```bash
# Clone the repository
git clone https://github.com/litmonw/markmark-windows.git
cd markmark-windows

# Install dependencies
npm install

# Start dev server (frontend + Rust backend)
npm run tauri dev
```

## Build

```bash
# Build release installer
npm run tauri build
```

The NSIS installer will be output to `src-tauri/target/release/bundle/nsis/`.

## Project Structure

```
markmark-windows/
├── src/                    # React frontend
│   ├── App.tsx             # Main application component
│   ├── assets/             # CSS, fonts, JS libraries (KaTeX, Mermaid, Prism)
│   └── stores/             # Zustand state stores
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands/       # Tauri commands (fs, clipboard)
│   │   ├── lib.rs          # Library entry
│   │   └── main.rs         # Binary entry
│   ├── capabilities/       # Tauri permission configs
│   └── tauri.conf.json     # Tauri configuration
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## License

MIT
