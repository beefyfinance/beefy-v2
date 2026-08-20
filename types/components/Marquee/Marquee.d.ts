import { type ReactNode } from 'react';
export type MarqueeProps = {
    /** content to scroll (duplicated for a gap-less, seamless loop) */
    children: ReactNode;
    /** scroll speed in px/second — longer content takes proportionally longer @default 40 */
    speed?: number;
    /**
     * gap in px between the end of one copy and the start of the next (the loop seam).
     * Lower it to keep items flowing tightly one after another @default 48
     */
    gap?: number;
    /** applied to the scrolling content element — use it to style `children` */
    className?: string;
};
export declare const Marquee: (({ children, speed, gap, className, }: MarqueeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
