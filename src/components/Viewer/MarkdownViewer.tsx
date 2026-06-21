/**
 * Main markdown rendering component.
 * Uses an iframe with srcdoc to render markdown with inlined CSS/JS assets.
 *
 * Communication protocol:
 *   - iframe -> parent: postMessage for scroll sync and critic actions
 *   - parent -> iframe: postMessage for scroll-to-line requests
 *
 * A webkit messageHandlers shim is injected so markdown-reader.js works
 * outside of WKWebView.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { render } from "../../services/markdownRenderer";
import { apply } from "../../services/criticMarkup";
import { useDocumentStore } from "../../stores/documentStore";
import { t } from "../../services/localization";
import type { HeadingInfo, IframeMessage } from "../../types";

// Import CSS/JS assets as raw strings via Vite's ?raw suffix
import markdownCSS from "../../assets/css/markdown.css?raw";
import scrollCSS from "../../assets/css/scroll.css?raw";
import katexCSS from "../../assets/css/katex.min.css?raw";
import mermaidJS from "../../assets/js/mermaid.min.js?raw";
import katexJS from "../../assets/js/katex.min.js?raw";
import prismCoreJS from "../../assets/js/prism-core.min.js?raw";
import prismAutoloaderJS from "../../assets/js/prism-autoloader.min.js?raw";
import markdownReaderJS from "../../assets/js/markdown-reader.js?raw";

// Common Prism language plugins (inlined to avoid autoloader network requests)
import prismBashJS from "../../assets/js/prism-bash.min.js?raw";
import prismCJS from "../../assets/js/prism-c.min.js?raw";
import prismCppJS from "../../assets/js/prism-cpp.min.js?raw";
import prismDartJS from "../../assets/js/prism-dart.min.js?raw";
import prismDockerJS from "../../assets/js/prism-docker.min.js?raw";
import prismGitJS from "../../assets/js/prism-git.min.js?raw";
import prismGoJS from "../../assets/js/prism-go.min.js?raw";
import prismGraphqlJS from "../../assets/js/prism-graphql.min.js?raw";
import prismHttpJS from "../../assets/js/prism-http.min.js?raw";
import prismIniJS from "../../assets/js/prism-ini.min.js?raw";
import prismJavaJS from "../../assets/js/prism-java.min.js?raw";
import prismJsonJS from "../../assets/js/prism-json.min.js?raw";
import prismJsxJS from "../../assets/js/prism-jsx.min.js?raw";
import prismKotlinJS from "../../assets/js/prism-kotlin.min.js?raw";
import prismMakefileJS from "../../assets/js/prism-makefile.min.js?raw";
import prismPhpJS from "../../assets/js/prism-php.min.js?raw";
import prismPlsqlJS from "../../assets/js/prism-plsql.min.js?raw";
import prismPowershellJS from "../../assets/js/prism-powershell.min.js?raw";
import prismPythonJS from "../../assets/js/prism-python.min.js?raw";
import prismRubyJS from "../../assets/js/prism-ruby.min.js?raw";
import prismRustJS from "../../assets/js/prism-rust.min.js?raw";
import prismScalaJS from "../../assets/js/prism-scala.min.js?raw";
import prismShellSessionJS from "../../assets/js/prism-shell-session.min.js?raw";
import prismSqlJS from "../../assets/js/prism-sql.min.js?raw";
import prismSwiftJS from "../../assets/js/prism-swift.min.js?raw";
import prismTomlJS from "../../assets/js/prism-toml.min.js?raw";
import prismTsxJS from "../../assets/js/prism-tsx.min.js?raw";
import prismTypescriptJS from "../../assets/js/prism-typescript.min.js?raw";
import prismYamlJS from "../../assets/js/prism-yaml.min.js?raw";

interface MarkdownViewerProps {
  content: string;
  themeCSS: string;
  contentPadding: number;
  isDark: boolean;
  scrollToLineRequest: { lineNumber: number; counter: number } | null;
  onContentChange: (newContent: string) => void;
  onHeadingsUpdate: (headings: HeadingInfo[]) => void;
}

// ---------------------------------------------------------------------------
// Webkit messageHandlers shim
// ---------------------------------------------------------------------------

/**
 * This script is injected BEFORE markdown-reader.js to provide a
 * window.webkit.messageHandlers shim that routes messages through
 * window.parent.postMessage() instead.
 */
