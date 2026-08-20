import { type CssStyles } from '@repo/styles/css';
export type LineTogglesState = {
    average: boolean;
    movingAverage: boolean;
};
export type LineTogglesProps = {
    css?: CssStyles;
    toggles: LineTogglesState;
    onChange: (newToggles: LineTogglesState) => void;
};
export declare const LineToggles: (({ toggles, onChange, css: cssProp, }: LineTogglesProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
