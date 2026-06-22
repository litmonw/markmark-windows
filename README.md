# MarkMark for Windows

> A quiet Windows Markdown reader — read, annotate, and hand your notes to an AI in one click.
>
> 一个安静的 Windows Markdown 阅读器 —— 边读边批注，一键把意见交给 AI。

![Windows 10+](https://img.shields.io/badge/Windows-10+-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

**English** · [简体中文](#简体中文)

---

## What is this

MarkMark for Windows is a native Markdown reader built with [Tauri v2](https://tauri.app/) + React. A clean layout with a file tree on the left and rendered view on the right — open and read instantly.

It is a port of the original macOS [MarkMark](https://github.com/easychen/markmark) to Windows, preserving the same focused reading experience while leveraging native Windows capabilities. On top of a classic reader, it adds a **review workflow**: while reading a Markdown document (especially AI-generated content), you can select text directly in the rendered page and annotate it — delete, replace, comment, highlight — then **copy the annotated document to an AI in one click** and let it revise accordingly. Read → annotate → hand to AI. A closed loop.

---

## ✨ Core feature: CriticMarkup review

- **Annotate as you read** — select any text in the rendered view; a floating toolbar offers four actions:
  - **Delete** `{--...--}`, **Highlight** `{==...==}`, **Comment** `{>>...<<}`, **Replace** `{~~old~>new~~}`
- **WYSIWYG annotation styling** — insertions in green, deletions in red strikethrough, comments as 💬 bubbles, highlights in an accent color, all visible at a glance while reading
- **Copy for AI in one click** — copies a "guiding prompt + the full text with CriticMarkup annotations"; paste it into any LLM to have it understand and revise
- **Clear all annotations in one click** — restores the document to its original text
- Annotations use standard [CriticMarkup](http://criticmarkup.com) syntax: plain text, portable, no lock-in

---

## Reader features

| Feature | Description |
|---------|-------------|
| WebView2 rendering engine | markdown-it 14 + WebView2, full GFM extended syntax |
| Mermaid diagrams | Flowcharts, sequence diagrams, Gantt charts, etc., rendered locally |
| Math formulas | KaTeX rendering of inline and block LaTeX |
| Code highlighting | Prism.js, 29 languages, one-click copy of code blocks |
| File tree | Recursive folder browsing with native Windows dialogs |
| Outline navigation | Auto-extracts heading hierarchy, click to jump |
| 33 themes | Curated writing themes with instant switching |
| Clipboard integration | Copy rendered HTML or raw Markdown to clipboard |
| Lightweight | ~5 MB NSIS installer, starts instantly, minimal resource usage |

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Open folder / file |
| `Ctrl+S` | Save file |
| `Ctrl+Shift+C` | Copy annotated document for AI |
| `Ctrl+F` | Find |

---

## Build & run

```bash
# Clone the repository
git clone https://github.com/litmonw/markmark-windows.git
cd markmark-windows

# Install dependencies
npm install

# Start dev server (frontend + Rust backend)
npm run tauri dev

# Build release installer
npm run tauri build
```

The NSIS installer will be output to `src-tauri/target/release/bundle/nsis/`.

### Requirements

- **Windows** 10 or later (WebView2 pre-installed)
- **Node.js** >= 18 (recommended: 24 LTS)
- **Rust** >= 1.70 (via [rustup](https://rustup.rs/))

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust (Tauri v2) |
| Frontend | React 18 + TypeScript 5 |
| Bundler | Vite 6 |
| State | Zustand 5 |
| Markdown | markdown-it 14 + KaTeX + Mermaid + Prism |
| Installer | NSIS |

---

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

---

## Acknowledgements

MarkMark for Windows is a port of [**easychen/markmark**](https://github.com/easychen/markmark) — an excellent, reading-focused native macOS Markdown reader. The Windows version rebuilds the core with Tauri v2 + React while preserving the same reading and annotation experience.

---

MIT License

<br>

---

<a name="简体中文"></a>

# 简体中文

> 一个安静的 Windows Markdown 阅读器 —— 边读边批注，一键把意见交给 AI。

[English](#markmark-for-windows) · **简体中文**

---

## 这是什么

MarkMark for Windows 是一个基于 [Tauri v2](https://tauri.app/) + React 构建的原生 Windows Markdown 阅读器。左侧目录树 + 右侧渲染视图，打开即用、秒开秒读。

它是 macOS 版 [MarkMark](https://github.com/easychen/markmark) 的 Windows 移植版，保留了同样专注的阅读体验。在经典阅读器的基础上，加入了一套**审阅工作流**：当你在读一份 Markdown（尤其是 AI 生成的内容）时，可以直接在渲染页面里选中文字做标注 —— 删除、替换、评论、高亮 —— 然后**一键复制带标注的文档交给 AI**，让它据此修订。读 → 批 → 交给 AI 改，闭环。

---

## ✨ 核心特性：CriticMarkup 审阅

- **边读边标注** — 在渲染视图里选中任意文字，浮动工具条提供四种操作：
  - **删除** `{--...--}`、**高亮** `{==...==}`、**评论** `{>>...<<}`、**替换** `{~~旧~>新~~}`
- **所见即所得的批注样式** — 新增绿色、删除红色删除线、评论 💬 气泡、高亮强调色，阅读时一目了然
- **一键复制给 AI** — 复制「引导提示词 + 带 CriticMarkup 标注的全文」，粘贴给任意大模型即可让它理解并修订
- **一键清除标注** — 把文档恢复为原文
- 标注采用标准 [CriticMarkup](http://criticmarkup.com) 语法，纯文本、可移植、不锁定

---

## 阅读器功能

| 功能 | 说明 |
|------|------|
| WebView2 渲染引擎 | markdown-it 14 + WebView2，完整 GFM 扩展语法 |
| Mermaid 图表 | 流程图、时序图、甘特图等本地渲染 |
| 数学公式 | KaTeX 渲染 LaTeX 行内和块级公式 |
| 代码高亮 | Prism.js，29 种语言语法高亮，代码块一键复制 |
| 目录树 | 递归浏览文件夹，原生 Windows 对话框 |
| 大纲导航 | 自动提取标题层级，点击跳转 |
| 33 套主题 | 精选写作主题，即时切换 |
| 剪贴板集成 | 复制渲染后的 HTML 或原始 Markdown |
| 轻量级 | ~5 MB NSIS 安装包，秒开，极低资源占用 |

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+O` | 打开目录 / 文件 |
| `Ctrl+S` | 保存文件 |
| `Ctrl+Shift+C` | 复制带标注文档给 AI |
| `Ctrl+F` | 查找 |

---

## 构建与运行

```bash
# 克隆仓库
git clone https://github.com/litmonw/markmark-windows.git
cd markmark-windows

# 安装依赖
npm install

# 启动开发服务器（前端 + Rust 后端）
npm run tauri dev

# 构建发布安装包
npm run tauri build
```

NSIS 安装包输出到 `src-tauri/target/release/bundle/nsis/`。

### 环境要求

- **Windows** 10 或更高版本（已预装 WebView2）
- **Node.js** >= 18（推荐 24 LTS）
- **Rust** >= 1.70（通过 [rustup](https://rustup.rs/) 安装）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Rust (Tauri v2) |
| 前端 | React 18 + TypeScript 5 |
| 打包 | Vite 6 |
| 状态管理 | Zustand 5 |
| Markdown | markdown-it 14 + KaTeX + Mermaid + Prism |
| 安装包 | NSIS |

---

## 致谢

MarkMark for Windows 移植自 [**easychen/markmark**](https://github.com/easychen/markmark) —— 一个优秀的、专注阅读的 macOS 原生 Markdown 阅读器。Windows 版使用 Tauri v2 + React 重写了核心，保留了相同的阅读和批注体验。

---

MIT License
