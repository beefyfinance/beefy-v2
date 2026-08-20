import type { ChainExposurePayloadData, GenericExposurePayloadData, PieChartType, TokenExposurePayloadData } from '../PieChart/types';
type BaseExposureTooltipProps = {
    active?: boolean;
    formatter?: (s: string) => string;
};
type TokenExposureTooltipProps = BaseExposureTooltipProps & {
    type: 'token';
    payload?: {
        payload: TokenExposurePayloadData;
    }[];
};
type ChainExposureTooltipProps = BaseExposureTooltipProps & {
    type: 'chain';
    payload?: {
        payload: ChainExposurePayloadData;
    }[];
};
type GenericExposureTooltipProps = BaseExposureTooltipProps & {
    type: Exclude<PieChartType, 'token' | 'chain'>;
    payload?: {
        payload: GenericExposurePayloadData;
    }[];
};
type TooltipProps = TokenExposureTooltipProps | ChainExposureTooltipProps | GenericExposureTooltipProps;
export declare const PieChartTooltip: ((props: TooltipProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
