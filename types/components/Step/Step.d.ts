import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type StepType = 'bridge';
export type StepProps = {
    stepType: StepType;
    title?: string;
    onBack?: () => void;
    children: ReactNode;
    titleAdornment?: ReactNode;
    contentCss?: CssStyles;
    noPadding?: boolean;
};
export declare const Step: (({ stepType, title, titleAdornment, onBack, children, contentCss, noPadding, }: StepProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
