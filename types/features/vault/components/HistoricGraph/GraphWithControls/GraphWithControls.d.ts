import type { TokenEntity } from '../../../../data/entities/token';
import type { VaultEntity } from '../../../../data/entities/vault';
import type { ChartStat } from '../types';
export type HistoricGraphProp = {
    vaultId: VaultEntity['id'];
    oracleId: TokenEntity['oracleId'];
    stat: ChartStat;
    inverted: boolean;
};
export declare const GraphWithControls: (({ vaultId, oracleId, stat, inverted, }: HistoricGraphProp) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
