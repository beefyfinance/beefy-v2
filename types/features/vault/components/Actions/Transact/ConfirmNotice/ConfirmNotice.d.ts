import { type CssStyles } from '@repo/styles/css';
export type ConfirmNoticeProps = {
    onChange: (shouldDisable: boolean) => void;
    css?: CssStyles;
};
export declare const ConfirmNotice: (({ css: cssProp, onChange, }: ConfirmNoticeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
