import type { VaultEntity } from '../../features/data/entities/vault';
import { type UserVaultPnl } from '../../features/data/selectors/analytics-types';
import { type VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultDepositNowStatProps = {
    vaultId: VaultEntity['id'];
    pnlData: UserVaultPnl;
    walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'loading' | 'value' | 'subValue' | 'tooltip' | 'blur' | 'expectSubValue'>;
export declare const VaultDepositNowStat: (({ vaultId, pnlData, walletAddress, ...passthrough }: VaultDepositNowStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
