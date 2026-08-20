import type { VaultEntity } from '../../features/data/entities/vault';
import { type UserVaultPnl } from '../../features/data/selectors/analytics-types';
import type { BeefyState } from '../../features/data/store/types';
import { type VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultDailyStatProps = {
    vaultId: VaultEntity['id'];
    pnlData: UserVaultPnl;
    walletAddress: string;
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultPnlStat>>;
export declare const VaultPnlStat: (({ vaultId, pnlData, walletAddress, ...passthrough }: VaultDailyStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
declare function selectVaultPnlStat(state: BeefyState, vaultId: VaultEntity['id'], pnlData: UserVaultPnl, walletAddress: string): {
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
    subValue: string | null;
    blur: boolean;
    loading: boolean;
    boosted: boolean;
    tooltip: import("react/jsx-runtime").JSX.Element | undefined;
};
export {};
