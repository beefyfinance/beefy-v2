import { search } from '@inquirer/prompts';
import { createFactory } from './factory';
import { strlen, first } from 'printable-characters';

const MAX_PROMPT_LENGTH = Number(process.stdout.columns || 80) - 2;

export function promptTrim(str: string, len: number = MAX_PROMPT_LENGTH) {
  return strlen(str) > len ? `${first(str, len - 1)}…` : str;
}

function inputToKeywords(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .map(w => w.trim())
    .filter(w => w.length > 0);
}

function scoreKeyword(inputKeyword: string, entryKeyword: string): number {
  const index = entryKeyword.indexOf(inputKeyword);
  return index === -1 ? 0 : index === 0 ? 3 : 1;
}

function scoreKeywords(inputKeywords: string[], entryKeywords: string[]): number {
  return inputKeywords.reduce((acc, inputKeyword) => {
    return (
      acc +
      entryKeywords.reduce((acc, entryKeyword) => acc + scoreKeyword(inputKeyword, entryKeyword), 0)
    );
  }, 0);
}

function keywordSearch<T>(
  inputKeywords: string[],
  entries: T[],
  keywordsPicker: (entry: T) => string[],
  titlePicker: (entry: T) => string,
  scoreFn: (inputKeywords: string[], entryKeywords: string[]) => number = scoreKeywords
): T[] {
  return entries
    .map(entry => ({
      score: scoreFn(inputKeywords, keywordsPicker(entry)),
      title: titlePicker(entry),
      entry,
    }))
    .filter(option => option.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    )
    .map(option => option.entry);
}

type Choice<TValue> = { value: TValue; name: string; description?: string };
type EntriesLoaderFn<TEntry> = () => Promise<TEntry[]>;
type ChoiceFn<TEntry, TValue extends string | number> = (entry: TEntry) => Choice<TValue>;
type KeywordFn = (input: string) => string[];
type ScoreFn = (inputKeywords: string[], entryKeywords: string[]) => number;
type SearchSourceFn<TValue> = (
  term: string | undefined,
  opt: { signal: AbortSignal }
) => Promise<Array<Choice<TValue>>>;
type SearchPromptFn<TEntry> = (message: string) => Promise<TEntry>;

export function createSearchPrompt<TEntry, TValue extends string | number>(
  entriesLoaderFn: EntriesLoaderFn<TEntry>,
  choiceFn: ChoiceFn<TEntry, TValue>,
  keywordFn: KeywordFn = inputToKeywords,
  scoreFn: ScoreFn = scoreKeywords
): SearchPromptFn<TEntry> {
  const createRequester = createFactory(async (): Promise<SearchPromptFn<TEntry | undefined>> => {
    const entries = await entriesLoaderFn();
    const allOptions = entries
      .map(entry => {
        const choice = choiceFn(entry);
        return {
          entry,
          choice,
          keywords: keywordFn(choice.name),
        };
      })
      .sort((a, b) =>
        a.choice.name.localeCompare(b.choice.name, undefined, { sensitivity: 'base' })
      );
    const allChoices = allOptions.map(option => option.choice);
    const searchFn: SearchSourceFn<TValue> = async input => {
      if (!input || input.length === 0) {
        return allChoices;
      }

      const keywords = keywordFn(input);
      if (keywords.length === 0) {
        return allChoices;
      }

      return keywordSearch(
        keywords,
        allOptions,
        option => option.keywords,
        option => option.choice.name,
        scoreFn
      ).map(option => option.choice);
    };

    return async (message: string): Promise<TEntry | undefined> => {
      const selectedValue = await search({
        message,
        source: searchFn,
      });
      return allOptions.find(option => option.choice.value === selectedValue)?.entry;
    };
  });

  return async (message: string): Promise<TEntry> => {
    const requester = await createRequester();
    while (true) {
      const entry = await requester(message);
      if (entry) {
        return entry;
      }
    }
  };
}
