import type { FC } from 'react';
import { type ItemInnerProps } from './Item';
export type SearchableListProps<TValue extends string = string> = {
    options: TValue[];
    onSelect: (value: TValue) => void;
    ItemInnerComponent?: FC<ItemInnerProps<TValue>>;
    EndComponent?: FC<ItemInnerProps<TValue>>;
    size?: 'sm' | 'md';
    hideShadows?: boolean;
};
export declare const SearchableList: (<TValue extends string = string>({ options, onSelect, ItemInnerComponent, EndComponent, size, hideShadows, }: SearchableListProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
