/**
 * Markdown renderer – ported from Swift MarkdownHTMLService.swift
 *
 * Uses markdown-it as the base parser with a preprocessing pipeline that
 * handles extended syntax (CriticMarkup, math, footnotes, highlight, etc.)
 * and adds data-line attributes to block elements for source mapping.
 */

import MarkdownIt from "markdown-it";
import * as criticMarkup from "./criticMarkup";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface RenderResult {
  html: string;
  headings: HeadingInfo[];
}

export interface HeadingInfo {
  id: string;
  level: number;
  title: string;
  lineNumber: number;
}

export interface BuildFullHTMLParams {
  content: string;
  themeCSS: string;
  contentPadding: number;
  maxContentWidthFollowsWindow?: boolean;
  isDark?: boolean;
}

// ---------------------------------------------------------------------------
// HTML escaping
// ---------------------------------------------------------------------------

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------------------------
// markdown-it instance with custom renderer rules (data-line attributes)
// ---------------------------------------------------------------------------

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false, // Disable smart quotes/smart punctuation to keep source fidelity
});

// Track heading counter for id generation and collect heading info
let headingCounter = 0;
let collectedHeadings: HeadingInfo[] = [];

/**
 * Override block-level renderer rules to inject data-line="N" attributes.
 * This enables the rendered view to scroll back to the source line.
 */
function installDataLineRules(mdInstance: MarkdownIt): void {
  // Save references to default renderers for tokens we override
  const defaultRules = mdInstance.renderer.rules;

  // Helper: extract source line from a token's map attribute
  function getLine(token: any): number | null {
    if (token.map && token.map.length >= 1) {
      return token.map[0] + 1; // markdown-it uses 0-based lines; we want 1-based
    }
    return null;
  }

  // Helper: render a token using the default rule or the built-in renderer
  function renderDefault(
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    self: any,
  ): string {
    // Use the built-in renderToken which takes (tokens, idx, options)
    return self.renderToken(tokens, idx, options);
  }

  // Override specific block-level tokens to add data-line
  const blockTokens = [
    "paragraph_open",
    "blockquote_open",
    "bullet_list_open",
    "ordered_list_open",
    "table_open",
  ];

  for (const tokenType of blockTokens) {
    mdInstance.renderer.rules[tokenType] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const line = getLine(token);
      if (line !== null) {
        token.attrSet("data-line", String(line));
      }
      return renderDefault(tokens, idx, options, env, self);
    };
  }

  // Horizontal rule
  mdInstance.renderer.rules.hr = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const line = getLine(token);
    if (line !== null) {
      token.attrSet("data-line", String(line));
    }
    return renderDefault(tokens, idx, options, env, self);
  };

  // Fenced code blocks: add data-line and language class
  mdInstance.renderer.rules.fence = (tokens, idx, options, _env, _self) => {
    const token = tokens[idx];
    const line = getLine(token);
    const info = token.info ? token.info.trim() : "";
    const langClass = info ? ` class="language-${htmlEscape(info)}"` : "";
    const lineAttr = line !== null ? ` data-line="${line}"` : "";
    const code = htmlEscape(token.content);
    return `<pre${lineAttr}><code${langClass}>${code}</code></pre>\n`;
  };

  // Headings: add id, data-line, and collect heading info
  mdInstance.renderer.rules.heading_open = (tokens, idx, options, _env, _self) => {
    const token = tokens[idx];
    const line = getLine(token);
    const level = parseInt(token.tag.slice(1), 10); // h1 -> 1, h2 -> 2, etc.
    headingCounter++;
    const id = `heading-${headingCounter}`;

    // Extract heading text from the inline token that follows
    const inlineToken = tokens[idx + 1];
    const title = inlineToken ? inlineToken.content : "";

    collectedHeadings.push({
      id,
      level,
      title,
      lineNumber: line ?? 0,
    });

    const lineAttr = line !== null ? ` data-line="${line}"` : "";
    return `<h${level} id="${id}"${lineAttr}>`;
  };

  mdInstance.renderer.rules.heading_close = (tokens, idx) => {
    const token = tokens[idx];
    const level = token.tag.slice(1);
    return `</h${level}>\n`;
  };

  // Task list items (checkbox) – simplified approach that manipulates the
  // inline content string rather than individual Token objects
  mdInstance.renderer.rules.list_item_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    // Check if the next inline token starts with a checkbox pattern
    if (idx + 1 < tokens.length && tokens[idx + 1].type === "inline") {
      const nextToken = tokens[idx + 1];
      const content = nextToken.content || "";
      const checkboxMatch = content.match(/^\[( |x)\]\s*/i);
      if (checkboxMatch) {
        const checked = checkboxMatch[1].toLowerCase() === "x";
        token.attrSet("class", "task-list-item");
        // Strip the checkbox text from the inline content
        nextToken.content = content.slice(checkboxMatch[0].length);
        // Also strip from children if present
        if (nextToken.children && nextToken.children.length > 0) {
          let consumed = 0;
          let startChild = 0;
          for (let c = 0; c < nextToken.children.length; c++) {
            if (consumed >= checkboxMatch[0].length) break;
            consumed += (nextToken.children[c].content || "").length;
            startChild = c + 1;
          }
          nextToken.children = nextToken.children.slice(startChild);
        }
        // Prepend a checkbox HTML token
        const checkboxHTML = `<input type="checkbox" disabled=""${checked ? ' checked=""' : ""} /> `;
        // We inject it as a raw html_inline child
        if (nextToken.children) {
          // Create a minimal Token-like object that markdown-it's renderer will output
          const htmlChild = new (mdInstance as any).Token("html_inline", "", 0);
          htmlChild.content = checkboxHTML;
          nextToken.children.unshift(htmlChild);
        }
      }
    }
    return renderDefault(tokens, idx, options, env, self);
  };
}

