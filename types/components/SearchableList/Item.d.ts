import type { FC } from 'react';
export type ItemInnerProps<V extends string = string> = {
    value: V;
};
type ItemProps<TValue extends string = string> = {
    value: TValue;
    onSelect: (value: TValue) => void;
    EndAdornmentComponent?: FC<ItemInnerProps<TValue>>;
    ItemInnerComponent?: FC<ItemInnerProps<TValue>>;
};
export declare const Item: (<TValue extends string = string>({ value, onSelect, ItemInnerComponent, EndAdornmentComponent, }: ItemProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
