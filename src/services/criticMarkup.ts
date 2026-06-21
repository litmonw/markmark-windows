/**
 * CriticMarkup service – ported from Swift CriticMarkup.swift
 *
 * Supports review annotations in Markdown source:
 *   Addition:     {++ text ++}
 *   Deletion:     {-- text --}
 *   Substitution: {~~ old ~> new ~~}
 *   Comment:      {>> text <<}
 *   Highlight:    {== text ==}
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Operation =
  | { kind: "delete" }
  | { kind: "highlight" }
  | { kind: "comment"; text: string }
  | { kind: "replace"; text: string }
  | { kind: "insert"; text: string };

export type AnnotationKind =
  | "addition"
  | "deletion"
  | "substitution"
  | "highlight"
  | "comment";

export interface Annotation {
  kind: AnnotationKind;
  /** Main text (highlighted/deleted/added content, or the old text of a substitution, or the comment body) */
  text: string;
  /** Replacement text for substitution, or the comment text attached to a highlight */
  payload: string | null;
  /** 1-based line number where the annotation starts */
  line: number;
  /** Start offset (inclusive) in the source string */
  start: number;
  /** End offset (exclusive) in the source string */
  end: number;
}

export interface Fragment {
  /** Closest preceding ATX heading (e.g. "## Chapter 3"), or null */
  heading: string | null;
  /** Fragment text (including CriticMarkup marks; truncated edges get ellipsis) */
  text: string;
  /** Byte offset of the fragment start in the source (for ordering) */
  position: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default AI prompt template.  `{{MarkMark:content}}` is replaced with the document. */
export const defaultAIPrompt = `The content below contains review annotations in CriticMarkup syntax:
- {++ addition ++}        suggested addition
- {-- deletion --}        suggested removal
- {~~ old ~> new ~~}      suggested replacement
- {>> comment <<}         my comment/question
- {== highlight ==}       part I want to focus on

---

{{MarkMark:content}}`;

/** Placeholder token used inside prompt templates. */
export const contentPlaceholder = "{{MarkMark:content}}";

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

const RE_ADDITION = /\{\+\+([\s\S]*?)\+\+\}/g;
const RE_DELETION = /\{--([\s\S]*?)--\}/g;
const RE_SUBSTITUTION = /\{~~([\s\S]*?)~>([\s\S]*?)~~\}/g;
const RE_HIGHLIGHT = /\{==([\s\S]*?)==\}/g;
const RE_COMMENT = /\{>>([\s\S]*?)<<\}/g;

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Escape a string for safe inclusion in an HTML attribute value. */
function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Global regex replace helper. */
function regexReplace(text: string, pattern: RegExp, replacement: string): string {
  // Reset lastIndex in case the regex is reused
  pattern.lastIndex = 0;
  return text.replace(pattern, replacement);
}

/** Return the 1-based line number for the character at `offset` in `source`. */
function lineNumberAt(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") line++;
  }
  return line;
}

/** Collapse consecutive blank lines to a single newline and trim whitespace. */
export function collapseBlankLines(s: string): string {
  const collapsed = s.replace(/[ \t]*\r?\n(?:[ \t]*\r?\n)+/g, "\n");
  return collapsed.trim();
}

// ---------------------------------------------------------------------------
// Locating selected text in source (two-level: exact + tolerant)
// ---------------------------------------------------------------------------

interface MatchRange {
  start: number;
  end: number;
}

/** Find all non-overlapping exact occurrences of `needle` in `source`. */
function exactRanges(needle: string, source: string): MatchRange[] {
  const ranges: MatchRange[] = [];
  let searchStart = 0;
  while (searchStart < source.length) {
    const idx = source.indexOf(needle, searchStart);
    if (idx === -1) break;
    ranges.push({ start: idx, end: idx + needle.length });
    searchStart = idx + needle.length || idx + 1;
  }
  return ranges;
}

/**
 * Tolerant search: non-whitespace characters of `selectedText` are matched
 * in order with up to 8 noise characters (whitespace / markdown symbols) between them.
 */