installDataLineRules(md);

// ---------------------------------------------------------------------------
// Preprocessing pipeline
// ---------------------------------------------------------------------------

/** Strip YAML front matter delimited by --- at the start of the document. */
function stripYAMLFrontMatter(content: string): string {
  const pattern = /^---\s*\n[\s\S]*?\n---\s*\n/;
  return content.replace(pattern, "");
}

/**
 * Protect fenced code blocks and inline code from subsequent regex transforms
 * by replacing them with null-delimited placeholders.
 */
function protectCodeRegions(content: string): { result: string; store: string[] } {
  const store: string[] = [];
  let result = content;

  // Fenced code blocks: ``` or ~~~
  const fencedPattern = /(^`{3,}|^~{3,})[^\n]*\n[\s\S]*?\1[ \t]*$/gm;
  let m: RegExpExecArray | null;
  const fencedMatches: Array<{ match: string; index: number }> = [];
  while ((m = fencedPattern.exec(result)) !== null) {
    fencedMatches.push({ match: m[0], index: m.index });
  }
  // Replace in reverse order to preserve offsets
  for (let i = fencedMatches.length - 1; i >= 0; i--) {
    const { match, index } = fencedMatches[i];
    const placeholder = `\u0000CODEBLOCK_${store.length}\u0000`;
    store.push(match);
    result = result.slice(0, index) + placeholder + result.slice(index + match.length);
  }

  // Inline code: `...` (and ``...`` etc.)
  const inlinePattern = /(?<!`)(`+)(?!`)([\s\S]*?)(?<!`)\1(?!`)/g;
  const inlineMatches: Array<{ match: string; index: number }> = [];
  while ((m = inlinePattern.exec(result)) !== null) {
    inlineMatches.push({ match: m[0], index: m.index });
  }
  for (let i = inlineMatches.length - 1; i >= 0; i--) {
    const { match, index } = inlineMatches[i];
    const placeholder = `\u0000CODEINLINE_${store.length}\u0000`;
    store.push(match);
    result = result.slice(0, index) + placeholder + result.slice(index + match.length);
  }

  return { result, store };
}

