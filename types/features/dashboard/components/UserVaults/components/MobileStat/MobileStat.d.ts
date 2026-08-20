import { type CssStyles } from '@repo/styles/css';
import { type ReactNode } from 'react';
interface MobileStatsProps {
    label: string;
    value: string | ReactNode;
    valueCss?: CssStyles;
}
export declare const MobileStat: (({ label, value, valueCss }: MobileStatsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
