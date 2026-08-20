import type { VaultEntity } from '../../features/data/entities/vault';
import type { BeefyState } from '../../features/data/store/types';
import { type VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultDailyUsdStatProps = {
    vaultId: VaultEntity['id'];
    walletAddress?: string;
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultDailyUsdStat>>;
export declare const VaultDailyUsdStat: (({ vaultId, walletAddress, ...passthrough }: VaultDailyUsdStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
declare function selectVaultDailyUsdStat(state: BeefyState, vaultId: VaultEntity['id'], walletAddress?: string): {
    label: string;
    value: string;
    subValue: null;
    blur: boolean;
    loading: boolean;
    boosted?: undefined;
    tooltip?: undefined;
} | {
    label: string;
    value: string;
    subValue: null;
    blur: boolean;
    loading: boolean;
    boosted: boolean;
    tooltip: null;
};
export {};
