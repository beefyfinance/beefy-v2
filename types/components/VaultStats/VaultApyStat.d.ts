import { type VaultEntity } from '../../features/data/entities/vault';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultApyStatProps = Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'blur' | 'loading' | 'boosted'> & {
    vaultId: VaultEntity['id'];
    type: 'yearly' | 'daily';
};
export declare const VaultApyStat: (({ vaultId, type, ...passthrough }: VaultApyStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const Container: import("@repo/styles/jsx").StyledComponent<"div", {}>;