function tolerantRanges(selectedText: string, source: string): MatchRange[] {
  const tokens = selectedText.replace(/\s/g, "");
  if (tokens.length < 2 || tokens.length > 200) return [];

  const separator = "[\\s*_~`\\\\]{0,8}";
  const escaped = Array.from(tokens)
    .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(separator);

  let regex: RegExp;
  try {
    regex = new RegExp(escaped, "g");
  } catch {
    return [];
  }

  const ranges: MatchRange[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(source)) !== null) {
    ranges.push({ start: m.index, end: m.index + m[0].length });
    if (m[0].length === 0) regex.lastIndex++;
  }
  return ranges;
}

/** Among candidate ranges, pick the one whose start line is closest to `nearLine` (1-based). */
function nearestRange(ranges: MatchRange[], source: string, nearLine: number): MatchRange | null {
  if (ranges.length === 0) return null;
  let best = ranges[0];
  let bestDistance = Infinity;
  for (const r of ranges) {
    const line = lineNumberAt(source, r.start);
    const distance = Math.abs(line - nearLine);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = r;
    }
  }
  return best;
}

/**
 * Locate `selectedText` in `source`, preferring the occurrence closest to
 * `nearLine` (1-based).  Returns null when the selection is empty or not found.
 *
 * Two-level strategy:
 *  1. Exact match – works when the rendered text is a substring of the source.
 *  2. Tolerant match – allows markdown noise characters between non-whitespace chars.
 */
export function locateRange(
  source: string,
  selectedText: string,
  nearLine: number,
): MatchRange | null {
  if (!selectedText) return null;

  const exact = nearestRange(exactRanges(selectedText, source), source, nearLine);
  if (exact) return exact;

  return nearestRange(tolerantRanges(selectedText, source), source, nearLine);
}

// ---------------------------------------------------------------------------
// Apply an operation
// ---------------------------------------------------------------------------

function replacementFor(op: Operation, selected: string): string {
  switch (op.kind) {
    case "delete":
      return `{--${selected}--}`;
    case "highlight":
      return `{==${selected}==}`;
    case "comment":
      return `{==${selected}==}{>>${collapseBlankLines(op.text)}<<}`;
    case "replace":
      return `{~~${selected}~>${op.text}~~}`;
    case "insert":
      return `${selected}{++${op.text}++}`;
  }
}

/**
 * Apply a CriticMarkup operation to `source` at the location of `selectedText`
 * closest to `nearLine`.  Returns the modified source, or null if the selection
 * could not be located.
 */
export function apply(
  op: Operation,
  source: string,
  selectedText: string,
  nearLine: number,
): string | null {
  const range = locateRange(source, selectedText, nearLine);
  if (!range) return null;
  const selected = source.slice(range.start, range.end);
  return (
    source.slice(0, range.start) +
    replacementFor(op, selected) +
    source.slice(range.end)
  );
}

// ---------------------------------------------------------------------------
// Edit / delete comments
// ---------------------------------------------------------------------------

/**
 * Edit an existing comment: locate `{>>oldComment<<}` nearest to `nearLine`
 * and replace its body with `newComment`.
 */
export function editComment(
  source: string,
  oldComment: string,
  newComment: string,
  nearLine: number,
): string | null {
  const marker = `{>>${oldComment}<<}`;
  const range = locateRange(source, marker, nearLine);
  if (!range) return null;
  return (
    source.slice(0, range.start) +
    `{>>${collapseBlankLines(newComment)}<<}` +
    source.slice(range.end)
  );
}

/**
 * Delete a comment: locate `{>>comment<<}` nearest to `nearLine` and remove it.
 * If the comment is immediately preceded by a paired `{==X==}` highlight
 * (as created when adding a comment), the highlight is also removed and the
 * original text `X` is restored.
 */
export function deleteComment(
  source: string,
  comment: string,
  nearLine: number,
): string | null {
  const marker = `{>>${comment}<<}`;
  const range = locateRange(source, marker, nearLine);
  if (!range) return null;

  const before = source.slice(0, range.start);
  const hlMatch = before.match(/\{==[\s\S]*?==\}$/);

  if (hlMatch) {
    const hlText = hlMatch[0];
    // Strip the {== and ==} delimiters (3 chars each)
    const inner = hlText.slice(3, -3);
    const hlStart = range.start - hlText.length;
    return source.slice(0, hlStart) + inner + source.slice(range.end);
  }

  return source.slice(0, range.start) + source.slice(range.end);
}

// ---------------------------------------------------------------------------
// Accept / reject / detect
// ---------------------------------------------------------------------------

