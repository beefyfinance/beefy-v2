import type { StyledVariantProps } from '@repo/styles/types';
import { type FC, type ReactNode, type SVGProps } from 'react';
type LayoutVariantProps = StyledVariantProps<typeof Layout>;
type ValueHolderVariantProps = StyledVariantProps<typeof ValueHolder>;
export type VaultValueStatProps = {
    /** label to show on mobile (when there are no colum headers) */
    label: string;
    /**
     * Controls label visibility:
     * - `false` — don't render the label
     * - `true` — keep it visible at all breakpoints
     * - a breakpoint (`'sm' | 'md' | 'lg'`) — visible below it, hidden from it up
     * @default 'lg'
     */
    showLabel?: boolean | 'sm' | 'md' | 'lg';
    /** tooltip content to show for entire stat */
    tooltip?: ReactNode;
    /** value for line one */
    value: ReactNode;
    /** value for line 2 */
    subValue?: ReactNode;
    /** hide the sub value line entirely */
    hideSubValue?: boolean;
    /** set to true to show loading indicator for the sub value slot also */
    expectSubValue?: boolean;
    /** blur the values */
    blur?: boolean;
    /** show loading indicator instead of values */
    loading?: boolean;
    /** when true, the main value and icon will get the boost color */
    boosted?: boolean;
    /** icon to show before the main value */
    Icon?: FC<SVGProps<SVGSVGElement>>;
    /** additional class name for outer div */
    className?: string;
} & Pick<LayoutVariantProps, 'layout' | 'align' | 'altLayout' | 'altAlign' | 'altFrom'> & Pick<ValueHolderVariantProps, 'textWrap'>;
export declare const VaultValueStat: (({ label, tooltip, value, subValue, hideSubValue, expectSubValue, blur, loading, boosted, showLabel, Icon, textWrap, ...rest }: VaultValueStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
declare const Layout: import("@repo/styles/types").StyledComponent<"div", {
    layout?: "horizontal" | "vertical" | undefined;
    align?: "left" | "right" | undefined;
    altLayout?: "horizontal" | "vertical" | undefined;
    altAlign?: "left" | "right" | undefined;
    altFrom?: "sm" | "md" | "lg" | "xl" | undefined;
}>;
declare const ValueHolder: import("@repo/styles/types").StyledComponent<"div", {
    kind?: "primary" | "secondary" | undefined;
    textWrap?: boolean | undefined;
    boosted?: boolean | undefined;
}>;
export {};
