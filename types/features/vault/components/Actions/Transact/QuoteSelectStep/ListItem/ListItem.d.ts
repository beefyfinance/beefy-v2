import { type CssStyles } from '@repo/styles/css';
export type ListItemProps = {
    quoteId: string;
    onSelect: (id: string) => void;
    css?: CssStyles;
};
export declare const ListItem: (({ quoteId, css: cssProp, onSelect }: ListItemProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
