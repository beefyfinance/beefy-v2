import type { BasicTooltipContentProps } from './BasicTooltipContent';
import { type IconWithTooltipProps } from './IconWithTooltip';
export type IconWithBasicTooltipProps = BasicTooltipContentProps & Omit<IconWithTooltipProps, 'title' | 'tooltip'>;
export declare const IconWithBasicTooltip: (({ title, content, ...rest }: IconWithBasicTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