/** Restore code regions from placeholders. */
function restoreCodeRegions(content: string, store: string[]): string {
  let result = content;
  for (let i = 0; i < store.length; i++) {
    for (const prefix of ["CODEBLOCK_", "CODEINLINE_"]) {
      const placeholder = `\u0000${prefix}${i}\u0000`;
      result = result.split(placeholder).join(store[i]);
    }
  }
  return result;
}

/** Convert $$...$$ block math to ```math code blocks. */
function preprocessBlockMath(content: string): string {
  const pattern = /\$\$([\s\S]+?)\$\$/g;
  let result = content;
  const matches: Array<{ full: string; math: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(result)) !== null) {
    matches.push({ full: m[0], math: m[1].trim(), index: m.index });
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const { full, math, index } = matches[i];
    const replacement = "```math\n" + math + "\n```";
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }
  return result;
}

/** Convert $...$ inline math to <code class="language-math inline"> spans. */
function preprocessInlineMath(content: string): string {
  // Match $...$ but not $$ or \$
  const pattern = /(?<!\$)\$(?!\s)([\s\S]+?)(?<!\s)\$(?!\$)/g;
  let result = content;
  const matches: Array<{ full: string; math: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(result)) !== null) {
    matches.push({ full: m[0], math: m[1], index: m.index });
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const { full, math, index } = matches[i];
    const replacement = `<code class="language-math inline">${htmlEscape(math)}</code>`;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }
  return result;
}

/** Convert footnote syntax [^label] references and [^label]: definitions to HTML. */
function preprocessFootnotes(content: string): string {
  let result = content;
  const footnotes: Array<{ label: string; text: string }> = [];

  // 1. Extract footnote definitions [^label]: text and remove from content
  const defPattern = /^\[\^([^\]]+)\]:\s+(.+)$/gm;
  const defMatches: Array<{ full: string; label: string; text: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = defPattern.exec(result)) !== null) {
    defMatches.push({ full: m[0], label: m[1], text: m[2], index: m.index });
  }
  for (let i = defMatches.length - 1; i >= 0; i--) {
    const { full, label, text, index } = defMatches[i];
    footnotes.push({ label, text });
    result = result.slice(0, index) + result.slice(index + full.length);
  }

  if (footnotes.length === 0) return result;

  // 2. Replace inline footnote references [^label] with <sup> links
  const refPattern = /\[\^([^\]]+)\]/g;
  const refMatches: Array<{ full: string; label: string; index: number }> = [];
  while ((m = refPattern.exec(result)) !== null) {
    refMatches.push({ full: m[0], label: m[1], index: m.index });
  }
  for (let i = refMatches.length - 1; i >= 0; i--) {
    const { full, label, index } = refMatches[i];
    const escaped = htmlEscape(label);
    const replacement = `<sup class="footnote-ref" id="fnref-${escaped}"><a href="#fn-${escaped}">${escaped}</a></sup>`;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }

  // 3. Append footnote list at the end of the document
  result += "\n<section class=\"footnotes\">\n<ol>\n";
  for (const fn of footnotes) {
    const escapedLabel = htmlEscape(fn.label);
    const escapedText = htmlEscape(fn.text);
    result += `<li id="fn-${escapedLabel}"><p>${escapedText}&#160;<a href="#fnref-${escapedLabel}" class="footnote-backref">&#8617;</a></p></li>\n`;
  }
  result += "</ol>\n</section>\n";

  return result;
}

/** Convert ==text== highlight syntax to <mark> tags. */
function preprocessHighlight(content: string): string {
  const pattern = /==([^=]+)==/g;
  let result = content;
  const matches: Array<{ full: string; text: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(result)) !== null) {
    matches.push({ full: m[0], text: m[1], index: m.index });
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const { full, text, index } = matches[i];
    const replacement = `<mark>${htmlEscape(text)}</mark>`;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }
  return result;
}

