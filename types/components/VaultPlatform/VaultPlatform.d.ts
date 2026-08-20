import type { VaultEntity } from '../../features/data/entities/vault';
export type VaultPlatformProps = {
    vaultId: VaultEntity['id'];
};
export declare const VaultPlatform: (({ vaultId }: VaultPlatformProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
