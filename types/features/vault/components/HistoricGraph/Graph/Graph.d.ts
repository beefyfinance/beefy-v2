import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import type { TokenEntity } from '../../../../data/entities/token';
import type { VaultEntity } from '../../../../data/entities/vault';
import type { LineTogglesState } from '../LineToggles/LineToggles';
import type { ChartStat } from '../types';
export type ChartProp<TStat extends ChartStat> = {
    vaultId: VaultEntity['id'];
    oracleId: TokenEntity['oracleId'];
    stat: TStat;
    bucket: ApiTimeBucket;
    toggles: LineTogglesState;
    inverted: boolean;
};
export declare const Graph: (<TStat extends ChartStat>({ vaultId, oracleId, stat, bucket, toggles, inverted, }: ChartProp<TStat>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