/** Convert ^text^ superscript syntax to <sup> tags (single caret, not ^^). */
function preprocessSuperscript(content: string): string {
  const pattern = /(?<!\^)\^(?!\s)([^\s^]+?)(?<!\s)\^(?!\^)/g;
  let result = content;
  const matches: Array<{ full: string; text: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(result)) !== null) {
    matches.push({ full: m[0], text: m[1], index: m.index });
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const { full, text, index } = matches[i];
    const replacement = `<sup>${htmlEscape(text)}</sup>`;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }
  return result;
}

/** Convert ~text~ subscript syntax to <sub> tags (single tilde, not ~~). */
function preprocessSubscript(content: string): string {
  const pattern = /(?<!~)~(?!\s)([^\s~]+?)(?<!\s)~(?!~)/g;
  let result = content;
  const matches: Array<{ full: string; text: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(result)) !== null) {
    matches.push({ full: m[0], text: m[1], index: m.index });
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const { full, text, index } = matches[i];
    const replacement = `<sub>${htmlEscape(text)}</sub>`;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Full preprocessing pipeline
// ---------------------------------------------------------------------------

/**
 * Run the complete preprocessing pipeline on raw Markdown content.
 * Order matters – see MarkdownHTMLService.swift for the rationale.
 */
function preprocess(content: string): string {
  let result = stripYAMLFrontMatter(content);

  // Protect code regions so subsequent regexes don't touch code
  const { result: protectedResult, store } = protectCodeRegions(result);
  result = protectedResult;

  // CriticMarkup annotations -> styled HTML spans
  result = criticMarkup.renderToHTML(result);

  // Extended syntax preprocessing (order: multi-line first, then inline)
  result = preprocessBlockMath(result);
  result = preprocessInlineMath(result);
  result = preprocessFootnotes(result);
  result = preprocessHighlight(result);
  result = preprocessSuperscript(result);
  result = preprocessSubscript(result);

  // Restore code regions
  result = restoreCodeRegions(result, store);

  return result;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render Markdown content to HTML with source line mapping.
 *
 * The preprocessing pipeline handles:
 *   1. YAML front matter stripping
 *   2. Code region protection
 *   3. CriticMarkup -> HTML
 *   4. Block math ($$...$$)
 *   5. Inline math ($...$)
 *   6. Footnotes
 *   7. Highlight (==text==)
 *   8. Superscript (^text^)
 *   9. Subscript (~text~)
 *  10. Code region restoration
 *  11. markdown-it parsing with data-line attributes
 */
export function render(markdown: string): RenderResult {
  const preprocessed = preprocess(markdown);

  // Reset per-render state
  headingCounter = 0;
  collectedHeadings = [];

  const html = md.render(preprocessed);

  return {
    html,
    headings: collectedHeadings,
  };
}

/**
 * Build a complete HTML document wrapping the rendered Markdown content.
 * Uses `mr:///` placeholder URLs for CSS/JS resources that are resolved
 * at runtime (e.g., via a custom protocol handler or build-time replacement).
 */
export function buildFullHTML(params: BuildFullHTMLParams): string {
  const {
    content,
    themeCSS,
    contentPadding,
    maxContentWidthFollowsWindow = false,
    isDark = true,
  } = params;

  const renderResult = render(content);

  const maxWidth = maxContentWidthFollowsWindow ? "none" : "980px";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="mr:///css/markdown.css">
    <link rel="stylesheet" href="mr:///css/scroll.css">
    <link rel="stylesheet" href="mr:///css/katex.min.css">
    <style id="mr-theme-style">${themeCSS}</style>
    <style>
    :root { --content-padding: ${contentPadding}px; --content-max-width: ${maxWidth}; }
    </style>
</head>
<body>
    <div class="markdown-preview">
        <div id="mr-content">
            ${renderResult.html}
        </div>
    </div>
    <script src="mr:///js/mermaid.min.js"></script>
    <script src="mr:///js/katex.min.js"></script>
    <script src="mr:///js/prism-core.min.js"></script>
    <script src="mr:///js/prism-autoloader.min.js"></script>
    <script>
    Prism.plugins.autoloader.languages_path = 'mr:///js/';
    </script>
    <script src="mr:///js/markdown-reader.js" data-is-dark="${isDark}"></script>
</body>
</html>`;
}
