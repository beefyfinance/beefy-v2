import { type CssStyles } from '@repo/styles/css';
import { type ReactNode } from 'react';
interface StatProps {
    tooltipText: string;
    label: string;
    value0: string;
    value1: string;
    value2?: ReactNode;
    subValue0?: string;
    subValue1?: string;
    subValue2?: ReactNode;
    value2Css?: CssStyles;
}
export declare const Stat: (({ tooltipText, label, value0, value1, subValue0, subValue1, value2, subValue2, value2Css, }: StatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
