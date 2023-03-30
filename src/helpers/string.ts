const PUNCTUATION = new RegExp(/([/,-])/g);
export function punctuationWrap(text: string): string {
  return text.replace(PUNCTUATION, '$1\u200B');
}
