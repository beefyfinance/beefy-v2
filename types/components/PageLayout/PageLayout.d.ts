import { type ReactNode } from 'react';
export type PageLayoutProps = {
    content: ReactNode;
    header?: ReactNode;
    contentAlignedCenter?: boolean;
};
export declare const PageLayout: (({ header, content, contentAlignedCenter, }: PageLayoutProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
