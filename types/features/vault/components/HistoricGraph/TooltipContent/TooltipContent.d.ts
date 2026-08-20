import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import type { LineTogglesState } from '../LineToggles/LineToggles';
import type { ChartDataPoint, ChartStat } from '../types';
import type { RechartsTooltipProps } from '../../../../../helpers/graph/types';
export type BaseTooltipProps<TStat extends ChartStat> = RechartsTooltipProps<'v', 't', ChartDataPoint<TStat>>;
export type ExtraTooltipContentProps<TStat extends ChartStat> = {
    stat: TStat;
    bucket: ApiTimeBucket;
    toggles: LineTogglesState;
    valueFormatter: (value: number) => string;
    avg: number;
    vaultType: 'standard' | 'gov' | 'cowcentrated' | 'erc4626';
};
export type TooltipContentProps<TStat extends ChartStat> = BaseTooltipProps<TStat> & ExtraTooltipContentProps<TStat>;
export declare const TooltipContent: (<TStat extends ChartStat>(props: TooltipContentProps<TStat>) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
