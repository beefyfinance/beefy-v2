import { type FC, type ReactNode, type SVGProps } from 'react';
import { type CssStyles } from '@repo/styles/css';
import type { TooltipOptions } from './types';
export type IconWithTooltipProps = Partial<IconProps> & TooltipOptions & {
    tooltip: ReactNode;
};
export declare const IconWithTooltip: (({ Icon, iconCss, iconSize, tooltip, ...rest }: IconWithTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
type IconProps = {
    Icon: FC<SVGProps<SVGSVGElement>>;
    iconCss: CssStyles;
    iconSize: number;
};
export {};
