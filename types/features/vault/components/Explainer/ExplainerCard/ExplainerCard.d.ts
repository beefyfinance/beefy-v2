import { type ReactElement, type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
type ExplainerCardProps = {
    css?: CssStyles;
    title: ReactElement;
    links?: {
        label: string;
        link: string;
    }[];
    description: ReactElement;
    details?: ReactNode;
};
export declare const ExplainerCard: (({ title, links, description, details, css: cssProp, }: ExplainerCardProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
