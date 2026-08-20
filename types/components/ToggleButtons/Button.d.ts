import type { StyledVariantProps } from '@repo/styles/types';
export type ButtonVariantProps = StyledVariantProps<typeof Button>;
export declare const Button: import("@repo/styles/types").StyledComponent<"button", {
    noBackground?: boolean | undefined;
    noPadding?: boolean | undefined;
    active?: boolean | undefined;
    unselectable?: boolean | undefined;
    variant?: "default" | "card" | undefined;
}>;
