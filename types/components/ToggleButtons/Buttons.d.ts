import type { StyledVariantProps } from '@repo/styles/types';
export type ButtonsVariantProps = StyledVariantProps<typeof Buttons>;
export declare const Buttons: import("@repo/styles/types").StyledComponent<"div", {
    fullWidth?: boolean | undefined;
    variant?: "boost" | "filter" | "default" | "success" | "range" | "card" | undefined;
    noBackground?: boolean | undefined;
    noBorder?: boolean | undefined;
}>;
