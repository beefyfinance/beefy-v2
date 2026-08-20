import type { VaultEntity } from '../../../../features/data/entities/vault';
export type VaultIconProps = {
    vaultId: VaultEntity['id'];
    size?: number;
};
export declare const VaultIcon: (({ vaultId, size }: VaultIconProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
