import { type RecipeVariantProps } from '@repo/styles/css';
export type ButtonVariantProps = NonNullable<RecipeVariantProps<typeof buttonRecipe>>;
export declare const buttonRecipe: import("../../../.cache/styles/types").RecipeRuntimeFn<{
    size: {
        xs: {
            padding: "3px 9px";
            borderRadius: "4px";
            textStyle: "body.sm.medium";
        };
        sm: {
            padding: "6px 10px";
        };
        md: {
            padding: "8px 16px";
        };
        lg: {
            padding: "12px 24px";
        };
    };
    borderless: {
        false: {
            borderStyle: "solid";
            borderWidth: "2px";
        };
        true: {};
    };
    fullWidth: {
        false: {};
        true: {
            width: "100%";
        };
    };
    variant: {
        default: {
            colorPalette: "buttons.default";
        };
        light: {
            colorPalette: "buttons.light";
        };
        filter: {
            colorPalette: "buttons.filter";
        };
        cta: {
            colorPalette: "buttons.cta";
        };
        boost: {
            colorPalette: "buttons.boost";
        };
        middle: {
            colorPalette: "buttons.middle";
        };
        dark: {
            colorPalette: "buttons.dark";
        };
        transparent: {
            colorPalette: "buttons.transparent";
        };
        recovery: {
            colorPalette: "buttons.recovery";
        };
    };
}>;