/**
 * Accept all annotations:
 *   additions  -> keep inserted text
 *   deletions  -> remove deleted text
 *   substitutions -> keep new text
 *   highlights -> keep content
 *   comments   -> remove
 */
export function accepting(text: string): string {
  let s = text;
  s = regexReplace(s, RE_SUBSTITUTION, "$2");
  s = regexReplace(s, RE_ADDITION, "$1");
  s = regexReplace(s, RE_DELETION, "");
  s = regexReplace(s, RE_HIGHLIGHT, "$1");
  s = regexReplace(s, RE_COMMENT, "");
  return s;
}

/**
 * Reject all annotations (restore original):
 *   additions  -> remove
 *   deletions  -> keep deleted text
 *   substitutions -> keep old text
 *   highlights -> keep content
 *   comments   -> remove
 */
export function rejecting(text: string): string {
  let s = text;
  s = regexReplace(s, RE_SUBSTITUTION, "$1");
  s = regexReplace(s, RE_ADDITION, "");
  s = regexReplace(s, RE_DELETION, "$1");
  s = regexReplace(s, RE_HIGHLIGHT, "$1");
  s = regexReplace(s, RE_COMMENT, "");
  return s;
}

/** Returns true if `text` contains any CriticMarkup annotation. */
export function hasMarkup(text: string): boolean {
  const patterns = [
    /\{\+\+[\s\S]*?\+\+\}/,
    /\{--[\s\S]*?--\}/,
    /\{~~[\s\S]*?~~\}/,
    /\{==[\s\S]*?==\}/,
    /\{>>[\s\S]*?<<\}/,
  ];
  return patterns.some((p) => p.test(text));
}

// ---------------------------------------------------------------------------
// Parse annotations
// ---------------------------------------------------------------------------

interface RawMatch {
  kind: AnnotationKind;
  start: number;
  end: number;
  text: string;
  payload: string | null;
}

/**
 * Parse all CriticMarkup annotations in `source`, returned in document order.
 * Adjacent `{==X==}{>>C<<}` pairs are merged into a single `comment` annotation
 * with `text = X` and `payload = C`.
 */
