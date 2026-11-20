import type { ReactNode } from 'react';

/**
 * A tiny, dependency-free highlighter for the JS/TS/JSX snippets in lessons.
 * It's intentionally simple: good enough for short examples, not a parser.
 */
const KEYWORDS = new Set(
  ('import export from default function return const let var if else for while ' +
    'async await new type interface extends typeof as of in true false null undefined ' +
    'try catch throw class this').split(' '),
);

const TOKEN = new RegExp(
  [
    String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)`, // 1 comment
    String.raw`('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|` + '`(?:\\\\.|[^`\\\\])*`)', // 2 string
    String.raw`(<\/?[A-Za-z][\w.]*)`, // 3 jsx tag
    String.raw`\b(\d+(?:\.\d+)?)\b`, // 4 number
    String.raw`([A-Za-z_$][\w$]*)(?=\s*\()`, // 5 function call
    String.raw`([A-Za-z_$][\w$]*)`, // 6 identifier
  ].join('|'),
  'g',
);

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(code.slice(last, start));
    const [text, comment, str, tag, num, fn, ident] = m;
    let cls: string | null = null;
    if (comment) cls = 'tk-comment';
    else if (str) cls = 'tk-string';
    else if (tag) cls = 'tk-tag';
    else if (num) cls = 'tk-number';
    else if (fn) cls = KEYWORDS.has(fn) ? 'tk-keyword' : 'tk-fn';
    else if (ident && KEYWORDS.has(ident)) cls = 'tk-keyword';
    else if (ident && /^[A-Z]/.test(ident)) cls = 'tk-type';
    out.push(cls ? <span key={i++} className={cls}>{text}</span> : text);
    last = start + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

/** Render `inline code` spans inside lesson prose. */
export function inlineCode(text: string): ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part,
  );
}
