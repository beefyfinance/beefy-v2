import escapeStringRegexp from 'escape-string-regexp';

const PUNCTUATION = new RegExp(/([/,-])/g);
const BREAKABLE = ['/', ',', '-', ' ']; // PUNCTUATION plus space

/**
 * Adds a zero-width space after punctuation characters to allow line breaks
 * @param text
 */
export function punctuationWrap(text: string): string {
  return text.replace(PUNCTUATION, '$1\u200B');
}

/**
 * Splits text into two parts at the last wrappable character (punctuation or space).
 * @param text
 * @param nbsp - whether to replace the last space with a non-breaking space in the wrap part
 * @returns `[nowrap, wrap]` if wrappable character is found or `[nowrap]` otherwise
 * where `nowrap` is the last segment of the text, without ZWSP,
 * and `wrap` is the rest of the text with ZWSP added after wrappable punctuation
 */
export function splitLastWrap(text: string, nbsp: boolean = false): [string, string] | [string] {
  text = text.trim();
  const lastIndex = lastIndexOfAny(text, BREAKABLE);
  if (lastIndex === -1) {
    return [text];
  }
  let lastMatch = text[lastIndex];
  if (nbsp && lastMatch === ' ') {
    lastMatch = '\u00A0';
  }
  return [text.substring(lastIndex + 1), punctuationWrap(text.substring(0, lastIndex)) + lastMatch];
}

/**
 * Like `string.lastIndexOf` but for any of the needles
 * @param haystack
 * @param needles
 */
function lastIndexOfAny(haystack: string, needles: readonly string[]): number {
  for (let i = haystack.length - 1; i >= 0; i--) {
    if (needles.includes(haystack[i])) {
      return i;
    }
  }
  return -1;
}

export function simplifySearchText(text: string) {
  return (text || '').replace(/-/g, ' ').trim();
}

export function safeSearchRegex(needle: string, caseInsensitive: boolean = true) {
  const modifiers = `g${caseInsensitive ? 'i' : ''}`;
  return new RegExp(escapeStringRegexp(needle), modifiers);
}

export function stringFoundAnywhere(
  haystack: string,
  needle: string,
  caseInsensitive: boolean = true
) {
  return (haystack || '').match(safeSearchRegex(needle, caseInsensitive));
}

export function ucFirstLetter<T extends string>(word: T): Capitalize<T> {
  return `${word.charAt(0).toUpperCase()}${word.slice(1)}` as Capitalize<T>;
}

/** 0 exact, 1 prefix, 2 substring, 3 no match */
export function rankStringMatch(text: string, needle: string): number {
  return (
    text === needle ? 0
    : text.startsWith(needle) ? 1
    : text.includes(needle) ? 2
    : 3
  );
}

/**
 * Levenshtein distance between a and b, capped at max: returns max + 1 once the distance exceeds max
 */
export function boundedLevenshtein(a: string, b: string, max: number): number {
  if (a === b) {
    return 0;
  }
  if (Math.abs(a.length - b.length) > max) {
    return max + 1;
  }
  if (a.length > b.length) {
    [a, b] = [b, a];
  }
  let prev = Array.from({ length: a.length + 1 }, (_, i) => i);
  let curr = new Array<number>(a.length + 1);
  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    let rowMin = curr[0];
    for (let i = 1; i <= a.length; i++) {
      curr[i] = Math.min(
        prev[i] + 1,
        curr[i - 1] + 1,
        prev[i - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      rowMin = Math.min(rowMin, curr[i]);
    }
    // every cell in this row exceeds max, so the final distance must too
    if (rowMin > max) {
      return max + 1;
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length] > max ? max + 1 : prev[a.length];
}
