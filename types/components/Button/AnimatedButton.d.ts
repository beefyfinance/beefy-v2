import { type ComponentProps } from 'react';
import { Button } from './Button';
export declare const CowAnimationProvider: (({ children, }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
type AnimatedButtonProps = ComponentProps<typeof Button> & {
    loading?: boolean;
    isCreating?: boolean;
    needFire?: boolean;
    isConfirmed?: boolean;
};
export declare const AnimatedButton: (({ loading, children, disabled, isCreating, needFire, isConfirmed, onClick, ...props }: AnimatedButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
