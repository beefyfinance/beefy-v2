import type { StyledVariantProps } from '@repo/styles/types';
type SizerVariantProps = StyledVariantProps<typeof Sizer>;
type CircleVariantProps = StyledVariantProps<typeof Circle>;
export type PulseHighlightProps = {
    innerCircles?: number;
    size?: number;
    variant?: SizerVariantProps['variant'];
    state?: CircleVariantProps['state'];
};
export declare const PulseHighlight: import("react").NamedExoticComponent<PulseHighlightProps>;
declare const Sizer: import("@repo/styles/types").StyledComponent<"div", {
    variant?: "success" | "error" | "loading" | "warning" | undefined;
}>;
declare const Circle: import("@repo/styles/types").StyledComponent<"div", {
    slot?: 1 | 2 | 3 | undefined;
    state?: "stopped" | "playing" | undefined;
}>;
export {};
