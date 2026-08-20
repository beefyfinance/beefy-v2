import { type CssStyles } from '@repo/styles/css';
export type NotEnoughProps = {
    onChange: (shouldDisable: boolean) => void;
    mode: 'deposit' | 'withdraw';
    css?: CssStyles;
};
export declare const NotEnoughNotice: (({ onChange, css: cssProp, mode, }: NotEnoughProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
