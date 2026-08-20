import type { BasicTooltipContentProps } from '../../../../../../components/Tooltip/BasicTooltipContent';
import type { IconWithTooltipProps } from '../../../../../../components/Tooltip/IconWithTooltip';
export type LabelTooltipProps = BasicTooltipContentProps;
export declare const LabelTooltip: (({ title, content }: LabelTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type LabelCustomTooltipProps = Omit<IconWithTooltipProps, 'triggerCss'>;
export declare const LabelCustomTooltip: ((props: LabelCustomTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
