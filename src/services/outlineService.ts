/**
 * Outline service – ported from Swift OutlineService.swift
 *
 * Parses Markdown headings (ATX and Setext) to build a document outline.
 * Code blocks (fenced with ```) are skipped.
 */

export interface OutlineItem {
  /** Heading level 1-6 */
  level: number;
  /** Heading title text (without leading # markers) */
  title: string;
  /** 0-based line number in the source */
  lineNumber: number;
}

/**
 * Parse a Markdown document and return all heading items in document order.
 *
 * Supports:
 *   - ATX headings:   `# Title` through `###### Title`
 *   - Setext headings: underline with `===` (h1) or `---` (h2)
 *
 * Fenced code blocks (``` or ~~~) are tracked and their contents are skipped.
 */
export function parseOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const trimmed = line.trim();

    // Skip blank lines
    if (trimmed.length === 0) continue;

    // Track fenced code block state (``` or ~~~)
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip everything inside code blocks
    if (inCodeBlock) continue;

    // ATX heading: # Title
    const atxItem = parseATXHeading(trimmed, index);
    if (atxItem) {
      items.push(atxItem);
      continue;
    }

    // Setext heading: check the next line for === or --- underline
    if (index + 1 < lines.length) {
      const nextLine = lines[index + 1].trim();
      if (nextLine.startsWith("===")) {
        items.push({ level: 1, title: trimmed, lineNumber: index });
      } else if (nextLine.startsWith("---") && !trimmed.startsWith("#")) {
        items.push({ level: 2, title: trimmed, lineNumber: index });
      }
    }
  }

  return items;
}

/**
 * Try to parse a single line as an ATX heading.
 * Returns null if the line is not a valid ATX heading.
 *
 * Rules:
 *   - 1-6 leading `#` characters
 *   - followed by a space or tab
 *   - title text with optional trailing `###` closure removed
 */
function parseATXHeading(line: string, lineNumber: number): OutlineItem | null {
  let hashCount = 0;
  for (const ch of line) {
    if (ch === "#") {
      hashCount++;
    } else {
      break;
    }
  }

  // Heading level must be 1-6
  if (hashCount < 1 || hashCount > 6) return null;

  // After the hashes there must be a space or tab (or end of line)
  const afterHashes = line.slice(hashCount);
  const firstChar = afterHashes[0];
  if (firstChar !== " " && firstChar !== "\t") return null;

  // Extract title text, trimming leading whitespace and optional trailing ### closure
  let title = afterHashes.slice(1).trim();

  // Remove optional trailing ATX closing sequence: `###` at end preceded by whitespace
  const trailingHashes = title.match(/\s+#+\s*$/);
  if (trailingHashes) {
    title = title.slice(0, trailingHashes.index).trim();
  }

  if (title.length === 0) return null;

  return { level: hashCount, title, lineNumber };
}
