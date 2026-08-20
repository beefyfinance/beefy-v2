import { type ReactNode } from 'react';
export type InterestTooltipContentProps = {
    rows: {
        label: string | string[];
        value: string;
        labelTextParams?: Record<string, string>;
    }[];
    highLightLast?: boolean;
    header?: ReactNode;
    footer?: ReactNode;
};
export declare const InterestTooltipContent: (({ header, footer, rows, highLightLast, }: InterestTooltipContentProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
