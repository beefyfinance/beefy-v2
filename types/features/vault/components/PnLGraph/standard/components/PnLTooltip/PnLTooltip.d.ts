type PayloadData = {
    datetime: string;
    underlyingBalance: string;
    usdBalance: string;
};
interface TooltipProps {
    active?: boolean;
    payload?: {
        payload: PayloadData;
    }[];
}
export declare const PnLTooltip: (({ active, payload }: TooltipProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
