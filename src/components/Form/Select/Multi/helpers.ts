import type { SelectItem } from '../types.ts';

export function indexesFromValues<TItem extends SelectItem>(
  options: TItem[],
  selected: TItem['value'][]
): number[] {
  return mutateSortIndexes(
    selected.map(value => options.findIndex(o => o.value === value)).filter(index => index >= 0)
  );
}

function mutateSortIndexes(indexes: number[]): number[] {
  return indexes.sort((a, b) => a - b);
}

export function defaultSearchFunction<TItem extends SelectItem>(
  item: TItem,
  query: string
): boolean {
  return item.label.toLowerCase().includes(query.toLowerCase());
}