const WEBKIT_SHIM = `
(function() {
  // Shim: make markdown-reader.js think it's running in WKWebView
  // but route messages through postMessage to the parent window
  if (!window.webkit) window.webkit = {};
  if (!window.webkit.messageHandlers) window.webkit.messageHandlers = {};

  window.webkit.messageHandlers.scrollSync = {
    postMessage: function(data) {
      window.parent.postMessage({ type: 'scrollSync', ...data }, '*');
    }
  };

  window.webkit.messageHandlers.criticAction = {
    postMessage: function(data) {
      window.parent.postMessage({ type: 'criticAction', ...data }, '*');
    }
  };
})();
`;

// ---------------------------------------------------------------------------
// Build the iframe postMessage listener script (runs inside iframe)
// ---------------------------------------------------------------------------

const PARENT_LISTENER = `
(function() {
  window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || !data.type) return;

    if (data.type === 'scrollToLine' && window.MR) {
      window.MR.scrollToLine(data.lineNumber);
    } else if (data.type === 'scrollToHeading' && window.MR) {
      window.MR.scrollToHeading(data.id);
    } else if (data.type === 'setCriticLabels' && window.MR) {
      window.MR.setCriticLabels(data.labels);
    }
  });
})();
`;

// ---------------------------------------------------------------------------
// Build the complete HTML document
// ---------------------------------------------------------------------------

function buildSrcDoc(
  renderedHTML: string,
  themeCSS: string,
  contentPadding: number,
  isDark: boolean
): string {
  const prismLanguages = [
    prismBashJS, prismCJS, prismCppJS,
    prismDartJS, prismDockerJS, prismGitJS, prismGoJS,
    prismGraphqlJS, prismHttpJS, prismIniJS, prismJavaJS,
    prismJsonJS, prismJsxJS, prismKotlinJS,
    prismMakefileJS, prismPhpJS, prismPlsqlJS, prismPowershellJS,
    prismPythonJS, prismRubyJS, prismRustJS, prismScalaJS,
    prismShellSessionJS, prismSqlJS, prismSwiftJS, prismTomlJS,
    prismTsxJS, prismTypescriptJS, prismYamlJS,
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* markdown.css */
    ${markdownCSS}
  </style>
  <style>
    /* scroll.css */
    ${scrollCSS}
  </style>
  <style>
    /* katex.min.css */
    ${katexCSS}
  </style>
  <style id="mr-theme-style">
    ${themeCSS}
  </style>
  <style>
    :root {
      --content-padding: ${contentPadding}px;
      --content-max-width: 980px;
    }
    /* CriticMarkup toolbar styling */
    #mr-critic-toolbar {
      position: fixed;
      z-index: 9999;
      display: none;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 4px;
      gap: 2px;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    #mr-critic-toolbar.visible {
      display: flex;
    }
    #mr-critic-toolbar.critic-input-mode {
      display: flex;
      flex-direction: column;
      padding: 8px;
      min-width: 240px;
    }
    #mr-critic-toolbar button {
      padding: 4px 10px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: var(--fg-secondary);
      cursor: pointer;
      font-size: 12px;
      white-space: nowrap;
    }
    #mr-critic-toolbar button:hover {
      background: var(--bg-muted);
      color: var(--ink);
    }
    #mr-critic-toolbar button.critic-primary {
      color: var(--accent);
      font-weight: 500;
    }
    #mr-critic-toolbar button.critic-danger {
      color: var(--danger);
    }
    #mr-critic-toolbar .critic-field {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--border);
      border-radius: 4px;
      background: var(--surface);
      color: var(--ink);
      font-size: 12px;
      outline: none;
      margin: 4px 0;
    }
    #mr-critic-toolbar .critic-field:focus {
      border-color: var(--accent);
    }
    #mr-critic-toolbar .critic-input-row {
      display: flex;
      gap: 4px;
      width: 100%;
    }
    #mr-critic-toolbar .critic-input-btns {
      display: flex;
      gap: 4px;
      width: 100%;
      justify-content: flex-end;
    }
    #mr-critic-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      padding: 8px 16px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--fg-secondary);
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none;
      z-index: 10000;
    }
    #mr-critic-toast.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    #mr-critic-popover {
      position: fixed;
      z-index: 9998;
      display: none;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    #mr-critic-popover.visible {
      display: block;
    }
    #mr-critic-popover.critic-input-mode {
      display: block;
    }
    #mr-critic-popover .critic-popover-text {
      font-size: 12px;
      color: var(--ink);
      margin-bottom: 6px;
      max-height: 120px;
      overflow-y: auto;
    }
    /* CSS Custom Highlight API for pending selection */
    ::highlight(critic-pending) {
      background-color: var(--accent-soft);
    }
  </style>
