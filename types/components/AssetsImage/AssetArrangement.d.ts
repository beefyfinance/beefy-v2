import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
type AssetArrangementProps = {
    count: number;
    children: ReactNode;
    size?: number;
    css?: CssStyles;
};
export declare const AssetArrangement: import("react").NamedExoticComponent<AssetArrangementProps>;
export {};
