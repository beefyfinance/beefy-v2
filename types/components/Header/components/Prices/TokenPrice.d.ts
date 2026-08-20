import type { Token } from './config';
type TokenPriceProps = {
    token: Token;
    mode: 'current' | 'next' | 'hidden';
    spacing: 'desktop' | 'mobile';
};
export declare const TokenPrice: (({ token, mode, spacing }: TokenPriceProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
