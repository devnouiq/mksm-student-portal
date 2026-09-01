/*
  Minimal inline formatting for announcement text — pure and framework-free.

  Supports only **bold** and *italic* / _italic_. The parser emits plain string
  tokens; the renderer turns them into <strong>/<em> React elements, so the
  text is placed as React children and never as raw HTML — there is no
  dangerouslySetInnerHTML and no HTML-injection surface.
*/

export type RichToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string };

// Bold first so **x** is not mis-read as two italic *x* runs.
const PATTERN = /\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;

/** Tokenize inline markers into a flat list of text/bold/italic runs. */
export function parseRichText(input: string): RichToken[] {
  const tokens: RichToken[] = [];
  let last = 0;

  for (const match of input.matchAll(PATTERN)) {
    const start = match.index ?? 0;
    if (start > last) {
      tokens.push({ type: "text", value: input.slice(last, start) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: "bold", value: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ type: "italic", value: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "italic", value: match[3] });
    }
    last = start + match[0].length;
  }

  if (last < input.length) {
    tokens.push({ type: "text", value: input.slice(last) });
  }
  return tokens;
}

/** The same text with all markers stripped — for list previews and labels. */
export function toPlainText(input: string): string {
  return parseRichText(input)
    .map((t) => t.value)
    .join("");
}
