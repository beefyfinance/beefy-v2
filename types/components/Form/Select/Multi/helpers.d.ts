import type { SelectItem } from '../types';
export declare function indexesFromValues<TItem extends SelectItem>(options: TItem[], selected: TItem['value'][]): number[];
export declare function defaultSearchFunction<TItem extends SelectItem>(item: TItem, query: string): boolean;
