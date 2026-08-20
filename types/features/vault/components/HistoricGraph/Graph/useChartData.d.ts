import type { ApiTimeBucket } from '../../../../data/apis/beefy/beefy-data-api-types';
import type { TokenEntity } from '../../../../data/entities/token';
import type { VaultEntity } from '../../../../data/entities/vault';
import type { ChartData, ChartStat } from '../types';
export declare function useChartData<TStat extends ChartStat>(stat: TStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket, inverted: boolean): ChartData<TStat> | undefined;
