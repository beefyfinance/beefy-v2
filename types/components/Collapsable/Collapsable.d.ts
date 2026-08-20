import type { ReactNode } from 'react';
import { type CssStyles, type RecipeVariantProps } from '@repo/styles/css';
type CollapsableProps = {
    openByDefault?: boolean;
    children: ReactNode;
    title: ReactNode;
    collapsableClass?: CssStyles;
    titleClass?: CssStyles;
    contentClass?: CssStyles;
} & CollapseRecipeProps;
export declare const Collapsable: import("react").NamedExoticComponent<CollapsableProps>;
declare const collapseRecipe: import("../../../.cache/styles/types/recipe").RecipeRuntimeFn<{
    variant: {
        transparent: {};
        noPadding: {
            padding: "0px";
            md: {
                padding: "0px";
            };
        };
        light: {
            background: "background.content.light";
        };
        primary: {
            background: "background.content";
        };
        card: {
            background: "background.content.light";
            gap: "0";
        };
    };
}>;
type CollapseRecipeProps = NonNullable<RecipeVariantProps<typeof collapseRecipe>>;
export {};
