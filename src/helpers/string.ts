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
  const lastMatch = text[lastIndex];
  return [
    text.substring(lastIndex + 1),
    punctuationWrap(text.substring(0, lastIndex)) +
      (lastMatch === ' ' ?
        nbsp ? '\u00A0'
        : ' '
      : ''),
  ];
}

/**
 * Like `string.lastIndexOf` but for any of the needles
 * @param haystack
 * @param needles
 */
function lastIndexOfAny(haystack: string, needles: string[]): number {
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
