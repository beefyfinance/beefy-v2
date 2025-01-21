import escapeStringRegexp from 'escape-string-regexp';

const PUNCTUATION = new RegExp(/([/,-])/g);

export function punctuationWrap(text: string): string {
  return text.replace(PUNCTUATION, '$1\u200B');
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
