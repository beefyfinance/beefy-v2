import { type ComponentProps, type ReactHTML } from 'react';
type HtmlTag = keyof ReactHTML;
declare function createTooltipTrigger<T extends HtmlTag>(tag: T): ((props: ComponentProps<T> & import("react").RefAttributes<HTMLElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
type TooltipTriggerFactory = {
    [K in HtmlTag]: ReturnType<typeof createTooltipTrigger<K>>;
};
export declare const TooltipTrigger: TooltipTriggerFactory;
export {};
