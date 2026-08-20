import { type ReactNode } from 'react';
type ActionTokensNoticeProps = {
    children: ReactNode;
    onClick?: () => void;
    multiline?: boolean;
};
export declare const ActionTokensNotice: (({ children, multiline, onClick, }: ActionTokensNoticeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
