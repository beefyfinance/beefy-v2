import type { ReactNode } from 'react';
export type StepHeaderProps = {
    onBack?: () => void;
    children: ReactNode;
};
export declare const StepHeader: (({ onBack, children }: StepHeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
