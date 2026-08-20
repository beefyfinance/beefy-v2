import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from 'react';
import type { RecipeVariantProps } from '@repo/styles/types';
export type BaseInputProps = CustomProps & Omit<ComponentPropsWithoutRef<'input'>, keyof CustomProps>;
export declare const BaseInput: ((props: ExtraProps & RecipeProps & Omit<Omit<import("react").DetailedHTMLProps<import("react").InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref">, "variant" | "fullWidth" | keyof ExtraProps> & import("react").RefAttributes<HTMLDivElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
type RecipeProps = Omit<NonNullable<RecipeVariantProps<typeof recipe>>, 'status'>;
type ExtraProps = {
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
    error?: boolean;
    warning?: boolean;
    success?: boolean;
    inputRef?: Ref<HTMLInputElement>;
};
type CustomProps = ExtraProps & RecipeProps;
declare const recipe: import("@repo/styles/types").SlotRecipeRuntimeFn<"input" | "root", {
    variant: {
        default: {};
        amount: {
            input: {
                textStyle: "h2";
            };
        };
        transparent: {
            root: {
                backgroundColor: "transparent";
                paddingInline: "0";
                paddingBlock: "0";
                height: "20px";
                alignItems: "flex-end";
                display: "flex";
                justifyContent: "center";
                gap: "8px";
                color: "text.dark";
                _hover: {
                    color: "text.middle";
                };
                _focusWithin: {
                    color: "text.light";
                };
                '&[data-disabled]': {
                    opacity: "0.5";
                    pointerEvents: "none";
                };
            };
            input: {
                height: "20px";
                caretColor: "indicators.success";
                color: "inherit";
                backgroundColor: "transparent";
                textStyle: "label";
                fontWeight: number;
                '&::placeholder': {
                    textStyle: "label";
                    opacity: "0.64";
                    color: "inherit";
                    fontWeight: number;
                    textDecoration: "underline";
                    textDecorationColor: "inherit";
                    textDecorationThickness: "0.5px";
                    textUnderlineOffset: "2px";
                };
                '&:not(:placeholder-shown)': {
                    textDecoration: "underline";
                    textDecorationColor: "inherit";
                    textDecorationThickness: "0.5px";
                    textUnderlineOffset: "2px";
                };
                _focus: {
                    color: "inherit";
                };
                _disabled: {
                    cursor: "not-allowed";
                };
            };
        };
    };
    fullWidth: {
        true: {
            root: {
                width: "100%";
            };
        };
    };
    status: {
        false: {};
        error: {
            root: {
                borderColor: "indicators.error";
            };
        };
        warning: {
            root: {
                borderColor: "indicators.warning";
            };
        };
        success: {
            root: {
                borderColor: "indicators.success";
            };
        };
    };
}>;
export {};
