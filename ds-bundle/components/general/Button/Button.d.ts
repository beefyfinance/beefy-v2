import * as React from 'react';

/**
 * Button — from beefy-v2@0.1.0.
 */
export interface ButtonProps {
/** visual style — maps to a colorPalette token set */
variant?: 'default' | 'light' | 'filter' | 'cta' | 'boost' | 'middle' | 'dark' | 'transparent' | 'recovery';
size?: 'xs' | 'sm' | 'md' | 'lg';
/** drop the 2px border (padding compensates) */
borderless?: boolean;
fullWidth?: boolean;
disabled?: boolean;
type?: 'button' | 'submit' | 'reset';
onClick?: React.MouseEventHandler<HTMLButtonElement>;
children?: React.ReactNode;
className?: string;
/** panda style object merged over the recipe */
css?: Record<string, unknown>;
}

export declare const Button: React.ComponentType<ButtonProps>;
