import type { ClmInvestorFeesTimeSeriesPoint, ClmInvestorOverviewTimeSeriesPoint } from '../../../../../../../helpers/graph/timeseries';
import type { TokenEntity } from '../../../../../../data/entities/token';
import type { RechartsTooltipProps } from '../../../../../../../helpers/graph/types';
export type OverviewTooltipProps = RechartsTooltipProps<'underlyingUsd', 'timestamp', ClmInvestorOverviewTimeSeriesPoint>;
export declare const OverviewTooltip: (({ active, payload, }: OverviewTooltipProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export type FeesTooltipProps = RechartsTooltipProps<'values', 't', ClmInvestorFeesTimeSeriesPoint> & {
    tokens: TokenEntity[];
};
export declare const FeesTooltip: (({ active, payload, tokens, }: FeesTooltipProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
