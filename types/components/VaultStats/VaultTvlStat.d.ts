import { type VaultEntity } from '../../features/data/entities/vault';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types';
import type { BeefyState } from '../../features/data/store/types';
import { type VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultTvlStatProps = {
    vaultId: VaultEntity['id'];
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultTvlStat>>;
export declare const VaultTvlStat: (({ vaultId, ...passthrough }: VaultTvlStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
declare function selectVaultTvlStat(state: BeefyState, vaultId: VaultEntity['id']): {
    label: string;
    value: string;
    subValue: null;
    blur: boolean;
    loading: boolean;
    expectSubValue: boolean;
    tooltip?: undefined;
} | {
    label: string;
    value: string;
    subValue: null;
    blur: boolean;
    loading: boolean;
    expectSubValue?: undefined;
    tooltip?: undefined;
} | {
    label: string;
    value: string;
    subValue: string;
    blur: boolean;
    loading: boolean;
    tooltip: import("react/jsx-runtime").JSX.Element;
    expectSubValue?: undefined;
};
type TvlShareTooltipProps = {
    breakdown: TvlBreakdownUnderlying;
};
export declare const TvlShareTooltip: (({ breakdown }: TvlShareTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