</head>
<body>
  <div class="markdown-preview">
    <div id="mr-content">
      ${renderedHTML}
    </div>
  </div>

  <!-- Webkit shim (BEFORE markdown-reader.js) -->
  <script>${WEBKIT_SHIM}</script>

  <!-- Parent message listener -->
  <script>${PARENT_LISTENER}</script>

  <!-- Mermaid -->
  <script>${mermaidJS}</script>

  <!-- KaTeX -->
  <script>${katexJS}</script>

  <!-- Prism -->
  <script>${prismCoreJS}</script>
  <script>${prismAutoloaderJS}</script>
  <script>
    // Disable autoloader network requests since we inline all languages
    if (typeof Prism !== 'undefined' && Prism.plugins && Prism.plugins.autoloader) {
      Prism.plugins.autoloader.languages_path = '';
    }
  </script>
  <script>${prismLanguages.join("\n")}</script>

  <!-- markdown-reader.js -->
  <script data-is-dark="${isDark}">${markdownReaderJS}</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// MarkdownViewer component
// ---------------------------------------------------------------------------

export function MarkdownViewer({
  content,
  themeCSS,
  contentPadding,
  isDark,
  scrollToLineRequest,
  onContentChange,
  onHeadingsUpdate,
}: MarkdownViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [srcdoc, setSrcdoc] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastContentRef = useRef(content);

  const { addSessionAnnotation } = useDocumentStore();

  // Render markdown to HTML (memoized by content)
  const renderResult = useMemo(() => {
    return render(content);
  }, [content]);

  // Build srcdoc (debounced to avoid excessive re-renders)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const html = buildSrcDoc(
        renderResult.html,
        themeCSS,
        contentPadding,
        isDark
      );
      setSrcdoc(html);
      lastContentRef.current = content;
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [renderResult.html, themeCSS, contentPadding, isDark]);

  // Report headings to parent
  useEffect(() => {
    if (renderResult.headings.length > 0) {
      onHeadingsUpdate(renderResult.headings);
    }
  }, [renderResult.headings, onHeadingsUpdate]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === "scrollSync") {
        // Update visible line and heading in document store
        const docStore = useDocumentStore.getState();
        if (data.line !== undefined) {
          docStore.setVisibleLineNumber(data.line);
        }
        if (data.heading) {
          docStore.setActiveHeadingLineNumber(data.heading.lineNumber);
        } else {
          docStore.setActiveHeadingLineNumber(null);
        }
      } else if (data.type === "criticAction") {
        // Apply CriticMarkup operation to the source
        const { op, text, line, payload } = data;
        const currentContent = useDocumentStore.getState().content;

        let operation;
        switch (op) {
          case "delete":
            operation = { kind: "delete" as const };
            break;
          case "highlight":
            operation = { kind: "highlight" as const };
            break;
          case "comment":
            operation = { kind: "comment" as const, text: payload || "" };
            break;
          case "replace":
            operation = { kind: "replace" as const, text: payload || "" };
            break;
          default:
            return;
        }

        const newContent = apply(operation, currentContent, text, line);
        if (newContent !== null) {
          onContentChange(newContent);
          addSessionAnnotation(text);
        } else {
          // Could not locate selection - flash error in iframe
          iframeRef.current?.contentWindow?.postMessage(
            { type: "criticError", message: t("criticNotFound") },
            "*"
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onContentChange, addSessionAnnotation]);

  // Forward scroll-to-line requests to the iframe
  useEffect(() => {
    if (scrollToLineRequest && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "scrollToLine", lineNumber: scrollToLineRequest.lineNumber },
        "*"
      );
    }
  }, [scrollToLineRequest]);

  // Send critic labels when language changes
  useEffect(() => {
    const labels = {
      delete: t("criticDelete"),
      highlight: t("criticHighlight"),
      comment: t("criticComment"),
      replace: t("criticReplace"),
      confirm: t("criticConfirm"),
      cancel: t("criticCancel"),
      edit: t("criticEdit"),
      notFound: t("criticNotFound"),
      commentHint: t("criticCommentHint"),
      replaceHint: t("criticReplaceHint"),
    };

    // Wait a bit for iframe to be ready
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "setCriticLabels", labels },
        "*"
      );
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcdoc}
      title="Markdown Preview"
      sandbox="allow-scripts allow-same-origin"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "var(--surface)",
      }}
    />
  );
}
