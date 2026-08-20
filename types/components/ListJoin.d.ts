import type { ReactNode } from 'react';
type ListJoinProps = {
    items: ReactNode[];
    mode?: 'and' | 'or';
};
export declare const ListJoin: (({ items, mode }: ListJoinProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
