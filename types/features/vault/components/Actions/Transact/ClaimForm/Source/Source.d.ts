import { type ReactNode } from 'react';
type SourceProps = {
    title: string;
    claim?: ReactNode;
    refresh?: ReactNode;
    children: ReactNode;
};
export declare const Source: (({ title, claim, refresh, children }: SourceProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
