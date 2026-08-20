import { type RecipeVariant } from '@repo/styles/css';
import { type FC, type SVGProps } from 'react';
declare const pillRecipe: import("../../.cache/styles/types").RecipeRuntimeFn<{
    mode: {
        ready: {
            colorPalette: "status.ready";
        };
        waiting: {
            colorPalette: "status.waiting";
        };
    };
}>;
export type Mode = RecipeVariant<typeof pillRecipe>['mode'];
type NotificationPillProps = {
    text?: string;
    Icon?: FC<SVGProps<SVGSVGElement>>;
    iconPosition?: 'left' | 'right';
    mode?: Mode;
};
export declare const StatusPill: (({ text, Icon, iconPosition, mode, }: NotificationPillProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
