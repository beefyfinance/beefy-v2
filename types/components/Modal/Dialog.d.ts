import { type RecipeVariantProps } from '@repo/styles/css';
export type DialogVariantProps = NonNullable<RecipeVariantProps<typeof dialogRecipe>>;
declare const dialogRecipe: import("../../../.cache/styles/types").RecipeRuntimeFn<{
    scrollable: {
        false: {
            maxHeight: "100%";
        };
    };
    position: {
        center: {
            margin: "auto";
            padding: {
                sm: "24px";
            };
        };
        right: {
            marginLeft: "auto";
        };
        left: {
            marginRight: "auto";
        };
        bottom: {
            marginTop: "auto";
            position: "fixed";
            bottom: number;
            left: number;
            right: number;
        };
    };
}>;
export declare const Dialog: import("@repo/styles/jsx").StyledComponent<"div", {
    scrollable?: boolean | undefined;
    position?: "center" | "bottom" | "left" | "right" | undefined;
}>;
export {};
