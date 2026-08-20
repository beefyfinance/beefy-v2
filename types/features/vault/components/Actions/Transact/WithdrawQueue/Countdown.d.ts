import { type ReactNode } from 'react';
type CountdownProps = {
    until: number;
    children: ReactNode;
};
export declare const Countdown: (({ until, children }: CountdownProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