export function parseAnnotations(source: string): Annotation[] {
  const patterns: Array<[AnnotationKind, RegExp]> = [
    ["substitution", /\{~~([\s\S]*?)~>([\s\S]*?)~~\}/g],
    ["addition", /\{\+\+([\s\S]*?)\+\+\}/g],
    ["deletion", /\{--([\s\S]*?)--\}/g],
    ["highlight", /\{==([\s\S]*?)==\}/g],
    ["comment", /\{>>([\s\S]*?)<<\}/g],
  ];

  const raws: RawMatch[] = [];

  for (const [kind, pattern] of patterns) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(source)) !== null) {
      const payload = kind === "substitution" && m[2] !== undefined ? m[2] : null;
      raws.push({
        kind,
        start: m.index,
        end: m.index + m[0].length,
        text: m[1],
        payload,
      });
      if (m[0].length === 0) pattern.lastIndex++;
    }
  }

  raws.sort((a, b) => a.start - b.start);

  const result: Annotation[] = [];
  let lastEnd = 0;
  let i = 0;

  while (i < raws.length) {
    const cur = raws[i];

    // Skip overlapping matches (e.g. comment syntax inside a deletion)
    if (cur.start < lastEnd) {
      i++;
      continue;
    }

    // Merge {==X==}{>>C<<} into a single comment annotation
    if (cur.kind === "highlight" && i + 1 < raws.length) {
      const next = raws[i + 1];
      if (next.kind === "comment" && next.start === cur.end) {
        const mergedEnd = next.end;
        result.push({
          kind: "comment",
          text: cur.text,
          payload: next.text,
          line: lineNumberAt(source, cur.start),
          start: cur.start,
          end: mergedEnd,
        });
        lastEnd = mergedEnd;
        i += 2;
        continue;
      }
    }

    result.push({
      kind: cur.kind,
      text: cur.text,
      payload: cur.payload,
      line: lineNumberAt(source, cur.start),
      start: cur.start,
      end: cur.end,
    });
    lastEnd = cur.end;
    i++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Render to HTML
// ---------------------------------------------------------------------------

/**
 * Convert CriticMarkup annotations in `text` to styled HTML spans.
 * Call this *before* Markdown parsing so that inner Markdown still renders.
 */
export function renderToHTML(text: string): string {
  let s = text;

  // Order matters: substitution first (contains ~>), then addition, deletion, highlight, comment
  s = regexReplace(
    s,
    RE_SUBSTITUTION,
    '<del class="critic critic-del">$1</del><ins class="critic critic-add">$2</ins>',
  );
  s = regexReplace(s, RE_ADDITION, '<ins class="critic critic-add">$1</ins>');
  s = regexReplace(s, RE_DELETION, '<del class="critic critic-del">$1</del>');
  s = regexReplace(s, RE_HIGHLIGHT, '<mark class="critic critic-mark">$1</mark>');
  s = renderComments(s);

  return s;
}

/** Replace comment markers with styled HTML spans (reverse order to preserve offsets). */
function renderComments(text: string): string {
  const pattern = /\{>>([\s\S]*?)<<\}/g;
  pattern.lastIndex = 0;

  const matches: Array<{ full: string; comment: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    matches.push({ full: m[0], comment: m[1], index: m.index });
    if (m[0].length === 0) pattern.lastIndex++;
  }

  // Replace in reverse order so offsets stay valid
  let result = text;
  for (let i = matches.length - 1; i >= 0; i--) {
    const { full, comment, index } = matches[i];
    const escaped = escapeAttr(comment);
    const replacement =
      `<span class="critic critic-comment" title="${escaped}" data-comment="${escaped}">\u{1F4AC}</span>`;
    result = result.slice(0, index) + replacement + result.slice(index + full.length);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Fragment extraction (for AI export)
// ---------------------------------------------------------------------------

/** Paragraph range surrounding the given offset range (delimited by blank lines). */
function paragraphRange(source: string, start: number, end: number): MatchRange {
  // Search backwards for \n\n
  let paraStart = 0;
  const beforeSlice = source.slice(0, start);
  const bbIdx = beforeSlice.lastIndexOf("\n\n");
  if (bbIdx !== -1) paraStart = bbIdx + 2;

  // Search forwards for \n\n
  let paraEnd = source.length;
  const afterSlice = source.slice(end);
  const afIdx = afterSlice.indexOf("\n\n");
  if (afIdx !== -1) paraEnd = end + afIdx;

  return { start: paraStart, end: paraEnd };
}

/** Nearest ATX heading line before `offset` (e.g. "## Chapter"). */
function nearestHeading(source: string, offset: number): string | null {
  const before = source.slice(0, offset);
  const lines = before.split("\n");
  let result: string | null = null;
  for (const rawLine of lines) {
    const line = rawLine.trimStart();
    if (!line.startsWith("#")) continue;
    const hashes = line.match(/^#+/);
    if (!hashes) continue;
    const count = hashes[0].length;
    if (count > 6) continue;
    const rest = line.slice(count);
    if (rest.startsWith(" ") || rest.startsWith("\t")) {
      result = line;
    }
  }
  return result;
}

// Sentence-ending characters for fragment clipping
const SENTENCE_ENDERS = new Set([".", "!", "?", ";", "\u3002", "\uFF01", "\uFF1F", "\uFF1B", "\n"]);

/**
 * Sentence/character-level clipping: expand from the annotation outward to
 * sentence boundaries; if the core sentence already exceeds `maxLength`, clip
 * by character count centered on the annotation.
 */
function clippedFragment(
  ann: Annotation,
  paraStart: number,
  paraEnd: number,
  source: string,
  maxLength: number,
): string {
  // Core sentence boundaries
  let coreStart = paraStart;
  let idx = ann.start;
  while (idx > paraStart) {
    const prev = idx - 1;
    if (SENTENCE_ENDERS.has(source[prev])) {
      coreStart = idx;
      break;
    }
    idx = prev;
  }

  let coreEnd = paraEnd;
  idx = ann.end;
  while (idx < paraEnd) {
    if (SENTENCE_ENDERS.has(source[idx])) {
      coreEnd = idx + 1;
      break;
    }
    idx++;
  }

  let fragStart = coreStart;
  let fragEnd = coreEnd;
  const coreLength = coreEnd - coreStart;

  if (coreLength > maxLength) {
    // Core sentence too long: clip by character count centered on the annotation
    const annLength = ann.end - ann.start;
    const budget = Math.max(0, maxLength - annLength) / 2;
    fragStart = Math.max(paraStart, ann.start - Math.floor(budget));
    fragEnd = Math.min(paraEnd, ann.end + Math.floor(budget));
  } else {
    // Expand sentence by sentence, alternating prev/next, up to maxLength
    let length = coreLength;
    let canPrev = fragStart > paraStart;
    let canNext = fragEnd < paraEnd;

    while ((canPrev || canNext) && length < maxLength) {
      if (canPrev) {
        let s = fragStart - 1;
        while (s > paraStart && SENTENCE_ENDERS.has(source[s])) s--;
        let newStart = paraStart;
        let j = s;
        while (j > paraStart) {
          const prev = j - 1;
          if (SENTENCE_ENDERS.has(source[prev])) {
            newStart = j;
            break;
          }
          j = prev;
        }
        const grow = fragStart - newStart;
        if (length + grow <= maxLength) {
          fragStart = newStart;
          length += grow;
          canPrev = fragStart > paraStart;
        } else {
          canPrev = false;
        }
      }
      if (canNext && length < maxLength) {
        let newEnd = paraEnd;
        let j = fragEnd;
        while (j < paraEnd) {
          if (SENTENCE_ENDERS.has(source[j])) {
            newEnd = j + 1;
            break;
          }
          j++;
        }
        const grow = newEnd - fragEnd;
        if (grow > 0 && length + grow <= maxLength) {
          fragEnd = newEnd;
          length += grow;
          canNext = fragEnd < paraEnd;
        } else {
          canNext = false;
        }
      }
    }
  }

  let text = source.slice(fragStart, fragEnd).trim();
  if (fragStart > paraStart) text = "\u2026" + text;
  if (fragEnd < paraEnd) text += "\u2026";
  return text;
}

/**
 * Extract readable fragments around annotations, suitable for sending to AI.
 * Paragraphs shorter than `maxLength` are included whole; longer paragraphs
 * are clipped per-annotation.  Multiple annotations in the same paragraph
 * share a single fragment.
 */
export function fragments(
  annotations: Annotation[],
  source: string,
  maxLength: number = 400,
): Fragment[] {
  const sorted = [...annotations].sort((a, b) => a.start - b.start);

  interface Group {
    para: MatchRange;
    anns: Annotation[];
  }

  const groups: Group[] = [];
  for (const ann of sorted) {
    const para = paragraphRange(source, ann.start, ann.end);
    const last = groups[groups.length - 1];
    if (last && last.para.start === para.start && last.para.end === para.end) {
      last.anns.push(ann);
    } else {
      groups.push({ para, anns: [ann] });
    }
  }

  const result: Fragment[] = [];
  for (const group of groups) {
    const heading = nearestHeading(source, group.para.start);
    const paragraph = source.slice(group.para.start, group.para.end);

    if (paragraph.length <= maxLength) {
      result.push({
        heading,
        text: paragraph.trim(),
        position: group.para.start,
      });
    } else {
      for (const ann of group.anns) {
        const text = clippedFragment(ann, group.para.start, group.para.end, source, maxLength);
        result.push({
          heading,
          text,
          position: ann.start,
        });
      }
    }
  }

  return result;
}

/**
 * Join fragments into a final export string.  Fragments are separated by
 * `[...]` and heading context is only emitted when it changes.
 */
export function exportFragments(frags: Fragment[], intro?: string): string {
  const sorted = [...frags].sort((a, b) => a.position - b.position);
  const blocks: string[] = [];
  let lastHeading: string | null = null;

  for (const frag of sorted) {
    let block = "";
    if (frag.heading && frag.heading !== lastHeading) {
      block += frag.heading + "\n\n";
      lastHeading = frag.heading;
    }
    block += frag.text;
    blocks.push(block);
  }

  const body = blocks.join("\n\n[...]\n\n");
  if (intro && intro.length > 0) {
    return intro + "\n\n" + body + "\n";
  }
  return body + "\n";
}

// ---------------------------------------------------------------------------
// AI export
// ---------------------------------------------------------------------------

/**
 * Generate text suitable for pasting into an AI chat.
 * If `prompt` contains the `{{MarkMark:content}}` placeholder, the source
 * replaces it; otherwise the prompt is prepended to the source.
 */
export function exportForAI(markedSource: string, prompt?: string): string {
  const header = prompt ?? defaultAIPrompt;
  if (header.includes(contentPlaceholder)) {
    return header.replace(contentPlaceholder, markedSource);
  }
  return header + "\n\n" + markedSource + "\n";
}
