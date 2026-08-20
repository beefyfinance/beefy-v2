import { type ReactNode } from 'react';
export type PartnerCardsProps = {
    title: string;
    openByDefault?: boolean;
    children: ReactNode;
};
export declare const PartnerCards: (({ title, children, openByDefault, }: PartnerCardsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
