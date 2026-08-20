import { type VaultEntity } from '../../features/data/entities/vault';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type MobileVaultYieldStatProps = {
    vaultId: VaultEntity['id'];
    walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;
export declare const MobileVaultYieldStat: (({ vaultId, walletAddress, ...passthrough }: MobileVaultYieldStatProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
