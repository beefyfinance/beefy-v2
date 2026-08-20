import type { VaultEntity } from '../../features/data/entities/vault';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultDepositStatProps = {
    vaultId: VaultEntity['id'];
    walletAddress?: string;
    label?: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;
export declare const VaultDepositStat: (({ vaultId, walletAddress, label, ...passthrough }: VaultDepositStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
