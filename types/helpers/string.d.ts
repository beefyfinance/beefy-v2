/**
 * Adds a zero-width space after punctuation characters to allow line breaks
 * @param text
 */
export declare function punctuationWrap(text: string): string;
/**
 * Splits text into two parts at the last wrappable character (punctuation or space).
 * @param text
 * @param nbsp - whether to replace the last space with a non-breaking space in the wrap part
 * @returns `[nowrap, wrap]` if wrappable character is found or `[nowrap]` otherwise
 * where `nowrap` is the last segment of the text, without ZWSP,
 * and `wrap` is the rest of the text with ZWSP added after wrappable punctuation
 */
export declare function splitLastWrap(text: string, nbsp?: boolean): [string, string] | [string];
export declare function simplifySearchText(text: string): string;
export declare function safeSearchRegex(needle: string, caseInsensitive?: boolean): RegExp;
export declare function stringFoundAnywhere(haystack: string, needle: string, caseInsensitive?: boolean): RegExpMatchArray | null;
export declare function ucFirstLetter<T extends string>(word: T): Capitalize<T>;
